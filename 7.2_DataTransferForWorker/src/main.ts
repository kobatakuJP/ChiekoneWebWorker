declare global {
    // グローバル変数にクラスを保持しておく
    interface Window {
        empsForWorker: { [key: string]: Employer };
        workExection: Function;
    }
}

/** 実行 */
export function work(mode: "str" | "trans" | "sab", num: number, str: "a" | "b" | "c" = "a") {
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

function cost1_1() {
    
}

function cost1_2and3() {

}

/** Wokerを酷使する人 */
abstract class Employer {
    num: number;
    sepnum: number;
    dataA: string | Float32Array | SharedArrayBuffer;
    dataB: string | Float32Array | SharedArrayBuffer;
    dataC: string | Float32Array | SharedArrayBuffer;
    worker: Worker;
    transferable: boolean;
    constructor() {
        this.num = 8 * 1000 * 1000;
        this.sepnum = 8;
        this.transferable = false;
    }
    exec(str: string): void {
        const data = str === "a" ? this.dataA : str === "b" ? this.dataB : this.dataC;
        const strtime = Date.now();
        if (this.transferable) {
            this.worker.postMessage({ val: data, time: strtime }, [(<Float32Array>data).buffer]);
        } else {
            this.worker.postMessage({ val: data, time: strtime });
        }
    }
}

/** StrWokerを酷使する人 */
class StrEmployer extends Employer {
    constructor() {
        super();
        // ビルド後のjsファイルを指定する。
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

/** TransWokerを酷使する人 */
class TransEmployer extends Employer {
    constructor() {
        super();
        this.transferable = true;
        // ビルド後のjsファイルを指定する。
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

/** SABWokerを酷使する人 */
class SABEmployer extends Employer {
    constructor() {
        super();
        // ビルド後のjsファイルを指定する。
        this.worker = new Worker("SABWorker.js");
        this.dataA = new SharedArrayBuffer(this.num * 4);
        this.dataB = new SharedArrayBuffer(this.num * 4);
        this.dataC = new SharedArrayBuffer(this.num * 4);
        // SharedArrayBufferにデータを詰めるためにViewを生成
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

// 雇い主を作成しておく
window.empsForWorker = {
    "str": new StrEmployer(),
    "trans": new TransEmployer(),
    "sab": new SABEmployer()
}