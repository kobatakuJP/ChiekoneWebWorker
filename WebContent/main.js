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
    constructor(csv, noData) {
        this.csv = csv;
        this.noData = noData;
        this.csvToBuf();
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
        const length = this.bufView.length;
        const aboutSepIndex = Math.ceil(length / CsvCalc.WORK_NUM);
        let startI = 0;
        for (let i = aboutSepIndex; i < length; i++) {
            if (this.bufView[i] === CsvCalc.LINE_SEPARATOR_CODE || i === length - 1) {
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
                saBuf: this.buf,
                indices: {
                    startI: s,
                    endI: e
                },
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
    csvToBuf() {
        this.buf = new SharedArrayBuffer(this.csv.length * 4);
        this.bufView = new Float32Array(this.buf);
        const ite = this.csv[Symbol.iterator]();
        let i = 0;
        for (let v of ite) {
            this.bufView[i] = v.codePointAt(0);
            i++;
        }
        this.bufView = this.bufView.slice(0, i);
    }
    initWorker() {
        this.workerPool = [];
        for (let i = 0; i < CsvCalc.WORK_NUM; i++) {
            this.workerPool.push(new Worker("worker.js"));
        }
    }
    getWorker() {
        this.workerIndex++;
        if (this.workerIndex >= CsvCalc.WORK_NUM) {
            this.workerIndex = 0;
        }
        return this.workerPool[this.workerIndex];
    }
}
CsvCalc.LINE_SEPARATOR_CODE = "\n".charCodeAt(0);
CsvCalc.WORK_NUM = 2;
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
    WorkType[WorkType["webworker"] = 0] = "webworker";
    WorkType[WorkType["normal"] = 1] = "normal";
})(WorkType || (WorkType = {}));
const cg = document.getElementById("csvget");
cg.onclick = function () {
    const a = new XMLHttpRequest();
    a.open("GET", "http://127.0.0.1:8000/bigfile/rice.csv", true);
    a.send();
    a.onreadystatechange = function () {
        if (a.readyState === XMLHttpRequest.DONE) {
            doTest(a.responseText, 1, getWorkType());
        }
    };
};
const t10t = document.getElementById("test10time");
t10t.onclick = function () {
    const a = new XMLHttpRequest();
    a.open("GET", "http://127.0.0.1:8000/bigfile/rice.csv", true);
    a.send();
    a.onreadystatechange = function () {
        if (a.readyState === XMLHttpRequest.DONE) {
            doTest(a.responseText, 10);
        }
    };
};
function doTest(csv, num, worktype) {
    for (let i = 0; i < num; i++) {
        if (!isNaN(worktype)) {
            requestCalc({ csv: csv, targetCellNum: 5, noData: calc_1.NoDataTreat.ignore }, worktype);
        }
        else {
            for (let v in WorkType) {
                const t = parseInt(v);
                if (!isNaN(t)) {
                    requestCalc({ csv: csv, targetCellNum: 5, noData: calc_1.NoDataTreat.ignore }, t);
                }
            }
        }
    }
}
function getWorkType() {
    const wr = document.getElementById("worktype-radio");
    return (parseInt(wr["worktype"].value));
}
async function requestCalc(arg, worktype) {
    let result;
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
function pushResult(result, ms, worktype) {
    if (!window.resultsForTable) {
        window.resultsForTable = new Results(10);
    }
    window.resultsForTable.push({ result, ms }, worktype);
}
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
        normalTH.style.fontWeight = "normal";
        let workerTH = document.createElement("th");
        workerTH.innerHTML = "null";
        workerTH.style.fontWeight = "normal";
        if (normalResult[i] && normalResult[i].result) {
            const normalSubResult = normalResult[i].result;
            const tooltipStr = "linenum:" + normalSubResult.lineNum + "\nave:" + normalSubResult.val + "\nnodata:" + normalSubResult.noDataNum + "\ninvalidData:" + normalSubResult.invalidDataNum;
            normalTH.innerHTML = normalResult[i].ms + "ms";
            normalTH.title = tooltipStr;
            normalsum += normalResult[i].ms;
            normalnum++;
        }
        if (workerResult[i] && workerResult[i].result) {
            const workerSubResult = workerResult[i].result;
            const tooltipStr = "linenum:" + workerSubResult.lineNum + "\nave:" + workerSubResult.val + "\nnodata:" + workerSubResult.noDataNum + "\ninvalidData:" + workerSubResult.invalidDataNum;
            workerTH.innerHTML = workerResult[i].ms + "ms";
            workerTH.title = tooltipStr;
            workersum += workerResult[i].ms;
            workernum++;
        }
        tr_normal.appendChild(normalTH);
        tr_worker.appendChild(workerTH);
    }
    th_normalAve.innerHTML = normalnum > 0 ? Math.ceil(normalsum / normalnum) + "ms" : "null";
    th_workerAve.innerHTML = workernum > 0 ? Math.ceil(workersum / workernum) + "ms" : "null";
    const d = document.getElementById("calc-result");
    d.innerHTML = "";
    d.appendChild(table);
}
class Results {
    constructor(ml) {
        this.maxLength = ml;
        this.result = {};
        for (let v in WorkType) {
            const t = parseInt(v);
            if (!isNaN(t)) {
                this.result[t] = [];
            }
        }
    }
    push(result, worktype) {
        if (!this.result[worktype]) {
            alert("Results.pushできません。worktypeがおかしいです。：" + worktype);
        }
        this.result[worktype].unshift(result);
        if (this.result[worktype].length > this.maxLength) {
            this.result[worktype] = this.result[worktype].slice(0, this.maxLength);
        }
    }
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