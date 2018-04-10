/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/main.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/calc.ts":
/*!*********************!*\
  !*** ./src/calc.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = __webpack_require__(/*! ./utils */ "./src/utils.ts");
var NoDataTreat;
(function (NoDataTreat) {
    NoDataTreat[NoDataTreat["ignore"] = 0] = "ignore";
    NoDataTreat[NoDataTreat["zero"] = 1] = "zero";
})(NoDataTreat = exports.NoDataTreat || (exports.NoDataTreat = {}));
class CsvCalc {
    constructor(csv, noData, threadNum) {
        this.csv = csv;
        this.noData = noData;
        this.workNum = threadNum;
        this.initWorker();
        this.workerIndex = 0;
    }
    async getAve(cellNum) {
        const promiz = this.separateAndAssignWork(cellNum);
        const vals = await Promise.all(promiz);
        return utils_1.Utils.margeAve(vals, this.noData);
    }
    separateAndAssignWork(cellNum) {
        let result = [];
        const length = this.csv.length;
        const aboutSepIndex = Math.ceil(length / this.workNum);
        let startI = 0;
        for (let i = aboutSepIndex; i < length; i++) {
            if (this.csv[i] === CsvCalc.LINE_SEPARATOR || i === length - 1) {
                result.push(this.doWorker(startI, i, cellNum));
                startI = i + 1;
                i = i + aboutSepIndex - 1;
                if (i > length) {
                    break;
                }
            }
        }
        result.push(this.doWorker(startI, length - 1, cellNum));
        return result;
    }
    doWorker(s, e, cellNum) {
        return new Promise((resolve, reject) => {
            const arg = {
                str: this.csv.slice(s, e),
                noData: NoDataTreat.ignore,
                targetCellNum: cellNum
            };
            let w = this.getWorker();
            w.onmessage = function (ev) {
                resolve(ev.data);
                w.terminate();
            };
            w.postMessage(arg);
        });
    }
    initWorker() {
        this.workerPool = [];
        for (let i = 0; i < this.workNum; i++) {
            this.workerPool.push(new Worker("worker.js"));
        }
    }
    getWorker() {
        this.workerIndex++;
        if (this.workerIndex >= this.workNum) {
            this.workerIndex = 0;
        }
        return this.workerPool[this.workerIndex];
    }
}
CsvCalc.LINE_SEPARATOR = "\n";
exports.CsvCalc = CsvCalc;
function normalCalc(arg) {
    console.time("nParseTime");
    const parse = utils_1.Utils.parseCSVKai(arg.csv[Symbol.iterator](), (v) => v, utils_1.Utils.CSV_SEP, utils_1.Utils.LINE_SEP, arg.targetCellNum);
    console.timeEnd("nParseTime");
    let calcArr = [];
    for (let i = 0, l = parse.targetArr.length; i < l; i++) {
        calcArr.push(parseFloat((parse.targetArr[i]).replace(/^\"+|\"+$/g, "")));
    }
    return utils_1.Utils.getAve(calcArr, parse.lineNum, arg.noData);
}
exports.normalCalc = normalCalc;


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const calc = __webpack_require__(/*! ./calc */ "./src/calc.ts");
const calc_1 = __webpack_require__(/*! ./calc */ "./src/calc.ts");
var WorkType;
(function (WorkType) {
    WorkType[WorkType["normal"] = 0] = "normal";
    WorkType[WorkType["webworker"] = 1] = "webworker";
})(WorkType || (WorkType = {}));
function getWTLavel(wt) {
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
    const recordNum = parseInt(document.getElementById("records-selector").value);
    const threadNum = parseInt(document.getElementById("threads-selector").value);
    a.open("GET", "http://127.0.0.1:8000/bigfile/csv_" + recordNum + ".csv", true);
    a.send();
    a.onreadystatechange = function () {
        if (a.readyState === XMLHttpRequest.DONE) {
            doTest(a.responseText, 1, getWorkType(), recordNum, threadNum);
        }
    }.bind(recordNum, threadNum);
};
const t10t = document.getElementById("test10time");
t10t.onclick = function () {
    alert("⚠工事中⚠");
};
function doTest(csv, num, worktype, recordNum, threadNum) {
    for (let i = 0; i < num; i++) {
        if (!isNaN(worktype)) {
            requestCalc({ csv: csv, targetCellNum: TARGETCELLNUM, noData: calc_1.NoDataTreat.ignore }, worktype, recordNum, threadNum);
        }
        else {
            alert("worktype invalid!: " + worktype);
        }
    }
}
function getWorkType() {
    const wr = document.getElementById("worktype-radio");
    return (parseInt(wr["worktype"].value));
}
async function requestCalc(arg, worktype, recordNum, threadNum) {
    let result;
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
function pushResult(result, ms, recordNum, threadNum, worktype) {
    if (!window.resultsForTable) {
        window.resultsForTable = new Results();
    }
    window.resultsForTable.push({ result, ms }, worktype, recordNum, threadNum);
}
function initOutPutTable() {
    const headers = ["record", "種別", "thread", "平均", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
    const table = document.createElement("table");
    const tr_header = document.createElement("tr");
    table.appendChild(tr_header);
    for (let h of headers) {
        const th = document.createElement("th");
        th.innerHTML = h;
        tr_header.appendChild(th);
    }
    for (let RN of RECORDNUMS) {
        let tr = document.createElement("tr");
        table.appendChild(tr);
        const th_RN = document.createElement("th");
        tr.appendChild(th_RN);
        let RNRowCount = 0;
        th_RN.innerHTML = RN.toString();
        let firstWT = true;
        for (let WT_STR in WorkType) {
            const WT = parseInt(WT_STR);
            if (!isNaN(WT)) {
                if (firstWT) {
                    firstWT = false;
                }
                else {
                    tr = document.createElement("tr");
                    table.appendChild(tr);
                }
                const th_WT = document.createElement("th");
                tr.appendChild(th_WT);
                th_WT.innerHTML = getWTLavel(WT);
                let WTRowCont = 0;
                let firstTN = true;
                for (let TN of THREADNUMS) {
                    RNRowCount++;
                    WTRowCont++;
                    if (firstTN) {
                        firstTN = false;
                    }
                    else {
                        tr = document.createElement("tr");
                        table.appendChild(tr);
                    }
                    if (WT === WorkType.normal) {
                        TN = 0;
                    }
                    const th_TN = document.createElement("th");
                    tr.appendChild(th_TN);
                    th_TN.innerHTML = TN === 0 ? "-" : TN.toString();
                    const th_AVE = document.createElement("th");
                    tr.appendChild(th_AVE);
                    th_AVE.id = createColumnID(RN, TN, WT, AVEKEY);
                    th_AVE.innerHTML = "N/A";
                    for (let i = 1; i <= TESTNUM; i++) {
                        const result = document.createElement("td");
                        tr.appendChild(result);
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
    const d = document.getElementById("calc-result");
    d.innerHTML = "";
    d.appendChild(table);
}
function createColumnID(recordnum, threadnum, worktype, num) {
    return recordnum + "_" + worktype + "_" + threadnum + "_" + num;
}
class Results {
    constructor() {
        this.result = {};
        for (let rn of RECORDNUMS) {
            this.result[rn] = {};
            for (let v in WorkType) {
                const t = parseInt(v);
                if (!isNaN(t)) {
                    this.result[rn][t] = {};
                    if (t === WorkType.normal) {
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
    push(result, worktype, recordnum, threadnum) {
        if (worktype === WorkType.normal) {
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
        for (let rn in this.result) {
            for (let wt in this.result[rn]) {
                for (let tn in this.result[rn][wt]) {
                    const val = this.result[rn][wt][tn];
                    let sum = 0;
                    for (let i = 0, l = val.length; i < l; i++) {
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


/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const calc_1 = __webpack_require__(/*! ./calc */ "./src/calc.ts");
var Utils;
(function (Utils) {
    Utils.CSV_SEP = ",";
    Utils.LINE_SEP = "\n";
    Utils.CSV_SEP_CODE = Utils.CSV_SEP.codePointAt(0);
    Utils.LINE_SEP_CODE = Utils.LINE_SEP.codePointAt(0);
    Utils.TRIM_STR_CODE = "\"".codePointAt(0);
    function parseCSV(arg) {
        switch (arg.csvArr[arg.i]) {
            case Utils.CSV_SEP:
            case Utils.LINE_SEP:
                if (arg.cellNum === arg.targetCellNum) {
                    arg.calcArr.push(parseFloat((arg.csvArr.slice(arg.currentCellStartI, arg.i).join("")).replace(/^\"+|\"+$/g, "")));
                }
                arg.currentCellStartI = arg.i + 1;
                if (arg.csvArr[arg.i] === Utils.CSV_SEP) {
                    arg.cellNum++;
                }
                else if (arg.csvArr[arg.i] === Utils.LINE_SEP) {
                    arg.cellNum = 0;
                }
                break;
            default:
        }
    }
    Utils.parseCSV = parseCSV;
    function parseCSVKai(ite, tostr, csvSep, lineSep, targetCellNum) {
        let targetCellVal = [];
        let targetArr = [];
        let currentCellNum = 0;
        let lineNum = 1;
        let lastChar;
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
            }
            if (currentCellNum === targetCellNum) {
                if (lastChar !== csvSep && lastChar !== lineSep) {
                    targetCellVal.push(tostr(lastChar));
                }
            }
            else {
                if (targetCellVal.length !== 0) {
                    targetArr.push(targetCellVal.join(""));
                    targetCellVal = [];
                }
            }
        }
        if (lastChar === lineSep) {
            lineNum--;
        }
        return { targetArr, lineNum };
    }
    Utils.parseCSVKai = parseCSVKai;
    function getAve(calcArr, lineNum, ndt) {
        let invalidData = [];
        let sum = 0;
        for (let i = 0, l = calcArr.length; i < l; i++) {
            if (!isNaN(calcArr[i])) {
                sum += calcArr[i];
            }
            else {
                invalidData.push(i);
            }
        }
        const result = sum / (ndt === calc_1.NoDataTreat.zero ? lineNum : calcArr.length - invalidData.length);
        return { val: result, lineNum, noDataNum: lineNum - calcArr.length, invalidDataNum: invalidData.length };
    }
    Utils.getAve = getAve;
    function margeAve(rs, ndt) {
        let tmpresult = { lineNum: 0, val: 0, noDataNum: 0, invalidDataNum: 0 };
        for (let i = 0, l = rs.length; i < l; i++) {
            switch (ndt) {
                case calc_1.NoDataTreat.ignore:
                    tmpresult.val += rs[i].val * (rs[i].lineNum - rs[i].noDataNum - rs[i].invalidDataNum);
                    break;
                case calc_1.NoDataTreat.zero:
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
            case calc_1.NoDataTreat.ignore:
                result.val = result.val / (result.lineNum - result.noDataNum - result.invalidDataNum);
                break;
            case calc_1.NoDataTreat.zero:
                result.val = result.val / result.lineNum;
                break;
            default:
        }
        return result;
    }
    Utils.margeAve = margeAve;
})(Utils = exports.Utils || (exports.Utils = {}));


/***/ })

/******/ });
//# sourceMappingURL=main.js.map