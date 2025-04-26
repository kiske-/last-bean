// ゲームの初期設定
function setupGame() {
    // カメラのビューポートを設定
    camScale(vec2(1, 1)); // カメラの倍率
    
    // 壁を作成
    createWalls();
    
    // プレイヤーを作成
    const player = createPlayer();
    
    // 敵を作成
    const enemies = createEnemies();
    
    // ハートアイテムを作成
    const hearts = createHearts();
    
    // HPゲージを作成（上中央に配置）
    const hpSystem = createHpBar(player);
    
    // 弾薬数表示を作成（左上に配置）
    const ammoDisplay = UI.createAmmoDisplay(player);
    
    // 残り時間を表示（右上に配置）
    const timeInfo = add([
        text(`${formatTime(SURVIVAL_TIME)}`, { size: 32 }),
        pos(width() - 130, 30),
        fixed(),
        outline(2, rgb(0, 0, 0)),
        z(100),  // 前面に表示
    ]);
    
    // 敵の追加タイマーとカウンター
    let enemySpawnTimer = 25; // 30秒→25秒ごとに敵を追加（頻度上昇）
    let enemySpawnCounter = 0;
    let totalEnemiesAdded = 0;
    const MAX_ADDITIONAL_ENEMIES = 20; // 最大追加敵数（15→20に増加）
    
    // 強力な敵の出現タイマー
    let superEnemyTimer = SUPER_ENEMY_INTERVAL;
    
    // ランプ敵の出現タイマー
    let lampTimer = LAMP_INTERVAL;
    
    // 新しい敵の出現タイマー
    let katTimer = KAT_INTERVAL;
    let marrocTimer = MARROC_INTERVAL;
    let gigagantrumTimer = GIGAGANTRUM_INTERVAL;
    let goldflyTimer = GOLDFLY_INTERVAL;
    
    // ハートの出現タイマー
    let heartSpawnTimer = 0;
    
    // ガンと雷アイテムの出現タイマー
    let gunItemTimer = 0;
    let lighteningItemTimer = 0;
    
    // キー入力による移動と時間処理
    onUpdate(() => {
        // ゲームオーバーまたはクリア後は操作を受け付けない
        if (isGameOver || isGameCleared) {
            return;
        }
        
        // ゲーム時間を更新
        gameTime += dt();
        const remainingTime = SURVIVAL_TIME - gameTime;
        
        // 時間表示を更新
        timeInfo.text = `${formatTime(Math.max(0, remainingTime))}`;
        
        // 残り15秒で最終ボスを登場させる
        if (remainingTime <= FINAL_BOSS_APPEAR_TIME && remainingTime > FINAL_BOSS_APPEAR_TIME - 0.1) {
            // 警告テキストを表示
            showFinalBossWarningText();
            
            // 最終ボスをFINAL_BOSS_COUNT体同時に出現させる
            for (let i = 0; i < FINAL_BOSS_COUNT; i++) {
                const newBoss = spawnFinalBoss(player);
                
                // ボスの登場エフェクト
                for (let j = 0; j < 15; j++) {
                    add([
                        circle(rand(5, 15)),
                        pos(newBoss.pos),
                        color(255, rand(0, 150), rand(0, 50)),
                        opacity(rand(0.6, 1)),
                        anchor("center"),
                        move(rand(0, 360), rand(50, 150)),
                        lifespan(rand(0.5, 1.0)),
                        z(5)
                    ]);
                }
            }
            
            // 画面を一瞬赤く点滅させる
            const flash = add([
                rect(width(), height()),
                pos(0, 0),
                color(255, 0, 0),
                opacity(0.15),
                fixed(),
                z(198)
            ]);
            
            // フラッシュを消す
            wait(0.2, () => {
                destroy(flash);
            });
        }
        
        // 残り60秒で障害物が動き出す
        if (remainingTime <= MOVING_OBSTACLE_ACTIVATE_TIME && remainingTime > MOVING_OBSTACLE_ACTIVATE_TIME - 0.1) {
            // 障害物をアクティブ化
            const activatedCount = activateMovingObstacles();
            console.log(`${activatedCount}個の障害物がアクティブ化されました`);
            
            // 画面全体を紫色に点滅させる
            const flash = add([
                rect(width(), height()),
                pos(0, 0),
                color(150, 50, 200),
                opacity(0.2),
                fixed(),
                z(198)
            ]);
            
            // フラッシュを消す
            wait(0.3, () => {
                destroy(flash);
            });
        }
        
        // 敵の追加処理
        enemySpawnCounter += dt();
        if (enemySpawnCounter >= enemySpawnTimer && totalEnemiesAdded < MAX_ADDITIONAL_ENEMIES) {
            // 敵を1体追加
            spawnNewEnemy(player);
            totalEnemiesAdded++;
            enemySpawnCounter = 0;
            
            // 追加した敵の数を表示（デバッグ用）
            console.log(`敵を追加しました。現在の追加数: ${totalEnemiesAdded}`);
        }
        
        // 強力な敵の出現処理
        superEnemyTimer -= dt();
        if (superEnemyTimer <= 0) {
            // 強力な敵を出現させる
            spawnSuperEnemy(player);
            // 警告テキストを表示
            showWarningText();
            // タイマーをリセット
            superEnemyTimer = SUPER_ENEMY_INTERVAL;
        }
        
        // ランプ敵の出現処理
        lampTimer -= dt();
        if (lampTimer <= 0) {
            // ランプ敵を出現させる
            const newLamp = spawnLamp();
            if (newLamp) {
                console.log("ランプ敵を追加しました");
                
                // 出現エフェクト
                for (let i = 0; i < 20; i++) {
                    add([
                        circle(rand(5, 15)),
                        pos(newLamp.pos),
                        color(255, rand(150, 255), rand(50, 150)),
                        opacity(rand(0.6, 1)),
                        anchor("center"),
                        move(rand(0, 360), rand(50, 150)),
                        lifespan(rand(0.5, 1.0)),
                        z(4)
                    ]);
                }
            }
            // タイマーをリセット（少しランダム性を持たせる）
            lampTimer = LAMP_INTERVAL + rand(-10, 10);
        }
        
        // Kat敵の出現処理
        katTimer -= dt();
        if (katTimer <= 0) {
            // Kat敵を出現させる
            const newKat = spawnKat(player);
            console.log("Kat敵を追加しました");
            
            // 出現エフェクト
            for (let i = 0; i < 15; i++) {
                add([
                    circle(rand(5, 15)),
                    pos(newKat.pos),
                    color(0, rand(150, 255), rand(150, 255)),
                    opacity(rand(0.6, 1)),
                    anchor("center"),
                    move(rand(0, 360), rand(50, 150)),
                    lifespan(rand(0.5, 1.0)),
                    z(4)
                ]);
            }
            
            // タイマーをリセット（少しランダム性を持たせる）
            katTimer = KAT_INTERVAL + rand(-5, 5);
        }
        
        // Marroc敵の出現処理
        marrocTimer -= dt();
        if (marrocTimer <= 0) {
            // Marroc敵を出現させる
            const newMarroc = spawnMarroc(player);
            console.log("Marroc敵を追加しました");
            
            // 出現エフェクト
            for (let i = 0; i < 15; i++) {
                add([
                    circle(rand(5, 15)),
                    pos(newMarroc.pos),
                    color(255, rand(100, 200), 0),
                    opacity(rand(0.6, 1)),
                    anchor("center"),
                    move(rand(0, 360), rand(50, 150)),
                    lifespan(rand(0.5, 1.0)),
                    z(4)
                ]);
            }
            
            // タイマーをリセット（少しランダム性を持たせる）
            marrocTimer = MARROC_INTERVAL + rand(-5, 5);
        }
        
        // Gigagantrum敵の出現処理
        gigagantrumTimer -= dt();
        if (gigagantrumTimer <= 0) {
            // Gigagantrum敵を出現させる
            const newGigagantrum = spawnGigagantrum(player);
            console.log("Gigagantrum敵を追加しました");
            
            // 警告テキストを表示
            const warning = add([
                text("WARNING: GIGAGANTRUM APPROACHING!", { 
                    size: 30,
                }),
                pos(center().x, 150),
                color(200, 50, 50),
                outline(2, rgb(100, 0, 0)),
                anchor("center"),
                fixed(),
                opacity(1),
                z(200)
            ]);
            
            // 警告テキストのフェードアウト
            warning.onUpdate(() => {
                warning.opacity -= 0.01;
                if (warning.opacity <= 0) {
                    destroy(warning);
                }
            });
            
            // 出現エフェクト
            for (let i = 0; i < 20; i++) {
                add([
                    circle(rand(5, 15)),
                    pos(newGigagantrum.pos),
                    color(rand(150, 200), rand(0, 100), rand(0, 100)),
                    opacity(rand(0.6, 1)),
                    anchor("center"),
                    move(rand(0, 360), rand(50, 150)),
                    lifespan(rand(0.5, 1.0)),
                    z(4)
                ]);
            }
            
            // タイマーをリセット（少しランダム性を持たせる）
            gigagantrumTimer = GIGAGANTRUM_INTERVAL + rand(-10, 10);
        }
        
        // Goldfly敵の出現処理
        goldflyTimer -= dt();
        if (goldflyTimer <= 0) {
            // Goldfly敵を出現させる
            const newGoldfly = spawnGoldfly(player);
            console.log("Goldfly敵を追加しました");
            
            // 出現エフェクト
            for (let i = 0; i < 15; i++) {
                add([
                    circle(rand(5, 15)),
                    pos(newGoldfly.pos),
                    color(255, rand(200, 255), 0),
                    opacity(rand(0.6, 1)),
                    anchor("center"),
                    move(rand(0, 360), rand(50, 150)),
                    lifespan(rand(0.5, 1.0)),
                    z(4)
                ]);
            }
            
            // タイマーをリセット（少しランダム性を持たせる）
            goldflyTimer = GOLDFLY_INTERVAL + rand(-10, 10);
        }
        
        // ハートの出現処理
        heartSpawnTimer += dt();
        if (heartSpawnTimer >= HEART_SPAWN_INTERVAL) {
            spawnNewHeart(player);
            heartSpawnTimer = 0;
        }
        
        // ガンアイテムの出現処理
        gunItemTimer += dt();
        if (gunItemTimer >= GUN_SPAWN_INTERVAL) {
            spawnGunItem();
            console.log("ガンアイテムを追加しました");
            gunItemTimer = 0;
        }
        
        // 雷アイテムの出現処理
        lighteningItemTimer += dt();
        if (lighteningItemTimer >= LIGHTENING_SPAWN_INTERVAL) {
            spawnLighteningItem();
            console.log("雷アイテムを追加しました");
            lighteningItemTimer = 0;
        }
        
        // 生存時間達成でゲームクリア
        if (remainingTime <= 0 && !isGameCleared) {
            showGameClear();
            return;
        }
        
        // 移動方向を初期化
        let direction = vec2(0, 0);
        
        // 矢印キーとWASDキーの入力を取得
        if (isKeyDown("left") || isKeyDown("a")) direction.x = -1;
        if (isKeyDown("right") || isKeyDown("d")) direction.x = 1;
        if (isKeyDown("up") || isKeyDown("w")) direction.y = -1;
        if (isKeyDown("down") || isKeyDown("s")) direction.y = 1;
        
        // プレイヤーの向きを変更（左右方向の入力がある場合のみ）
        if (direction.x !== 0) {
            player.direction = direction.x;
            
            // 画像を反転する（scale.xで左右反転）
            if (!window.playerImageFailed) {
                player.scale = vec2(player.direction, 1);
            }
        }
        
        // 単位ベクトル化（斜め移動時に速度が一定になるよう正規化）
        if (direction.x !== 0 || direction.y !== 0) {
            direction = direction.unit();
        }
        
        // シフトキーが押されていれば速度アップ
        let speed = isKeyDown("shift") ? PLAYER_SPEED_FAST : PLAYER_SPEED;
        
        // 移動速度を適用
        player.move(direction.scale(speed));
    });
}

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
            hp: 50  // 敵のHP値を設定
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
    
    // 弾を生成
    const bullet = add([
        circle(5),
        pos(enemyPos),
        color(255, 50, 50),
        outline(2, rgb(200, 0, 0)),
        area(),
        move(direction, BULLET_SPEED),
        opacity(1),  // opacityコンポーネントを追加
        lifespan(5),
        anchor("center"),
        "enemy-bullet"
    ]);
    
    // 発射効果音を再生
    GameAudio.playGunSound();
    
    return bullet;
}

