onmessage = function (e) {
    // 取得したSharedArrayBufferのViewを作成
    let view = new Float32Array(e.data.val);
    view = view.slice(e.data.index.s, e.data.index.e);
    console.log('cost3_2and3: ' + (Date.now() - e.data.time)　+ 'ms' + ' SABWorker: length' + view.length);
}