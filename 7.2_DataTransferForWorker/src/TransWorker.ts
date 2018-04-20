onmessage = function (e) {
    let s = e.data.val;
    console.log('cost2_2: ' + (Date.now() - e.data.time) + 'ms' + ' TransWorker: length:' + s.length);
}