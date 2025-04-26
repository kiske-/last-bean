// ===== 敵キャラクター関連の機能をまとめたファイル =====

// ===== 通常敵 =====
// 新しい敵を生成する関数
function spawnNewEnemy(player) {
    // プレイヤーから一定距離離れた位置に配置
    let enemyX, enemyY;
    let tooClose = true;
    const MIN_DISTANCE = 400; // プレイヤーからの最小距離
    const MAX_DISTANCE = 600; // プレイヤーからの最大距離
    
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
    
    let enemyComponents = [
        pos(enemyX, enemyY),
        area({ scale: 0.8 }),
        body(),
        anchor("center"),
        "enemy",
        {
            direction: 1,  // 向き（1: 右向き、-1: 左向き）
            shotTimer: rand(3, 6), // 最初の発射までのランダムな時間
            hp: ENEMY_HP  // 敵のHP値を設定
        }
    ];
    
    // 画像があるかどうかで表示を変える
    if (!window.enemyImageFailed) {
        enemyComponents.unshift(sprite("enemy"));
        enemyComponents.push(scale(vec2(1, 1)));
    } else {
        enemyComponents.unshift(rect(ENEMY_SIZE, ENEMY_SIZE));
        enemyComponents.push(color(255, 80, 80)); // 赤色
        enemyComponents.push(outline(2, rgb(200, 30, 30)));
    }
    
    const enemy = add(enemyComponents);
    
    // 敵の動きを更新する処理
    enemy.onUpdate(() => {
        // ゲームオーバーまたはクリア時は移動しない
        if (isGameOver || isGameCleared) return;
        
        const player = get("player")[0];
        if (player) {
            // プレイヤーの方向へ向かう
            const direction = player.pos.sub(enemy.pos).unit();
            enemy.move(direction.scale(ENEMY_SPEED));
            
            // 敵の向きを変更
            if (direction.x !== 0) {
                // プレイヤーが右にいるなら右向き、左にいるなら左向き
                enemy.direction = direction.x > 0 ? 1 : -1;
                
                // 画像を反転
                if (!window.enemyImageFailed) {
                    enemy.scale = vec2(enemy.direction, 1);
                }
            }
            
            // 弾を発射する処理
            enemy.shotTimer -= dt();
            if (enemy.shotTimer <= 0) {
                // プレイヤーに向かって弾を発射
                fireEnemyBullet(enemy.pos, player.pos);
                // 次の発射までの時間をランダムに設定（3〜6秒）
                enemy.shotTimer = rand(3, 6);
            }
        }
    });
    
    return enemy;
}

// 敵の弾を発射する関数
function fireEnemyBullet(enemyPos, playerPos) {
    // 敵からプレイヤーへの方向ベクトルを計算
    const direction = playerPos.sub(enemyPos).unit();
    
    // 発射元の敵タイプに応じて弾の大きさを変更
    let bulletSize = 5;
    const nearbyGigagantrum = get("gigagantrum-enemy").find(e => e.pos.dist(enemyPos) < 10);
    if (nearbyGigagantrum) {
        bulletSize = GIGAGANTRUM_PROJECTILE_SIZE / 10; // サイズをスケーリング
    }
    
    // 弾を生成
    const bullet = add([
        circle(bulletSize),
        pos(enemyPos),
        color(255, 50, 50),
        outline(2, rgb(200, 0, 0)),
        area(),
        move(direction, BULLET_SPEED),
        opacity(1),
        lifespan(5),
        anchor("center"),
        "enemy-bullet"
    ]);
    
    // 発射効果音を再生
    GameAudio.playGunSound();
    
    return bullet;
}

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
                    console.log("SuperEnemy burp sound played");
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
                color(200, 100, 255),
                anchor("center"),
                opacity(1),
                lifespan(1),
                z(100)
            ]);
            
            // 安全なノックバック効果に変更
            safeKnockback(player, superEnemy.pos, 100);
            
            // 衝突エフェクト
            for (let i = 0; i < 15; i++) {
                add([
                    circle(rand(5, 15)),
                    pos(player.pos),
                    color(255, rand(100, 200), rand(100, 255)),
                    anchor("center"),
                    move(rand(0, 360), rand(50, 150)),
                    opacity(1),
                    lifespan(rand(0.5, 1.0)),
                    z(50)
                ]);
            }
        }
    });
    
    return superEnemy;
}

