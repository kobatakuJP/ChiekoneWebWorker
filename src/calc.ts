interface WorkArg {
    indices: Indices;
    csvBuf: SharedArrayBuffer;
}

/** 配列の対象インデックス、開始終了 */
interface Indices {
    startI: number;
    endI: number;
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
    calc(csv: string) {
        this.csv = csv;
        this.csvToBuf();
    }
    getAve(cellNum: Number) {
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
    }
    doWorker(s: number, e: number) {
        // TypedArray.prototype.sliceは結局コピーなのでもったいない。開始終了だけ渡す。
        const arg: WorkArg = {
            csvBuf: this.buf,
            indices: {
                startI: s,
                endI: e
            }
        }
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
export function normalCalc(csv: string, targetCellNum: number): { result: number, num: number } {
    const CSV_SEP = ",";
    const csvArr: string[] = Array.from(this.csv);
    let calcArr: number[] = [];
    for (let i = 0, l = csvArr.length, cellNum = 0, currentCellStartI = 0; i < l; i++) {
        switch (csvArr[i]) {
            case CSV_SEP:
            case CsvCalc.SEPARATOR:
                // セルの終わりなので、現在のセル確認
                if (cellNum === targetCellNum) {
                    // 現在ターゲットセルにいれば、中身を計算対象に入れる(数値じゃない可能性は・・無視！！)
                    calcArr.push(parseFloat(csvArr.slice(currentCellStartI, i - 1).join()));
                }
                currentCellStartI = i + 1; // 次の文字がセル開始位置
                break;
            case CSV_SEP:
                // セル区切りなのでセル番を更新
                cellNum++;
                break;
            case CsvCalc.SEPARATOR:
                // 行区切りなので、セル番をリセット
                cellNum = 0;
                break;
            default:
        }
    }
    return { result: Ave(calcArr), num: calcArr.length };
}

function Ave(calcArr: number[]): number {
    let sum = 0;
    for (let i = 0, l = calcArr.length; i < l; i++) {
        sum += calcArr[i];
    }
    return sum / calcArr.length;
}