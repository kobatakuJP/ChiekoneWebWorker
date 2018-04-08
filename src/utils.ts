import { NoDataTreat, CalcResult } from "./calc";

export namespace Utils {
    export const CSV_SEP = ",";
    export const LINE_SEP = "\n";
    export const CSV_SEP_CODE = CSV_SEP.codePointAt(0);
    export const LINE_SEP_CODE = LINE_SEP.codePointAt(0);
    export const TRIM_STR_CODE = "\"".codePointAt(0);

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

    interface ParseResult {
        targetArr: string[];
        lineNum: number;
    }

    /** 
     * CSVパーサ。イテレータを渡すことで型に縛られずにイテレートする。  
     * 文字コードUTF-8, 改行LF(\n), 禁則文字[",","\n"]
     * @param ite 元CSVデータのイテレータ。stringでもTypedArrayでも、hoge[Symbol.iterator]()でイテレータは取得できる。
     * @param tostr valueをstringに変換するfunction。TypedArrayで必要なはず。
     * @param csvSep CSVのセパレータ。文字列戻したりしたくはないので、そのまま判別したいので。
     * @param lineSep 行セパレータ。同上。
     * @param targetCellNum 返却対象のセル番号。
     */
    export function parseCSVKai<T>(ite: IterableIterator<T>, tostr: (a: T) => string, csvSep: T, lineSep: T, targetCellNum: number): ParseResult {
        let targetCellVal: string[] = [];
        /** 空セルは配列に入らない（飛ばされる） */
        let targetArr: string[] = [];
        let currentCellNum = 0;
        let lineNum = 1;
        let lastChar: T;

        for (let t = ite.next(); t && t.value; t = ite.next()) {
            lastChar = t.value;
            switch (lastChar) {
                case csvSep:
                    currentCellNum++;
                    break;
                case lineSep:
                    currentCellNum = 0;
                    lineNum++;
                    break;
                default:
                // nothing to do
            }
            if (currentCellNum === targetCellNum) {
                if (lastChar !== csvSep && lastChar !== lineSep) {
                    // 当該セル内で、かつセパレータは邪魔なので除く
                    targetCellVal.push(tostr(lastChar));
                }
            } else {
                if (targetCellVal.length !== 0) {
                    // 内容をpush
                    targetArr.push(targetCellVal.join(""));
                    targetCellVal = [];
                }
            }
        }
        if (lastChar === lineSep) {
            // 最後が改行なら、次の行はカウントしないので一歩下がっておく
            lineNum--;
        }
        return { targetArr, lineNum };
    }

    export function getAve(calcArr: number[], lineNum: number, ndt: NoDataTreat): CalcResult {
        let invalidData: number[] = [];
        let sum = 0;
        for (let i = 0, l = calcArr.length; i < l; i++) {
            if (!isNaN(calcArr[i])) {
                // 数値は普通に足す
                sum += calcArr[i];
            } else {
                // データなし配列に添字を入れる
                invalidData.push(i);
            }
        }
        // Noデータを０扱いするかどうかで割り算を変える
        const result = sum / (ndt === NoDataTreat.zero ? lineNum : calcArr.length - invalidData.length);
        return { val: result, lineNum, noDataNum: lineNum - calcArr.length, invalidDataNum: invalidData.length };
    }

    export function margeAve(rs: CalcResult[], ndt: NoDataTreat): CalcResult {
        let tmpresult: CalcResult = { lineNum: 0, val: 0, noDataNum: 0, invalidDataNum: 0 };
        for (let i = 0, l = rs.length; i < l; i++) {
            switch (ndt) {
                case NoDataTreat.ignore:
                    tmpresult.val += rs[i].val * (rs[i].lineNum - rs[i].noDataNum - rs[i].invalidDataNum);
                    break;
                case NoDataTreat.zero:
                    tmpresult.val += rs[i].val * rs[i].lineNum;
                    break;
                default:
            }
            tmpresult.lineNum += rs[i].lineNum;
            tmpresult.invalidDataNum += rs[i].invalidDataNum;
            tmpresult.noDataNum += rs[i].noDataNum;
        }
        let result = tmpresult;
        switch (ndt) {
            case NoDataTreat.ignore:
                result.val = result.val / (result.lineNum - result.noDataNum - result.invalidDataNum);
                break;
            case NoDataTreat.zero:
                result.val = result.val / result.lineNum;
                break;
            default:
        }
        return result;
    }
}