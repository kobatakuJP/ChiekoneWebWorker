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
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nclass CsvCalc {\r\n    calc(csv) {\r\n        this.csv = csv;\r\n        this.csvToBuf();\r\n    }\r\n    getAve(cellNum) {\r\n        let lastStart = 0;\r\n        let recordCount = 0;\r\n        for (let csvI = 0, csvL = this.csvArr.length; csvI < csvL; csvI++) {\r\n            if (CsvCalc.SEPARATOR === this.csvArr[csvI][0]) {\r\n                recordCount++;\r\n                if (recordCount === CsvCalc.WORK_UNIT_NUM) {\r\n                    this.doWorker(lastStart, csvI);\r\n                    recordCount = 0;\r\n                    lastStart = csvI + 1;\r\n                }\r\n            }\r\n        }\r\n        this.doWorker(lastStart, this.csvArr.length);\r\n    }\r\n    doWorker(s, e) {\r\n        const arg = {\r\n            csvBuf: this.buf,\r\n            indices: {\r\n                startI: s,\r\n                endI: e\r\n            }\r\n        };\r\n    }\r\n    csvToBuf() {\r\n        this.csvArr = Array.from(this.csv);\r\n        this.buf = new SharedArrayBuffer(this.csvArr.length * 4);\r\n        this.bufView = new Float32Array(this.buf);\r\n        for (let i = 0, l = this.bufView.length; i < l; i++) {\r\n            this.bufView[i] = this.csvArr[i].codePointAt(0);\r\n        }\r\n    }\r\n}\r\nCsvCalc.SEPARATOR = \"\\n\";\r\nCsvCalc.WORK_UNIT_NUM = 1000 * 10;\r\nexports.CsvCalc = CsvCalc;\r\nfunction normalCalc(csv, targetCellNum) {\r\n    const CSV_SEP = \",\";\r\n    const csvArr = Array.from(this.csv);\r\n    let calcArr = [];\r\n    for (let i = 0, l = csvArr.length, cellNum = 0, currentCellStartI = 0; i < l; i++) {\r\n        switch (csvArr[i]) {\r\n            case CSV_SEP:\r\n            case CsvCalc.SEPARATOR:\r\n                if (cellNum === targetCellNum) {\r\n                    calcArr.push(parseFloat(csvArr.slice(currentCellStartI, i - 1).join()));\r\n                }\r\n                currentCellStartI = i + 1;\r\n                break;\r\n            case CSV_SEP:\r\n                cellNum++;\r\n                break;\r\n            case CsvCalc.SEPARATOR:\r\n                cellNum = 0;\r\n                break;\r\n            default:\r\n        }\r\n    }\r\n    return { result: Ave(calcArr), num: calcArr.length };\r\n}\r\nexports.normalCalc = normalCalc;\r\nfunction Ave(calcArr) {\r\n    let sum = 0;\r\n    for (let i = 0, l = calcArr.length; i < l; i++) {\r\n        sum += calcArr[i];\r\n    }\r\n    return sum / calcArr.length;\r\n}\r\n\n\n//# sourceURL=webpack:///./src/calc.ts?");

/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nconst calc = __webpack_require__(/*! ./calc */ \"./src/calc.ts\");\r\nlet w = new Worker(\"worker.js\");\r\nlet w2 = new Worker(\"worker.js\");\r\nconst wb = document.getElementById(\"workbtn\");\r\nconst cg = document.getElementById(\"csvget\");\r\nlet sb = new SharedArrayBuffer(12);\r\nlet bufView = new Float32Array(sb);\r\nwb.onclick = function () {\r\n    w.postMessage(sb);\r\n    setTimeout(function () {\r\n        for (let i = 0; i < 10; i++) {\r\n            console.log(bufView[i]);\r\n        }\r\n    }, 1000);\r\n};\r\ncg.onclick = function () {\r\n    const a = new XMLHttpRequest();\r\n    a.open(\"GET\", \"http://127.0.0.1:8000/bigfile/rice.csv\", true);\r\n    a.send();\r\n    a.onreadystatechange = function () {\r\n        if (a.status === XMLHttpRequest.DONE) {\r\n            console.time(\"h\");\r\n            let result = calc.normalCalc(a.responseText, 0);\r\n            console.timeEnd(\"h\");\r\n            console.log(\"num:\" + result.num + \", ave:\" + result.result);\r\n        }\r\n    };\r\n};\r\n\n\n//# sourceURL=webpack:///./src/main.ts?");

/***/ })

/******/ });