// ===== 最終ボス =====
// 最終ボスを生成する関数
function spawnFinalBoss(player) {
    // プレイヤーから一定距離離れた位置に配置
    let enemyX, enemyY;
    let tooClose = true;
    const MIN_DISTANCE = 600; // プレイヤーからの最小距離
    const MAX_DISTANCE = 800; // プレイヤーからの最大距離
    
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
    
    // 最終ボスのコンポーネント
    let bossComponents = [
        pos(enemyX, enemyY),
        area({ scale: 0.9 }),
        body(),
        anchor("center"),
        "final-boss",
        {
            direction: 1,  // 向き（1: 右向き、-1: 左向き）
            pulseTimer: 0,  // 脈動エフェクト用タイマー
            hp: FINAL_BOSS_HP,  // 最終ボスのHP値を設定
            initialHP: FINAL_BOSS_HP  // 初期HP値も保存
        }
    ];
    
    // 画像があるかどうかで表示を変える
    if (!window.dinoImageFailed) {
        bossComponents.unshift(sprite("dino"));
        // 画像サイズを調整（FINAL_BOSS_SIZEに基づいてスケール値を計算）
        const scaleValue = FINAL_BOSS_SIZE / 1333; // dinoイメージの元サイズで調整
        bossComponents.push(scale(vec2(scaleValue, scaleValue)));
    } else {
        bossComponents.unshift(rect(FINAL_BOSS_SIZE, FINAL_BOSS_SIZE));
        bossComponents.push(color(255, 100, 0));
        bossComponents.push(outline(2, rgb(200, 50, 0)));
    }
    
    // 最終ボスを追加
    const finalBoss = add(bossComponents);
    
    // 最終ボスの動きを更新する処理
    finalBoss.onUpdate(() => {
        // ゲームオーバーまたはクリア時は移動しない
        if (isGameOver || isGameCleared) return;
        
        const player = get("player")[0];
        if (player) {
            // プレイヤーの方向へ向かう
            const direction = player.pos.sub(finalBoss.pos).unit();
            finalBoss.move(direction.scale(FINAL_BOSS_SPEED));
            
            // 敵の向きを変更
            if (direction.x !== 0) {
                // プレイヤーが右にいるなら右向き、左にいるなら左向き
                finalBoss.direction = direction.x > 0 ? 1 : -1;
                
                // 画像を反転
                if (!window.dinoImageFailed) {
                    const scaleValue = FINAL_BOSS_SIZE / 1333; // dinoイメージの元サイズで調整
                    finalBoss.scale = vec2(finalBoss.direction * scaleValue, scaleValue);
                }
            }
            
            // 脈動エフェクト
            finalBoss.pulseTimer += dt();
            const pulse = Math.sin(finalBoss.pulseTimer * 10) * 0.2 + 1;
            
            if (!window.dinoImageFailed) {
                const scaleValue = FINAL_BOSS_SIZE / 1333; // dinoイメージの元サイズで調整
                finalBoss.scale = vec2(finalBoss.direction * scaleValue * pulse, scaleValue * pulse);
            } else {
                const baseColor = 255;
                const pulseColor = Math.floor(Math.sin(finalBoss.pulseTimer * 10) * 100 + 155);
                finalBoss.color = rgb(baseColor, pulseColor, 0);
            }
        }
    });
    
    // プレイヤーとの衝突処理
    finalBoss.onCollide("player", (player) => {
        // 無敵時間中でなければダメージを受ける
        if (!player.isInvincible) {
            player.hp -= FINAL_BOSS_DAMAGE; // HPを減らす（FINAL_BOSS_DAMAGEの値分）
            player.isDamaged = true;
            player.isInvincible = true;
            player.invincibleTimer = DAMAGE_COOLDOWN;
            
            // HPが0以下になったらゲームオーバー
            if (player.hp <= 0) {
                showGameOver();
            }
            
            // ダメージ表示
            add([
                text(`-${FINAL_BOSS_DAMAGE}`, { size: 30 }),
                pos(player.pos.x, player.pos.y - 50),
                color(255, 50, 50),
                outline(3, rgb(100, 0, 0)),
                anchor("center"),
                opacity(1),
                lifespan(1),
                z(100)
            ]);
            
            // 安全なノックバック効果（強力）
            safeKnockback(player, finalBoss.pos, 150);
            
            // 爆発エフェクト
            for (let i = 0; i < 20; i++) {
                add([
                    circle(rand(5, 15)),
                    pos(player.pos),
                    color(255, rand(0, 150), rand(0, 50)),
                    anchor("center"),
                    move(rand(0, 360), rand(50, 200)),
                    opacity(1),
                    lifespan(rand(0.5, 1.0)),
                    z(50)
                ]);
            }
        }
    });
    
    return finalBoss;
}

// Kat敵の動きを更新する処理
function updateKatEnemy(katEnemy) {
    // ゲームオーバーまたはクリア時は移動しない
    if (isGameOver || isGameCleared) return;
    
    const player = get("player")[0];
    if (player) {
        // プレイヤーの方向へ向かう
        const direction = player.pos.sub(katEnemy.pos).unit();
        katEnemy.move(direction.scale(KAT_SPEED));
        
        // 敵の向きを変更
        if (direction.x !== 0) {
            // プレイヤーが右にいるなら右向き、左にいるなら左向き
            katEnemy.direction = direction.x > 0 ? 1 : -1;
            
            // 画像を反転
            katEnemy.scale = vec2(katEnemy.direction * 1.2, 1.2);
        }
        
        // 脈動エフェクト
        katEnemy.pulseTimer += dt();
        const pulse = Math.sin(katEnemy.pulseTimer * 8) * 0.1 + 1;
        
        // アニメーション中もスケールを維持
        katEnemy.scale = vec2(katEnemy.direction * 1.2 * pulse, 1.2 * pulse);
        
        // 突進時間のカウントダウン
        katEnemy.dashTimer -= dt();
        if (katEnemy.dashTimer <= 0) {
            // 突進（プレイヤーに向かって素早く移動）
            const dashDirection = player.pos.sub(katEnemy.pos).unit();
            katEnemy.move(dashDirection.scale(KAT_SPEED * 1.5));
            
            // 突進エフェクト
            for (let i = 0; i < 5; i++) {
                add([
                    circle(rand(5, 10)),
                    pos(katEnemy.pos.x - dashDirection.x * 20, katEnemy.pos.y - dashDirection.y * 20),
                    color(0, rand(150, 255), rand(150, 255)),
                    anchor("center"),
                    move(rand(0, 360), rand(30, 80)),
                    opacity(1),
                    lifespan(0.3),
                    z(5)
                ]);
            }
            
            // 突進タイマーをリセット
            katEnemy.dashTimer = rand(2, 4);
        }
    }
}

