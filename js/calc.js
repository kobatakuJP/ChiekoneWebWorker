"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
            }
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
function normalCalc(csv, targetCellNum) {
    const CSV_SEP = ",";
    const csvArr = Array.from(this.csv);
    let calcArr = [];
    for (let i = 0, l = csvArr.length, cellNum = 0, currentCellStartI = 0; i < l; i++) {
        switch (csvArr[i]) {
            case CSV_SEP:
            case CsvCalc.SEPARATOR:
                if (cellNum === targetCellNum) {
                    calcArr.push(parseFloat(csvArr.slice(currentCellStartI, i - 1).join()));
                }
                currentCellStartI = i + 1;
                break;
            case CSV_SEP:
                cellNum++;
                break;
            case CsvCalc.SEPARATOR:
                cellNum = 0;
                break;
            default:
        }
    }
    return { result: Ave(calcArr), num: calcArr.length };
}
exports.normalCalc = normalCalc;
function Ave(calcArr) {
    let sum = 0;
    for (let i = 0, l = calcArr.length; i < l; i++) {
        sum += calcArr[i];
    }
    return sum / calcArr.length;
}
//# sourceMappingURL=calc.js.map