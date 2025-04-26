// 敵の弾を発射する関数
function fireEnemyBullet(from, to) {
    // 発射方向を計算
    const direction = to.sub(from).unit();
    
    // 弾のサイズ
    const bulletSize = 12;
    
    // 弾を作成
    const bullet = add([
        circle(bulletSize),
        pos(from.x, from.y),
        color(255, 100, 50),
        outline(2, rgb(255, 50, 0)),
        area({ scale: 0.7 }),
        anchor("center"),
        move(direction, BULLET_SPEED),
        opacity(1),
        lifespan(4), // 4秒後に消滅
        "enemy-bullet", // タグを付ける
        {
            distanceTraveled: 0,
            originalDirection: direction,
            originalSpeed: BULLET_SPEED
        }
    ]);
    
    // 弾の更新処理
    bullet.onUpdate(() => {
        // 移動距離を追跡
        bullet.distanceTraveled += bullet.originalSpeed * dt();
        
        // マップの境界に達したら爆発して消滅
        const margin = 20; // 壁の厚さを考慮したマージン
        if (
            bullet.pos.x <= margin ||
            bullet.pos.x >= MAP_WIDTH - margin ||
            bullet.pos.y <= margin ||
            bullet.pos.y >= MAP_HEIGHT - margin
        ) {
            showKaboomExplosion(bullet.pos);
            destroy(bullet);
            return;
        }
        
        // 壁との衝突を確認
        if (bullet.distanceTraveled > 10) {  // 初期位置から少し離れてから判定開始
            // 壁との衝突をチェック
            const walls = get("wall");
            for (const wall of walls) {
                if (bullet.isColliding(wall)) {
                    showKaboomExplosion(bullet.pos);
                    GameAudio.playGunSound(); // 爆発音を再生
                    destroy(bullet);
                    return;
                }
            }
            
            // 障害物との衝突をチェック
            const obstacles = get("obstacle");
            for (const obstacle of obstacles) {
                const dist = obstacle.pos.dist(bullet.pos);
                if (dist < obstacle.width / 2 + 8) {  // 障害物の半径 + 弾の半径
                    showKaboomExplosion(bullet.pos);
                    GameAudio.playGunSound(); // 爆発音を再生
                    destroy(bullet);
                    return;
                }
            }
        }
        
        // 一定距離を超えたら消滅
        if (bullet.distanceTraveled > MAX_BULLET_DISTANCE) {
            showKaboomExplosion(bullet.pos);
            destroy(bullet);
        }
    });
    
    return bullet;
}

// 爆発エフェクトを表示する関数
function showExplosion(position) {
    // 爆発エフェクト
    for (let i = 0; i < 12; i++) {
        add([
            circle(rand(2, 8)),
            pos(position),
            color(rand(200, 255), rand(50, 150), rand(0, 50)),
            anchor("center"),
            move(rand(0, 360), rand(60, 180)),
            opacity(1),
            lifespan(rand(0.3, 0.7)),
            z(10)
        ]);
    }
}

// kaboom.pngを使った爆発エフェクトを表示する関数
function showKaboomExplosion(position) {
    try {
        // kaboom.pngを使用して爆発エフェクトを表示
        const explosion = add([
            sprite("kaboom"),
            pos(position),
            anchor("center"),
            scale(0.1),
            opacity(1),
            lifespan(0.5),
            z(10)
        ]);
        
        // 拡大するアニメーション
        explosion.onUpdate(() => {
            explosion.scale = vec2(explosion.scale.x + 0.05, explosion.scale.y + 0.05);
            if (explosion.opacity > 0) {
                explosion.opacity -= dt() * 2;
            }
        });
    } catch (e) {
        // kaboom画像がない場合は通常の爆発エフェクトを表示
        showExplosion(position);
    }
}