// 強力な敵の登場を警告するテキストを表示
function showWarningText() {
    // 警告テキスト
    const warning = add([
        text("WARNING: SUPER ENEMY APPROACHING!", { 
            size: 30,
        }),
        pos(center().x, 100),
        color(255, 50, 50),
        outline(2, rgb(100, 0, 0)),
        anchor("center"),
        fixed(),
        opacity(1),
        z(200)
    ]);
    
    // 警告効果音を再生
    GameAudio.playWarningSound();
    
    // 警告テキストのフェードアウト
    warning.onUpdate(() => {
        warning.opacity -= 0.01;
        if (warning.opacity <= 0) {
            destroy(warning);
        }
    });
}

// 最終ボスの登場を警告するテキストを表示
function showFinalBossWarningText() {
    // 警告テキスト（画面全体に表示）
    const warningBg = add([
        rect(width(), height()),
        pos(0, 0),
        color(200, 0, 0),
        opacity(0.15), // 0.3から0.15に透明度を下げる
        fixed(),
        z(199)
    ]);
    
    const warning = add([
        text("DANGER: FINAL BOSS APPROACHING!", { 
            size: 40,
        }),
        pos(center().x, center().y),
        color(255, 255, 0),
        outline(3, rgb(200, 0, 0)),
        anchor("center"),
        fixed(),
        opacity(0.8), // 透明度を0.8に設定
        z(200)
    ]);
    
    // サブテキスト
    const subWarning = add([
        text("AVOID AT ALL COSTS!", { 
            size: 30,
        }),
        pos(center().x, center().y + 60),
        color(255, 255, 255),
        outline(2, rgb(200, 0, 0)),
        anchor("center"),
        fixed(),
        opacity(0.8), // 透明度を0.8に設定
        z(200)
    ]);
    
    // 警告効果音を再生
    GameAudio.playWarningSound();
    
    // 警告テキストのフェードアウト
    let timer = 0;
    warning.onUpdate(() => {
        timer += dt();
        warningBg.opacity = 0.15 * (1 - timer/3); // 開始透明度を0.15に変更
        warning.opacity = 0.8 * (1 - timer/3); // 開始透明度を0.8に変更
        subWarning.opacity = 0.8 * (1 - timer/3); // 開始透明度を0.8に変更
        
        // 点滅効果
        warning.color = timer % 0.5 < 0.25 ? rgb(255, 255, 0) : rgb(255, 0, 0);
        
        if (timer >= 3) {
            destroy(warningBg);
            destroy(warning);
            destroy(subWarning);
        }
    });
}