// Marroc敵を生成する関数
function spawnMarroc(player) {
    // プレイヤーから一定距離離れた位置に配置
    let enemyX, enemyY;
    let tooClose = true;
    const MIN_DISTANCE = 450; // プレイヤーからの最小距離
    const MAX_DISTANCE = 650; // プレイヤーからの最大距離
    
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
    
    // Marroc敵のコンポーネント
    let enemyComponents = [
        pos(enemyX, enemyY),
        area({ scale: 0.9 }),
        body(),
        anchor("center"),
        "marroc-enemy",
        {
            direction: 1,  // 向き（1: 右向き、-1: 左向き）
            pulseTimer: 0, // 脈動エフェクト用タイマー
            chargeTimer: rand(3, 5), // チャージ時間
            isCharging: false // チャージ中かどうか
        }
    ];
    
    // 画像の設定
    enemyComponents.unshift(sprite("marroc"));
    enemyComponents.push(scale(vec2(1.2, 1.2)));
    
    // Marroc敵を追加
    const marrocEnemy = add(enemyComponents);
    
    // Marroc敵の動きを更新する処理
    marrocEnemy.onUpdate(() => {
        // ゲームオーバーまたはクリア時は移動しない
        if (isGameOver || isGameCleared) return;
        
        const player = get("player")[0];
        if (player) {
            // 敵の向きを更新
            const dirToPlayer = player.pos.sub(marrocEnemy.pos);
            if (dirToPlayer.x !== 0) {
                marrocEnemy.direction = dirToPlayer.x > 0 ? 1 : -1;
                marrocEnemy.scale.x = marrocEnemy.direction * 1.2;
            }
            
            // 脈動エフェクト
            marrocEnemy.pulseTimer += dt();
            const pulse = Math.sin(marrocEnemy.pulseTimer * 8) * 0.1 + 1;
            marrocEnemy.scale.y = 1.2 * pulse;
            
            // チャージ状態に応じた動き
            if (marrocEnemy.isCharging) {
                // チャージ中は高速移動
                const chargeDir = dirToPlayer.unit();
                marrocEnemy.move(chargeDir.scale(MARROC_SPEED * 1.8));
                
                // チャージエフェクト
                if (rand() < 0.3) {
                    add([
                        circle(rand(5, 10)),
                        pos(marrocEnemy.pos.x - dirToPlayer.unit().x * 30, 
                            marrocEnemy.pos.y - dirToPlayer.unit().y * 30),
                        color(255, rand(100, 200), 0),
                        anchor("center"),
                        move(rand(0, 360), rand(50, 100)),
                        opacity(1),
                        lifespan(rand(0.2, 0.4)),
                        z(5)
                    ]);
                }
                
                // チャージ終了判定
                marrocEnemy.chargeTimer -= dt();
                if (marrocEnemy.chargeTimer <= 0) {
                    marrocEnemy.isCharging = false;
                    marrocEnemy.chargeTimer = rand(3, 5);
                }
            } else {
                // 通常時は通常速度で追跡
                const direction = dirToPlayer.unit();
                marrocEnemy.move(direction.scale(MARROC_SPEED));
                
                // チャージ開始判定
                marrocEnemy.chargeTimer -= dt();
                if (marrocEnemy.chargeTimer <= 0) {
                    marrocEnemy.isCharging = true;
                    marrocEnemy.chargeTimer = rand(1, 2); // チャージ継続時間
                    
                    // チャージ開始エフェクト
                    for (let i = 0; i < 12; i++) {
                        add([
                            circle(rand(5, 15)),
                            pos(marrocEnemy.pos),
                            color(255, rand(100, 200), 0),
                            anchor("center"),
                            move(rand(0, 360), rand(50, 150)),
                            opacity(1),
                            lifespan(rand(0.3, 0.7)),
                            z(5)
                        ]);
                    }
                }
            }
        }
    });
    
    // プレイヤーとの衝突処理
    marrocEnemy.onCollide("player", (player) => {
        // 無敵時間中でなければダメージを受ける
        if (!player.isInvincible) {
            player.hp -= MARROC_DAMAGE;
            player.isDamaged = true;
            player.isInvincible = true;
            player.invincibleTimer = DAMAGE_COOLDOWN;
            
            // HPが0以下になったらゲームオーバー
            if (player.hp <= 0) {
                showGameOver();
            }
            
            // ダメージ表示
            add([
                text(`-${MARROC_DAMAGE}`, { size: 30 }),
                pos(player.pos.x, player.pos.y - 40),
                color(255, 150, 0),
                anchor("center"),
                opacity(1),
                lifespan(1),
                z(100)
            ]);
            
            // 安全なノックバック効果に変更（チャージ中はより強力）
            const knockbackPower = marrocEnemy.isCharging ? 120 : 80;
            safeKnockback(player, marrocEnemy.pos, knockbackPower);
            
            // 衝突エフェクト
            for (let i = 0; i < 15; i++) {
                add([
                    circle(rand(5, 15)),
                    pos(player.pos),
                    color(255, rand(100, 200), 0),
                    anchor("center"),
                    move(rand(0, 360), rand(50, 150)),
                    opacity(1),
                    lifespan(rand(0.3, 0.7)),
                    z(50)
                ]);
            }
        }
    });
    
    return marrocEnemy;
}

