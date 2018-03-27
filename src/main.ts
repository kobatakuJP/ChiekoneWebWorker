import * as calc from "./calc";
import { NoDataTreat as NDT, CalcArg as CArg, CalcResult as CRslt } from "./calc";

enum WorkType {
    webworker,
    normal
}

let w = new Worker("worker.js");
let w2 = new Worker("worker.js");
const wb = document.getElementById("workbtn");
const cg = document.getElementById("csvget");
let sb = new SharedArrayBuffer(12);
let bufView = new Float32Array(sb);

wb.onclick = function () {
    w.postMessage(sb);
    setTimeout(function () {
        for (let i = 0; i < 10; i++) {
            console.log(bufView[i])
        }
    }, 1000)
};

cg.onclick = function () {
    const a = new XMLHttpRequest();
    a.open("GET", "http://127.0.0.1:8000/bigfile/rice.csv", true);
    a.send();
    a.onreadystatechange = function () {
        if (a.readyState === XMLHttpRequest.DONE) {
            requestCalc({ csv: a.responseText, targetCellNum: 5, noData: NDT.ignore }, WorkType.normal);
        }
    }
}

function requestCalc(arg: CArg, worktype: WorkType) {
    let result: calc.CalcResult;
    let time = Date.now();
    switch (worktype) {
        case WorkType.webworker:
            const c = new calc.CsvCalc(arg.csv);
            // result = c.getAve(5);
            break;
        case WorkType.normal:
            result = calc.normalCalc(arg);
            break;
        default:
            alert("worktypeがおかしいんじゃ:" + worktype);
    }
    time = Date.now() - time;
    resultOutPut(result, time, worktype);
}

function resultOutPut(result: CRslt, ms: number, worktype: WorkType) {
    const resultstr = result ? "worktype:" + WorkType[worktype] + "<br>time:" + ms + "ms" + "<br>linenum:" + result.lineNum + "<br>ave:" + result.val + "<br>nodata:" + result.noDataIdx.length : "null!";
    const d = <HTMLDivElement>document.getElementById("calc-result");
    d.innerHTML = resultstr;
}