// 新しいハートを生成する関数
function spawnNewHeart(player) {
    // ランダムな位置を生成
    let heartX, heartY;
    let validPosition = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 100; // 最大試行回数
    
    // 有効な位置を見つけるまで繰り返す
    while (!validPosition && attempts < MAX_ATTEMPTS) {
        attempts++;
        
        // ランダムな位置を生成（余白を考慮）
        heartX = rand(100, MAP_WIDTH - 100);
        heartY = rand(100, MAP_HEIGHT - 100);
        
        // プレイヤーからの距離を計算
        const distToPlayer = Math.sqrt(
            Math.pow(heartX - player.pos.x, 2) + 
            Math.pow(heartY - player.pos.y, 2)
        );
        
        // プレイヤーから一定距離以内に配置
        if (distToPlayer > 500) { // 遠すぎる場合はスキップ
            continue;
        }
        
        // 障害物との衝突チェック
        validPosition = true;
        for (const obstacle of obstacles) {
            // 外周の壁は無視
            if (!obstacle.is("obstacle")) {
                continue;
            }
            
            const distX = Math.max(
                obstacle.pos.x - heartX,
                0,
                heartX - (obstacle.pos.x + obstacle.width)
            );
            const distY = Math.max(
                obstacle.pos.y - heartY,
                0,
                heartY - (obstacle.pos.y + obstacle.height)
            );
            
            const distance = Math.sqrt(distX * distX + distY * distY);
            const MIN_OBSTACLE_DISTANCE = HEART_SIZE + 50;
            
            if (distance < MIN_OBSTACLE_DISTANCE) {
                validPosition = false;
                break;
            }
        }
    }
    
    // 有効な位置が見つからなかった場合はスキップ
    if (!validPosition) {
        console.log(`新しいハートの配置に失敗しました`);
        return null;
    }
    
    // ハートアイテムを追加
    let heartComponents = [
        pos(heartX, heartY),
        area({ scale: 0.9 }),
        anchor("center"),
        z(2),
        "heart"
    ];
     
    // 画像があるかどうかで表示を変える
    if (!window.heartImageFailed) {
        heartComponents.unshift(sprite("heart"));
        heartComponents.push(scale(vec2(HEART_SIZE/50, HEART_SIZE/50)));
    } else {
        heartComponents.unshift(rect(HEART_SIZE * 2, HEART_SIZE * 2));
        heartComponents.push(color(255, 50, 80)); // ピンク色
        heartComponents.push(outline(2, rgb(255, 100, 150)));
    }
    
    // 出現エフェクト
    for (let i = 0; i < 12; i++) {
        add([
            circle(rand(5, 10)),
            pos(heartX, heartY),
            color(255, rand(150, 255), rand(150, 255)),
            anchor("center"),
            opacity(1),
            lifespan(0.7),
            move(rand(0, 360), rand(50, 100)),
            z(5)
        ]);
    }
    
    // ハートを上下に浮かせるアニメーション
    const heart = add(heartComponents);
    heart.onUpdate(() => {
        // ゲームオーバーまたはクリア時はアニメーションしない
        if (isGameOver || isGameCleared) return;
        
        // 上下に浮かぶようなアニメーション
        heart.pos.y += Math.sin(time() * 3) * 0.5;
    });
    
    return heart;
}

