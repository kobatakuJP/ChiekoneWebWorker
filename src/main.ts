import * as calc from "./calc";
import { NoDataTreat as NDT, CalcArg as CArg, CalcResult as CRslt } from "./calc";

declare global {
    interface Window { resultsForTable: Results; }
}

enum WorkType {
    webworker,
    normal
}

const cg = document.getElementById("csvget");
cg.onclick = function () {
    const a = new XMLHttpRequest();
    a.open("GET", "http://127.0.0.1:8000/bigfile/rice.csv", true);
    a.send();
    a.onreadystatechange = function () {
        if (a.readyState === XMLHttpRequest.DONE) {
            doTest(a.responseText, 1, getWorkType());
        }
    }
}

const t10t = document.getElementById("test10time");
t10t.onclick = function () {
    const a = new XMLHttpRequest();
    a.open("GET", "http://127.0.0.1:8000/bigfile/rice.csv", true);
    a.send();
    a.onreadystatechange = function () {
        if (a.readyState === XMLHttpRequest.DONE) {
            doTest(a.responseText, 10);
        }
    }
}

function doTest(csv: string, num: number, worktype?: WorkType) {
    for (let i = 0; i < num; i++) {
        if (!isNaN(worktype)) {
            requestCalc({ csv: csv, targetCellNum: 5, noData: NDT.ignore }, worktype);
        } else {
            for (let v in WorkType) {
                const t = parseInt(v);
                if (!isNaN(t)) {
                    requestCalc({ csv: csv, targetCellNum: 5, noData: NDT.ignore }, t);
                }
            }
        }
    }
}

/** 画面のワークタイプ選択ラジオボタンからワークタイプを割り出す */
function getWorkType(): WorkType {
    const wr = <HTMLFormElement>document.getElementById("worktype-radio");
    return <WorkType>(parseInt(wr["worktype"].value));
}

async function requestCalc(arg: CArg, worktype: WorkType) {
    let result: CRslt;
    let time = Date.now();
    switch (worktype) {
        case WorkType.webworker:
            const c = new calc.CsvCalc(arg.csv, arg.noData);
            result = await c.getAve(arg.targetCellNum);
            break;
        case WorkType.normal:
            result = calc.normalCalc(arg);
            break;
        default:
            alert("worktypeがおかしいんじゃ:" + worktype);
    }
    time = Date.now() - time;
    pushResult(result, time, worktype);
    resultOutPut();
}

function pushResult(result: CRslt, ms: number, worktype: WorkType) {
    if (!window.resultsForTable) {
        window.resultsForTable = new Results(10);
    }
    window.resultsForTable.push({ result, ms }, worktype);
}

/** 結果を表示するDOM職人 */
function resultOutPut() {
    const table = document.createElement("table");
    const tr_header = document.createElement("tr");
    const kind = document.createElement("th");
    kind.innerHTML = "種別";
    tr_header.appendChild(kind);
    const ave = document.createElement("th");
    ave.innerHTML = "平均";
    tr_header.appendChild(ave);
    for (let i = 0; i < (window.resultsForTable ? window.resultsForTable.maxLength : 0); i++) {
        const header = document.createElement("th");
        header.innerHTML = (i + 1).toString();
        tr_header.appendChild(header);
    }
    table.appendChild(tr_header);

    const tr_normal = document.createElement("tr");
    const tr_worker = document.createElement("tr");
    const th_normalTitle = document.createElement("th");
    th_normalTitle.innerHTML = "フツーのfor文";
    const th_normalAve = document.createElement("th");
    th_normalAve.innerHTML = "null";
    tr_normal.appendChild(th_normalTitle);
    tr_normal.appendChild(th_normalAve);
    const th_workerTitle = document.createElement("th");
    th_workerTitle.innerHTML = "WebWorker";
    const th_workerAve = document.createElement("th");
    th_workerAve.innerHTML = "null";
    tr_worker.appendChild(th_workerTitle);
    tr_worker.appendChild(th_workerAve);

    table.appendChild(tr_normal);
    table.appendChild(tr_worker);

    const normalResult = window.resultsForTable.result[WorkType.normal];
    const workerResult = window.resultsForTable.result[WorkType.webworker];
    let normalsum = 0;
    let normalnum = 0;
    let workersum = 0;
    let workernum = 0;
    for (let i = 0, l = window.resultsForTable.maxLength; i < l; i++) {
        let normalTH = document.createElement("th");
        normalTH.innerHTML = "null";
        let workerTH = document.createElement("th");
        workerTH.innerHTML = "null";
        if (normalResult[i] && normalResult[i].result) {
            const normalSubResult = normalResult[i].result;
            const tooltipStr = "linenum:" + normalSubResult.lineNum + "\nave:" + normalSubResult.val + "\nnodata:" + normalSubResult.noDataNum + "\ninvalidData:" + normalSubResult.invalidDataNum;
            normalTH.innerHTML = normalResult[i].ms + "ms";
            normalTH.title = tooltipStr;
            normalTH.style.fontWeight = "normal";
            normalsum += normalResult[i].ms;
            normalnum++;
        }
        if (workerResult[i] && workerResult[i].result) {
            const workerSubResult = workerResult[i].result;
            const tooltipStr = "linenum:" + workerSubResult.lineNum + "\nave:" + workerSubResult.val + "\nnodata:" + workerSubResult.noDataNum + "\ninvalidData:" + workerSubResult.invalidDataNum;
            workerTH.innerHTML = workerResult[i].ms + "ms";
            workerTH.title = tooltipStr;
            workerTH.style.fontWeight = "normal";
            workersum += workerResult[i].ms;
            workernum++;
        }
        tr_normal.appendChild(normalTH);
        tr_worker.appendChild(workerTH);
    }
    th_normalAve.innerHTML = normalnum > 0 ? Math.ceil(normalsum / normalnum) + "ms" : "null";
    th_workerAve.innerHTML = workernum > 0 ? Math.ceil(workersum / workernum) + "ms" : "null";

    const d = <HTMLDivElement>document.getElementById("calc-result");
    d.innerHTML = "";
    d.appendChild(table);
}

class Results {
    result: { [worktype: number]: { result: CRslt, ms: number }[] };
    maxLength: number;
    constructor(ml: number) {
        this.maxLength = ml;
        this.result = {};
        for (let v in WorkType) {
            const t = parseInt(v);
            if (!isNaN(t)) {
                this.result[t] = [];
            }
        }
    }
    push(result: { result: CRslt, ms: number }, worktype: WorkType) {
        if (!this.result[worktype]) {
            alert("Results.pushできません。worktypeがおかしいです。：" + worktype);
        }
        this.result[worktype].unshift(result);
        if (this.result[worktype].length > this.maxLength) {
            this.result[worktype] = this.result[worktype].slice(0, this.maxLength);
        }
    }
}