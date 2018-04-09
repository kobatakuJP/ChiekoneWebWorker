onmessage = function (e) {
    // 取得したSharedArrayBufferのViewを作成
    let view = new Float32Array(e.data.val);
    console.log('SABWorker: length' + view.length + ', time:' + (Date.now() - e.data.time));
}