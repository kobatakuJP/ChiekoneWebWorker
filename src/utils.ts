import { NoDataTreat, CalcResult } from "./calc";

export namespace Utils {
    const CSV_SEP = ",";
    const LINE_SEP = "\n";
    const CSV_SEP_CODE = CSV_SEP.codePointAt(0);
    const LINE_SEP_CODE = LINE_SEP.codePointAt(0);
    const TRIM_STR_CODE = "\"".codePointAt(0);

    /** CSVパーサ。ダブルクォートなどはまったく考慮していない。 */
    export function parseCSV(arg: { csvArr: string[], calcArr: number[], currentCellStartI: number, i: number, cellNum: number, targetCellNum: number }): void {
        switch (arg.csvArr[arg.i]) {
            case CSV_SEP:
            case LINE_SEP:
                // セルの終わりなので、現在のセル確認
                if (arg.cellNum === arg.targetCellNum) {
                    // 現在ターゲットセルにいれば、中身を計算対象に入れる。数値じゃなきゃNaNを入れて、後処理で頑張ってもらう。
                    arg.calcArr.push(parseFloat((arg.csvArr.slice(arg.currentCellStartI, arg.i).join("")).replace(/^\"+|\"+$/g, "")));
                }
                arg.currentCellStartI = arg.i + 1; // 次の文字がセル開始位置
                if (arg.csvArr[arg.i] === CSV_SEP) {
                    // セル区切りなのでセル番を更新
                    arg.cellNum++;
                } else if (arg.csvArr[arg.i] === LINE_SEP) {
                    // 行区切りなので、セル番をリセット
                    arg.cellNum = 0;
                }
                break;
            default:
        }
    }

    /** TypedArrayベース用のCSVパーサ */
    export function parseCSVForBuf(arg: { csvBuf: Float32Array, calcArr: number[], currentCellStartI: number, i: number, cellNum: number, targetCellNum: number }): void {
        switch (arg.csvBuf[arg.i]) {
            case CSV_SEP_CODE:
            case LINE_SEP_CODE:
                // セルの終わりなので、現在のセル確認
                if (arg.cellNum === arg.targetCellNum) {
                    // 現在ターゲットセルにいれば、中身を計算対象に入れる。数値じゃなきゃNaNを入れて、後処理で頑張ってもらう。
                    arg.calcArr.push(parseFloat(getStrArrFromF32Arr(arg.currentCellStartI, arg.i, arg.csvBuf, TRIM_STR_CODE)));
                }
                arg.currentCellStartI = arg.i + 1; // 次の文字がセル開始位置
                if (arg.csvBuf[arg.i] === CSV_SEP_CODE) {
                    // セル区切りなのでセル番を更新
                    arg.cellNum++;
                } else if (arg.csvBuf[arg.i] === LINE_SEP_CODE) {
                    // 行区切りなので、セル番をリセット
                    arg.cellNum = 0;
                }
                break;
            default:
        }
    }

    function getStrArrFromF32Arr(s: number, e: number, f: Float32Array, trimStrCode: number): string {
        let frontTrimNum = 0;
        let backTrimNum = 0;
        // 前のtrim探し
        for (let i = s; i < e; i++) {
            if (f[i] === trimStrCode) {
                frontTrimNum++;
            } else {
                break;
            }
        }
        // 後ろのtrim探し
        for (let i = e - 1; i > s; i--) {
            if (f[i] === trimStrCode) {
                backTrimNum++;
            } else {
                break;
            }
        }
        let result: string[] = [];
        // trim後の文字列を生成
        for (let i = s + frontTrimNum, l = e - backTrimNum; i < l; i++) {
            result.push(String.fromCodePoint(f[i]));
        }
        return result.join("");
    }


    export function getAve(calcArr: number[], ndt: NoDataTreat): CalcResult {
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

    export function margeAve(rs: CalcResult[], ndt: NoDataTreat): CalcResult {
        let tmpresult: CalcResult = { lineNum: 0, noDataIdx: [], val: 0 };
        for (let i = 0, l = rs.length; i < l; i++) {
            switch (ndt) {
                case NoDataTreat.ignore:
                    tmpresult.val += rs[i].val * (rs[i].lineNum - rs[i].noDataIdx.length);
                    break;
                case NoDataTreat.zero:
                    tmpresult.val += rs[i].val * rs[i].lineNum;
                    break;
                default:
            }
            tmpresult.lineNum += rs[i].lineNum;
            tmpresult.noDataIdx = tmpresult.noDataIdx.concat(rs[i].noDataIdx);
        }
        let result = tmpresult;
        switch (ndt) {
            case NoDataTreat.ignore:
                result.val = result.val / (result.lineNum - result.noDataIdx.length);
                break;
            case NoDataTreat.zero:
                result.val = result.val / result.lineNum;
                break;
            default:
        }
        return result;
    }
}