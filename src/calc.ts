export interface CalcArg {
    csv: string,
    targetCellNum: number,
    noData: NoDataTreat
}

interface WorkArg {
    indices: Indices;
    noData: NoDataTreat;
    csvBuf: SharedArrayBuffer;
}

/** 配列の対象インデックス、開始終了 */
interface Indices {
    startI: number;
    endI: number;
}

/** データがない場合の扱い */
export enum NoDataTreat {
    /** ないものとして計算する */
    ignore,
    /** ゼロとして計算する */
    zero
}

export interface CalcResult {
    val: number;
    lineNum: number;
    noDataIdx: number[];
}

export class CsvCalc {
    /** 入力元CSV */
    csv: string;
    /** CSVを一文字ずつの配列にしたもの。𩸽対策で文字単位で入れたいため。 */
    csvArr: string[];
    /** Workerとメモリシェアするために */
    buf: SharedArrayBuffer;
    /** SharedArrayBufferを使うためのView */
    bufView: Float32Array;
    static SEPARATOR: string = "\n";
    /** ワーカが処理するレコードの単位 */
    static WORK_UNIT_NUM: number = 1000 * 10;
    constructor(csv: string) {
        this.csv = csv;
        this.csvToBuf();
    }
    getAve(cellNum: Number): CalcResult {
        /** 前のループの改行の次の文字のインデックス */
        let lastStart = 0;
        /** レコード数チェック変数 */
        let recordCount = 0;
        for (let csvI = 0, csvL = this.csvArr.length; csvI < csvL; csvI++) {
            if (CsvCalc.SEPARATOR === this.csvArr[csvI][0]) {
                recordCount++;
                if (recordCount === CsvCalc.WORK_UNIT_NUM) {
                    this.doWorker(lastStart, csvI);
                    recordCount = 0;
                    lastStart = csvI + 1; // 改行の一つ後ろの文字からやるために
                }
            }
        }
        this.doWorker(lastStart, this.csvArr.length); // ぴったり終わることなんてないので最後の分を送る
        return;
    }
    doWorker(s: number, e: number) {
        // TypedArray.prototype.sliceは結局コピーなのでもったいない。開始終了だけ渡す。
        const arg: WorkArg = {
            csvBuf: this.buf,
            indices: {
                startI: s,
                endI: e
            },
            noData: NoDataTreat.ignore
        }
        // worker
    }
    /** 文字列をバッファに変換する */
    csvToBuf() {
        // 一文字ごとの配列にする。
        this.csvArr = Array.from(this.csv);
        // 一文字4最大バイトなのでlenght*4
        this.buf = new SharedArrayBuffer(this.csvArr.length * 4);
        // ArrayBufferをシステムで扱うためにviewを作成
        this.bufView = new Float32Array(this.buf);
        for (let i = 0, l = this.bufView.length; i < l; i++) {
            this.bufView[i] = this.csvArr[i].codePointAt(0);
        }
    }
}

/** 普通にfor文で計算するパティーン */
export function normalCalc(arg: CalcArg): CalcResult {
    const CSV_SEP = ",";
    const csvArr: string[] = Array.from(arg.csv);
    let calcArr: number[] = [];
    console.time("calctime");
    for (let i = 0, l = csvArr.length, cellNum = 0, currentCellStartI = 0; i < l; i++) {
        switch (csvArr[i]) {
            case CSV_SEP:
            case CsvCalc.SEPARATOR:
                // セルの終わりなので、現在のセル確認
                if (cellNum === arg.targetCellNum) {
                    // 現在ターゲットセルにいれば、中身を計算対象に入れる。数値じゃなきゃNaNを入れて、後処理で頑張ってもらう。
                    calcArr.push(parseFloat((csvArr.slice(currentCellStartI, i - 1).join("")).replace(/^\"+|\"+$/g, "")));
                }
                currentCellStartI = i + 1; // 次の文字がセル開始位置
                if (csvArr[i] === CSV_SEP) {
                    // セル区切りなのでセル番を更新
                    cellNum++;
                } else if (csvArr[i] === CsvCalc.SEPARATOR) {
                    // 行区切りなので、セル番をリセット
                    cellNum = 0;
                }
                break;
            default:
        }
    }
    console.timeEnd("calctime");
    return Ave(calcArr, arg.noData);
}

function Ave(calcArr: number[], ndt: NoDataTreat): CalcResult {
    let noData: number[] = [];
    let sum = 0;
    for (let i = 0, l = calcArr.length; i < l; i++) {
        if (!isNaN(calcArr[i])) {
            // 数値は普通に足す
            sum += calcArr[i];
        } else {
            // データなし配列に添字を入れる
            noData.push(i);
        }
    }
    // Noデータを０扱いするかどうかで割り算を変える
    const result = sum / (ndt === NoDataTreat.zero ? calcArr.length : calcArr.length - noData.length);
    return { val: result, lineNum: calcArr.length, noDataIdx: noData };
}