// フォントが読み込まれるのを待ってからゲームを開始
document.fonts.ready.then(() => {
    console.log("フォントの読み込みが完了しました");
    initGame();
}).catch(err => {
    console.error("フォントの読み込みに失敗しました:", err);
    // フォント読み込み失敗時もゲームを開始
    initGame();
});

// ゲーム初期化関数
function initGame() {
    // ゲームの初期化
    kaplay({
        background: "#222233", // 背景色の設定（暗い青系）
        // width と height を指定しないことでフルスクリーンになる
        scale: 1,             // スケール
        debug: false,          // デバッグモード
        font: "Darumadrop One"
    });
    
    // 難易度設定を初期化
    // 先にCOMMON設定をグローバル変数に展開
    for (const [key, value] of Object.entries(DifficultySettings.COMMON)) {
        window[key] = value;
    }
    
    // デフォルト難易度の設定を適用
    applyDifficultySettings();
    
    // プレイヤー画像の読み込み試行（エラー処理付き）
    loadGameSprites();
    
    // オーディオの初期化
    GameAudio.init();
    
    // シーンを作成
    createScenes();

    // スタート画面から始める
    go("start");
}

// ウィンドウサイズが変更されたときの処理
window.addEventListener('resize', () => {
    // Kaplay.jsは自動的にキャンバスサイズを調整するが、
    // 必要に応じてここで追加の処理を行うことができる
});
