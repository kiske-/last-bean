// 難易度設定を管理するファイル

// 現在の難易度（デフォルトはNORMAL）
let currentDifficulty = "NORMAL";

// 難易度設定オブジェクト
const DifficultySettings = {
    // 難易度に依存しない共通設定
    COMMON: {
        // マップサイズ
        MAP_WIDTH: 2000,
        MAP_HEIGHT: 2000,
        
        // プレイヤーの基本設定
        PLAYER_SIZE: 50,
        PLAYER_SPEED: 200,
        PLAYER_SPEED_FAST: 400,
        
        // 弾の設定
        BULLET_SPEED: 300,
        BULLET_DAMAGE: 15,
        MAX_BULLET_DISTANCE: 1000,
        
        // 敵の基本サイズ
        ENEMY_SIZE: 50,
        SUPER_ENEMY_SIZE: 70,
        SUPER_ENEMY_SPEED: 120,
        
        // ランプ敵の設定
        LAMP_SIZE: 60,
        LAMP_BEAM_INTERVAL: 5,
        LAMP_BEAM_DURATION: 1.5,
        LAMP_BEAM_LENGTH: 1000,
        LAMP_BEAM_WIDTH: 40,
        LAMP_HP: 150,
        LAMP_INTERVAL: 60,
        LAMP_BEAM_DAMAGE: 35,
        
        // 特殊敵の基本設定
        KAT_SIZE: 60,
        KAT_SPEED: 280,
        KAT_HP: 150,
        KAT_INTERVAL: 30,
        
        MARROC_SIZE: 60,
        MARROC_SPEED: 270,
        MARROC_HP: 180,
        MARROC_INTERVAL: 30,
        
        GIGAGANTRUM_SIZE: 80,
        GIGAGANTRUM_SPEED: 100,
        GIGAGANTRUM_HP: 250,
        GIGAGANTRUM_INTERVAL: 60,
        GIGAGANTRUM_THROW_INTERVAL: 5,
        GIGAGANTRUM_THROW_SPEED: 500,
        GIGAGANTRUM_PROJECTILE_SIZE: 100,
        GIGAGANTRUM_PROJECTILE_DISTANCE: 600,
        GIGAGANTRUM_PREPARE_TIME: 1.5,
        
        GOLDFLY_SIZE: 50,
        GOLDFLY_SPEED: 300,
        GOLDFLY_HP: 120,
        GOLDFLY_INTERVAL: 60,
        GOLDFLY_DIRECTION_CHANGE_INTERVAL: 1,
        
        // 最終ボスの基本設定
        FINAL_BOSS_SIZE: 500,
        FINAL_BOSS_SPEED: 100,
        
        // アイテム設定
        HEART_SIZE: 40,
        GUN_SIZE: 50,
        GUN_BULLET_SIZE: 10,
        GUN_BULLET_SPEED: 500,
        GUN_BULLET_DAMAGE: 20,  // プレイヤーの銃弾のダメージ
        GUN_AMMO: 10,
        GUN_COOLDOWN: 0.3,
        
        LIGHTENING_SIZE: 50,
        LIGHTENING_RANGE: 300,
        LIGHTENING_DURATION: 2,
        LIGHTENING_COOLDOWN: 5,
        LIGHTENING_SPAWN_INTERVAL: 60,
        LIGHTENING_DAMAGE: 80,
        
        // 障害物設定
        MOVING_OBSTACLE_SPEED: 150,
        MOVING_OBSTACLE_ACTIVATE_TIME: 60,
        MOVING_OBSTACLE_DAMAGE: 15,
    },
    
    // 簡単モード
    EASY: {
        // プレイヤー設定
        PLAYER_MAX_HP: 200,             // 最大HP増加
        DAMAGE_COOLDOWN: 1.5,           // 無敵時間長め
        
        // 敵の設定
        ENEMY_COUNT: 6,                 // 敵の数を減らす
        ENEMY_SPEED: 120,               // 敵の移動速度低下
        ENEMY_DAMAGE: 15,               // 敵のダメージ量減少
        ENEMY_HP: 40,                   // 敵のHP減少
        ENEMY_INTERVAL: 8,              // 敵の出現間隔を長く
        
        // 強力な敵
        SUPER_ENEMY_DAMAGE: 30,         // ダメージ量減少
        SUPER_ENEMY_HP: 200,            // HP減少
        SUPER_ENEMY_INTERVAL: 60,       // 出現間隔を長く
        
        // 特殊敵
        KAT_DAMAGE: 25,
        MARROC_DAMAGE: 30,
        GIGAGANTRUM_DAMAGE: 20,
        GIGAGANTRUM_PROJECTILE_DAMAGE: 30,
        GOLDFLY_DAMAGE: 25,
        
        // 最終ボス
        FINAL_BOSS_HP: 400,             // HP減少
        FINAL_BOSS_DAMAGE: 30,          // ダメージ量減少
        FINAL_BOSS_COUNT: 3,            // ボスの数を減らす
        FINAL_BOSS_APPEAR_TIME: 45,     // 出現までの時間を長く
        
        // アイテム
        HEART_COUNT: 8,                 // ハートの数を増やす
        HEART_HEAL_AMOUNT: 15,          // 回復量増加
        HEART_SPAWN_INTERVAL: 8,        // ハート出現間隔短縮
        GUN_SPAWN_INTERVAL: 15,         // 銃アイテム出現間隔短縮
        
        // サバイバル設定
        SURVIVAL_TIME: 15 * 60,          // 生存時間15分
    },
    
    // 普通モード（デフォルト設定）
    NORMAL: {
        // プレイヤー設定
        PLAYER_MAX_HP: 100,
        DAMAGE_COOLDOWN: 1,
        
        // 敵の設定
        ENEMY_COUNT: 8,
        ENEMY_SPEED: 150,
        ENEMY_DAMAGE: 20,
        ENEMY_HP: 50,
        ENEMY_INTERVAL: 5,
        
        // 強力な敵
        SUPER_ENEMY_DAMAGE: 40,
        SUPER_ENEMY_HP: 250,
        SUPER_ENEMY_INTERVAL: 45,
        
        // 特殊敵
        KAT_DAMAGE: 30,
        MARROC_DAMAGE: 35,
        GIGAGANTRUM_DAMAGE: 25,
        GIGAGANTRUM_PROJECTILE_DAMAGE: 40,
        GOLDFLY_DAMAGE: 30,
        
        // 最終ボス
        FINAL_BOSS_HP: 500,
        FINAL_BOSS_DAMAGE: 40,
        FINAL_BOSS_COUNT: 5,
        FINAL_BOSS_APPEAR_TIME: 30,
        
        // アイテム
        HEART_COUNT: 5,
        HEART_HEAL_AMOUNT: 10,
        HEART_SPAWN_INTERVAL: 10,
        GUN_SPAWN_INTERVAL: 15,
        
        // サバイバル設定
        SURVIVAL_TIME: 15 * 60,          // 生存時間15分
    },
    
    // 難しいモード
    HARD: {
        // プレイヤー設定
        PLAYER_MAX_HP: 100,              // 最大HP減少
        DAMAGE_COOLDOWN: 0.8,           // 無敵時間短め
        
        // 敵の設定
        ENEMY_COUNT: 10,                // 敵の数を増やす
        ENEMY_SPEED: 180,               // 敵の移動速度上昇
        ENEMY_DAMAGE: 25,               // 敵のダメージ量増加
        ENEMY_HP: 60,                   // 敵のHP増加
        ENEMY_INTERVAL: 3,              // 敵の出現間隔を短く
        
        // 強力な敵
        SUPER_ENEMY_DAMAGE: 50,         // ダメージ量増加
        SUPER_ENEMY_HP: 300,            // HP増加
        SUPER_ENEMY_INTERVAL: 30,       // 出現間隔を短く
        
        // 特殊敵
        KAT_DAMAGE: 35,
        MARROC_DAMAGE: 40,
        GIGAGANTRUM_DAMAGE: 30,
        GIGAGANTRUM_PROJECTILE_DAMAGE: 50,
        GOLDFLY_DAMAGE: 35,
        
        // 最終ボス
        FINAL_BOSS_HP: 600,             // HP増加
        FINAL_BOSS_DAMAGE: 50,          // ダメージ量増加
        FINAL_BOSS_COUNT: 8,            // ボスの数を増やす
        FINAL_BOSS_APPEAR_TIME: 20,     // 出現までの時間を短く
        
        // アイテム
        HEART_COUNT: 3,                 // ハートの数を減らす
        HEART_HEAL_AMOUNT: 8,           // 回復量減少
        HEART_SPAWN_INTERVAL: 15,       // ハート出現間隔長め
        GUN_SPAWN_INTERVAL: 30,         // 銃アイテム出現間隔長め
        
        // サバイバル設定
        SURVIVAL_TIME: 15 * 60,          // 生存時間15分
    }
};

