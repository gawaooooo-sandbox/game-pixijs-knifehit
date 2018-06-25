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
// let renderer = PIXI.autoDetectRenderer(750, 1334, {
//     backgroundColor: 0x444444
// });

document.querySelector("#pixi-game-container").appendChild(app.view);
// document.querySelector("#pixi-game-container").appendChild(renderer.view);

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

    // app.stage.addChild(target);
    // app.stage.addChild(throwingKnife);
    stage.interactive = true;

    throwingKnife.interactive = true;
    throwingKnife.on("pointerdown", () => {
        canThrow = false;
    });

    stage.addChild(target);
    stage.addChild(throwingKnife);

    app.stage.addChild(stage);

    app.start();
}

function fallOut(delta) {
    if (throwingKnife.y >= (app.screen.height / 5) * 4) {
        console.log(" koeta ");

        throwingKnife.y = (app.screen.height / 5) * 4;
        throwingKnife.rotation = 0;

        isLegalHit = true;
        canThrow = true;
        return;
    }

    throwingKnife.rotation += 0.2 * delta;
    throwingKnife.y += -throwingKnife.vy * 1.5 + delta;
}

function hit() {
    console.log(" call hit target ");
    // TODO: knifeにhitしたら、addChild?したオブジェクトをdestroyすればいいのか、、
    let hit = false;

    // TODO: fallOut
    isLegalHit = false;
    return true;
}

function thrownKnife(delta) {
    if (canThrow) {
        return;
    }
    // TODO: このyの位置は固定でいいかも
    if (throwingKnife.y >= 500 + target.height / 2) {
        throwingKnife.y += throwingKnife.vy + delta;
        return;
    }
    console.log(" knife hit target ?? ");

    // hitしたかどうかのチェック
    // check for a collision between the throw knife and target
    if (hit()) {
        console.log(" target に 当たったのかナイフに当たったのか");
        return;
    }

    // knifeの位置を戻す
    canThrow = true;
    throwingKnife.y = (app.screen.height / 5) * 4;

    // app.stop();
}

function gameLoop(delta) {
    // target.rotation += 0.1 * delta;
    target.rotation += 0.04 * delta;

    // throwing knife
    // TODO: targetの下限まで到達したら止める
    thrownKnife(delta);

    if (!isLegalHit) {
        fallOut(delta);
    }
}

// Listen for animate update
app.ticker.add(delta => gameLoop(delta));
