import * as calc from "./calc";
import { NoDataTreat as NDT, CalcArg as CArg, CalcResult as CRslt } from "./calc";

declare global {
    interface Window { resultsForTable: Results; }
}

enum WorkType {
    normal,
    webworker
}

function getWTLavel(wt: WorkType): string {
    switch (wt) {
        case WorkType.normal:
            return "メインでfor文";
        case WorkType.webworker:
            return "WebWorker";
        default:
            return "おかしいので確認して！";
    }
}

const TARGETCELLNUM = 11;
const THREADNUMS = [1, 4, 8, 16];
const RECORDNUMS = [50000, 100000, 200000];
const TESTNUM = 10;
const AVEKEY = 0;

const cg = document.getElementById("csvget");
cg.onclick = function () {
    const a = new XMLHttpRequest();
    const recordNum = parseInt((<HTMLSelectElement>document.getElementById("records-selector")).value);
    const threadNum = parseInt((<HTMLSelectElement>document.getElementById("threads-selector")).value);
    a.open("GET", "http://127.0.0.1:8000/bigfile/csv_" + recordNum + ".csv", true);
    a.send();
    a.onreadystatechange = function () {
        if (a.readyState === XMLHttpRequest.DONE) {
            doTest(a.responseText, 1, getWorkType(), recordNum, threadNum);
        }
    }.bind(recordNum, threadNum)
}

const t10t = document.getElementById("test10time");
t10t.onclick = function () {
    alert("⚠工事中⚠");
    // const a = new XMLHttpRequest();
    // a.open("GET", "http://127.0.0.1:8000/bigfile/rice.csv", true);
    // a.send();
    // a.onreadystatechange = function () {
    //     if (a.readyState === XMLHttpRequest.DONE) {
    //         doTest(a.responseText, 10);
    //     }
    // }
}

function doTest(csv: string, num: number, worktype: WorkType, recordNum: number, threadNum: number) {
    for (let i = 0; i < num; i++) {
        if (!isNaN(worktype)) {
            requestCalc({ csv: csv, targetCellNum: TARGETCELLNUM, noData: NDT.ignore }, worktype, recordNum, threadNum);
        } else {
            alert("worktype invalid!: " + worktype);
        }
    }
}

/** 画面のワークタイプ選択ラジオボタンからワークタイプを割り出す */
function getWorkType(): WorkType {
    const wr = <HTMLFormElement>document.getElementById("worktype-radio");
    return <WorkType>(parseInt(wr["worktype"].value));
}

async function requestCalc(arg: CArg, worktype: WorkType, recordNum: number, threadNum: number) {
    let result: CRslt;
    let time = Date.now();
    switch (worktype) {
        case WorkType.webworker:
            const c = new calc.CsvCalc(arg.csv, arg.noData, threadNum);
            result = await c.getAve(arg.targetCellNum);
            break;
        case WorkType.normal:
            result = calc.normalCalc(arg);
            break;
        default:
            alert("worktypeがおかしいんじゃ:" + worktype);
    }
    time = Date.now() - time;
    pushResult(result, time, recordNum, threadNum, worktype);
    window.resultsForTable.drawOutput();
}

function pushResult(result: CRslt, ms: number, recordNum: number, threadNum: number, worktype: WorkType) {
    if (!window.resultsForTable) {
        window.resultsForTable = new Results();
    }
    window.resultsForTable.push({ result, ms }, worktype, recordNum, threadNum);
}