// ガンアイテムを生成する関数
function spawnGunItem() {
    // ランダムな位置を生成（余白を考慮）
    let gunX, gunY;
    let validPosition = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 100; // 最大試行回数
    const MIN_OBSTACLE_DISTANCE = GUN_SIZE + 50; // 障害物からの最小距離
    
    // 有効な位置を見つけるまで繰り返す
    while (!validPosition && attempts < MAX_ATTEMPTS) {
        attempts++;
        
        // ランダムな位置を生成（余白を考慮）
        gunX = rand(200, MAP_WIDTH - 200);
        gunY = rand(200, MAP_HEIGHT - 200);
        
        // 障害物との衝突チェック
        validPosition = true;
        for (const obstacle of obstacles) {
            // 外周の壁は無視
            if (!obstacle.is("obstacle")) {
                continue;
            }
            
            const distX = Math.max(
                obstacle.pos.x - gunX,
                0,
                gunX - (obstacle.pos.x + obstacle.width)
            );
            const distY = Math.max(
                obstacle.pos.y - gunY,
                0,
                gunY - (obstacle.pos.y + obstacle.height)
            );
            
            const distance = Math.sqrt(distX * distX + distY * distY);
            
            if (distance < MIN_OBSTACLE_DISTANCE) {
                validPosition = false;
                break;
            }
        }
    }
    
    // 有効な位置が見つからなかった場合はスキップ
    if (!validPosition) {
        console.log("ガンアイテムの配置に失敗しました");
        return null;
    }
    
    // ガンアイテムのコンポーネント
    const gunItem = add([
        sprite("gun"),
        pos(gunX, gunY),
        area({ scale: 0.8 }),
        anchor("center"),
        scale(0.8),
        opacity(1), // 追加: opacityコンポーネント
        "gun-item",
        {
            pulseTimer: 0, // 脈動エフェクト用タイマー
            lifeTimer: 15,  // アイテムの存在時間（15秒）
            gunMaxCooldown: GUN_COOLDOWN // クールダウンの最大値を設定
        }
    ]);
    
    // 脈動エフェクトと存在時間
    gunItem.onUpdate(() => {
        // 脈動エフェクト
        gunItem.pulseTimer += dt();
        const pulse = Math.sin(gunItem.pulseTimer * 5) * 0.1 + 1;
        gunItem.scale = vec2(0.8 * pulse, 0.8 * pulse);
        
        // 存在時間のカウントダウン
        gunItem.lifeTimer -= dt();
        if (gunItem.lifeTimer <= 0) {
            // 消滅エフェクト
            for (let i = 0; i < 10; i++) {
                add([
                    circle(rand(3, 8)),
                    pos(gunItem.pos),
                    color(200, 200, 200),
                    anchor("center"),
                    move(rand(0, 360), rand(30, 80)),
                    opacity(1),
                    lifespan(rand(0.3, 0.7)),
                    z(5)
                ]);
            }
            destroy(gunItem);
        }
        
        // 残り時間警告（点滅）
        if (gunItem.lifeTimer <= 3) {
            gunItem.opacity = Math.sin(gunItem.lifeTimer * 10) * 0.5 + 0.5;
        }
    });
    
    // プレイヤーとの衝突判定
    gunItem.onCollide("player", (player) => {
        // プレイヤーに弾薬を追加（既にガンを持っている場合）または新しく装備
        if (player.hasGun) {
            player.gunAmmo += GUN_AMMO; // 既存の弾薬に加算
        } else {
            player.hasGun = true;
            player.gunAmmo = GUN_AMMO; // 初めて取得する場合は弾薬をGUN_AMMO発に設定
            player.gunCooldown = 0;
            player.gunMaxCooldown = GUN_COOLDOWN;
            player.gunType = "normal"; // デフォルトは通常銃
        }
        
        // 装備メッセージを表示
        UI.showSpecialAttackMessage("gun");
        
        // 取得音を再生
        GameAudio.playGunSound();
        
        // 取得エフェクト
        for (let i = 0; i < 20; i++) {
            add([
                circle(rand(3, 8)),
                pos(gunItem.pos),
                color(200, 200, 200),
                anchor("center"),
                move(rand(0, 360), rand(50, 150)),
                opacity(1),
                lifespan(rand(0.3, 0.7)),
                z(5)
            ]);
        }
        
        // アイテムを消去
        destroy(gunItem);
    });
    
    return gunItem;
}

// 雷アイテムを生成する関数
function spawnLighteningItem() {
    // ランダムな位置を生成（余白を考慮）
    let lighteningX, lighteningY;
    let validPosition = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 100; // 最大試行回数
    const MIN_OBSTACLE_DISTANCE = LIGHTENING_SIZE + 50; // 障害物からの最小距離
    
    // 有効な位置を見つけるまで繰り返す
    while (!validPosition && attempts < MAX_ATTEMPTS) {
        attempts++;
        
        // ランダムな位置を生成（余白を考慮）
        lighteningX = rand(200, MAP_WIDTH - 200);
        lighteningY = rand(200, MAP_HEIGHT - 200);
        
        // 障害物との衝突チェック
        validPosition = true;
        for (const obstacle of obstacles) {
            // 外周の壁は無視
            if (!obstacle.is("obstacle")) {
                continue;
            }
            
            const distX = Math.max(
                obstacle.pos.x - lighteningX,
                0,
                lighteningX - (obstacle.pos.x + obstacle.width)
            );
            const distY = Math.max(
                obstacle.pos.y - lighteningY,
                0,
                lighteningY - (obstacle.pos.y + obstacle.height)
            );
            
            const distance = Math.sqrt(distX * distX + distY * distY);
            
            if (distance < MIN_OBSTACLE_DISTANCE) {
                validPosition = false;
                break;
            }
        }
    }
    
    // 有効な位置が見つからなかった場合はスキップ
    if (!validPosition) {
        console.log("雷アイテムの配置に失敗しました");
        return null;
    }
    
    // 雷アイテムのコンポーネント
    const lighteningItem = add([
        sprite("lightening"),
        pos(lighteningX, lighteningY),
        area({ scale: 0.8 }),
        anchor("center"),
        scale(0.8),
        opacity(1),
        "lightening-item",
        {
            pulseTimer: 0, // 脈動エフェクト用タイマー
            lifeTimer: 15,  // アイテムの存在時間（15秒）
            lighteningMaxCooldown: LIGHTENING_COOLDOWN // クールダウンの最大値を設定
        }
    ]);
    
    // 脈動エフェクトと存在時間
    lighteningItem.onUpdate(() => {
        // 脈動エフェクト
        lighteningItem.pulseTimer += dt();
        const pulse = Math.sin(lighteningItem.pulseTimer * 5) * 0.1 + 1;
        lighteningItem.scale = vec2(0.8 * pulse, 0.8 * pulse);
        
        // 存在時間のカウントダウン
        lighteningItem.lifeTimer -= dt();
        if (lighteningItem.lifeTimer <= 0) {
            // 消滅エフェクト
            for (let i = 0; i < 10; i++) {
                add([
                    circle(rand(3, 8)),
                    pos(lighteningItem.pos),
                    color(255, 255, 100),
                    anchor("center"),
                    move(rand(0, 360), rand(30, 80)),
                    opacity(1),
                    lifespan(rand(0.3, 0.7)),
                    z(5)
                ]);
            }
            destroy(lighteningItem);
        }
        
        // 残り時間警告（点滅）
        if (lighteningItem.lifeTimer <= 3) {
            lighteningItem.opacity = Math.sin(lighteningItem.lifeTimer * 10) * 0.5 + 0.5;
        }
    });
    
    // プレイヤーとの衝突判定
    lighteningItem.onCollide("player", (player) => {
        // プレイヤーに雷を装備
        player.hasLightening = true;
        player.lighteningCooldown = 0;
        
        // 装備メッセージを表示
        UI.showSpecialAttackMessage("lightening");
        
        // 取得エフェクト
        for (let i = 0; i < 20; i++) {
            add([
                circle(rand(3, 8)),
                pos(lighteningItem.pos),
                color(255, 255, 100),
                anchor("center"),
                move(rand(0, 360), rand(50, 150)),
                opacity(1),
                lifespan(rand(0.3, 0.7)),
                z(5)
            ]);
        }
        
        // アイテムを消去
        destroy(lighteningItem);
    });
    
    return lighteningItem;
}

