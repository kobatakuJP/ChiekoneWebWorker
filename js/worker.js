let sbwork;
onmessage = function (e) {
    sbwork = e.data;
    let buf = new Float32Array(sbwork);
    buf[0] = 1;
    buf[1] = 2;
    buf[2] = 3;
    buf[3] = 4;
};
//# sourceMappingURL=worker.js.map