// 現在の難易度を設定する関数
function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    applyDifficultySettings();
}

// 現在の難易度の設定を適用する関数
function applyDifficultySettings() {
    try {
        // まず共通設定を適用
        if (DifficultySettings && DifficultySettings.COMMON) {
            for (const [key, value] of Object.entries(DifficultySettings.COMMON)) {
                window[key] = value;
            }
            console.log("共通設定を適用しました");
        } else {
            console.error("共通設定が見つかりません");
        }
        
        // 次に選択された難易度の設定を適用（共通設定を上書き）
        if (DifficultySettings && DifficultySettings[currentDifficulty]) {
            const settings = DifficultySettings[currentDifficulty];
            for (const [key, value] of Object.entries(settings)) {
                window[key] = value;
            }
            console.log(`難易度[${currentDifficulty}]の設定を適用しました`);
        } else {
            console.error(`難易度[${currentDifficulty}]の設定が見つかりません`);
        }
    } catch (error) {
        console.error("難易度設定の適用中にエラーが発生しました:", error);
    }
}

// 現在の難易度を取得する関数
function getCurrentDifficulty() {
    return currentDifficulty;
}

// グローバルオブジェクトにエクスポート
window.DifficultySettings = DifficultySettings;
window.setDifficulty = setDifficulty;
window.applyDifficultySettings = applyDifficultySettings;
window.getCurrentDifficulty = getCurrentDifficulty; 