// Kat敵を生成する関数
function spawnKat(player) {
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
    
    // Kat敵のコンポーネント
    let enemyComponents = [
        pos(enemyX, enemyY),
        area({ scale: 0.9 }),
        body(),
        anchor("center"),
        "kat-enemy",
        {
            direction: 1,  // 向き（1: 右向き、-1: 左向き）
            pulseTimer: 0, // 脈動エフェクト用タイマー
            dashTimer: rand(2, 4), // 突進時間
            hp: 50  // 敵のHP値を設定
        }
    ];
    
    // 画像の設定
    enemyComponents.unshift(sprite("kat"));
    enemyComponents.push(scale(vec2(1.2, 1.2)));
    
    // Kat敵を追加
    const katEnemy = add(enemyComponents);
    
    // special-enemies-kat.jsで定義された処理を使用
    katEnemy.onUpdate(() => {
        updateKatEnemy(katEnemy);
    });
    
    // プレイヤーとの衝突処理
    katEnemy.onCollide("player", (player) => {
        // 無敵時間中でなければダメージを受ける
        if (!player.isInvincible) {
            player.hp -= KAT_DAMAGE;
            player.isDamaged = true;
            player.isInvincible = true;
            player.invincibleTimer = DAMAGE_COOLDOWN;
            
            // HPが0以下になったらゲームオーバー
            if (player.hp <= 0) {
                showGameOver();
            }
            
            // ダメージ表示
            add([
                text(`-${KAT_DAMAGE}`, { size: 30 }),
                pos(player.pos.x, player.pos.y - 40),
                color(0, 200, 255),
                anchor("center"),
                opacity(1),
                lifespan(1),
                z(100)
            ]);
            
            // 安全なノックバック効果に変更
            safeKnockback(player, katEnemy.pos, 80);
            
            // 衝突エフェクト
            for (let i = 0; i < 15; i++) {
                add([
                    circle(rand(5, 15)),
                    pos(player.pos),
                    color(0, rand(150, 255), rand(150, 255)),
                    anchor("center"),
                    move(rand(0, 360), rand(50, 150)),
                    opacity(1),
                    lifespan(rand(0.3, 0.7)),
                    z(50)
                ]);
            }
        }
    });
    
    return katEnemy;
}

// プレイヤーとハートの衝突処理
function playerHeartCollision(player, heart) {
    // HPを回復
    player.hp = Math.min(player.hp + HEART_HEAL_AMOUNT, PLAYER_MAX_HP);
    
    // 効果音を再生（二重で再生して確実に音が聞こえるようにする）
    GameAudio.playHeartSound();
    
    // 回復エフェクト
    const healText = add([
        text(`+${HEART_HEAL_AMOUNT}`, { size: 24 }),
        pos(heart.pos),
        color(100, 255, 100),
        anchor("center"),
        lifespan(1),
        move(90, 40),
        opacity(1),
        z(100)
    ]);
    
    // 輝きエフェクト
    for (let i = 0; i < 12; i++) {
        add([
            circle(rand(5, 10)),
            pos(heart.pos),
            color(255, rand(150, 255), rand(150, 255)),
            anchor("center"),
            opacity(1),
            lifespan(0.5),
            move(rand(0, 360), rand(50, 100)),
            z(10)
        ]);
    }
    
    // ハートを削除
    destroy(heart);
}

// 弾と敵の衝突判定
onCollide("bullet", "enemy", (bullet, enemy) => {
    // 爆発エフェクト
    showExplosion(bullet.pos);
    
    // 敵にHPが設定されていない場合は初期値として設定
    if (enemy.hp === undefined) {
        enemy.hp = 50;
    }
    
    // 初期HPを記録（HPバー表示用）
    if (enemy.initialHP === undefined) {
        enemy.initialHP = enemy.hp;
    }
    
    // 敵のHPを減らす
    enemy.hp -= bullet.damage;
    
    // 音を鳴らす
    GameAudio.playGunSound();
    
    // ダメージ表示（大きく、目立つテキスト）
    add([
        text(`-${bullet.damage}`, { size: 24 }),
        pos(enemy.pos.x, enemy.pos.y - 40),
        color(50, 255, 255),
        outline(2, rgb(0, 100, 255)),
        anchor("center"),
        opacity(1),
        lifespan(0.8),
        move(0, -60),
        scale(1),
        z(100),
        {
            timer: 0
        }
    ]).onUpdate(function() {
        this.timer += dt();
        this.scale = vec2(1 + Math.sin(this.timer * 10) * 0.2, 1 + Math.sin(this.timer * 10) * 0.2);
    });
    
    // 敵がまだ生きているなら
    if (enemy.hp > 0) {
        // 一時的に敵の色を変更（ダメージエフェクト）
        const originalColor = enemy.color;
        enemy.color = rgb(255, 100, 100); // 赤っぽく変化
        
        // 振動エフェクト
        const originalPos = vec2(enemy.pos.x, enemy.pos.y);
        const shake = 5; // 振動の強さ
        
        // 複数回振動させる
        for (let i = 0; i < 5; i++) {
            wait(i * 0.05, () => {
                if (enemy.exists()) {
                    enemy.pos = vec2(
                        originalPos.x + rand(-shake, shake),
                        originalPos.y + rand(-shake, shake)
                    );
                }
            });
        }
        
        // 元に戻す
        wait(0.25, () => {
            if (enemy.exists()) {
                enemy.color = originalColor;
                enemy.pos = originalPos;
            }
        });
        
        // HPバーを表示（一時的に）
        const hpBarWidth = 40;
        const hpBarHeight = 4;
        const hpRatio = enemy.hp / enemy.initialHP; // 初期HP値で割る
        
        const hpBarBg = add([
            rect(hpBarWidth, hpBarHeight),
            pos(enemy.pos.x - hpBarWidth/2, enemy.pos.y - 30),
            color(100, 100, 100),
            opacity(0.8),
            lifespan(1.5),
            z(90)
        ]);
        
        const hpBar = add([
            rect(hpBarWidth * hpRatio, hpBarHeight),
            pos(enemy.pos.x - hpBarWidth/2, enemy.pos.y - 30),
            color(255, 50, 50),
            opacity(0.8),
            lifespan(1.5),
            z(91)
        ]);
        
        // 残りHPのパーセント表示
        const hpPercent = Math.floor(hpRatio * 100);
        const hpText = add([
            text(`${hpPercent}%`, { size: 12 }),
            pos(enemy.pos.x, enemy.pos.y - 30 - 12),
            color(255, 255, 255),
            outline(1, rgb(0, 0, 0)),
            anchor("center"),
            opacity(0.9),
            lifespan(1.5),
            z(92)
        ]);
    } else {
        // 敵を破壊
        destroy(enemy);
        
        // 敵破壊エフェクト（より派手に）
        for (let i = 0; i < 25; i++) {
            add([
                circle(rand(5, 15)),
                pos(enemy.pos),
                color(255, rand(50, 200), rand(0, 150)),
                anchor("center"),
                move(rand(0, 360), rand(50, 200)),
                opacity(rand(0.6, 1)),
                lifespan(rand(0.5, 1.2)),
                z(10)
            ]);
        }
        
        // 破壊メッセージ
        add([
            text("DESTROYED!", { size: 20 }),
            pos(enemy.pos.x, enemy.pos.y),
            color(255, 100, 50),
            outline(2, rgb(150, 50, 0)),
            anchor("center"),
            opacity(1),
            lifespan(1),
            move(0, -40),
            z(100)
        ]);
    }
    
    // 弾を破壊
    destroy(bullet);
});