// Gigagantrum敵を生成する関数
function spawnGigagantrum(player) {
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
    
    // Gigagantrum敵のコンポーネント
    let enemyComponents = [
        pos(enemyX, enemyY),
        area({ scale: 0.9 }),
        body(),
        anchor("center"),
        "gigagantrum-enemy",
        {
            direction: 1,  // 向き（1: 右向き、-1: 左向き）
            pulseTimer: 0, // 脈動エフェクト用タイマー
            throwTimer: rand(2, GIGAGANTRUM_THROW_INTERVAL), // 投げる間隔タイマー
            preparingThrow: false, // 投げる準備中かどうか
            prepareTimer: 0, // 準備時間
            moveSpeed: GIGAGANTRUM_SPEED * 0.6 // 遅い移動速度
        }
    ];
    
    // 画像の設定
    enemyComponents.unshift(sprite("gigagantrum"));
    enemyComponents.push(scale(vec2(1.3, 1.3)));
    
    // Gigagantrum敵を追加
    const gigagantrumEnemy = add(enemyComponents);
    
    // Gigagantrumの動きを更新する処理
    gigagantrumEnemy.onUpdate(() => {
        // ゲームオーバーまたはクリア時は移動しない
        if (isGameOver || isGameCleared) return;
        
        const player = get("player")[0];
        if (player) {
            // 脈動エフェクト
            gigagantrumEnemy.pulseTimer += dt();
            const pulse = Math.sin(gigagantrumEnemy.pulseTimer * 4) * 0.05 + 1; // ゆっくりとした脈動
            gigagantrumEnemy.scale = vec2(gigagantrumEnemy.direction * 1.3 * pulse, 1.3 * pulse);
            
            // プレイヤーへの方向
            const dirToPlayer = player.pos.sub(gigagantrumEnemy.pos);
            
            // 敵の向きを更新
            if (dirToPlayer.x !== 0) {
                gigagantrumEnemy.direction = dirToPlayer.x > 0 ? 1 : -1;
            }
            
            // 投げる準備をしていない場合、プレイヤーに近づく
            if (!gigagantrumEnemy.preparingThrow) {
                // 非常にゆっくりとプレイヤーに近づく
                const moveDirection = dirToPlayer.unit();
                gigagantrumEnemy.move(moveDirection.scale(gigagantrumEnemy.moveSpeed));
                
                // 投げるタイマーを減らす
                gigagantrumEnemy.throwTimer -= dt();
                if (gigagantrumEnemy.throwTimer <= 0) {
                    // 投げる準備開始
                    gigagantrumEnemy.preparingThrow = true;
                    gigagantrumEnemy.prepareTimer = GIGAGANTRUM_PREPARE_TIME;
                }
            } else {
                // 投げる準備中
                gigagantrumEnemy.prepareTimer -= dt();
                
                // 準備中は色を変えるなどのエフェクト
                if (Math.floor(gigagantrumEnemy.prepareTimer * 5) % 2 === 0) {
                    gigagantrumEnemy.color = rgb(200, 50, 50);
                } else {
                    gigagantrumEnemy.color = rgb();
                }
                
                // 準備時間が終わったら弾を発射
                if (gigagantrumEnemy.prepareTimer <= 0) {
                    // 弾を発射
                    fireGigagantrumProjectile(gigagantrumEnemy, player);
                    
                    // 発射エフェクト
                    for (let i = 0; i < 10; i++) {
                        add([
                            circle(rand(5, 15)),
                            pos(gigagantrumEnemy.pos),
                            color(255, rand(50, 150), rand(0, 50)),
                            anchor("center"),
                            move(rand(0, 360), rand(50, 150)),
                            opacity(1),
                            lifespan(rand(0.3, 0.7)),
                            z(5)
                        ]);
                    }
                    
                    // タイマーをリセット
                    gigagantrumEnemy.preparingThrow = false;
                    gigagantrumEnemy.throwTimer = rand(2, GIGAGANTRUM_THROW_INTERVAL);
                    gigagantrumEnemy.color = rgb(); // 色をリセット
                }
            }
        }
    });
    
    // プレイヤーとの衝突処理
    gigagantrumEnemy.onCollide("player", (player) => {
        // 無敵時間中でなければダメージを受ける
        if (!player.isInvincible) {
            player.hp -= GIGAGANTRUM_DAMAGE;
            player.isDamaged = true;
            player.isInvincible = true;
            player.invincibleTimer = DAMAGE_COOLDOWN;
            
            // HPが0以下になったらゲームオーバー
            if (player.hp <= 0) {
                showGameOver();
            }
            
            // ダメージ表示
            add([
                text(`-${GIGAGANTRUM_DAMAGE}`, { size: 30 }),
                pos(player.pos.x, player.pos.y - 40),
                color(200, 50, 50),
                anchor("center"),
                opacity(1),
                lifespan(1),
                z(100)
            ]);
            
            // 安全なノックバック効果に変更
            safeKnockback(player, gigagantrumEnemy.pos, 100);
            
            // 衝突エフェクト
            for (let i = 0; i < 15; i++) {
                add([
                    circle(rand(5, 15)),
                    pos(player.pos),
                    color(rand(150, 255), rand(50, 100), rand(50, 100)),
                    anchor("center"),
                    move(rand(0, 360), rand(50, 150)),
                    opacity(1),
                    lifespan(rand(0.3, 0.7)),
                    z(50)
                ]);
            }
        }
    });
    
    return gigagantrumEnemy;
}

