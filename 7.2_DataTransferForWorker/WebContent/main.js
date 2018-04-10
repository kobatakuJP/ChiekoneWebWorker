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
/***/ (function(module, exports) {

let num = 8 * 1000 * 1000;
let str = "";
let sepnum = 8;
function init() {
    num = Math.ceil(parseFloat(document.getElementById("num").value));
    str = (function () {
        let s = "";
        for (let i = 0; i < num / 100; i++) {
            s += getRandChar();
        }
        s = s.repeat(100);
        return s;
    })();
    sepnum = Math.ceil(parseFloat(document.getElementById("sep").value));
}
let catalog = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゐゆゑよらりるれろわをん";
function getRandChar() {
    return catalog[Math.floor(Math.random() * catalog.length)];
}
function cost1_1() {
    console.time("cost1_1");
    const sepS = str.slice(0, num / sepnum);
    console.timeEnd("cost1_1");
    return sepS;
}
function cost1_2and3() {
    const worker = new Worker("StrWorker.js");
    const sepS = cost1_1();
    worker.postMessage({ val: sepS, time: Date.now() });
}
function cost2_1() {
    console.time("cost2_1");
    let f = new Float32Array(num / sepnum);
    let ite = str[Symbol.iterator]();
    for (let v = ite.next(), i = 0; i < f.length; v = ite.next(), i++) {
        f[i] = v.value.codePointAt(0);
    }
    console.timeEnd("cost2_1");
    return f;
}
function cost2_2() {
    const worker = new Worker("TransWorker.js");
    let f = cost2_1();
    worker.postMessage({ val: f, time: Date.now() }, [f.buffer]);
}
function cost3_1() {
    console.time("cost3_1");
    let sba = new SharedArrayBuffer(num * 4);
    let f = new Float32Array(sba);
    let ite = str[Symbol.iterator]();
    for (let v = ite.next(), i = 0; i < f.length; v = ite.next(), i++) {
        f[i] = v.value.codePointAt(0);
    }
    console.timeEnd("cost3_1");
    return sba;
}
function cost3_2and3() {
    const worker = new Worker("SABWorker.js");
    let sba = cost3_1();
    worker.postMessage({ val: sba, time: Date.now(), index: { s: 0, e: num / sepnum } });
}
init();
document.getElementById("cost1").onclick = cost1_2and3;
document.getElementById("cost2").onclick = cost2_2;
document.getElementById("cost3").onclick = cost3_2and3;
document.getElementById("init").onclick = init;


/***/ })

/******/ });
//# sourceMappingURL=main.js.map