// 弾と壁の衝突判定
onCollide("bullet", "wall", (bullet, wall) => {
    // 爆発エフェクトを表示（kaboom.pngを使用）
    showKaboomExplosion(bullet.pos);
    
    // 音を鳴らす
    GameAudio.playGunSound();
    
    // 弾を破壊
    destroy(bullet);
});

// 弾と障害物の衝突判定
onCollide("bullet", "obstacle", (bullet, obstacle) => {
    // 爆発エフェクトを表示（kaboom.pngを使用）
    showKaboomExplosion(bullet.pos);
    
    // 音を鳴らす
    GameAudio.playGunSound();
    
    // 弾を破壊
    destroy(bullet);
});

// 敵の弾と壁の衝突判定
onCollide("enemy-bullet", "wall", (bullet, wall) => {
    // 爆発エフェクトを表示（kaboom.pngを使用）
    showKaboomExplosion(bullet.pos);
    
    // 音を鳴らす
    GameAudio.playGunSound();
    
    // 弾を破壊
    destroy(bullet);
});

// 敵の弾と障害物の衝突判定
onCollide("enemy-bullet", "obstacle", (bullet, obstacle) => {
    // 爆発エフェクトを表示（kaboom.pngを使用）
    showKaboomExplosion(bullet.pos);
    
    // 音を鳴らす
    GameAudio.playGunSound();
    
    // 弾を破壊
    destroy(bullet);
});

// 弾と特殊な敵タイプの衝突判定
const specialEnemyTypes = ["super-enemy", "kat-enemy", "marroc-enemy", "gigagantrum-enemy", "goldfly-enemy"];

specialEnemyTypes.forEach(enemyType => {
    onCollide("bullet", enemyType, (bullet, enemy) => {
        // 爆発エフェクト
        showExplosion(bullet.pos);
        
        // 敵にHPが設定されていない場合は初期値として設定
        if (enemy.hp === undefined) {
            enemy.hp = 100;
        }
        
        // 初期HPを記録（HPバー表示用）
        if (enemy.initialHP === undefined) {
            enemy.initialHP = enemy.hp;
        }
        
        // 敵のHPを減らす
        enemy.hp -= bullet.damage;
        
        // 音を鳴らす
        GameAudio.playGunSound();
        
        // ダメージ表示（大きく、目立つテキスト）
        add([
            text(`-${bullet.damage}`, { size: 28 }),
            pos(enemy.pos.x, enemy.pos.y - 50),
            color(50, 255, 255),
            outline(2, rgb(0, 100, 255)),
            anchor("center"),
            opacity(1),
            lifespan(1),
            move(0, -70),
            scale(1),
            z(100),
            {
                timer: 0
            }
        ]).onUpdate(function() {
            this.timer += dt();
            this.scale = vec2(1 + Math.sin(this.timer * 10) * 0.2, 1 + Math.sin(this.timer * 10) * 0.2);
        });
        
        // 敵がまだ生きているなら
        if (enemy.hp > 0) {
            // 一時的に敵の色を変更（ダメージエフェクト）
            const originalColor = enemy.color;
            enemy.color = rgb(255, 100, 100); // 赤っぽく変化
            
            // 振動エフェクト
            const originalPos = vec2(enemy.pos.x, enemy.pos.y);
            const shake = 8; // 振動の強さ（特殊敵はより強く）
            
            // 複数回振動させる
            for (let i = 0; i < 5; i++) {
                wait(i * 0.05, () => {
                    if (enemy.exists()) {
                        enemy.pos = vec2(
                            originalPos.x + rand(-shake, shake),
                            originalPos.y + rand(-shake, shake)
                        );
                    }
                });
            }
            
            // 元に戻す
            wait(0.25, () => {
                if (enemy.exists()) {
                    enemy.color = originalColor;
                    enemy.pos = originalPos;
                }
            });
            
            // HPバーを表示（一時的に）
            const hpBarWidth = 60; // 特殊敵は大きいのでバーも大きく
            const hpBarHeight = 6;
            const hpRatio = enemy.hp / enemy.initialHP; 
            
            const hpBarBg = add([
                rect(hpBarWidth, hpBarHeight),
                pos(enemy.pos.x - hpBarWidth/2, enemy.pos.y - 40),
                color(100, 100, 100),
                opacity(0.8),
                lifespan(1.5),
                z(90)
            ]);
            
            const hpBar = add([
                rect(hpBarWidth * hpRatio, hpBarHeight),
                pos(enemy.pos.x - hpBarWidth/2, enemy.pos.y - 40),
                color(255, 50, 50),
                opacity(0.8),
                lifespan(1.5),
                z(91)
            ]);
            
            // 残りHPのパーセント表示
            const hpPercent = Math.floor(hpRatio * 100);
            const hpText = add([
                text(`${hpPercent}%`, { size: 12 }),
                pos(enemy.pos.x, enemy.pos.y - 40 - 15),
                color(255, 255, 255),
                outline(1, rgb(0, 0, 0)),
                anchor("center"),
                opacity(0.9),
                lifespan(1.5),
                z(92)
            ]);
        } else {
            // 敵を破壊
            destroy(enemy);
            
            // 敵破壊エフェクト（特殊敵はより派手に）
            for (let i = 0; i < 35; i++) {
                add([
                    circle(rand(5, 20)),
                    pos(enemy.pos),
                    color(rand(150, 255), rand(100, 255), rand(0, 255)),
                    anchor("center"),
                    move(rand(0, 360), rand(60, 250)),
                    opacity(rand(0.7, 1)),
                    lifespan(rand(0.6, 1.5)),
                    z(10)
                ]);
            }
            
            // 破壊メッセージ（特殊敵はより目立つように）
            add([
                text("BOSS DEFEATED!", { size: 28 }),
                pos(enemy.pos.x, enemy.pos.y),
                color(255, 200, 50),
                outline(3, rgb(200, 100, 0)),
                anchor("center"),
                opacity(1),
                lifespan(1.5),
                move(0, -50),
                scale(1),
                z(100),
                {
                    timer: 0
                }
            ]).onUpdate(function() {
                this.timer += dt();
                this.scale = vec2(1 + Math.sin(this.timer * 8) * 0.3, 1 + Math.sin(this.timer * 8) * 0.3);
            });
        }
        
        // 弾を破壊
        destroy(bullet);
    });
});

