import { WorkArg, CalcResult } from "./calc.js";
import { Utils as U } from "./utils";

onmessage = function (e) {
    const arg = <WorkArg>e.data;
    console.time("parseTimework");
    const parse = U.parseCSVKai<string>(arg.str[Symbol.iterator](), (a: string) => a, U.CSV_SEP, U.LINE_SEP, arg.targetCellNum);
    console.timeEnd("parseTimework")
    let calcArr: number[] = [];
    for (let i = 0, l = parse.targetArr.length; i < l; i++) {
        calcArr.push(parseFloat((parse.targetArr[i]).replace(/^\"+|\"+$/g, "")))
    }
    postMessage(U.getAve(calcArr, parse.lineNum, arg.noData));
}