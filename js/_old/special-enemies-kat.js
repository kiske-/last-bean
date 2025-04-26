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
                    fireEnemyBullet(gigagantrumEnemy.pos, player.pos);
                    
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
