import { WorkArg, CalcResult } from "./calc.js";
import { Utils as U } from "./utils";

onmessage = function (e) {
    const arg = <WorkArg>e.data;
    let buf = new Float32Array(arg.saBuf);
    let calcArr: number[] = [];
    console.time("calctime");
    const parseArg = { csvBuf: buf, calcArr: calcArr, currentCellStartI: arg.indices.startI, i: arg.indices.startI, cellNum: 0, targetCellNum: arg.targetCellNum };
    for (const l = arg.indices.endI; parseArg.i < l; parseArg.i++) {
        U.parseCSVForBuf(parseArg);
    }

    // TODO 引数を2つにすると実行時エラー、引数一つだとビルドエラー。これの対処法を探す。
    postMessage(U.getAve(parseArg.calcArr, arg.noData));
}