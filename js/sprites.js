// ゲームスプライトの読み込み関数
function loadGameSprites() {
    try {
        loadSprite("player-bean", "img/bean.png");
        loadSprite("portal", "img/portal.png");
        loadSprite("steel", "img/steel.png");
        loadSprite("enemy", "img/tga.png");
        loadSprite("heart", "img/heart.png");
        loadSprite("kaboom", "img/kaboom.png"); // 爆発エフェクト用の画像
        
        // 新しい敵キャラクターの画像を読み込み
        loadSprite("kat", "img/kat.png");
        loadSprite("marroc", "img/marroc.png");
        loadSprite("gigagantrum", "img/gigagantrum.png");
        loadSprite("goldfly", "img/goldfly.png");
        
        // 攻撃アイテムの画像を読み込み
        loadSprite("gun", "img/gun.png");
        loadSprite("lightening", "img/lightening.png");
        
        try {
            // 強力な敵のスプライトシートを読み込む - 別の方法を試す
            loadSpriteAtlas("img/superburp_sprite_sheet_vertical.png", {
                "superburp": {
                    x: 0,
                    y: 0,
                    width: 93,     // 画像の実際のサイズに合わせる
                    height: 1848,  // 28フレーム×64px = 1792px (想定)
                    sliceY: 28,    // 28フレーム
                    anims: {
                        idle: { from: 0, to: 27, speed: 12, loop: true }
                    }
                }
            });
            console.log("SuperEnemy spritesheet loaded using atlas method");
        } catch (spriteErr) {
            console.error("Failed to load SuperEnemy spritesheet:", spriteErr);
            // スプライトシートの読み込みに失敗した場合は単一画像として再試行
            try {
                loadSprite("superburp", "img/superburp.png");
                console.log("Fallback to static SuperEnemy sprite");
            } catch (fallbackErr) {
                console.error("Failed to load fallback SuperEnemy sprite:", fallbackErr);
                window.superburpImageFailed = true;
            }
        }
        
        // ランプ敵の画像を読み込む
        try {
            loadSprite("lamp", "img/lamp.png");
            console.log("Lamp enemy sprite loaded");
        } catch (lampErr) {
            console.error("Failed to load lamp sprite:", lampErr);
            window.lampImageFailed = true;
        }
        
        loadSprite("dino", "img/dino.png"); // 最終ボスの画像（happy.pngからdino.pngに変更）
        console.log("画像を読み込みました");
    } catch (e) {
        console.error("画像の読み込みに失敗しました:", e);
        // 画像読み込み失敗時のフラグ
        window.playerImageFailed = true;
        window.portalImageFailed = true;
        window.steelImageFailed = true;
        window.enemyImageFailed = true;
        window.heartImageFailed = true;
        window.kaboomImageFailed = true;
        window.superburpImageFailed = true;
        window.dinoImageFailed = true; // happyImageFailedをdinoImageFailedに変更
    }
}
