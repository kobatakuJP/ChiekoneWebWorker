import { Utils as U } from "./utils";

export interface CalcArg {
    csv: string,
    targetCellNum: number,
    noData: NoDataTreat
}

export interface WorkArg {
    buf: Float32Array;
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
    /** データなしの場合の扱い規定 */
    noData: NoDataTreat;
    static LINE_SEPARATOR = "\n";
    static LINE_SEPARATOR_CODE: number = "\n".charCodeAt(0);
    /** 同時実行ワーカ数 */
    static WORK_NUM: number = 8; // TODO とりあえず８。
    constructor(csv: string, noData: NoDataTreat) {
        this.csv = csv;
        this.noData = noData;
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
        /** 均等割りした場合の数。これをもとにざっくり仕事を切っていく */
        const aboutSepIndex = Math.ceil(this.csv.length / CsvCalc.WORK_NUM);
        let startI = 0;
        const ite = this.csv[Symbol.iterator]();
        let i = 0, sepStartI = 0;
        let buf = new Float32Array(this.csv.length); // ワーカに渡すバッファ
        for (let v of ite) {
            buf[i - sepStartI] = v.codePointAt(0);
            if ((i > sepStartI + aboutSepIndex && buf[i - sepStartI] === CsvCalc.LINE_SEPARATOR_CODE)) {
                // ざっくり切る範囲の次の改行までを渡す単位として、ワーカに渡す
                result.push(this.doWorker(buf.slice(0, (i - sepStartI + 1)), cellNum));
                sepStartI = i + 1;
                // 次のバッファを作成、作成するバッファ長はだんだん短くて十分になる。
                buf = new Float32Array(this.csv.length - sepStartI);
            }
            i++;
        }
        // 最後の一回はほとんどの場合半端になるはずなので、ここで実行。
        result.push(this.doWorker(buf.slice(0, i - sepStartI), cellNum))
        return result;
    }

    private doWorker(cutCSV: Float32Array, cellNum: number): Promise<CalcResult> {
        // TypedArray.prototype.sliceは結局コピーなのでもったいない。開始終了だけ渡す。
        return new Promise((resolve, reject) => {
            const arg: WorkArg = {
                buf: cutCSV,
                noData: NoDataTreat.ignore,
                targetCellNum: cellNum
            }
            let w = new Worker("worker.js");
            w.onmessage = function (ev) {
                resolve(<CalcResult>ev.data);
                w.terminate();
            };
            w.postMessage(arg, [arg.buf.buffer]);
        });
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