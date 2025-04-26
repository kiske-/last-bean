// ゲーム変数
let gameTime = 0;              // 経過時間
let obstacles = [];            // 障害物の配列
let isGameOver = false;        // ゲームオーバーかどうか
let isGameCleared = false;     // ゲームクリアしたかどうか

// スタート画面シーン
function createScenes() {
    // スタート画面シーン
    scene("start", () => {
        // 背景色設定
        add([
            rect(width(), height()),
            color(30, 30, 60),
            z(-2)  // 一番背面に配置
        ]);
        
        // Bean パターン背景の作成
        const beanPatterns = [];
        const numBeans = 20; // 背景に配置するBeanの数
        
        // パターン化したBeanを背景に配置
        for (let i = 0; i < numBeans; i++) {
            const beanSize = rand(0.2, 0.5); // ランダムなサイズ
            const beanPattern = add([
                sprite("player-bean"),
                pos(rand(0, width()), rand(0, height())),
                scale(beanSize),
                opacity(0.15), // 半透明
                anchor("center"),
                rotate(rand(0, 360)), // ランダムな回転
                z(-1), // 背景よりも前、コンテンツよりも後ろ
                {
                    speedX: rand(-20, 20),    // X軸の移動速度
                    speedY: rand(-20, 20),    // Y軸の移動速度
                    rotSpeed: rand(-1, 1),    // 回転速度
                    initialX: rand(0, width()),
                    initialY: rand(0, height())
                }
            ]);
            
            // 動きの更新処理
            beanPattern.onUpdate(() => {
                // 位置の更新（ゆっくりと動く）
                beanPattern.pos.x += beanPattern.speedX * dt();
                beanPattern.pos.y += beanPattern.speedY * dt();
                
                // 回転の更新
                beanPattern.angle += beanPattern.rotSpeed * dt() * 30;
                
                // 画面外に出た場合は反対側から再登場
                if (beanPattern.pos.x < -50) beanPattern.pos.x = width() + 50;
                if (beanPattern.pos.x > width() + 50) beanPattern.pos.x = -50;
                if (beanPattern.pos.y < -50) beanPattern.pos.y = height() + 50;
                if (beanPattern.pos.y > height() + 50) beanPattern.pos.y = -50;
            });
            
            beanPatterns.push(beanPattern);
        }
        
        // コンテンツの垂直位置調整（上下の余白を揃える）
        const contentOffsetY = -30; // タイトルを少し上に配置して全体のバランスを整える
        
        // タイトルテキスト
        add([
            text("LAST BEAN", { 
                size: 80
            }),
            pos(center().x, center().y - 120 + contentOffsetY),
            anchor("center"),
            color(255, 255, 100),
            scale(1),
            z(10)
        ]);
        
        // サブタイトル
        add([
            text("Survival Game", { 
                size: 40
            }),
            pos(center().x, center().y - 40 + contentOffsetY),
            anchor("center"),
            color(200, 200, 255),
            z(10)
        ]);
        
        // 操作説明
        add([
            text("CONTROLS", { 
                size: 24
            }),
            pos(center().x, center().y + 40 + contentOffsetY),
            anchor("center"),
            color(255, 255, 255),
            z(10)
        ]);
        
        add([
            text("ARROW KEYS / WASD: Move\nSHIFT: Speed up", { 
                size: 20,
                align: "center"
            }),
            pos(center().x, center().y + 80 + contentOffsetY),
            anchor("center"),
            color(200, 200, 200),
            z(10)
        ]);
        
        // 難易度のリスト
        const difficulties = ["EASY", "NORMAL", "HARD"];
        // 現在選択されている難易度のインデックス
        let selectedDifficultyIndex = difficulties.indexOf(getCurrentDifficulty());
        if (selectedDifficultyIndex === -1) selectedDifficultyIndex = 1; // デフォルトはNORMAL
        
        // 難易度表示用テキスト
        const difficultyText = add([
            text(difficulties[selectedDifficultyIndex], { 
                size: 40
            }),
            pos(center().x, center().y + 160 + contentOffsetY),
            anchor("center"),
            color(getColorForDifficulty(difficulties[selectedDifficultyIndex])),
            z(10)
        ]);
        
        // 左右矢印
        const leftArrow = add([
            text("←", { size: 40 }),
            pos(center().x - 100, center().y + 160 + contentOffsetY),
            anchor("center"),
            color(200, 200, 200),
            area(),
            z(10),
            {
                isHovered: false
            }
        ]);
        
        const rightArrow = add([
            text("→", { size: 40 }),
            pos(center().x + 100, center().y + 160 + contentOffsetY),
            anchor("center"),
            color(200, 200, 200),
            area(),
            z(10),
            {
                isHovered: false
            }
        ]);
        
        // 難易度に対応する色を取得する関数
        function getColorForDifficulty(difficulty) {
            switch(difficulty) {
                case "EASY": return rgb(70, 180, 70);
                case "NORMAL": return rgb(70, 130, 180);
                case "HARD": return rgb(180, 70, 70);
                default: return rgb(255, 255, 255);
            }
        }
        
        // 難易度変更の関数
        function changeDifficulty(direction) {
            // 効果音
            GameAudio.playGunSound();
            
            // インデックスを更新
            selectedDifficultyIndex = (selectedDifficultyIndex + direction + difficulties.length) % difficulties.length;
            
            // 難易度を設定
            const newDifficulty = difficulties[selectedDifficultyIndex];
            setDifficulty(newDifficulty);
            
            // 表示を更新
            difficultyText.text = newDifficulty;
            difficultyText.color = getColorForDifficulty(newDifficulty);
        }
        
        // 矢印クリックイベント
        leftArrow.onClick(() => changeDifficulty(-1));
        rightArrow.onClick(() => changeDifficulty(1));
        
        // 矢印ホバーエフェクト
        leftArrow.onUpdate(() => {
            if (leftArrow.isHovering()) {
                if (!leftArrow.isHovered) {
                    leftArrow.isHovered = true;
                    leftArrow.color = rgb(255, 255, 255);
                    leftArrow.scale = vec2(1.2, 1.2);
                }
                setCursor("pointer");
            } else {
                if (leftArrow.isHovered) {
                    leftArrow.isHovered = false;
                    leftArrow.color = rgb(200, 200, 200);
                    leftArrow.scale = vec2(1, 1);
                }
            }
        });
        
        rightArrow.onUpdate(() => {
            if (rightArrow.isHovering()) {
                if (!rightArrow.isHovered) {
                    rightArrow.isHovered = true;
                    rightArrow.color = rgb(255, 255, 255);
                    rightArrow.scale = vec2(1.2, 1.2);
                }
                setCursor("pointer");
            } else {
                if (rightArrow.isHovered) {
                    rightArrow.isHovered = false;
                    rightArrow.color = rgb(200, 200, 200);
                    rightArrow.scale = vec2(1, 1);
                }
            }
        });
        
        // キーボード操作
        onKeyPress("left", () => changeDifficulty(-1));
        onKeyPress("right", () => changeDifficulty(1));
        
        // ゲーム開始説明
        add([
            text("PRESS SPACE TO START", { 
                size: 20,
                align: "center"
            }),
            pos(center().x, center().y + 220 + contentOffsetY),
            anchor("center"),
            color(255, 255, 255),
            z(10)
        ]);
        
        // スペースキーでスタート
        onKeyPress("space", () => {
            GameAudio.playWarningSound();
            go("game");
        });
    });

    // メインゲームシーン
    scene("game", () => {
        // BGMを再生
        GameAudio.playBGM();
        
        // ゲーム状態をリセット
        gameTime = 0;
        isGameOver = false;
        isGameCleared = false;
        
        // ゲーム開始
        setupGame();
        
        // ゲームオーバー時やクリア時にBGMを停止するための処理
        onUpdate(() => {
            if (isGameOver || isGameCleared) {
                GameAudio.stopBGM();
            }
        });
    });
}

// 時間をフォーマットする関数（秒を「分:秒」形式に変換）
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