// Gigagantrumの投げる障害物（弾）を発射する関数
function fireGigagantrumProjectile(enemy, player) {
    // プレイヤーへの方向を計算
    const dir = player.pos.sub(enemy.pos).unit();
    
    // 投射音を再生
    GameAudio.playThudSound();
    
    // 投射物を作成
    const projectile = add([
        pos(enemy.pos.x, enemy.pos.y),
        circle(GIGAGANTRUM_PROJECTILE_SIZE / 2),
        color(rgb(139, 69, 19)), // 茶色
        area(),
        state("moving"),
        "gigagantrum-projectile",
        {
            speed: GIGAGANTRUM_SPEED * 0.8, // 敵の移動速度の80%
            damage: GIGAGANTRUM_PROJECTILE_DAMAGE,
            direction: dir,
            distanceTraveled: 0, // 移動距離を追跡
            
            update() {
                // 移動方向に速度を掛けて移動
                this.move(this.direction.scale(this.speed));
                
                // 移動した距離を追加
                this.distanceTraveled += this.speed;
                
                // 最大距離に達したら爆発して消滅
                if (this.distanceTraveled >= GIGAGANTRUM_PROJECTILE_DISTANCE) {
                    this.explode();
                    destroy(this);
                }
                
                // プレイヤーとの衝突をチェック
                if (this.isColliding(player) && !player.isInvincible) {
                    // プレイヤーにダメージを与える
                    player.hp -= this.damage;
                    updateHearts();
                    
                    // 無敵状態を設定
                    player.isInvincible = true;
                    
                    // 無敵時間後に無敵状態を解除
                    wait(DAMAGE_COOLDOWN, () => {
                        if (player.exists()) {
                            player.isInvincible = false;
                        }
                    });
                    
                    // HPが0以下ならゲームオーバー
                    if (player.hp <= 0) {
                        go("gameover", score);
                    }
                    
                    // 爆発エフェクトを表示して投射物を破壊
                    this.explode();
                    destroy(this);
                }
            },
            
            // 爆発エフェクト
            explode() {
                add([
                    sprite("kaboom"),
                    pos(this.pos),
                    scale(1.5),
                    opacity(1),
                    lifespan(0.5),
                    "explosion"
                ]);
            }
        }
    ]);
    
    return projectile;
}

// Goldfly敵を生成する関数
function spawnGoldfly(player) {
    // マップのランダムな位置に配置
    let enemyX, enemyY;
    let tooClose = true;
    
    // プレイヤーから少し離れた位置に配置
    while (tooClose) {
        // マップの端から少し離れた位置でランダム
        enemyX = rand(100, MAP_WIDTH - 100);
        enemyY = rand(100, MAP_HEIGHT - 100);
        
        // プレイヤーからの距離を計算
        const distToPlayer = Math.sqrt(
            Math.pow(enemyX - player.pos.x, 2) + 
            Math.pow(enemyY - player.pos.y, 2)
        );
        
        // 一定距離以上離れていれば配置OK
        if (distToPlayer >= 500) {
            tooClose = false;
        }
    }
    
    // Goldfly敵のコンポーネント
    let enemyComponents = [
        pos(enemyX, enemyY),
        area({ scale: 0.9 }),
        body(),
        anchor("center"),
        "goldfly-enemy",
        {
            direction: 1,  // 向き（1: 右向き、-1: 左向き）
            pulseTimer: 0, // 脈動エフェクト用タイマー
            moveAngle: rand(0, Math.PI * 2), // 移動方向
            directionTimer: 0, // 方向転換タイマー
            targetPlayer: rand() < 0.5 // プレイヤーを追いかけるかどうか
        }
    ];
    
    // 画像の設定
    enemyComponents.unshift(sprite("goldfly"));
    enemyComponents.push(scale(vec2(1.1, 1.1)));
    
    // Goldfly敵を追加
    const goldflyEnemy = add(enemyComponents);
    
    // Goldflyの動きを更新する処理
    goldflyEnemy.onUpdate(() => {
        updateGoldflyEnemy(goldflyEnemy);
    });
    
    // プレイヤーとの衝突処理
    goldflyEnemy.onCollide("player", (player) => {
        // 無敵時間中でなければダメージを受ける
        if (!player.isInvincible) {
            player.hp -= GOLDFLY_DAMAGE;
            player.isDamaged = true;
            player.isInvincible = true;
            player.invincibleTimer = DAMAGE_COOLDOWN;
            
            // HPが0以下になったらゲームオーバー
            if (player.hp <= 0) {
                showGameOver();
            }
            
            // ダメージ表示
            add([
                text(`-${GOLDFLY_DAMAGE}`, { size: 30 }),
                pos(player.pos.x, player.pos.y - 40),
                color(255, 200, 0),
                anchor("center"),
                opacity(1),
                lifespan(1),
                z(100)
            ]);
            
            // 安全なノックバック効果に変更
            safeKnockback(player, goldflyEnemy.pos, 70);
            
            // 衝突エフェクト
            for (let i = 0; i < 15; i++) {
                add([
                    circle(rand(5, 15)),
                    pos(player.pos),
                    color(255, rand(200, 255), 0),
                    anchor("center"),
                    move(rand(0, 360), rand(50, 150)),
                    opacity(1),
                    lifespan(rand(0.3, 0.7)),
                    z(50)
                ]);
            }
        }
    });
    
    return goldflyEnemy;
}

