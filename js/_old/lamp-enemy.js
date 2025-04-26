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
