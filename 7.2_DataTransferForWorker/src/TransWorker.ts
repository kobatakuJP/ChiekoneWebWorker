onmessage = function (e) {
    let s = e.data.val;
    console.log('cost2_2: '+(Date.now() - e.data.time) + ' TransWorker: length:' + s.length);
}