// Goldfly敵の動きを更新する処理
function updateGoldflyEnemy(goldflyEnemy) {
    // ゲームオーバーまたはクリア時は移動しない
    if (isGameOver || isGameCleared) return;
    
    const player = get("player")[0];
    if (player) {
        // 脈動エフェクト
        goldflyEnemy.pulseTimer += dt();
        const pulse = Math.sin(goldflyEnemy.pulseTimer * 12) * 0.1 + 1; // 早い脈動
        goldflyEnemy.scale = vec2(goldflyEnemy.direction * 1.1 * pulse, 1.1 * pulse);
        
        // 方向転換タイマーの更新
        goldflyEnemy.directionTimer -= dt();
        
        // 移動方向の更新（タイマーが0以下になったら）
        if (goldflyEnemy.directionTimer <= 0) {
            // プレイヤーを追いかけるかどうかをランダムに変更
            goldflyEnemy.targetPlayer = rand() < 0.7; // 70%の確率でプレイヤーを追いかける
            
            if (goldflyEnemy.targetPlayer) {
                // プレイヤーの方向へ向かう場合
                const dirToPlayer = player.pos.sub(goldflyEnemy.pos);
                goldflyEnemy.moveAngle = Math.atan2(dirToPlayer.y, dirToPlayer.x);
                
                // 敵の向きを変更
                goldflyEnemy.direction = dirToPlayer.x > 0 ? 1 : -1;
            } else {
                // ランダムな方向へ向かう場合
                goldflyEnemy.moveAngle = rand(0, Math.PI * 2);
                
                // 向きもランダムに変更
                goldflyEnemy.direction = rand() < 0.5 ? -1 : 1;
            }
            
            // 次の方向転換までの時間をセット（ばらつきを持たせる）
            goldflyEnemy.directionTimer = GOLDFLY_DIRECTION_CHANGE_INTERVAL + rand(-0.5, 0.5);
            
            // 方向転換時のエフェクト
            add([
                circle(rand(5, 10)),
                pos(goldflyEnemy.pos),
                color(255, 255, 0),
                anchor("center"),
                move(rand(0, 360), rand(20, 50)),
                opacity(0.7),
                lifespan(0.2),
                z(5)
            ]);
        }
        
        // 移動処理
        const moveDir = vec2(
            Math.cos(goldflyEnemy.moveAngle),
            Math.sin(goldflyEnemy.moveAngle)
        );
        
        // Goldflyは素早く動く
        goldflyEnemy.move(moveDir.scale(GOLDFLY_SPEED));
        
        // 壁や障害物との衝突チェック（衝突したら反射）
        if (goldflyEnemy.pos.x <= 50 || goldflyEnemy.pos.x >= MAP_WIDTH - 50) {
            // X軸方向の反射
            goldflyEnemy.moveAngle = Math.PI - goldflyEnemy.moveAngle;
            goldflyEnemy.direction *= -1; // 向きを反転
        }
        
        if (goldflyEnemy.pos.y <= 50 || goldflyEnemy.pos.y >= MAP_HEIGHT - 50) {
            // Y軸方向の反射
            goldflyEnemy.moveAngle = -goldflyEnemy.moveAngle;
        }
        
        // 移動中のトレイルエフェクト（まれに発生）
        if (rand() < 0.1) {
            add([
                circle(rand(3, 6)),
                pos(goldflyEnemy.pos),
                color(255, rand(200, 255), 0),
                anchor("center"),
                opacity(0.5),
                lifespan(0.3),
                z(4)
            ]);
        }
    }
}

