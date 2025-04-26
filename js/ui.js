// UI関連の機能をまとめたファイル

// UIオブジェクトを作成
const UI = {};

// 時間をフォーマットする関数（秒を「分:秒」形式に変換）
UI.formatTime = function(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 弾薬数を表示する関数
UI.createAmmoDisplay = function(player) {
    // 弾薬アイコン（左上に配置）
    const ammoIcon = add([
        sprite("gun"),
        pos(20, 20),
        scale(1),
        anchor("topleft"),
        fixed(),
        z(100)
    ]);
    
    // 弾薬数表示
    const ammoDisplay = add([
        text("0", { size: 32 }),
        pos(80, 20),
        color(255, 255, 255),
        outline(2, rgb(0, 0, 0)),
        anchor("topleft"),
        fixed(),
        z(100)
    ]);
    
    // 更新処理
    onUpdate(() => {
        // プレイヤーが銃を持っている場合のみ表示
        if (player.hasGun) {
            ammoDisplay.text = `${player.gunAmmo}`;
            ammoDisplay.opacity = 1;
            ammoIcon.opacity = 1;
        } else {
            ammoDisplay.opacity = 0;
            ammoIcon.opacity = 0;
        }
    });
    
    return { ammoDisplay, ammoIcon };
}

// 銃タイプとクールダウンを表示する関数
UI.createGunTypeDisplay = function(player) {
    // 銃タイプ表示（左上に配置、弾薬数の下）
    const gunTypeDisplay = add([
        text("", { size: 20 }),
        pos(20, 60),
        color(200, 200, 255),
        outline(2, rgb(0, 0, 0)),
        anchor("topleft"),
        fixed(),
        z(100)
    ]);
    
    // クールダウン表示
    const cooldownDisplay = add([
        text("", { size: 16 }),
        pos(20, 85),
        color(150, 150, 255),
        outline(1, rgb(0, 0, 0)),
        anchor("topleft"),
        fixed(),
        z(100)
    ]);
    
    // 更新処理
    onUpdate(() => {
        // プレイヤーが銃を持っている場合のみ表示
        if (player.hasGun) {
            // 銃タイプの表示
            let gunTypeName = "";
            switch(player.gunType) {
                case "normal":
                    gunTypeName = "通常銃";
                    break;
                case "shotgun":
                    gunTypeName = "ショットガン";
                    break;
                case "machinegun":
                    gunTypeName = "マシンガン";
                    break;
                case "laser":
                    gunTypeName = "レーザー";
                    break;
                default:
                    gunTypeName = player.gunType;
            }
            
            gunTypeDisplay.text = `武器: ${gunTypeName}`;
            gunTypeDisplay.opacity = 1;
            
            // クールダウン表示
            if (player.gunCooldown > 0) {
                const cooldownPercent = Math.round((player.gunCooldown / player.gunMaxCooldown) * 100);
                cooldownDisplay.text = `クールダウン: ${cooldownPercent}%`;
                cooldownDisplay.opacity = 1;
            } else {
                cooldownDisplay.text = "発射可能";
                cooldownDisplay.opacity = 0.8;
            }
        } else {
            gunTypeDisplay.opacity = 0;
            cooldownDisplay.opacity = 0;
        }
    });
    
    return { gunTypeDisplay, cooldownDisplay };
}

// HPゲージを作成する関数
UI.createHpBar = function(player, PLAYER_MAX_HP) {
    const hpBarWidth = 300;
    const hpBarHeight = 30;

    // HPゲージの背景（上中央に配置）
    const hpBarBg = add([
        rect(hpBarWidth, hpBarHeight),
        pos(center().x - hpBarWidth/2, 30),
        color(100, 100, 100),
        fixed(),
        z(100)
    ]);
    
    // HPゲージ
    const hpBar = add([
        rect(hpBarWidth, hpBarHeight),
        pos(center().x - hpBarWidth/2, 30),
        color(255, 50, 50),
        fixed(),
        z(101)
    ]);
    
    // HPの数値表示
    const hpText = add([
        text(`HP: ${player.hp}/${PLAYER_MAX_HP}`, { size: 24 }),
        pos(center().x, 30 + hpBarHeight / 2),
        color(255, 255, 255),
        anchor("center"),
        fixed(),
        z(102)
    ]);
    
    // HPゲージを更新する関数
    function updateHpBar() {
        const hpRatio = player.hp / PLAYER_MAX_HP;
        hpBar.width = hpBarWidth * hpRatio;
        hpText.text = `HP: ${Math.max(0, Math.floor(player.hp))}/${PLAYER_MAX_HP}`;
        
        // HPに応じて色を変える
        if (hpRatio < 0.3) {
            hpBar.color = rgb(255, 0, 0); // 濃い赤色（30%未満）
        } else if (hpRatio < 0.6) {
            hpBar.color = rgb(255, 120, 0); // オレンジ色（30%〜60%未満）
        } else if (hpRatio < 1.0) {
            hpBar.color = rgb(255, 220, 0); // 黄色（60%〜100%未満）
        } else {
            hpBar.color = rgb(50, 200, 50); // 緑色（100%）
        }
    }
    
    // 更新処理
    onUpdate(() => {
        updateHpBar();
    });
    
    return { hpBar, hpBarBg, hpText, updateHpBar };
}

// タイマー表示を作成する関数
UI.createTimeDisplay = function(initialTime) {
    // タイマー表示（右上）
    const timeInfo = add([
        text(`${UI.formatTime(initialTime)}`, { size: 32 }),
        pos(width() - 20, 20),
        color(255, 255, 255),
        anchor("topright"),
        fixed(),
        z(100)
    ]);
    
    // タイマー更新関数
    function updateTimeDisplay(remainingTime) {
        timeInfo.text = `${UI.formatTime(Math.max(0, remainingTime))}`;
        
        // 残り時間が少なくなったら赤く点滅
        if (remainingTime <= 30) {
            const pulse = Math.sin(time() * 8) * 0.5 + 0.5;
            timeInfo.color = rgb(255, 50 + pulse * 200, 50 + pulse * 200);
        }
    }
    
    return { timeInfo, updateTimeDisplay };
}

// 警告テキスト表示関数
UI.showWarningText = function(message, colorArray = [255, 255, 0]) {
    const warning = add([
        text(message, {
            size: 32,
            width: width() - 100
        }),
        pos(center().x, center().y - 100),
        color(colorArray[0], colorArray[1], colorArray[2]),
        outline(4, rgb(50, 50, 50)),
        anchor("center"),
        fixed(),
        opacity(1),
        z(100)
    ]);
    
    // フェードアウト
    warning.onUpdate(() => {
        warning.opacity -= 0.01;
        if (warning.opacity <= 0) {
            destroy(warning);
        }
    });
    
    return warning;
}

// 大きな警告テキスト表示（フラッシュ効果付き）
UI.showBigWarningText = function(mainMessage, subMessage) {
    // 暗い背景
    const warningBg = add([
        rect(width(), height()),
        pos(0, 0),
        color(0, 0, 0),
        opacity(0.15),
        fixed(),
        z(99)
    ]);
    
    // 警告テキスト
    const warning = add([
        text(mainMessage, { 
            size: 40,
            width: width() - 100
        }),
        pos(center().x, center().y - 40),
        color(255, 255, 0),
        outline(4, rgb(150, 0, 0)),
        anchor("center"),
        fixed(),
        opacity(0.8),
        z(100)
    ]);
    
    // サブ警告テキスト
    const subWarning = add([
        text(subMessage, { 
            size: 24
        }),
        pos(center().x, center().y + 20),
        color(255, 200, 200),
        outline(2, rgb(100, 0, 0)),
        anchor("center"),
        fixed(),
        opacity(0.8),
        z(100)
    ]);
    
    // アニメーション
    let timer = 0;
    warning.onUpdate(() => {
        timer += dt();
        warningBg.opacity = 0.15 * (1 - timer/3);
        warning.opacity = 0.8 * (1 - timer/3);
        subWarning.opacity = 0.8 * (1 - timer/3);
        
        // 点滅効果
        warning.color = timer % 0.5 < 0.25 ? rgb(255, 255, 0) : rgb(255, 0, 0);
        
        if (timer >= 3) {
            destroy(warningBg);
            destroy(warning);
            destroy(subWarning);
        }
    });
}

// メッセージ表示関数（一時的に表示して消える）
UI.showMessage = function(message, yPosition = 200, colorArray = [255, 255, 255], duration = 2) {
    const msg = add([
        text(message, { size: 24 }),
        pos(center().x, yPosition),
        color(colorArray[0], colorArray[1], colorArray[2]),
        outline(2, rgb(50, 50, 50)),
        anchor("center"),
        fixed(),
        opacity(1),
        lifespan(duration),
        z(100)
    ]);
    
    return msg;
}

// ゲームオーバー表示
UI.showGameOver = function(isFinalBoss) {
    // ゲームオーバーテキスト表示用の基準Y座標
    const baseY = center().y - 40;
    const lineHeight = 40;
    
    // バックグラウンド（少し暗くする）
    add([
        rect(width(), height()),
        pos(0, 0),
        color(0, 0, 0),
        opacity(0.7),
        fixed(),
        z(100),
    ]);
    
    // ゲームオーバーメッセージ
    add([
        text("GAME OVER", { size: 40 }),
        pos(center().x, baseY),
        color(255, 50, 50),
        anchor("center"),
        fixed(),
        z(101),
    ]);

    // 敗北理由の表示
    if (isFinalBoss) {
        add([
            text("You were caught by the FINAL BOSS!", { size: 20 }),
            pos(center().x, baseY + lineHeight),
            color(255, 255, 0),
            anchor("center"),
            fixed(),
            z(101),
        ]);
    } else {
        add([
            text("Your HP reached 0 from enemy attacks", { size: 20 }),
            pos(center().x, baseY + lineHeight),
            color(255, 255, 255),
            anchor("center"),
            fixed(),
            z(101),
        ]);
    }

    add([
        text("Press SPACE to restart", { size: 16 }),
        pos(center().x, baseY + lineHeight * 2),
        color(200, 200, 200),
        anchor("center"),
        fixed(),
        z(101),
    ]);
    
    add([
        text("Press T to return to title", { size: 16 }),
        pos(center().x, baseY + lineHeight * 3),
        color(200, 200, 200),
        anchor("center"),
        fixed(),
        z(101),
    ]);
    
    // リスタートと戻るボタンの処理
    onKeyPress("space", () => {
        location.reload();
    });
    
    onKeyPress("t", () => {
        go("start");
    });
}

// ゲームクリア表示
UI.showGameClear = function(survivalTime) {
    // ゲームクリアテキスト表示用の基準Y座標
    const baseY = center().y - 100;
    const lineHeight = 40;
    
    // バックグラウンド（少し明るくする）
    add([
        rect(width(), height()),
        pos(0, 0),
        color(255, 255, 200),
        opacity(0.3),
        fixed(),
        z(100),
    ]);
    
    // ゲームクリアメッセージ
    add([
        text("GAME CLEAR!", { size: 50 }),
        pos(center().x, baseY),
        color(50, 200, 50),
        outline(4, rgb(0, 100, 0)),
        anchor("center"),
        fixed(),
        scale(1),
        z(101),
        {
            timer: 0
        }
    ]).onUpdate(function() {
        this.timer += dt();
        this.scale = 1 + Math.sin(this.timer * 5) * 0.1;
    });

    // クリア時間の表示
    add([
        text(`You survived for ${UI.formatTime(survivalTime)}!`, { size: 30 }),
        pos(center().x, baseY + lineHeight * 2),
        color(50, 50, 200),
        outline(2, rgb(0, 0, 100)),
        anchor("center"),
        fixed(),
        opacity(1),
        z(101),
    ]);
    
    add([
        text("Press SPACE to play again", { size: 20 }),
        pos(center().x, baseY + lineHeight * 4),
        color(0, 0, 0),
        anchor("center"),
        fixed(),
        z(101),
    ]);
    
    add([
        text("Press T to return to title", { size: 20 }),
        pos(center().x, baseY + lineHeight * 5),
        color(0, 0, 0),
        anchor("center"),
        fixed(),
        z(101),
    ]);
    
    // リスタートと戻るボタンの処理
    onKeyPress("space", () => {
        location.reload();
    });
    
    onKeyPress("t", () => {
        go("start");
    });
    
    // 紙吹雪エフェクト
    for (let i = 0; i < 100; i++) {
        wait(rand(0, 2), () => {
            add([
                rect(rand(5, 10), rand(5, 15)),
                pos(rand(0, width()), -20),
                color(rand(0, 255), rand(0, 255), rand(0, 255)),
                opacity(rand(0.6, 1)),
                rotate(rand(0, 360)),
                move(90, rand(50, 150)),
                lifespan(rand(4, 8)),
                fixed(),
                z(90)
            ]).onUpdate(function() {
                this.angle += dt() * 100;
            });
        });
    }
}

// 特殊攻撃メッセージの表示
UI.showSpecialAttackMessage = function(type) {
    let message = "";
    let color = [255, 255, 255];
    
    if (type === "gun") {
        message = "GUN EQUIPPED! AUTO-FIRING AT NEARBY ENEMIES!";
        color = [50, 200, 255];
    } else if (type === "lightening") {
        message = "LIGHTENING POWER! DESTROY ALL NEARBY ENEMIES!";
        color = [255, 255, 0];
    }
    
    return UI.showMessage(message, 200, color, 3);
}

// グローバルスコープにUIオブジェクトを公開
window.UI = UI; 