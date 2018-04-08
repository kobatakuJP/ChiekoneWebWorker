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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/worker.ts");
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
    }
    async getAve(cellNum) {
        const promiz = this.separateAndAssignWork(cellNum);
        const vals = await Promise.all(promiz);
        return utils_1.Utils.margeAve(vals, this.noData);
    }
    separateAndAssignWork(cellNum) {
        let result = [];
        const aboutSepIndex = Math.ceil(this.csv.length / CsvCalc.WORK_NUM);
        let startI = 0;
        const ite = this.csv[Symbol.iterator]();
        let i = 0, sepStartI = 0;
        let buf = new Float32Array(this.csv.length);
        for (let v of ite) {
            buf[i - sepStartI] = v.codePointAt(0);
            if ((i > sepStartI + aboutSepIndex && buf[i - sepStartI] === CsvCalc.LINE_SEPARATOR_CODE)) {
                result.push(this.doWorker(buf.slice(0, (i - sepStartI + 1)), cellNum));
                sepStartI = i + 1;
                buf = new Float32Array(this.csv.length - sepStartI);
            }
            i++;
        }
        result.push(this.doWorker(buf.slice(0, i - sepStartI), cellNum));
        return result;
    }
    doWorker(cutCSV, cellNum) {
        return new Promise((resolve, reject) => {
            const arg = {
                buf: cutCSV,
                noData: NoDataTreat.ignore,
                targetCellNum: cellNum
            };
            let w = new Worker("worker.js");
            w.onmessage = function (ev) {
                resolve(ev.data);
                w.terminate();
            };
            w.postMessage(arg, [arg.buf.buffer]);
        });
    }
}
CsvCalc.LINE_SEPARATOR = "\n";
CsvCalc.LINE_SEPARATOR_CODE = "\n".charCodeAt(0);
CsvCalc.WORK_NUM = 8;
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
        let lineNum = 0;
        for (let t = ite.next(); t && t.value; t = ite.next()) {
            switch (t.value) {
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
                if (t.value !== csvSep && t.value !== lineSep) {
                    targetCellVal.push(tostr(t.value));
                }
            }
            else {
                if (targetCellVal.length !== 0) {
                    targetArr.push(targetCellVal.join(""));
                    targetCellVal = [];
                }
            }
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


/***/ }),

/***/ "./src/worker.ts":
/*!***********************!*\
  !*** ./src/worker.ts ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = __webpack_require__(/*! ./utils */ "./src/utils.ts");
onmessage = function (e) {
    const arg = e.data;
    console.time("parseTimework");
    const parse = utils_1.Utils.parseCSVKai(arg.buf[Symbol.iterator](), (a) => String.fromCodePoint(a), utils_1.Utils.CSV_SEP_CODE, utils_1.Utils.LINE_SEP_CODE, arg.targetCellNum);
    console.timeEnd("parseTimework");
    let calcArr = [];
    for (let i = 0, l = parse.targetArr.length; i < l; i++) {
        calcArr.push(parseFloat((parse.targetArr[i]).replace(/^\"+|\"+$/g, "")));
    }
    postMessage(utils_1.Utils.getAve(calcArr, parse.lineNum, arg.noData));
};


/***/ })

/******/ });
//# sourceMappingURL=worker.js.map