// ランプ敵を生成する関数
function spawnLamp() {
    // 適切な場所をランダムに選択
    let lampX, lampY;
    let validPosition = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 100;
    
    // プレイヤーから一定距離離れた位置を探す
    const player = get("player")[0];
    
    while (!validPosition && attempts < MAX_ATTEMPTS) {
        attempts++;
        
        // マップのランダムな位置
        lampX = rand(100, MAP_WIDTH - 100);
        lampY = rand(100, MAP_HEIGHT - 100);
        
        if (player) {
            // プレイヤーからの距離を計算
            const distToPlayer = Math.sqrt(
                Math.pow(lampX - player.pos.x, 2) + 
                Math.pow(lampY - player.pos.y, 2)
            );
            
            // プレイヤーから十分離れていて、かつ障害物に重ならない位置
            if (distToPlayer >= 400) {
                validPosition = true;
                
                // 障害物との衝突チェック
                for (const obstacle of obstacles) {
                    if (!obstacle.is("obstacle")) continue;
                    
                    const distX = Math.abs(lampX - (obstacle.pos.x + obstacle.width/2));
                    const distY = Math.abs(lampY - (obstacle.pos.y + obstacle.height/2));
                    
                    if (distX < LAMP_SIZE + obstacle.width/2 && 
                        distY < LAMP_SIZE + obstacle.height/2) {
                        validPosition = false;
                        break;
                    }
                }
            }
        } else {
            // プレイヤーオブジェクトがなければ（ロード中など）、単にランダムな位置
            validPosition = true;
        }
    }
    
    // 有効な位置が見つからなかった場合
    if (!validPosition) {
        console.log("ランプの配置に失敗しました");
        return null;
    }
    
    // ランプ敵のコンポーネント
    let lampComponents = [
        pos(lampX, lampY),
        area({ scale: 0.8 }),
        anchor("center"),
        z(5),
        "lamp",
        {
            beamTimer: rand(3, LAMP_BEAM_INTERVAL), // 次の光線発射までの時間
            beamActive: false,                      // 光線が発射中かどうか
            beamDirection: rand(0, Math.PI * 2),    // 光線の方向（ランダム）
            beamDuration: 0,                        // 光線の残り持続時間
            pulseTimer: 0                           // 脈動エフェクト用タイマー
        }
    ];
    
    // 画像があるかどうかで表示を変える
    if (!window.lampImageFailed) {
        lampComponents.unshift(sprite("lamp"));
        lampComponents.push(scale(vec2(1, 1)));
    } else {
        lampComponents.unshift(rect(LAMP_SIZE, LAMP_SIZE));
        lampComponents.push(color(255, 220, 50)); // 黄色
        lampComponents.push(outline(3, rgb(255, 150, 0)));
    }
    
    // ランプ敵を追加
    const lamp = add(lampComponents);
    
    // 脈動エフェクト
    lamp.onUpdate(() => {
        // ゲームオーバーまたはクリア時は何もしない
        if (isGameOver || isGameCleared) return;
        
        // 脈動エフェクト
        lamp.pulseTimer += dt();
        const pulse = Math.sin(lamp.pulseTimer * 4) * 0.1 + 1;
        
        if (!window.lampImageFailed) {
            lamp.scale = vec2(pulse, pulse);
        } else {
            const baseColor = 255;
            const pulseColor = Math.floor(Math.sin(lamp.pulseTimer * 4) * 50 + 170);
            lamp.color = rgb(baseColor, pulseColor, pulseColor > 150 ? 50 : 20);
        }
        
        // 光線発射のタイミング管理
        if (lamp.beamActive) {
            // 光線発射中
            lamp.beamDuration -= dt();
            if (lamp.beamDuration <= 0) {
                // 光線の終了
                lamp.beamActive = false;
                lamp.beamTimer = LAMP_BEAM_INTERVAL; // 次の発射までリセット
                
                // 光線オブジェクトを探して削除
                get("lamp-beam").forEach(beam => {
                    destroy(beam);
                });
            }
        } else {
            // 光線待機中
            lamp.beamTimer -= dt();
            if (lamp.beamTimer <= 0) {
                // 光線発射の準備
                fireLampBeam(lamp);
                lamp.beamActive = true;
                lamp.beamDuration = LAMP_BEAM_DURATION;
            }
            
            // 発射直前は点滅する警告エフェクト
            if (lamp.beamTimer <= 1.0) {
                if (Math.floor(lamp.beamTimer * 10) % 2 === 0) {
                    lamp.opacity = 1.5;
                    lamp.scale = vec2(pulse * 1.2, pulse * 1.2);
                } else {
                    lamp.opacity = 0.8;
                    lamp.scale = vec2(pulse * 0.9, pulse * 0.9);
                }
            }
        }
    });
    
    return lamp;
}