// 障害物を動かす関数
function activateMovingObstacles() {
    // 警告メッセージを表示
    const warningBg = add([
        rect(width(), height()),
        pos(0, 0),
        color(100, 50, 150), // 紫色の背景
        opacity(0.15),
        fixed(),
        z(198)
    ]);
    
    const warning = add([
        text("WARNING: OBSTACLES ARE MOVING!", { 
            size: 35,
        }),
        pos(center().x, center().y),
        color(200, 100, 255), // 紫色のテキスト
        outline(3, rgb(100, 0, 150)),
        anchor("center"),
        fixed(),
        opacity(0.8),
        z(200)
    ]);
    
    // サブテキスト
    const subWarning = add([
        text("NOWHERE TO HIDE!", { 
            size: 25,
        }),
        pos(center().x, center().y + 50),
        color(255, 255, 255),
        outline(2, rgb(100, 0, 150)),
        anchor("center"),
        fixed(),
        opacity(0.8),
        z(200)
    ]);
    
    // 警告テキストのフェードアウト
    let timer = 0;
    warning.onUpdate(() => {
        timer += dt();
        warningBg.opacity = 0.15 * (1 - timer/2);
        warning.opacity = 0.8 * (1 - timer/2);
        subWarning.opacity = 0.8 * (1 - timer/2);
        
        // 点滅効果
        warning.color = timer % 0.5 < 0.25 ? rgb(200, 100, 255) : rgb(255, 150, 255);
        
        if (timer >= 2) {
            destroy(warningBg);
            destroy(warning);
            destroy(subWarning);
        }
    });
    
    // すべての静的障害物を取得
    const staticObstacles = get("static-obstacle");
    console.log(`${staticObstacles.length}個の障害物をアクティブ化します`);
    
    // 各障害物を動的に変更
    staticObstacles.forEach(obstacle => {
        // 静的な体から動的な体に変更
        if (obstacle.body && obstacle.body.isStatic) {
            // 静的ボディを削除して動的ボディを追加
            obstacle.unuse("body");
            obstacle.use(body());
        }
        
        // タグを変更（静的→動的）
        obstacle.unuse("static-obstacle");
        obstacle.use("moving-obstacle");
        
        // プロパティを更新
        obstacle.isMoving = true;
        obstacle.moveSpeed = MOVING_OBSTACLE_SPEED * rand(0.8, 1.2); // 速度にランダム性を持たせる
        obstacle.activated = true;
        
        // 変化のエフェクト
        for (let i = 0; i < 15; i++) {
            add([
                circle(rand(5, 15)),
                pos(obstacle.pos.x + rand(-obstacle.width/2, obstacle.width/2), 
                    obstacle.pos.y + rand(-obstacle.height/2, obstacle.height/2)),
                color(rand(100, 200), rand(0, 100), rand(150, 255)),
                opacity(rand(0.6, 1)),
                anchor("center"),
                move(rand(0, 360), rand(50, 150)),
                opacity(1),
                lifespan(rand(0.4, 1.0)),
                z(10)
            ]);
        }
        
        // 障害物の見た目を変更（少し色を変える）
        if (obstacle.color) {
            // 紫色に近づける
            obstacle.color = rgb(
                obstacle.color.r * 0.7 + 0.3 * 150,
                obstacle.color.g * 0.7 + 0.3 * 50,
                obstacle.color.b * 0.7 + 0.3 * 200
            );
            
            if (obstacle.outline) {
                obstacle.outline.color = rgb(
                    obstacle.outline.color.r * 0.7 + 0.3 * 200,
                    obstacle.outline.color.g * 0.7 + 0.3 * 0,
                    obstacle.outline.color.b * 0.7 + 0.3 * 255
                );
            }
        }
        
        // 障害物の動きのロジック
        obstacle.onUpdate(() => {
            // ゲームオーバーまたはクリア時は移動しない
            if (isGameOver || isGameCleared) return;
            
            const player = get("player")[0];
            if (player && obstacle.isMoving) {
                // プレイヤーの方向へゆっくり向かう
                const direction = player.pos.sub(obstacle.pos).unit();
                obstacle.move(direction.scale(obstacle.moveSpeed));
                
                // 移動時のエフェクト（まれに）
                if (rand() < 0.03) {
                    // 移動方向の反対側にパーティクル
                    add([
                        circle(rand(3, 8)),
                        pos(obstacle.pos.x - direction.x * obstacle.width/2, 
                            obstacle.pos.y - direction.y * obstacle.height/2),
                        color(rand(100, 200), rand(0, 100), rand(150, 255)),
                        opacity(rand(0.3, 0.6)),
                        anchor("center"),
                        move(rand(0, 360), rand(20, 50)),
                        opacity(1),
                        lifespan(rand(0.2, 0.5)),
                        z(2)
                    ]);
                }
            }
        });
        
        // プレイヤーとの衝突時のダメージ処理
        obstacle.onCollide("player", (player) => {
            // 障害物がアクティブで、プレイヤーが無敵状態でない場合
            if (obstacle.activated && !player.isInvincible) {
                // ダメージを与える
                player.hp -= MOVING_OBSTACLE_DAMAGE;
                player.isDamaged = true;
                player.isInvincible = true;
                player.invincibleTimer = DAMAGE_COOLDOWN;
                
                // HPが0以下になったらゲームオーバー
                if (player.hp <= 0) {
                    showGameOver();
                }
                
                // ダメージ表示
                add([
                    text(`-${MOVING_OBSTACLE_DAMAGE}`, { size: 20 }),
                    pos(player.pos.x, player.pos.y - 30),
                    color(200, 100, 255),
                    anchor("center"),
                    opacity(1),
                    lifespan(0.5),
                    z(100)
                ]);
                
                // 安全なノックバック効果に変更
                safeKnockback(player, obstacle.pos, 80);
                
                // 衝突エフェクト
                for (let i = 0; i < 10; i++) {
                    add([
                        circle(rand(5, 10)),
                        pos(player.pos),
                        color(rand(100, 200), rand(0, 100), rand(150, 255)),
                        opacity(rand(0.5, 0.8)),
                        anchor("center"),
                        move(rand(0, 360), rand(30, 80)),
                        opacity(1),
                        lifespan(rand(0.3, 0.6)),
                        z(5)
                    ]);
                }
            }
        });
    });
    
    return staticObstacles.length; // 活性化された障害物の数を返す
}

