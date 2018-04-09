import { WorkArg, CalcResult } from "./calc.js";
import { Utils as U } from "./utils";

onmessage = function (e) {
    const arg = <WorkArg>e.data;
    console.time("sliceCopyTime");
    let buf = new Float32Array(arg.saBuf).slice(arg.indices.startI, arg.indices.endI);
    console.timeEnd("sliceCopyTime");
    console.time("parseTimework");
    const parse = U.parseCSVKai<number>(buf[Symbol.iterator](), (a: number) => String.fromCodePoint(a), U.CSV_SEP_CODE, U.LINE_SEP_CODE, arg.targetCellNum);
    console.timeEnd("parseTimework")
    let calcArr: number[] = [];
    for (let i = 0, l = parse.targetArr.length; i < l; i++) {
        calcArr.push(parseFloat((parse.targetArr[i]).replace(/^\"+|\"+$/g, "")))
    }
    postMessage(U.getAve(calcArr, parse.lineNum, arg.noData));
}