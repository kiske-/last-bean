// 強力な敵を生成する関数
function spawnSuperEnemy(player) {
    // プレイヤーから一定距離離れた位置に配置
    let enemyX, enemyY;
    let tooClose = true;
    const MIN_DISTANCE = 500; // プレイヤーからの最小距離
    const MAX_DISTANCE = 700; // プレイヤーからの最大距離
    
    // プレイヤーから適切な距離に配置
    while (tooClose) {
        // マップの端から少し離れた位置でランダム
        enemyX = rand(100, MAP_WIDTH - 100);
        enemyY = rand(100, MAP_HEIGHT - 100);
        
        // プレイヤーからの距離を計算
        const distToPlayer = Math.sqrt(
            Math.pow(enemyX - player.pos.x, 2) + 
            Math.pow(enemyY - player.pos.y, 2)
        );
        
        // MIN_DISTANCE以上、MAX_DISTANCE以下の距離なら配置OK
        if (distToPlayer >= MIN_DISTANCE && distToPlayer <= MAX_DISTANCE) {
            tooClose = false;
        }
    }
    
    // 強力な敵のコンポーネント
    let enemyComponents = [
        pos(enemyX, enemyY),
        area({ scale: 0.9 }),
        body(),
        anchor("center"),
        "super-enemy",
        {
            direction: 1,  // 向き（1: 右向き、-1: 左向き）
            pulseTimer: 0, // 脈動エフェクト用タイマー
            chargeTimer: rand(3, 5) // チャージ時間
        }
    ];
    
    // 画像があるかどうかで表示を変える
    if (!window.superburpImageFailed) {
        enemyComponents.unshift(sprite("superburp"));
        enemyComponents.push(scale(vec2(1.2, 1.2)));
    } else {
        enemyComponents.unshift(rect(SUPER_ENEMY_SIZE, SUPER_ENEMY_SIZE));
        enemyComponents.push(color(255, 30, 30)); // 赤色
        enemyComponents.push(outline(4, rgb(200, 0, 0)));
    }
    
    // 強力な敵を追加
    const superEnemy = add(enemyComponents);
    
    // アニメーションを再生
    if (!window.superburpImageFailed) {
        try {
            // 少し待ってからアニメーションを開始（ロード完了を待つため）
            wait(0.1, () => {
                superEnemy.play("idle");
                console.log("SuperEnemy animation started with delay");
            });
        } catch (e) {
            console.error("Error setting up animation:", e);
            window.superburpImageFailed = true;
        }
    }
    
    // 強力な敵の動きを更新する処理
    superEnemy.onUpdate(() => {
        // ゲームオーバーまたはクリア時は移動しない
        if (isGameOver || isGameCleared) return;
        
        const player = get("player")[0];
        if (player) {
            // プレイヤーの方向へ向かう
            const direction = player.pos.sub(superEnemy.pos).unit();
            superEnemy.move(direction.scale(SUPER_ENEMY_SPEED));
            
            // 敵の向きを変更
            if (direction.x !== 0) {
                // プレイヤーが右にいるなら右向き、左にいるなら左向き
                superEnemy.direction = direction.x > 0 ? 1 : -1;
                
                // 画像を反転
                if (!window.superburpImageFailed) {
                    superEnemy.scale = vec2(superEnemy.direction * 1.2, 1.2);
                }
            }
            
            // 脈動エフェクト
            superEnemy.pulseTimer += dt();
            const pulse = Math.sin(superEnemy.pulseTimer * 8) * 0.1 + 1;
            
            if (!window.superburpImageFailed) {
                // アニメーション中もスケールを維持
                superEnemy.scale = vec2(superEnemy.direction * 1.2 * pulse, 1.2 * pulse);
            } else {
                const baseColor = 255;
                const pulseColor = Math.floor(Math.sin(superEnemy.pulseTimer * 8) * 50 + 200);
                superEnemy.color = rgb(baseColor, pulseColor > 30 ? pulseColor : 30, 30);
            }
            
            // チャージ時間のカウントダウン
            superEnemy.chargeTimer -= dt();
            if (superEnemy.chargeTimer <= 0) {
                // チャージ攻撃（プレイヤーに向かって素早く移動）
                const chargeDirection = player.pos.sub(superEnemy.pos).unit();
                superEnemy.move(chargeDirection.scale(SUPER_ENEMY_SPEED * 3));
                
                // ゲップ音を再生
                if (typeof GameAudio !== 'undefined' && GameAudio.playBurpSound) {
                    GameAudio.playBurpSound();
                }
                
                // チャージエフェクト
                for (let i = 0; i < 5; i++) {
                    add([
                        circle(rand(5, 10)),
                        pos(superEnemy.pos.x - chargeDirection.x * 20, superEnemy.pos.y - chargeDirection.y * 20),
                        color(255, rand(0, 100), rand(0, 50)),
                        anchor("center"),
                        move(rand(0, 360), rand(30, 80)),
                        opacity(1),
                        lifespan(0.3),
                        z(5)
                    ]);
                }
                
                // チャージタイマーをリセット
                superEnemy.chargeTimer = rand(3, 5);
            }
        }
    });
    
    // プレイヤーとの衝突処理
    superEnemy.onCollide("player", (player) => {
        // 無敵時間中でなければダメージを受ける
        if (!player.isInvincible) {
            player.hp -= SUPER_ENEMY_DAMAGE;
            player.isDamaged = true;
            player.isInvincible = true;
            player.invincibleTimer = DAMAGE_COOLDOWN;
            
            // HPが0以下になったらゲームオーバー
            if (player.hp <= 0) {
                showGameOver();
            }
            
            // ダメージ表示
            add([
                text(`-${SUPER_ENEMY_DAMAGE}`, { size: 30 }),
                pos(player.pos.x, player.pos.y - 40),
                color(255, 50, 50),
                anchor("center"),
                opacity(1),
                lifespan(1),
                z(100)
            ]);
            
            // ノックバック効果
            const knockbackDir = player.pos.sub(superEnemy.pos).unit();
            player.pos = player.pos.add(knockbackDir.scale(100));
            
            // 衝突エフェクト
            for (let i = 0; i < 15; i++) {
                add([
                    circle(rand(5, 15)),
                    pos(player.pos),
                    color(255, rand(0, 100), rand(0, 50)),
                    anchor("center"),
                    move(rand(0, 360), rand(50, 150)),
                    opacity(1),
                    lifespan(rand(0.3, 0.7)),
                    z(50)
                ]);
            }
        }
    });
    
    return superEnemy;
}
