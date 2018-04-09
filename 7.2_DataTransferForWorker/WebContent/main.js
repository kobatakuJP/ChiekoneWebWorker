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

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function work(mode, num, str = "a") {
    for (let i = 0; i < num; i++) {
        switch (mode) {
            case "str":
            case "sab":
            case "trans":
                window.empsForWorker[mode].exec(str);
                break;
            default:
                console.log("オプションミス(str|trans|sab|all)");
                break;
        }
    }
}
exports.work = work;
class Employer {
    constructor() {
        this.num = 8 * 1000 * 1000;
        this.sepnum = 8;
        this.transferable = false;
    }
    exec(str) {
        const data = str === "a" ? this.dataA : str === "b" ? this.dataB : this.dataC;
        const strtime = Date.now();
        if (this.transferable) {
            this.worker.postMessage({ val: data, time: strtime }, [data.buffer]);
        }
        else {
            this.worker.postMessage({ val: data, time: strtime });
        }
    }
}
class StrEmployer extends Employer {
    constructor() {
        super();
        this.worker = new Worker("StrWorker.js");
        this.dataA = "";
        this.dataB = "";
        this.dataC = "";
        for (let i = 0; i < this.num; i++) {
            this.dataA += "a";
            this.dataB += "b";
            this.dataC += "c";
        }
    }
}
class TransEmployer extends Employer {
    constructor() {
        super();
        this.worker = new Worker("TransWorker.js");
        this.dataA = new Float32Array(this.num);
        this.dataB = new Float32Array(this.num);
        this.dataC = new Float32Array(this.num);
        for (let i = 0; i < this.num; i++) {
            this.dataA[i] = "a".codePointAt(0);
            this.dataB[i] = "b".codePointAt(0);
            this.dataC[i] = "c".codePointAt(0);
        }
    }
}
class SABEmployer extends Employer {
    constructor() {
        super();
        this.worker = new Worker("SABWorker.js");
        this.dataA = new SharedArrayBuffer(this.num * 4);
        this.dataB = new SharedArrayBuffer(this.num * 4);
        this.dataC = new SharedArrayBuffer(this.num * 4);
        let sabFa = new Float32Array(this.dataA);
        let sabFb = new Float32Array(this.dataB);
        let sabFc = new Float32Array(this.dataC);
        for (let i = 0; i < this.num; i++) {
            sabFa[i] = "a".codePointAt(0);
            sabFb[i] = "b".codePointAt(0);
            sabFc[i] = "c".codePointAt(0);
        }
    }
}
window.empsForWorker = {
    "str": new StrEmployer(),
    "trans": new TransEmployer(),
    "sab": new SABEmployer()
};


/***/ })

/******/ });
//# sourceMappingURL=main.js.map