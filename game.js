const KEY_CODE_LEFT = 37;
const KEY_CODE_RIGHT = 39;
const KEY_CODE_SPACE = 32;


const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

const PLAYER_WIDTH = 30;
const PLAYER_MAX_SPEED = 600;

const LASER_MAX_SPEED = 300;
const LASER_COOLDOWN = 0.3;

const ENEMIES_PER_ROW = 10;
const ENEMY_HORIZONTAL_PADDING = 80;
const ENEMY_VERTICAL_PADDING = 70;
const ENEMY_VERTICAL_SPACING = 80;

// const ENEMY_LASER_MAX_SPEED = 300;
// const ENEMY_LASER_COOLDOWN = 0.3;


const GAME_STATE = {
    lastTime: Date.now(),
    leftPressed: false,
    rightPressed: false,
    spacePressed: false,
    playerX: 0,
    playerY: 0,
    playerCooldown: 0,
    lasers: [],
    enemies: [],
};

function rectsIntersect(r1, r2) {
    return !(
        r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top
    );
}

function setPosition($el, x, y) {
    $el.style.transform = `translate(${x}px, ${y}px`;
};

function clamp(v, min, max) {
    if (v < min) {
        return min;
    } else if (v > max) {
        return max;
    } else {
        return v;
    }
};

function createPlayer($container) {
    GAME_STATE.playerX = GAME_WIDTH / 2;
    GAME_STATE.playerY = GAME_HEIGHT - 64;
    const $player = document.createElement("img");
    $player.src = "assets/images/siXwing.png";
    $player.className = "player"; 
    $container.appendChild($player);
    setPosition($player, GAME_STATE.playerX, GAME_STATE.playerY);
};

function init() {
    const $container = document.querySelector(".game");
    createPlayer($container);

    const enemySpacing = (GAME_WIDTH - ENEMY_HORIZONTAL_PADDING * 2) / (ENEMIES_PER_ROW - 1);
    for (let j = 0; j < 3; j++) {
        const y = ENEMY_VERTICAL_PADDING + j * ENEMY_VERTICAL_SPACING;
        for (let i = 0; i < ENEMIES_PER_ROW; i++) {
            const x = i * enemySpacing + ENEMY_HORIZONTAL_PADDING;
            createEnemy($container, x, y);
        }
    }
};

function updatePlayer(dt, $container) {
    if (GAME_STATE.leftPressed) {
        GAME_STATE.playerX -= dt * PLAYER_MAX_SPEED;
    }
    if (GAME_STATE.rightPressed) {
        GAME_STATE.playerX += dt * PLAYER_MAX_SPEED;
    }

    GAME_STATE.playerX = clamp(GAME_STATE.playerX, PLAYER_WIDTH, GAME_WIDTH - PLAYER_WIDTH);

    if (GAME_STATE.spacePressed && GAME_STATE.playerCooldown <= 0) {
        createLaser($container, GAME_STATE.playerX-PLAYER_WIDTH/2, GAME_STATE.playerY-10);
        GAME_STATE.playerCooldown = LASER_COOLDOWN;
    }
    if (GAME_STATE.playerCooldown > 0) {
        GAME_STATE.playerCooldown -= dt;
    }

    const $player = document.querySelector(".player"); 
    setPosition($player, GAME_STATE.playerX, GAME_STATE.playerY);
};

function createLaser($container, x, y) {
    const $element = document.createElement("img");
    $element.src = "assets/images/xWingLasers.png";
    $element.className = "laser";
    $container.appendChild($element);
    const laser = { x, y, $element };
    GAME_STATE.lasers.push(laser);
    setPosition($element, x, y);
    // const audio = new Audio("sound/sfx-laser1.ogg");
    // audio.play();
}

function updateLasers(dt, $container) {
    const lasers = GAME_STATE.lasers;
    for (let i = 0; i < lasers.length; i++) {
        const laser = lasers[i];
        laser.y -= dt * LASER_MAX_SPEED;
        if (laser.y < 0) {
            destroyLaser($container, laser);
        }
        setPosition(laser.$element, laser.x, laser.y);
        const r1 = laser.$element.getBoundingClientRect();
        const enemies = GAME_STATE.enemies;
        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];
            if (enemy.isDead) continue;
            const r2 = enemy.$element.getBoundingClientRect();
            if (rectsIntersect(r1, r2)) {
                //enemy was hit
                destroyEnemy($container, enemy);
                destroyLaser($container, laser);
                break;
            }
        }
    }
    GAME_STATE.lasers = GAME_STATE.lasers.filter(e => !e.isDead);
}

