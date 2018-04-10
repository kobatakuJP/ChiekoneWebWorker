let num = 8 * 1000 * 1000;
let str = (function () {
    let s = "";
    for (let i = 0; i < num; i++) {
        s += "a";
    }
    return s;
})()
let sepnum = 8;

function init() {
    num = Math.ceil(parseFloat((<HTMLInputElement>document.getElementById("num")).value));
    str = (function () {
        let s = "";
        for (let i = 0; i < num; i++) {
            s += getRandChar();
        }
        return s;
    })()
    sepnum = Math.ceil(parseFloat((<HTMLInputElement>document.getElementById("sep")).value));
}

let catalog = "abcdefghijklmnopqrstuvwxyz"
function getRandChar() {
    return catalog[Math.floor(Math.random() * catalog.length)];
}

function cost1_1(): string {
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

function cost2_1(): Float32Array {
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

function cost3_1(): SharedArrayBuffer {
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

document.getElementById("cost1").onclick = cost1_2and3;
document.getElementById("cost2").onclick = cost2_2;
document.getElementById("cost3").onclick = cost3_2and3;
document.getElementById("init").onclick = init;
