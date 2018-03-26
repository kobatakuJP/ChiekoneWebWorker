import * as calc from "./calc";

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
            console.log(bufView[i])
        }
    }, 1000)
};

cg.onclick = function () {
    const a = new XMLHttpRequest();
    a.open("GET", "http://127.0.0.1:8000/bigfile/rice.csv", true);
    a.send();
    a.onreadystatechange = function() {
        if (a.readyState === XMLHttpRequest.DONE) {
            console.time("total");
            let result = calc.normalCalc(a.responseText, 5);
            console.timeEnd("total");
            console.log("num:" + result.num + ", ave:" + result.result);
        }
    }
}