function destroyLaser($container, laser) {
    $container.removeChild(laser.$element);
    laser.isDead = true;
}


// ---------------------------NEW STUFF---------------------


// function createEnemyLaser($container, x, y) {
//     const $element = document.createElement("img");
//     $element.src = "assets/images/xWingLasers.png";
//     $element.className = "enemyLaser";
//     $container.appendChild($element);
//     const enemyLaser = { x, y, $element };
//     GAME_STATE.enemyLasers.push(enemyLaser);
//     setPosition($element, x, y);
//     // const audio = new Audio("sound/sfx-laser1.ogg");
//     // audio.play();
// }

// function updateEnemyLasers(dt, $container) {
//     const enemyLasers = GAME_STATE.enemyLasers;
//     for (let i = 0; i < enemyLasers.length; i++) {
//         const enemyLaser = enemyLasers[i];
//         enemyLaser.y -= dt * ENEMY_LASER_MAX_SPEED;
//         if (enemyLaser.y < 0) {
//             destroyEnemyLaser($container, laser);
//         }
//         setPosition(enemyLaser.$element, enemyLaser.x, enemyLaser.y);
//         const r1 = enemyLaser.$element.getBoundingClientRect();
//         const enemies = GAME_STATE.enemies;
//         for (let j = 0; j < enemies.length; j++) {
//             const enemy = enemies[j];
//             if (enemy.isDead) continue;
//             const r2 = enemy.$element.getBoundingClientRect();
//             if (rectsIntersect(r1, r2)) {
//                 //enemy was hit
//                 destroyEnemy($container, enemy);
//                 destroyEnemyLaser($container, laser);
//                 break;
//             }
//         }
//     }
//     GAME_STATE.lasers = GAME_STATE.lasers.filter(e => !e.isDead);
// }

// function destroyEnemyLaser($container, laser) {
//     $container.removeChild(laser.$element);
//     laser.isDead = true;
// }


// ------------------------END OF NEW STUFF---------------------





function createEnemy($container, x, y) {
    const $element = document.createElement("img");
    $element.src = "assets/images/siAlien.png";
    $element.className = "enemy"
    $container.appendChild($element);
    const enemy = {
        x,
        y,
        $element
    };
    GAME_STATE.enemies.push(enemy);
    setPosition($element, x, y);
}

function updateEnemies(dt, $container) {
    const dx = Math.sin(GAME_STATE.lastTime / 1000.0) * 50;
    const dy = Math.cos(GAME_STATE.lastTime / 1000.0) * 10;

    const enemies = GAME_STATE.enemies;
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        const x = enemy.x + dx;
        const y = enemy.y + dy;
        setPosition(enemy.$element, x, y);
    }
    GAME_STATE.enemies = GAME_STATE.enemies.filter(e => !e.isDead);
}

function destroyEnemy($container, enemy) {
    $container.removeChild(enemy.$element);
    enemy.isDead = true;
}

//----------------NEW STUFF--------------


// function destroyPlayer($container, player) {
//     $container.removeChild(player.$element);
//     player.isDead = true;
// }


//------------END OF NEW STUFF--------------

function update() {
    const currentTime = Date.now();
    const dt = (currentTime - GAME_STATE.lastTime) / 1000;
    
    const $container = document.querySelector(".game");
    updatePlayer(dt, $container);
    updateLasers(dt, $container);
    updateEnemies(dt, $container);

    GAME_STATE.lastTime = currentTime;
    window.requestAnimationFrame(update);
};

function onKeyDown(e) {
    if (e.keyCode === KEY_CODE_LEFT) {
        GAME_STATE.leftPressed = true;
    } else if (e.keyCode === KEY_CODE_RIGHT) {
        GAME_STATE.rightPressed = true;
    } else if (e.keyCode === KEY_CODE_SPACE) {
        GAME_STATE.spacePressed = true;
    }
}
function onKeyUp(e) {
    if (e.keyCode === KEY_CODE_LEFT) {
        GAME_STATE.leftPressed = false;
    } else if (e.keyCode === KEY_CODE_RIGHT) {
        GAME_STATE.rightPressed = false;
    } else if (e.keyCode === KEY_CODE_SPACE) {
        GAME_STATE.spacePressed = false;
    }
}

init();
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
window.requestAnimationFrame(update);