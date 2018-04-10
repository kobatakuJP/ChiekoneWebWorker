onmessage = function (e) {
    let s = e.data.val;
    console.log('cost1_2and3: ' + (Date.now() - e.data.time) + ' worker string:' + s.length + ', time:');
}