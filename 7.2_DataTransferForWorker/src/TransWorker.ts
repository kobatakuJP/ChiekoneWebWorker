onmessage = function (e) {
    let s = e.data.val;
    console.log('TransWorker: length:' + s.length + ', time:' + (Date.now() - e.data.time));
}