// ゲームクリア表示
function showGameClear() {
    // ゲームクリアフラグを立てる
    isGameCleared = true;
    
    // 効果音やエフェクト（ここでは簡易的なエフェクト）
    const player = get("player")[0];
    if (player) {
        // プレイヤー周りに輝きエフェクト
        for (let i = 0; i < 20; i++) {
            add([
                circle(rand(10, 20)),
                pos(player.pos.x + rand(-30, 30), player.pos.y + rand(-30, 30)),
                color(rand(100, 255), rand(200, 255), rand(100, 200)),
                anchor("center"),
                lifespan(rand(0.5, 1.5)),
                opacity(1),
                scale(1),
                {
                    timer: 0
                }
            ]).onUpdate(function() {
                this.timer += dt();
                this.scale = vec2(1 + Math.sin(this.timer * 10) * 0.2, 1 + Math.sin(this.timer * 10) * 0.2);
            });
        }
    }
    
    // 大きなクリアメッセージ
    const clearMessage = add([
        rect(width() * 0.7, height() * 0.4),
        pos(center()),
        color(0, 0, 0),
        anchor("center"),
        fixed(),
        outline(4, rgb(50, 200, 50)),
        z(100), // 最前面に表示
    ]);

    add([
        text("GAME CLEAR!", { size: 40 }),
        pos(center().x, center().y - 40),
        color(50, 255, 50),
        anchor("center"),
        fixed(),
        z(101), // 最前面に表示
    ]);

    add([
        text("You survived for 5 minutes!", { size: 20 }),
        pos(center().x, center().y),
        color(255, 255, 255),
        anchor("center"),
        fixed(),
        z(101), // 最前面に表示
    ]);

    add([
        text("Press SPACE to restart", { size: 16 }),
        pos(center().x, center().y + 40),
        color(200, 200, 200),
        anchor("center"),
        fixed(),
        z(101), // 最前面に表示
    ]);
        
    // タイトルに戻るテキスト
    add([
        text("Press T to return to title", { size: 16 }),
        pos(center().x, center().y + 70),
        color(200, 200, 200),
        anchor("center"),
        fixed(),
        z(101), // 最前面に表示
    ]);
    
    // スペースキーでリスタート
    onKeyPress("space", () => {
        location.reload(); // ページをリロードしてリスタート
    });
        
    // Tキーでタイトル画面に戻る
    onKeyPress("t", () => {
        go("start");
    });
}

