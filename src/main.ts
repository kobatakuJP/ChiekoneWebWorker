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
            requestCalc({ csv: a.responseText, targetCellNum: 5, noData: NDT.ignore }, getWorkType());
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
    tr_normal.appendChild(th_normalTitle);
    const th_workerTitle = document.createElement("th");
    th_workerTitle.innerHTML = "WebWorker";
    tr_worker.appendChild(th_workerTitle);

    table.appendChild(tr_normal);
    table.appendChild(tr_worker);

    const normalResult = window.resultsForTable.result[WorkType.normal];
    const workerResult = window.resultsForTable.result[WorkType.webworker];
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
        }
        if (workerResult[i] && workerResult[i].result) {
            const workerSubResult = workerResult[i].result;
            const tooltipStr = "linenum:" + workerSubResult.lineNum + "\nave:" + workerSubResult.val + "\nnodata:" + workerSubResult.noDataNum + "\ninvalidData:" + workerSubResult.invalidDataNum;
            workerTH.innerHTML = workerResult[i].ms + "ms";
            workerTH.title = tooltipStr;
        }
        tr_normal.appendChild(normalTH);
        tr_worker.appendChild(workerTH);
    }

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