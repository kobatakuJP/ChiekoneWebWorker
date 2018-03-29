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
            let w = new Worker("worker.js");
            w.onmessage = function (ev) {
                resolve(ev.data);
            };
            w.postMessage(arg);
        });
    }
    csvToBuf() {
        this.csvArr = Array.from(this.csv);
        this.buf = new SharedArrayBuffer(this.csvArr.length * 4);
        this.bufView = new Float32Array(this.buf);
        for (let i = 0, l = this.bufView.length; i < l; i++) {
            this.bufView[i] = this.csvArr[i].codePointAt(0);
        }
    }
}
CsvCalc.LINE_SEPARATOR_CODE = "\n".charCodeAt(0);
CsvCalc.WORK_NUM = 8;
exports.CsvCalc = CsvCalc;
function normalCalc(arg) {
    const csvArr = Array.from(arg.csv);
    let calcArr = [];
    console.time("calctime");
    const parseArg = { csvArr: csvArr, calcArr: calcArr, currentCellStartI: 0, i: 0, cellNum: 0, targetCellNum: arg.targetCellNum };
    for (const l = csvArr.length; parseArg.i < l; parseArg.i++) {
        utils_1.Utils.parseCSV(parseArg);
    }
    console.timeEnd("calctime");
    return utils_1.Utils.getAve(calcArr, arg.noData);
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
let w = new Worker("worker.js");
const wb = document.getElementById("workbtn");
const cg = document.getElementById("csvget");
let sb = new SharedArrayBuffer(12);
let bufView = new Float32Array(sb);
wb.onclick = function () {
    w.postMessage(sb);
    setTimeout(function () {
        for (let i = 0; i < 10; i++) {
            console.log(bufView[i]);
        }
    }, 1000);
};
cg.onclick = function () {
    const a = new XMLHttpRequest();
    a.open("GET", "http://127.0.0.1:8000/bigfile/rice.csv", true);
    a.send();
    a.onreadystatechange = function () {
        if (a.readyState === XMLHttpRequest.DONE) {
            requestCalc({ csv: a.responseText, targetCellNum: 5, noData: calc_1.NoDataTreat.ignore }, getWorkType());
        }
    };
};
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
    resultOutPut(result, time, worktype);
}
function resultOutPut(result, ms, worktype) {
    const resultstr = result ? "worktype:" + WorkType[worktype] + "<br>time:" + ms + "ms" + "<br>linenum:" + result.lineNum + "<br>ave:" + result.val + "<br>nodata:" + result.noDataIdx.length : "null!";
    const d = document.getElementById("calc-result");
    d.innerHTML = resultstr;
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
    const CSV_SEP = ",";
    const LINE_SEP = "\n";
    const CSV_SEP_CODE = CSV_SEP.codePointAt(0);
    const LINE_SEP_CODE = LINE_SEP.codePointAt(0);
    const TRIM_STR_CODE = "\"".codePointAt(0);
    function parseCSV(arg) {
        switch (arg.csvArr[arg.i]) {
            case CSV_SEP:
            case LINE_SEP:
                if (arg.cellNum === arg.targetCellNum) {
                    arg.calcArr.push(parseFloat((arg.csvArr.slice(arg.currentCellStartI, arg.i).join("")).replace(/^\"+|\"+$/g, "")));
                }
                arg.currentCellStartI = arg.i + 1;
                if (arg.csvArr[arg.i] === CSV_SEP) {
                    arg.cellNum++;
                }
                else if (arg.csvArr[arg.i] === LINE_SEP) {
                    arg.cellNum = 0;
                }
                break;
            default:
        }
    }
    Utils.parseCSV = parseCSV;
    function parseCSVForBuf(arg) {
        switch (arg.csvBuf[arg.i]) {
            case CSV_SEP_CODE:
            case LINE_SEP_CODE:
                if (arg.cellNum === arg.targetCellNum) {
                    arg.calcArr.push(parseFloat(getStrArrFromF32Arr(arg.currentCellStartI, arg.i, arg.csvBuf, TRIM_STR_CODE)));
                }
                arg.currentCellStartI = arg.i + 1;
                if (arg.csvBuf[arg.i] === CSV_SEP_CODE) {
                    arg.cellNum++;
                }
                else if (arg.csvBuf[arg.i] === LINE_SEP_CODE) {
                    arg.cellNum = 0;
                }
                break;
            default:
        }
    }
    Utils.parseCSVForBuf = parseCSVForBuf;
    function getStrArrFromF32Arr(s, e, f, trimStrCode) {
        let frontTrimNum = 0;
        let backTrimNum = 0;
        for (let i = s; i < e; i++) {
            if (f[i] === trimStrCode) {
                frontTrimNum++;
            }
            else {
                break;
            }
        }
        for (let i = e - 1; i > s; i--) {
            if (f[i] === trimStrCode) {
                backTrimNum++;
            }
            else {
                break;
            }
        }
        let result = [];
        for (let i = s + frontTrimNum, l = e - backTrimNum; i < l; i++) {
            result.push(String.fromCodePoint(f[i]));
        }
        return result.join("");
    }
    function getAve(calcArr, ndt) {
        let noData = [];
        let sum = 0;
        for (let i = 0, l = calcArr.length; i < l; i++) {
            if (!isNaN(calcArr[i])) {
                sum += calcArr[i];
            }
            else {
                noData.push(i);
            }
        }
        const result = sum / (ndt === calc_1.NoDataTreat.zero ? calcArr.length : calcArr.length - noData.length);
        return { val: result, lineNum: calcArr.length, noDataIdx: noData };
    }
    Utils.getAve = getAve;
    function margeAve(rs, ndt) {
        let tmpresult = { lineNum: 0, noDataIdx: [], val: 0 };
        for (let i = 0, l = rs.length; i < l; i++) {
            switch (ndt) {
                case calc_1.NoDataTreat.ignore:
                    tmpresult.val += rs[i].val * (rs[i].lineNum - rs[i].noDataIdx.length);
                    break;
                case calc_1.NoDataTreat.zero:
                    tmpresult.val += rs[i].val * rs[i].lineNum;
                    break;
                default:
            }
            tmpresult.lineNum += rs[i].lineNum;
            tmpresult.noDataIdx = tmpresult.noDataIdx.concat(rs[i].noDataIdx);
        }
        let result = tmpresult;
        switch (ndt) {
            case calc_1.NoDataTreat.ignore:
                result.val = result.val / (result.lineNum - result.noDataIdx.length);
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