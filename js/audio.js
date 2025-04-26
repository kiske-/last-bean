// オーディオ機能を管理するファイル

// オーディオオブジェクトを作成
const GameAudio = {};

// BGMの音量（0.0～1.0）
const BGM_VOLUME = 0.3;

// 効果音の音量（0.0～1.0）
const SFX_VOLUME = 0.5;

// 音楽と効果音のロード関数
function loadGameAudio() {
    try {
        // BGMをロード
        loadSound("bgm", "audio/bgm.mp3");
        
        // 効果音をロード
        loadSound("gun", "audio/gun.mp3");
        loadSound("heart", "audio/heart.mp3");
        loadSound("warning", "audio/warning.mp3");
        loadSound("burp", "audio/burp.mp3"); // SuperEnemyの鳴き声
        loadSound("thud", "audio/thud.mp3"); // Gigagantrumの投射物の音
        
        console.log("音声ファイルを読み込みました");
    } catch (e) {
        console.error("音声ファイルの読み込みに失敗しました:", e);
    }
}

// BGMを再生（ループあり）
GameAudio.playBGM = function() {
    // すでに再生中なら何もしない
    if (GameAudio.bgmPlaying) return;
    
    try {
        const music = play("bgm", {
            volume: BGM_VOLUME,
            loop: true
        });
        
        GameAudio.bgmPlaying = true;
        GameAudio.bgmInstance = music;
        
        console.log("BGMを再生しました");
    } catch (e) {
        console.error("BGMの再生に失敗しました:", e);
    }
};

// BGMを停止
GameAudio.stopBGM = function() {
    if (GameAudio.bgmInstance) {
        GameAudio.bgmInstance.stop();
        GameAudio.bgmPlaying = false;
        console.log("BGMを停止しました");
    }
};

// 効果音を再生
GameAudio.playSFX = function(name) {
    try {
        play(name, {
            volume: SFX_VOLUME,
            loop: false
        });
    } catch (e) {
        console.error(`効果音 ${name} の再生に失敗しました:`, e);
    }
};

// 銃の効果音を再生
GameAudio.playGunSound = function() {
    GameAudio.playSFX("gun");
};

// ハート取得効果音を再生
GameAudio.playHeartSound = function() {
    GameAudio.playSFX("heart");
};

// 警告効果音を再生
GameAudio.playWarningSound = function() {
    GameAudio.playSFX("warning");
};

// SuperEnemyの鳴き声を再生
GameAudio.playBurpSound = function() {
    GameAudio.playSFX("burp");
};

// Gigagantrumの投射物音を再生
GameAudio.playThudSound = function() {
    GameAudio.playSFX("thud");
};

// オーディオ設定の初期化
GameAudio.init = function() {
    GameAudio.bgmPlaying = false;
    GameAudio.bgmInstance = null;
    
    // オーディオファイルのロード
    loadGameAudio();
};

// グローバルに公開
window.GameAudio = GameAudio; 