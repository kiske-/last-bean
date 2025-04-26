// 壁の配置
function createWalls() {
    // 外周の壁
    // 上の壁
    add([
        rect(MAP_WIDTH, 20),
        pos(0, 0),
        color(70, 70, 120),
        area(),
        body({ isStatic: true }),
        "wall"
    ]);
    
    // 下の壁
    add([
        rect(MAP_WIDTH, 20),
        pos(0, MAP_HEIGHT - 20),
        color(70, 70, 120),
        area(),
        body({ isStatic: true }),
        "wall"
    ]);
    
    // 左の壁
    add([
        rect(20, MAP_HEIGHT),
        pos(0, 0),
        color(70, 70, 120),
        area(),
        body({ isStatic: true }),
        "wall"
    ]);
    
    // 右の壁
    add([
        rect(20, MAP_HEIGHT),
        pos(MAP_WIDTH - 20, 0),
        color(70, 70, 120),
        area(),
        body({ isStatic: true }),
        "wall"
    ]);
    
    // マップ内の障害物（いくつかランダムに配置）
    const numObstacles = 20;
    const OBSTACLE_SIZE = 80; // 障害物のサイズを統一
    const MIN_OBSTACLE_DISTANCE = OBSTACLE_SIZE * 1.5; // 障害物間の最小距離
    
    // 障害物の位置を保存する配列
    const obstaclePositions = [];
    
    for (let i = 0; i < numObstacles; i++) {
        let obstacleX, obstacleY;
        let validPosition = false;
        let attempts = 0;
        const MAX_ATTEMPTS = 100; // 最大試行回数
        
        // 有効な位置を見つけるまで繰り返す
        while (!validPosition && attempts < MAX_ATTEMPTS) {
            attempts++;
            
            // ランダムな位置を生成（余白を考慮）
            obstacleX = rand(100, MAP_WIDTH - 100 - OBSTACLE_SIZE);
            obstacleY = rand(100, MAP_HEIGHT - 100 - OBSTACLE_SIZE);
            
            // 既存の障害物との距離をチェック
            validPosition = true;
            for (const pos of obstaclePositions) {
                const distance = Math.sqrt(
                    Math.pow(obstacleX - pos.x, 2) + 
                    Math.pow(obstacleY - pos.y, 2)
                );
                
                if (distance < MIN_OBSTACLE_DISTANCE) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        // 位置が見つかったか、最大試行回数に達した場合
        if (!validPosition) {
            // 最大試行回数に達した場合、この障害物はスキップする
            console.log(`障害物 ${i} の配置に失敗しました。`);
            continue;
        }
        
        // 有効な位置を保存
        obstaclePositions.push({ x: obstacleX, y: obstacleY });
        
        let obstacleComponents = [
            pos(obstacleX, obstacleY),
            area(),
            body({ isStatic: true }),
            z(3),
            "wall",
            "obstacle",  // 障害物を識別するためのタグを追加
            "static-obstacle", // 静的な障害物としてタグ付け（後で動的に変更）
            {
                isMoving: false,     // 動いているかどうか
                moveSpeed: 0,        // 移動速度
                activated: false,    // アクティブになったかどうか
                originalPos: vec2(obstacleX, obstacleY) // 元の位置を記録
            }
        ];
        
        // 画像があるかどうかで表示を変える
        if (!window.steelImageFailed) {
            obstacleComponents.unshift(sprite("steel"));
            obstacleComponents.push(scale(vec2(OBSTACLE_SIZE/100, OBSTACLE_SIZE/100)));
        } else {
            obstacleComponents.unshift(rect(OBSTACLE_SIZE, OBSTACLE_SIZE));
            obstacleComponents.push(color(100, 100, 170));
            obstacleComponents.push(outline(2, rgb(150, 150, 220)));
        }
        
        const obstacle = add(obstacleComponents);
        
        // 障害物を配列に追加
        obstacles.push(obstacle);
    }
}

// 敵キャラクターを生成する関数
function createEnemies() {
    const enemies = [];
    
    for (let i = 0; i < ENEMY_COUNT; i++) {
        // ランダムな位置（プレイヤーから少し離れた位置）
        let enemyX, enemyY;
        let tooClose = true;
        
        // プレイヤーの初期位置から一定距離離れた位置に配置
        while (tooClose) {
            enemyX = rand(100, MAP_WIDTH - 100);
            enemyY = rand(100, MAP_HEIGHT - 100);
            
            // プレイヤーの初期位置からの距離を計算
            const distToPlayer = Math.sqrt(
                Math.pow(enemyX - MAP_WIDTH/2, 2) + 
                Math.pow(enemyY - MAP_HEIGHT/2, 2)
            );
            
            // 一定距離（例：300ピクセル）以上離れていれば配置OK
            if (distToPlayer > 300) {
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
        
        enemies.push(enemy);
    }
    
    return enemies;
}

// ハートアイテムを生成する関数
function createHearts() {
    const hearts = [];
    
    // ハートアイテムの最小間隔
    const MIN_DISTANCE = HEART_SIZE * 3;
    const MIN_OBSTACLE_DISTANCE = HEART_SIZE + 50; // 障害物からの最小距離
    
    for (let i = 0; i < HEART_COUNT; i++) {
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
            
            // プレイヤーの初期位置からの距離を計算
            const distToPlayer = Math.sqrt(
                Math.pow(heartX - MAP_WIDTH/2, 2) + 
                Math.pow(heartY - MAP_HEIGHT/2, 2)
            );
            
            // プレイヤーの初期位置から離す
            if (distToPlayer < 200) {
                continue;
            }
            
            // 既存のハートや障害物との距離をチェック
            validPosition = true;
            
            // 他のハートとの距離チェック
            for (const heart of hearts) {
                const distance = Math.sqrt(
                    Math.pow(heartX - heart.pos.x, 2) + 
                    Math.pow(heartY - heart.pos.y, 2)
                );
                
                if (distance < MIN_DISTANCE) {
                    validPosition = false;
                    break;
                }
            }
            
            // 障害物との衝突チェック
            if (validPosition) {
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
                    
                    if (distance < MIN_OBSTACLE_DISTANCE) {
                        validPosition = false;
                        break;
                    }
                }
            }
        }
        
        // 有効な位置が見つからなかった場合はスキップ
        if (!validPosition) {
            console.log(`ハート ${i} の配置に失敗しました`);
            continue;
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
        
        // ハートを上下に浮かせるアニメーション
        const heart = add(heartComponents);
        heart.onUpdate(() => {
            // ゲームオーバーまたはクリア時はアニメーションしない
            if (isGameOver || isGameCleared) return;
            
            // 上下に浮かぶようなアニメーション
            heart.pos.y += Math.sin(time() * 3) * 0.5;
        });
        
        hearts.push(heart);
    }
    
    return hearts;
}

    // プレイヤーの作成
function createPlayer() {
    let playerComponents = [
        pos(MAP_WIDTH / 2, MAP_HEIGHT / 2), // マップの中央に配置
        area({ scale: 1.1 }), // 衝突判定を少し大きくして検出を容易にする
        body(),
        anchor("center"), // 中心を基準点に設定
        "player",
        {
            hp: PLAYER_MAX_HP,         // 現在のHP
            isDamaged: false,          // ダメージ状態かどうか
            damageCooldown: 0,         // ダメージクールダウン
            isInvincible: false,       // 無敵状態かどうか
            invincibleTimer: 0,        // 無敵時間タイマー
            flash: false,              // 点滅エフェクト用
            direction: 1,              // 向き（1: 右向き、-1: 左向き）
            hasGun: false,             // ガンを持っているかどうか
            gunCooldown: 0,            // ガンのクールダウン
            gunAmmo: 0,                // ガンの弾薬数（初期は0）
            hasLightening: false,      // 雷を持っているかどうか
            lighteningCooldown: 0,     // 雷のクールダウン
            lighteningDuration: 0      // 雷の効果持続時間
        }
    ];
    
    // 画像が読み込めたかどうかで表示を変える
    if (!window.playerImageFailed) {
        playerComponents.unshift(sprite("player-bean"));
        playerComponents.push(scale(vec2(1, 1))); // ベクトルとして指定
    } else {
        playerComponents.unshift(rect(PLAYER_SIZE, PLAYER_SIZE));
        playerComponents.push(color(50, 255, 100)); // 明るい緑色
        playerComponents.push(outline(3, rgb(30, 200, 80))); // 輪郭線でプレイヤーをより目立たせる
    }
    
    const player = add(playerComponents);
    
    // プレイヤーの衝突設定
    player.onCollide("wall", () => {
        // 壁と衝突したときの効果（必要に応じて）
        // 例：サウンドを鳴らしたり、特定のアニメーションをしたりなど
    });
    
    // 敵との衝突判定
    player.onCollide("enemy", (enemy) => {
        // 無敵時間中でなければダメージを受ける
        if (!player.isInvincible) {
            player.hp -= ENEMY_DAMAGE;
            player.isDamaged = true;
            player.isInvincible = true;
            player.invincibleTimer = DAMAGE_COOLDOWN;
            
            // HPが0以下になったらゲームオーバー
            if (player.hp <= 0) {
                showGameOver();
            }
            
            // ダメージ表示
            add([
                text(`-${ENEMY_DAMAGE}`, { size: 20 }),
                pos(player.pos.x, player.pos.y - 30),
                color(255, 50, 50),
                anchor("center"),
                opacity(1),
                lifespan(0.5),
                z(100)
            ]);
        }
    });
        
    // 敵の弾との衝突判定
    player.onCollide("enemy-bullet", (bullet) => {
        // 無敵時間中でなければダメージを受ける
        if (!player.isInvincible) {
            player.hp -= BULLET_DAMAGE;
            player.isDamaged = true;
            player.isInvincible = true;
            player.invincibleTimer = DAMAGE_COOLDOWN;
            
            // HPが0以下になったらゲームオーバー
            if (player.hp <= 0) {
                showGameOver();
            }
            
            // ダメージ表示
            add([
                text(`-${BULLET_DAMAGE}`, { size: 20 }),
                pos(player.pos.x, player.pos.y - 30),
                color(255, 80, 80),
                anchor("center"),
                opacity(1),
                lifespan(0.5),
                z(100)
            ]);
            
            // 弾を消滅させる
            destroy(bullet);
            
            // 爆発エフェクトを表示
            showKaboomExplosion(player.pos);
        } else {
            // 無敵中も弾は消える
            destroy(bullet);
        }
    });
    
    // ハートとの衝突判定
    player.onCollide("heart", (heart) => {
        // playerHeartCollision関数を呼び出す（重複を避けるため）
        playerHeartCollision(player, heart);
    });
    
    // カメラをプレイヤーに追従させる
    player.onUpdate(() => {
        // カメラの位置をプレイヤーに合わせる（プレイヤーを中央に表示）
        camPos(player.pos);
        
        // 無敵時間のカウントダウン
        if (player.isInvincible) {
            player.invincibleTimer -= dt();
            
            // 点滅エフェクト
            player.flash = !player.flash;
            player.opacity = player.flash ? 0.5 : 1;
            
            // 無敵時間が終了したら
            if (player.invincibleTimer <= 0) {
                player.isInvincible = false;
                player.opacity = 1;
            }
        }
        
        // 銃を持っている場合の処理
        if (player.hasGun && player.gunCooldown <= 0) {
            // 最も近い敵を見つける
            let closestEnemy = null;
            let closestDistance = Infinity;
            const enemyTags = ["enemy", "super-enemy", "kat-enemy", "marroc-enemy", "gigagantrum-enemy", "goldfly-enemy", "lamp", "lamp-enemy"];
            
            enemyTags.forEach(tag => {
                const enemies = get(tag);
                enemies.forEach(enemy => {
                    const distance = player.pos.dist(enemy.pos);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestEnemy = enemy;
                    }
                });
            });
            
            // 近くに敵がいて、一定距離内なら弾を発射
            const FIRE_RANGE = 300; // 発射範囲（ピクセル）
            if (closestEnemy && closestDistance < FIRE_RANGE) {
                // 敵の方向へ向かうベクトルを計算
                const direction = closestEnemy.pos.sub(player.pos).unit();
                
                // プレイヤーの向きを更新
                player.direction = direction.x > 0 ? 1 : -1;
                if (!window.playerImageFailed) {
                    player.scale = vec2(player.direction, 1);
                }
                
                // 弾を発射
                fireGunBullet(player, direction);
            }
        } else if (player.gunCooldown > 0) {
            // ガンのクールダウンを更新
            player.gunCooldown -= dt();
        }
        
        // 雷を持っている場合の処理
        if (player.hasLightening) {
            // 雷の効果を開始
            if (player.lighteningDuration <= 0) {
                // 雷の効果持続時間を設定
                player.lighteningDuration = LIGHTENING_DURATION;
                
                // 雷の攻撃範囲内の敵を取得
                const enemyTags = ["enemy", "super-enemy", "kat-enemy", "marroc-enemy", "gigagantrum-enemy", "goldfly-enemy", "lamp", "lamp-enemy"];
                let affectedEnemies = [];
                
                enemyTags.forEach(tag => {
                    const enemies = get(tag);
                    enemies.forEach(enemy => {
                        const distance = player.pos.dist(enemy.pos);
                        if (distance < LIGHTENING_RANGE) {
                            affectedEnemies.push(enemy);
                        }
                    });
                });
                
                // 雷の攻撃エフェクトを表示
                for (let i = 0; i < 30; i++) {
                    add([
                        rect(rand(5, 15), rand(20, 50)),
                        pos(player.pos),
                        color(255, 255, rand(100, 255)),
                        anchor("center"),
                        rotate(rand(0, 360)),
                        move(rand(0, 360), rand(100, 300)),
                        opacity(1),
                        lifespan(rand(0.3, 0.8)),
                        z(10)
                    ]);
                }
                
                // 雷の中心エフェクト
                add([
                    circle(LIGHTENING_RANGE),
                    pos(player.pos),
                    color(255, 255, 100),
                    opacity(0.2),
                    anchor("center"),
                    lifespan(0.5),
                    scale(0.1),
                    z(5),
                    {
                        timer: 0
                    }
                ]).onUpdate(function() {
                    this.timer += dt() * 3;
                    this.scale = vec2(this.scale.x + 0.2, this.scale.y + 0.2);
                    this.opacity -= dt() * 0.4;
                });
                
                // 敵にダメージを与える
                affectedEnemies.forEach(enemy => {
                    // 敵にHPが設定されていない場合は初期値として設定
                    if (enemy.hp === undefined) {
                        enemy.hp = 100;
                    }
                    
                    // 初期HPを記録（HPバー表示用）
                    if (enemy.initialHP === undefined) {
                        enemy.initialHP = enemy.hp;
                    }
                    
                    // 敵のHPを減らす
                    enemy.hp -= LIGHTENING_DAMAGE;
                    
                    // ダメージ表示
                    add([
                        text(`-${LIGHTENING_DAMAGE}`, { size: 28 }),
                        pos(enemy.pos.x, enemy.pos.y - 50),
                        color(255, 255, 0),
                        outline(2, rgb(200, 200, 0)),
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
                    
                    // 敵と雷をつなぐエフェクト
                    for (let i = 0; i < 3; i++) {
                        add([
                            rect(5, player.pos.dist(enemy.pos)),
                            pos(player.pos),
                            color(255, 255, 100),
                            anchor("center"),
                            rotate(player.pos.angle(enemy.pos) + 90),
                            opacity(rand(0.3, 0.7)),
                            lifespan(rand(0.2, 0.5)),
                            z(5)
                        ]);
                    }
                    
                    // 敵がまだ生きているなら
                    if (enemy.hp > 0) {
                        // 一時的に敵の色を変更（ダメージエフェクト）
                        const originalColor = enemy.color;
                        enemy.color = rgb(255, 255, 100); // 黄色く変化
                        
                        // 振動エフェクト
                        const originalPos = vec2(enemy.pos.x, enemy.pos.y);
                        const shake = 10; // 振動の強さ
                        
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
                    } else {
                        // 敵を破壊
                        destroy(enemy);
                        
                        // 敵破壊エフェクト
                        for (let i = 0; i < 25; i++) {
                            add([
                                circle(rand(5, 15)),
                                pos(enemy.pos),
                                color(255, 255, rand(0, 150)),
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
                            color(255, 255, 50),
                            outline(2, rgb(200, 200, 0)),
                            anchor("center"),
                            opacity(1),
                            lifespan(1),
                            move(0, -40),
                            z(100)
                        ]);
                    }
                });
                
                // 雷アイテムを使い切る
                player.hasLightening = false;
            } else {
                // 雷の効果持続時間を更新
                player.lighteningDuration -= dt();
                
                // 雷の効果中は周囲に小さなエフェクトを表示
                if (rand() < 0.3) {
                    add([
                        rect(rand(2, 5), rand(10, 20)),
                        pos(player.pos.x + rand(-30, 30), player.pos.y + rand(-30, 30)),
                        color(255, 255, rand(100, 255)),
                        anchor("center"),
                        rotate(rand(0, 360)),
                        move(rand(0, 360), rand(50, 150)),
                        opacity(1),
                        lifespan(rand(0.1, 0.3)),
                        z(5)
                    ]);
                }
            }
        }
    });
    
    return player;
}