function initOutPutTable() {
    const headers = ["record", "種別", "thread", "平均", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
    const table = document.createElement("table");
    const tr_header = document.createElement("tr"); table.appendChild(tr_header);
    for (let h of headers) {
        const th = document.createElement("th");
        th.innerHTML = h;
        tr_header.appendChild(th);
    }
    for (let RN of RECORDNUMS) {
        let tr = document.createElement("tr"); table.appendChild(tr);
        const th_RN = document.createElement("th"); tr.appendChild(th_RN);
        /** レコード数が書かれるカラムの縦結合長 */
        let RNRowCount = 0;
        th_RN.innerHTML = RN.toString(); // レコード数が書いてあるカラム
        let firstWT = true;
        for (let WT_STR in WorkType) {
            const WT = parseInt(WT_STR);
            if (!isNaN(WT)) {
                if (firstWT) {
                    firstWT = false;
                } else {
                    tr = document.createElement("tr"); table.appendChild(tr);
                }
                const th_WT = document.createElement("th"); tr.appendChild(th_WT);
                th_WT.innerHTML = getWTLavel(WT); // 仕事種別が書いてあるカラム
                /** 種別が書かれるカラムの縦結合長 */
                let WTRowCont = 0;
                let firstTN = true;
                for (let TN of THREADNUMS) {
                    RNRowCount++;
                    WTRowCont++;
                    if (firstTN) {
                        firstTN = false;
                    } else {
                        tr = document.createElement("tr"); table.appendChild(tr);
                    }
                    if (WT === WorkType.normal) {
                        // 通常for文の場合はスレッド数とかないので0を入れておく
                        TN = 0;
                    }
                    const th_TN = document.createElement("th"); tr.appendChild(th_TN);
                    th_TN.innerHTML = TN === 0 ? "-" : TN.toString(); // スレッド数が書いてあるカラム、0なら-にしておく
                    // 値を格納するときに辿れるようにidを付与する
                    // 平均値カラム
                    const th_AVE = document.createElement("th"); tr.appendChild(th_AVE);
                    th_AVE.id = createColumnID(RN, TN, WT, AVEKEY); // アベレージは0カラムとする
                    th_AVE.innerHTML = "N/A";
                    for (let i = 1; i <= TESTNUM; i++) {
                        // 1～10のID付与するので、0始まりじゃなくした。
                        const result = document.createElement("td"); tr.appendChild(result);
                        // 値を格納するときに辿れるようにidを付与する
                        result.id = createColumnID(RN, TN, WT, i);
                        result.innerHTML = "N/A";
                    }
                    if (TN === 0) {
                        break;
                    }
                }
                th_WT.rowSpan = WTRowCont;
            }
        }
        th_RN.rowSpan = RNRowCount;
    }

    const d = <HTMLDivElement>document.getElementById("calc-result");
    d.innerHTML = "";
    d.appendChild(table);
}

/** ID生成。すごく雑に作ってあるがnumberが来たらtoStringしてくれるしいい感じに動くはず。 */
function createColumnID(recordnum: number | string, threadnum: number | string, worktype: number | string, num: number | string): string {
    return recordnum + "_" + worktype + "_" + threadnum + "_" + num;
}

class Results {
    result: { [recordnum: number]: { [worktype: number]: { [threadnum: number]: { result: CRslt, ms: number }[] } } };
    constructor() {
        this.result = {};
        for (let rn of RECORDNUMS) {
            this.result[rn] = {};
            for (let v in WorkType) {
                const t = parseInt(v);
                if (!isNaN(t)) {
                    this.result[rn][t] = {};
                    if (t === WorkType.normal) {
                        // 通常ケースではスレッド数関係ないので
                        this.result[rn][t][0] = [];
                    }
                    for (let tn of THREADNUMS) {
                        this.result[rn][t][tn] = [];
                    }
                }
            }
        }
        initOutPutTable();
    }
    push(result: { result: CRslt, ms: number }, worktype: WorkType, recordnum: number, threadnum: number) {
        if (worktype === WorkType.normal) {
            // 通常ケースではスレッド数関係ないので
            threadnum = 0;
        }
        if (!this.result[recordnum] || !this.result[recordnum][worktype] || !this.result[recordnum][worktype][threadnum]) {
            alert("Results.pushできません。なにかがおかしいです。recordnum:" + recordnum + ", threadnum:" + threadnum + ", worktype:" + worktype);
        }
        this.result[recordnum][worktype][threadnum].unshift(result);
        if (this.result[recordnum][worktype][threadnum].length > TESTNUM) {
            this.result[recordnum][worktype][threadnum] = this.result[recordnum][worktype][threadnum].slice(0, TESTNUM);
        }
    }
    drawOutput() {
        // こちらはキー値で拾っていくので、constructorと異なりfor...inである。
        for (let rn in this.result) {
            for (let wt in this.result[rn]) {
                for (let tn in this.result[rn][wt]) {
                    const val = this.result[rn][wt][tn];
                    let sum = 0;
                    for (let i = 0, l = val.length; i < l; i++) {
                        // DOM探しの時、iを一つ増やすことだけ注意する。
                        const column = document.getElementById(createColumnID(rn, tn, wt, i + 1));
                        column.innerHTML = val[i].ms + "";
                        column.title = "linenum:" + val[i].result.lineNum + "\nave:" + val[i].result.val + "\nnodata:" + val[i].result.noDataNum + "\ninvalidData:" + val[i].result.invalidDataNum;
                        sum += val[i].ms;
                    }
                    if (val.length > 0) {
                        const ave = document.getElementById(createColumnID(rn, tn, wt, AVEKEY));
                        ave.innerHTML = (sum / val.length) + "ms";
                    }
                }
            }
        }
    }
}

if (!window.resultsForTable) {
    window.resultsForTable = new Results();
}