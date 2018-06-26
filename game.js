// Alias
const Application = PIXI.Application;
const loader = PIXI.loader;
const resources = PIXI.loader.resources;
const Sprite = PIXI.Sprite;

// Create a Pixi Application
let app = new Application(750, 1334, {
    autoStart: false,
    backgroundColor: 0x444444
});

document.querySelector("#pixi-game-container").appendChild(app.view);

// Scale mode for all textures, will retain pixelation
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

// create the root of the scene graph
const stage = new PIXI.Container();

// load images
loader.add(["knife.png", "target.png"]).load(setup);

let target = null;
let throwingKnife = null;
let canThrow = true;
let isLegalHit = true;
let hitKnifes = [];

// ナイフと丸太の画像を初期位置にセット
function setup() {
    console.log(" load image complete ");
    // create the target sprite
    target = new Sprite(resources["target.png"].texture);
    target.anchor.set(0.5);
    target.x = app.screen.width / 2;
    // target.y = app.screen.height / 2;
    target.y = 400;

    throwingKnife = new Sprite(resources["knife.png"].texture);
    throwingKnife.anchor.set(0, 0.5);
    throwingKnife.x = app.screen.width / 2;
    throwingKnife.y = (app.screen.height / 5) * 4;
    throwingKnife.vy = -30;

    stage.interactive = true;

    throwingKnife.interactive = true;
    throwingKnife.on("pointerdown", () => {
        canThrow = false;
    });

    stage.addChildAt(throwingKnife, 0);
    stage.addChildAt(target, 1);

    app.stage.addChild(stage);

    app.start();
}

function fallOut(delta) {
    if (throwingKnife.y >= (app.screen.height / 5) * 4) {
        throwingKnife.y = (app.screen.height / 5) * 4;
        throwingKnife.rotation = 0;

        isLegalHit = true;
        canThrow = true;
        return;
    }

    throwingKnife.rotation += 0.2 * delta;
    throwingKnife.y += -throwingKnife.vy * 1.5 + delta;

    resetGame();
}

function hitKnifeRotation(delta) {
    hitKnifes.forEach(knife => {
        knife.rotation += 0.04 * delta;
        const rad = knife.rotation + (90 * Math.PI) / 180;
        const x = (target.width / 2) * 0.7 * Math.cos(rad) + target.x;
        const y = (target.width / 2) * 0.7 * Math.sin(rad) + target.y;
        knife.x = x;
        knife.y = y;
    });
}

function hit() {
    const currentDeg = (target.rotation * (180 / Math.PI)) % 360;
    console.log(`current deg : ${currentDeg}`);
    for (let i = 0; i < hitKnifes.length; i += 1) {
        const knife = hitKnifes[i];
        const diff = currentDeg - knife.impactAngle;
        console.log(`差分：： ${Math.abs(diff)}`);
        if (Math.abs(diff) < 5) {
            console.log("OUT!!!!");
            isLegalHit = false;
            return false;
        }
    }

    // Add knife
    const knife = new Sprite(resources["knife.png"].texture);
    knife.anchor.set(0, 0);
    knife.x = throwingKnife.x;
    knife.y = throwingKnife.y - 150;

    knife.impactAngle = currentDeg;

    hitKnifes.push(knife);
    stage.addChildAt(knife, 0);

    isLegalHit = true;
    return true;
}

function thrownKnife(delta) {
    if (canThrow) {
        return;
    }

    if (throwingKnife.y >= 500 + target.height / 2) {
        throwingKnife.y += throwingKnife.vy + delta;
        return;
    }

    // check for a collision between the throw knife and target
    if (!hit()) {
        console.log(" GAME OVER ");
        return;
    }

    // knifeの位置を戻す
    canThrow = true;
    throwingKnife.y = (app.screen.height / 5) * 4;
}

function gameLoop(delta) {
    target.rotation += 0.04 * delta;

    thrownKnife(delta);

    if (!isLegalHit) {
        fallOut(delta);
    }

    hitKnifeRotation(delta);
}

function resetGame() {
    hitKnifes.forEach(knife => {
        stage.removeChild(knife);
    });
    hitKnifes = [];
}

// Listen for animate update
app.ticker.add(delta => gameLoop(delta));