// ゲームオーバー表示
function showGameOver() {
    // ゲームオーバーフラグを立てる
    isGameOver = true;
    
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

    // 現在のタグから最終ボスと衝突したかチェック
    if (get("final-boss").length > 0) {
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
        
    // タイトルに戻るテキスト
    add([
        text("Press T to return to title", { size: 16 }),
        pos(center().x, center().y + 60),
        color(200, 200, 200),
        anchor("center"),
        fixed(),
        z(101), // 最前面に表示
    ]);
    
    // スペースキーでリスタート
    onKeyPress("space", () => {
        location.reload(); // ページをリロードしてリスタート
    });
    
    // Tキーでタイトル画面に戻る
    onKeyPress("t", () => {
        go("start");
    });
}

// HPゲージを作成する関数
function createHpBar(player) {
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

// プレイヤーのガン弾を発射する関数
function fireGunBullet(player, direction) {
    try {
        // 必要な変数を確認し、未定義の場合はデフォルト値を設定
        const bulletSize = typeof GUN_BULLET_SIZE !== 'undefined' ? GUN_BULLET_SIZE : 10;
        const bulletSpeed = typeof GUN_BULLET_SPEED !== 'undefined' ? GUN_BULLET_SPEED : 500;
        const bulletDamage = typeof GUN_BULLET_DAMAGE !== 'undefined' ? GUN_BULLET_DAMAGE : 20;
        const mapWidth = typeof MAP_WIDTH !== 'undefined' ? MAP_WIDTH : 2000;
        const mapHeight = typeof MAP_HEIGHT !== 'undefined' ? MAP_HEIGHT : 2000;
        const maxBulletDistance = typeof MAX_BULLET_DISTANCE !== 'undefined' ? MAX_BULLET_DISTANCE : 1000;
        const gunCooldown = typeof GUN_COOLDOWN !== 'undefined' ? GUN_COOLDOWN : 0.3;
        
        // プレイヤーとdirectionが有効かチェック
        if (!player || !direction) {
            console.error('Invalid player or direction', { player, direction });
            return;
        }
        
        // 弾の発射位置（プレイヤーの位置から少し前に）
        const offset = direction.scale(30);
        const bulletPos = player.pos.add(offset);
        
        // 弾を作成
        const bullet = add([
            circle(bulletSize),
            pos(bulletPos),
            color(50, 200, 255),
            outline(2, rgb(0, 150, 255)),
            area({ scale: 1.5 }), // 衝突判定を大きくして当たりやすくする
            anchor("center"),
            move(direction, bulletSpeed),
            opacity(1),
            lifespan(2), // 2秒後に消滅
            "bullet",
            {
                damage: bulletDamage,
                distanceTraveled: 0,
                originalDirection: direction,
                originalSpeed: bulletSpeed
            }
        ]);
        
        // 弾の更新処理
        bullet.onUpdate(() => {
            // 移動距離を追跡
            bullet.distanceTraveled += bullet.originalSpeed * dt();
            
            // 画面外に出たら削除
            if (
                bullet.pos.x < 0 ||
                bullet.pos.x > mapWidth ||
                bullet.pos.y < 0 ||
                bullet.pos.y > mapHeight
            ) {
                showKaboomExplosion(bullet.pos);
                destroy(bullet);
                return;
            }
            
            // 敵との衝突をチェック（手動で衝突判定を行う）
            const enemyTags = ["enemy", "super-enemy", "kat-enemy", "marroc-enemy", "gigagantrum-enemy", "goldfly-enemy", "lamp-enemy", "lamp", "final-boss"];
            
            enemyTags.forEach(tag => {
                const enemies = get(tag);
                enemies.forEach(enemy => {
                    if (bullet.exists() && enemy.exists()) {
                        const distance = bullet.pos.dist(enemy.pos);
                        // 弾のサイズ + 敵のサイズの半分で衝突判定
                        const collisionDistance = bulletSize + (enemy.width ? enemy.width / 2 : 30);
                        
                        if (distance < collisionDistance) {
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
                            
                            // 爆発エフェクト
                            showExplosion(bullet.pos);
                            
                            // 音を鳴らす
                            GameAudio.playGunSound();
                            
                            // ダメージ表示
                            add([
                                text(`-${bullet.damage}`, { size: 24 }),
                                pos(enemy.pos.x, enemy.pos.y - 40),
                                color(50, 255, 255),
                                outline(2, rgb(0, 100, 255)),
                                anchor("center"),
                                opacity(1),
                                lifespan(0.8),
                                move(0, -60), // 上に移動するエフェクト
                                scale(1),
                                z(100),
                                {
                                    timer: 0
                                }
                            ]).onUpdate(function() {
                                this.timer += dt();
                                this.scale = vec2(1 + Math.sin(this.timer * 10) * 0.2, 1 + Math.sin(this.timer * 10) * 0.2); // 脈動エフェクト
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
                        }
                    }
                });
            });
            
            // 一定距離を超えたら消滅
            if (bullet.distanceTraveled > maxBulletDistance) {
                showKaboomExplosion(bullet.pos);
                destroy(bullet);
            }
        });
        
        // 発射音を鳴らす
        GameAudio.playGunSound();
        
        // プレイヤーのクールダウンとアモを更新
        player.gunCooldown = gunCooldown;
        player.gunAmmo--;
        
        // アモがなくなったら銃を失う
        if (player.gunAmmo <= 0) {
            player.hasGun = false;
        }
        
        return bullet;
    } catch (e) {
        console.error('Error in fireGunBullet:', e);
    }
}
