import { Utils as U } from "./utils";

export interface CalcArg {
    csv: string,
    targetCellNum: number,
    noData: NoDataTreat
}

export interface WorkArg {
    indices: Indices;
    saBuf: SharedArrayBuffer;
    targetCellNum: number;
    noData: NoDataTreat;
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

/** 計算結果 */
export interface CalcResult {
    val: number;
    lineNum: number;
    noDataNum: number;
    invalidDataNum: number;
}

export class CsvCalc {
    /** 入力元CSV */
    csv: string;
    /** Workerとメモリシェアするために */
    buf: SharedArrayBuffer;
    /** SharedArrayBufferを使うためのView */
    bufView: Float32Array;
    /** データなしの場合の扱い規定 */
    noData: NoDataTreat;
    static LINE_SEPARATOR_CODE: number = "\n".charCodeAt(0);
    /** 同時実行ワーカ数 */
    static WORK_NUM: number = 8; // TODO とりあえず８。
    constructor(csv: string, noData: NoDataTreat) {
        this.csv = csv;
        this.noData = noData;
        this.csvToBuf();
    }

    /** 
     * 平均値を含む結果を返す。  
     */
    async getAve(cellNum: number): Promise<CalcResult> {
        const promiz = this.separateAndAssignWork(cellNum);
        const vals = await Promise.all(promiz);
        return U.margeAve(vals, this.noData);
    }

    /** csvをざっと切ってワーカに渡す、を繰り返す。 */
    private separateAndAssignWork(cellNum: number): Promise<CalcResult>[] {
        let result: Promise<CalcResult>[] = [];
        const length = this.bufView.length;
        /** 均等割りした場合の数。これをもとにざっくり仕事を切っていく */
        const aboutSepIndex = Math.ceil(length / CsvCalc.WORK_NUM);
        let startI = 0;
        for (let i = aboutSepIndex; i < length; i++) {
            if (this.bufView[i] === CsvCalc.LINE_SEPARATOR_CODE || i === length - 1/*最後が改行じゃないかもしれないし・・・*/) {
                // とりあえず次の改行までを仕事範囲とする。
                result.push(this.doWorker(startI, i, cellNum));
                startI = i + 1; // 次のスタートはこの改行の次の文字から
                i = i + aboutSepIndex - 1; // 次の終わりはざっと飛んだあたり、ざっと飛ぶのではあるのだけど一応for文の+1を考慮して-1するような繊細な面も持ち合わせる。
                if (i > length) {
                    break;
                }
            }
        }
        // 最後の一回はほとんどの場合半端になるはずなので、ここで実行。
        result.push(this.doWorker(startI, length - 1, cellNum))
        return result;
    }

    private doWorker(s: number, e: number, cellNum: number): Promise<CalcResult> {
        // TypedArray.prototype.sliceは結局コピーなのでもったいない。開始終了だけ渡す。
        return new Promise((resolve, reject) => {
            const arg: WorkArg = {
                saBuf: this.buf,
                indices: {
                    startI: s,
                    endI: e
                },
                noData: NoDataTreat.ignore,
                targetCellNum: cellNum
            }
            let w = new Worker("worker.js");
            w.onmessage = function (ev) {
                resolve(<CalcResult>ev.data);
                w.terminate();
            };
            w.postMessage(arg);
        });
    }
    /** 文字列をバッファに変換する */
    csvToBuf() {
        // 一文字4最大バイトなのでlenght*4
        this.buf = new SharedArrayBuffer(this.csv.length * 4);
        // ArrayBufferをシステムで扱うためにviewを作成
        this.bufView = new Float32Array(this.buf);
        const ite = this.csv[Symbol.iterator]();
        let i = 0;
        for (let v of ite) {
            this.bufView[i] = v.codePointAt(0);
            i++;
        }
        this.bufView = this.bufView.slice(0, i);
    }
}

/** 普通にfor文で計算するパティーン */
export function normalCalc(arg: CalcArg): CalcResult {
    console.time("nParseTime");
    const parse = U.parseCSVKai(arg.csv[Symbol.iterator](), (v: string) => v, U.CSV_SEP, U.LINE_SEP, arg.targetCellNum);
    console.timeEnd("nParseTime");
    let calcArr: number[] = [];
    for (let i = 0, l = parse.targetArr.length; i < l; i++) {
        calcArr.push(parseFloat((parse.targetArr[i]).replace(/^\"+|\"+$/g, "")))
    }
    return U.getAve(calcArr, parse.lineNum, arg.noData);
}