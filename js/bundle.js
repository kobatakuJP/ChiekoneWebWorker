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
var NoDataTreat;
(function (NoDataTreat) {
    NoDataTreat[NoDataTreat["ignore"] = 0] = "ignore";
    NoDataTreat[NoDataTreat["zero"] = 1] = "zero";
})(NoDataTreat = exports.NoDataTreat || (exports.NoDataTreat = {}));
class CsvCalc {
    calc(csv) {
        this.csv = csv;
        this.csvToBuf();
    }
    getAve(cellNum) {
        let lastStart = 0;
        let recordCount = 0;
        for (let csvI = 0, csvL = this.csvArr.length; csvI < csvL; csvI++) {
            if (CsvCalc.SEPARATOR === this.csvArr[csvI][0]) {
                recordCount++;
                if (recordCount === CsvCalc.WORK_UNIT_NUM) {
                    this.doWorker(lastStart, csvI);
                    recordCount = 0;
                    lastStart = csvI + 1;
                }
            }
        }
        this.doWorker(lastStart, this.csvArr.length);
    }
    doWorker(s, e) {
        const arg = {
            csvBuf: this.buf,
            indices: {
                startI: s,
                endI: e
            },
            noData: NoDataTreat.ignore
        };
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
CsvCalc.SEPARATOR = "\n";
CsvCalc.WORK_UNIT_NUM = 1000 * 10;
exports.CsvCalc = CsvCalc;
function normalCalc(arg) {
    const CSV_SEP = ",";
    const csvArr = Array.from(arg.csv);
    let calcArr = [];
    console.time("calctime");
    for (let i = 0, l = csvArr.length, cellNum = 0, currentCellStartI = 0; i < l; i++) {
        switch (csvArr[i]) {
            case CSV_SEP:
            case CsvCalc.SEPARATOR:
                if (cellNum === arg.targetCellNum) {
                    calcArr.push(parseFloat((csvArr.slice(currentCellStartI, i - 1).join("")).replace(/^\"+|\"+$/g, "")));
                }
                currentCellStartI = i + 1;
                if (csvArr[i] === CSV_SEP) {
                    cellNum++;
                }
                else if (csvArr[i] === CsvCalc.SEPARATOR) {
                    cellNum = 0;
                }
                break;
            default:
        }
    }
    console.timeEnd("calctime");
    return Ave(calcArr, arg.noData);
}
exports.normalCalc = normalCalc;
function Ave(calcArr, ndt) {
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
    const result = sum / (ndt === NoDataTreat.zero ? calcArr.length : calcArr.length - noData.length);
    return { val: result, lineNum: calcArr.length, noDataIdx: noData };
}


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
            console.time("total");
            let result = calc.normalCalc({ csv: a.responseText, targetCellNum: 5, noData: calc_1.NoDataTreat.ignore });
            console.timeEnd("total");
            resultOutPut(result);
        }
    };
};
function resultOutPut(result) {
    console.log("linenum:" + result.lineNum + ", ave:" + result.val + ", nodata:" + result.noDataIdx.length);
}


/***/ })

/******/ });
//# sourceMappingURL=bundle.js.map