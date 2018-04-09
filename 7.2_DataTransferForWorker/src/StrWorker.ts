onmessage = function (e) {
    let s = e.data.val;
    console.log('worker string:' + s.length + ', time:' + (Date.now() - e.data.time));
}