// ユーティリティ関数

// 安全なノックバック処理を行う関数
// 壁との衝突をチェックし、マップ外にプレイヤーが出ないようにする
function safeKnockback(player, sourcePos, power) {
    // 現在位置を保存
    const originalPos = vec2(player.pos.x, player.pos.y);
    
    // ノックバックの方向ベクトルを計算（対象から離れる方向）
    const knockbackDir = player.pos.sub(sourcePos).unit();
    
    // ノックバック後の位置を計算
    const targetPos = player.pos.add(knockbackDir.scale(power));
    
    // マップの境界をチェック
    const safeX = Math.max(30, Math.min(MAP_WIDTH - 30, targetPos.x));
    const safeY = Math.max(30, Math.min(MAP_HEIGHT - 30, targetPos.y));
    
    // 安全な位置に移動
    player.pos = vec2(safeX, safeY);
    
    // 障害物との衝突をチェック
    let hasCollision = false;
    for (const wall of get("wall")) {
        if (player.isColliding(wall)) {
            hasCollision = true;
            break;
        }
    }
    
    // 障害物に衝突した場合、力を弱めて再試行
    if (hasCollision) {
        // 元の位置に戻す
        player.pos = originalPos;
        
        // 力を半分にして再試行
        const halfPower = power * 0.5;
        if (halfPower > 5) {
            // 再帰的に呼び出し（力を弱めて）
            safeKnockback(player, sourcePos, halfPower);
        } else {
            // 最小限の移動（障害物から少し離れる程度）
            const minimalMove = player.pos.add(knockbackDir.scale(5));
            
            // マップの境界をチェック
            const safeX = Math.max(30, Math.min(MAP_WIDTH - 30, minimalMove.x));
            const safeY = Math.max(30, Math.min(MAP_HEIGHT - 30, minimalMove.y));
            
            player.pos = vec2(safeX, safeY);
        }
    }
    
    return player.pos;
} 