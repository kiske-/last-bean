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
            hp: FINAL_BOSS_HP  // 最終ボスのHP値を設定
        }
    ];
    
    // 画像があるかどうかで表示を変える
    if (!window.dinoImageFailed) {
        bossComponents.unshift(sprite("dino"));
        // 画像サイズを調整（サイズに合わせたスケール値を使用）
        bossComponents.push(scale(vec2(0.3, 0.3)));
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
                    finalBoss.scale = vec2(finalBoss.direction * 0.3, 0.3);
                }
            }
            
            // 脈動エフェクト
            finalBoss.pulseTimer += dt();
            const pulse = Math.sin(finalBoss.pulseTimer * 10) * 0.2 + 1;
            
            if (!window.dinoImageFailed) {
                finalBoss.scale = vec2(finalBoss.direction * 0.3 * pulse, 0.3 * pulse);
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
