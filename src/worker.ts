import { WorkArg, CalcResult } from "./calc.js";
import { Utils as U } from "./utils";

onmessage = function (e) {
    const arg = <WorkArg>e.data;
    console.time("parseTimework");
    const parse = U.parseCSVKai<number>(arg.buf[Symbol.iterator](), (a: number) => String.fromCodePoint(a), U.CSV_SEP_CODE, U.LINE_SEP_CODE, arg.targetCellNum);
    console.timeEnd("parseTimework")
    let calcArr: number[] = [];
    for (let i = 0, l = parse.targetArr.length; i < l; i++) {
        calcArr.push(parseFloat((parse.targetArr[i]).replace(/^\"+|\"+$/g, "")))
    }
    // TODO 引数を2つにすると実行時エラー、引数一つだとビルドエラー。これの対処法を探す。
    postMessage(U.getAve(calcArr, parse.lineNum, arg.noData));
}