// 弾とランプ敵の衝突判定
onCollide("bullet", "lamp", (bullet, lamp) => {
    // 爆発エフェクト
    showExplosion(bullet.pos);
    
    // 敵にHPが設定されていない場合は初期値として設定
    if (lamp.hp === undefined) {
        lamp.hp = LAMP_HP;
    }
    
    // 初期HPを記録（HPバー表示用）
    if (lamp.initialHP === undefined) {
        lamp.initialHP = lamp.hp;
    }
    
    // 敵のHPを減らす
    lamp.hp -= bullet.damage;
    
    // 音を鳴らす
    GameAudio.playGunSound();
    
    // ダメージ表示（大きく、目立つテキスト）
    add([
        text(`-${bullet.damage}`, { size: 28 }),
        pos(lamp.pos.x, lamp.pos.y - 50),
        color(50, 255, 255),
        outline(2, rgb(0, 100, 255)),
        anchor("center"),
        opacity(1),
        lifespan(1),
        move(0, -70),
        scale(1),
        z(100),
        {
            timer: 0
        }
    ]).onUpdate(function() {
        this.timer += dt();
        this.scale = vec2(1 + Math.sin(this.timer * 10) * 0.2, 1 + Math.sin(this.timer * 10) * 0.2);
    });
    
    // 敵がまだ生きているなら
    if (lamp.hp > 0) {
        // 一時的に敵の色を変更（ダメージエフェクト）
        const originalColor = lamp.color;
        lamp.color = rgb(255, 100, 100); // 赤っぽく変化
        
        // 振動エフェクト
        const originalPos = vec2(lamp.pos.x, lamp.pos.y);
        const shake = 8; // 振動の強さ
        
        // 複数回振動させる
        for (let i = 0; i < 5; i++) {
            wait(i * 0.05, () => {
                if (lamp.exists()) {
                    lamp.pos = vec2(
                        originalPos.x + rand(-shake, shake),
                        originalPos.y + rand(-shake, shake)
                    );
                }
            });
        }
        
        // 元に戻す
        wait(0.25, () => {
            if (lamp.exists()) {
                lamp.color = originalColor;
                lamp.pos = originalPos;
            }
        });
        
        // HPバーを表示（一時的に）
        const hpBarWidth = 60;
        const hpBarHeight = 6;
        const hpRatio = lamp.hp / lamp.initialHP; 
        
        const hpBarBg = add([
            rect(hpBarWidth, hpBarHeight),
            pos(lamp.pos.x - hpBarWidth/2, lamp.pos.y - 40),
            color(100, 100, 100),
            opacity(0.8),
            lifespan(1.5),
            z(90)
        ]);
        
        const hpBar = add([
            rect(hpBarWidth * hpRatio, hpBarHeight),
            pos(lamp.pos.x - hpBarWidth/2, lamp.pos.y - 40),
            color(255, 50, 50),
            opacity(0.8),
            lifespan(1.5),
            z(91)
        ]);
        
        // 残りHPのパーセント表示
        const hpPercent = Math.floor(hpRatio * 100);
        const hpText = add([
            text(`${hpPercent}%`, { size: 12 }),
            pos(lamp.pos.x, lamp.pos.y - 40 - 15),
            color(255, 255, 255),
            outline(1, rgb(0, 0, 0)),
            anchor("center"),
            opacity(0.9),
            lifespan(1.5),
            z(92)
        ]);
    } else {
        // 敵を破壊
        destroy(lamp);
        
        // 敵破壊エフェクト
        for (let i = 0; i < 35; i++) {
            add([
                circle(rand(5, 20)),
                pos(lamp.pos),
                color(rand(220, 255), rand(180, 255), rand(0, 150)),
                anchor("center"),
                move(rand(0, 360), rand(60, 250)),
                opacity(rand(0.7, 1)),
                lifespan(rand(0.6, 1.5)),
                z(10)
            ]);
        }
        
        // 破壊メッセージ
        add([
            text("LAMP DEFEATED!", { size: 28 }),
            pos(lamp.pos.x, lamp.pos.y),
            color(255, 200, 50),
            outline(3, rgb(200, 100, 0)),
            anchor("center"),
            opacity(1),
            lifespan(1.5),
            move(0, -50),
            scale(1),
            z(100),
            {
                timer: 0
            }
        ]).onUpdate(function() {
            this.timer += dt();
            this.scale = vec2(1 + Math.sin(this.timer * 8) * 0.3, 1 + Math.sin(this.timer * 8) * 0.3);
        });
    }
    
    // 弾を破壊
    destroy(bullet);
});