// ランプの光線攻撃を発射する関数
function fireLampBeam(lamp) {
    // ランダムな方向または近くにプレイヤーがいる場合はプレイヤー方向
    let beamDirection = lamp.beamDirection;
    
    const player = get("player")[0];
    if (player) {
        const distToPlayer = Math.sqrt(
            Math.pow(lamp.pos.x - player.pos.x, 2) + 
            Math.pow(lamp.pos.y - player.pos.y, 2)
        );
        
        // プレイヤーが近くにいる場合（50%の確率）、プレイヤー方向を狙う
        if (distToPlayer < 500 && rand() < 0.5) {
            beamDirection = Math.atan2(
                player.pos.y - lamp.pos.y,
                player.pos.x - lamp.pos.x
            );
            // ±15度のランダムな誤差を追加
            beamDirection += rand(-0.25, 0.25);
        }
    }
    
    // 光線の終点座標を計算
    const endX = lamp.pos.x + Math.cos(beamDirection) * LAMP_BEAM_LENGTH;
    const endY = lamp.pos.y + Math.sin(beamDirection) * LAMP_BEAM_LENGTH;
    
    // 光線の警告エフェクト
    for (let i = 0; i < 10; i++) {
        const t = i / 10;
        const particleX = lamp.pos.x + (endX - lamp.pos.x) * t;
        const particleY = lamp.pos.y + (endY - lamp.pos.y) * t;
        
        add([
            circle(rand(5, 15)),
            pos(particleX, particleY),
            color(255, rand(200, 255), rand(0, 100)),
            opacity(rand(0.5, 1)),
            anchor("center"),
            lifespan(0.5),
            z(5)
        ]);
    }
    
    // 少し待ってから光線を発射
    wait(0.2, () => {
        // 光線オブジェクト
        const beam = add([
            rect(LAMP_BEAM_LENGTH, LAMP_BEAM_WIDTH),
            pos(lamp.pos),
            color(255, 220, 50),
            opacity(0.8),
            anchor("left"),
            rotate(beamDirection),
            area(),
            z(4),
            "lamp-beam",
            {
                sourcePos: lamp.pos,
                direction: beamDirection,
                timer: 0
            }
        ]);
        
        // 光線内側のエフェクト
        const innerBeam = add([
            rect(LAMP_BEAM_LENGTH, LAMP_BEAM_WIDTH * 0.5),
            pos(lamp.pos),
            color(255, 255, 200),
            opacity(0.9),
            anchor("left"),
            rotate(beamDirection),
            z(5),
            "lamp-beam-inner"
        ]);
        
        // 光線のパルスエフェクト
        beam.onUpdate(() => {
            beam.timer += dt();
            const pulseScale = Math.sin(beam.timer * 15) * 0.1 + 1;
            beam.width = LAMP_BEAM_WIDTH * pulseScale;
            innerBeam.width = beam.width * 0.5;
            
            // 光源の位置に追従
            innerBeam.pos = beam.pos = lamp.pos;
            innerBeam.angle = beam.angle = beamDirection * (180 / Math.PI);
            
            // プレイヤーとの衝突判定
            const player = get("player")[0];
            if (player && !player.isInvincible) {
                // 光線とプレイヤーの衝突判定（シンプルな実装）
                const playerToSource = vec2(
                    player.pos.x - lamp.pos.x,
                    player.pos.y - lamp.pos.y
                );
                
                // プレイヤーから光源への方向ベクトル
                const playerDist = Math.sqrt(
                    playerToSource.x ** 2 + playerToSource.y ** 2
                );
                
                // 光線方向の単位ベクトル
                const beamDirVec = vec2(
                    Math.cos(beamDirection),
                    Math.sin(beamDirection)
                );
                
                // プレイヤーの方向と光線の方向の内積
                const dot = (playerToSource.x * beamDirVec.x + 
                             playerToSource.y * beamDirVec.y) / playerDist;
                
                // プレイヤーから光線への垂直距離
                const perpDist = playerDist * Math.sqrt(1 - dot ** 2);
                
                // 光線の範囲内で、かつ垂直距離が光線幅の半分以下
                if (dot > 0 && perpDist < LAMP_BEAM_WIDTH/2 && 
                    playerDist * dot < LAMP_BEAM_LENGTH) {
                    // ダメージを与える
                    player.hp -= LAMP_BEAM_DAMAGE;
                    player.isDamaged = true;
                    player.isInvincible = true;
                    player.invincibleTimer = DAMAGE_COOLDOWN;
                    
                    // HPが0以下になったらゲームオーバー
                    if (player.hp <= 0) {
                        showGameOver();
                    }
                    
                    // ダメージ表示
                    add([
                        text(`-${LAMP_BEAM_DAMAGE}`, { size: 25 }),
                        pos(player.pos.x, player.pos.y - 30),
                        color(255, 200, 0),
                        anchor("center"),
                        opacity(1),
                        lifespan(0.8),
                        z(100)
                    ]);
                    
                    // 光線ヒットエフェクト
                    for (let i = 0; i < 15; i++) {
                        add([
                            circle(rand(5, 15)),
                            pos(player.pos),
                            color(255, rand(150, 255), rand(0, 100)),
                            opacity(rand(0.7, 1)),
                            anchor("center"),
                            move(rand(0, 360), rand(50, 150)),
                            opacity(1),
                            lifespan(rand(0.3, 0.7)),
                            z(6)
                        ]);
                    }
                }
            }
        });
        
        // 光線終了時の処理
        wait(LAMP_BEAM_DURATION, () => {
            destroy(beam);
            destroy(innerBeam);
        });
    });
}