// 弾と最終ボスの衝突判定
onCollide("bullet", "final-boss", (bullet, finalBoss) => {
    // 爆発エフェクト
    showExplosion(bullet.pos);
    
    // 敵にHPが設定されていない場合は初期値として設定
    if (finalBoss.hp === undefined) {
        finalBoss.hp = FINAL_BOSS_HP;
    }
    
    // 初期HPを記録（HPバー表示用）
    if (finalBoss.initialHP === undefined) {
        finalBoss.initialHP = finalBoss.hp;
    }
    
    // 敵のHPを減らす
    finalBoss.hp -= bullet.damage;
    
    // 音を鳴らす
    GameAudio.playGunSound();
    
    // ダメージ表示（大きく、目立つテキスト）
    add([
        text(`-${bullet.damage}`, { size: 32 }),
        pos(finalBoss.pos.x, finalBoss.pos.y - 60),
        color(255, 100, 50),
        outline(3, rgb(200, 0, 0)),
        anchor("center"),
        opacity(1),
        lifespan(1),
        move(0, -80),
        scale(1),
        z(100),
        {
            timer: 0
        }
    ]).onUpdate(function() {
        this.timer += dt();
        this.scale = vec2(1 + Math.sin(this.timer * 10) * 0.3, 1 + Math.sin(this.timer * 10) * 0.3);
    });
    
    // 敵がまだ生きているなら
    if (finalBoss.hp > 0) {
        // 一時的に敵の色を変更（ダメージエフェクト）
        if (!window.dinoImageFailed) {
            finalBoss.color = rgb(255, 100, 100);
            wait(0.25, () => {
                if (finalBoss.exists()) {
                    finalBoss.color = rgb(255, 255, 255);
                }
            });
        } else {
            const originalColor = finalBoss.color;
            finalBoss.color = rgb(255, 50, 0);
            
            // 元に戻す
            wait(0.25, () => {
                if (finalBoss.exists()) {
                    finalBoss.color = originalColor;
                }
            });
        }
        
        // 振動エフェクト
        const originalPos = vec2(finalBoss.pos.x, finalBoss.pos.y);
        const shake = 12; // 振動の強さ
        
        // 複数回振動させる
        for (let i = 0; i < 5; i++) {
            wait(i * 0.05, () => {
                if (finalBoss.exists()) {
                    finalBoss.pos = vec2(
                        originalPos.x + rand(-shake, shake),
                        originalPos.y + rand(-shake, shake)
                    );
                }
            });
        }
        
        // 元に戻す
        wait(0.25, () => {
            if (finalBoss.exists()) {
                finalBoss.pos = originalPos;
            }
        });
        
        // HPバーを表示（一時的に）
        const hpBarWidth = 80;
        const hpBarHeight = 8;
        const hpRatio = finalBoss.hp / finalBoss.initialHP; 
        
        const hpBarBg = add([
            rect(hpBarWidth, hpBarHeight),
            pos(finalBoss.pos.x - hpBarWidth/2, finalBoss.pos.y - 50),
            color(100, 100, 100),
            opacity(0.8),
            lifespan(2),
            z(90)
        ]);
        
        const hpBar = add([
            rect(hpBarWidth * hpRatio, hpBarHeight),
            pos(finalBoss.pos.x - hpBarWidth/2, finalBoss.pos.y - 50),
            color(255, 50, 50),
            opacity(0.8),
            lifespan(2),
            z(91)
        ]);
        
        // 残りHPのパーセント表示
        const hpPercent = Math.floor(hpRatio * 100);
        const hpText = add([
            text(`${hpPercent}%`, { size: 14 }),
            pos(finalBoss.pos.x, finalBoss.pos.y - 50 - 18),
            color(255, 255, 255),
            outline(2, rgb(0, 0, 0)),
            anchor("center"),
            opacity(0.9),
            lifespan(2),
            z(92)
        ]);
    } else {
        // 敵を破壊
        destroy(finalBoss);
        
        // 破壊エフェクト（特大爆発）
        for (let i = 0; i < 80; i++) {
            add([
                circle(rand(8, 30)),
                pos(finalBoss.pos),
                color(rand(200, 255), rand(100, 200), rand(0, 100)),
                anchor("center"),
                move(rand(0, 360), rand(60, 300)),
                opacity(rand(0.7, 1)),
                lifespan(rand(1, 2.5)),
                z(10)
            ]);
        }
        
        // 破壊メッセージ（特殊敵はより目立つように）
        add([
            text("BOSS DEFEATED!", { size: 35 }),
            pos(finalBoss.pos.x, finalBoss.pos.y),
            color(255, 220, 50),
            outline(4, rgb(200, 100, 0)),
            anchor("center"),
            opacity(1),
            lifespan(2),
            move(0, -60),
            scale(1),
            z(100),
            {
                timer: 0
            }
        ]).onUpdate(function() {
            this.timer += dt();
            this.scale = vec2(1 + Math.sin(this.timer * 8) * 0.3, 1 + Math.sin(this.timer * 8) * 0.3);
        });
        
        // 残りのボスの数をチェック
        const remainingBosses = get("final-boss").length;
        
        // 全てのボスを倒したらゲームクリア
        if (remainingBosses <= 1) { // 現在のボスが破壊されるため、残り1体以下ならクリア
                                    // 注: 現在破壊中のボスも含まれるため、1を使用している
            // ゲームクリアフラグを立てる
            isGameCleared = true;
            
            // 最終ボス全滅のメッセージ
            add([
                text("ALL FINAL BOSSES DEFEATED!", { size: 40 }),
                pos(center().x, center().y - 100),
                color(255, 255, 0),
                outline(4, rgb(200, 50, 0)),
                anchor("center"),
                fixed(),
                opacity(1),
                lifespan(3),
                z(100),
                {
                    timer: 0
                }
            ]).onUpdate(function() {
                this.timer += dt();
                this.scale = vec2(1 + Math.sin(this.timer * 5) * 0.2, 1 + Math.sin(this.timer * 5) * 0.2);
            });
            
            // ゲームクリア表示
            showGameCleared();
        }
    }
    
    // 弾を破壊
    destroy(bullet);
});

// ゲームクリア表示
function showGameCleared() {
    // クリア効果音
    GameAudio.playExplodeSound();
    
    // 画面全体のフラッシュエフェクト
    const flash = add([
        rect(width(), height()),
        pos(0, 0),
        color(255, 255, 200),
        opacity(0.8),
        fixed(),
        z(90)
    ]);
    
    // フラッシュを徐々に消す
    tween(
        flash.opacity,
        0,
        1,
        (val) => flash.opacity = val,
        easings.easeOutQuint
    );
    
    // 少し待ってからクリア画面を表示
    wait(1, () => {
        // UI.jsのshowGameClear関数を呼び出す
        UI.showGameClear(SURVIVAL_TIME);
    });
}
