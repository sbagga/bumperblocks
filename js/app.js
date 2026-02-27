// ======================== PIXI APPLICATION ========================
// Creates the PixiJS app and the 10-layer container hierarchy.
// Depends on: constants.js (HEADER_HEIGHT)
// See: ARCHITECTURE.md for layer z-order table.

const gameContainer = document.getElementById('gameContainer');
const appWidth = window.innerWidth;
const appHeight = window.innerHeight - HEADER_HEIGHT;

const app = new PIXI.Application({
  width: appWidth,
  height: appHeight,
  antialias: true,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  backgroundColor: CONFIG.app.canvasBackgroundColor,
});
gameContainer.insertBefore(app.view, gameContainer.firstChild);

// ======================== LAYERS (bottom → top) ========================
const bgLayer = new PIXI.Container();          // background, night overlay, sun
const nightSkyLayer = new PIXI.Container();    // stars, moon, shooting stars
const treeShadowLayer = new PIXI.Container();
const treeLayer = new PIXI.Container();
const grassLayer = new PIXI.Container();
const blockShadowLayer = new PIXI.Container();
const blockLayer = new PIXI.Container();       // sortable — blocks use zIndex
const effectLayer = new PIXI.Container();      // flashes, debris
const wreckLayer = new PIXI.Container();       // pin, chain, ball
const birdLayer = new PIXI.Container();

app.stage.addChild(
  bgLayer, nightSkyLayer, treeShadowLayer, treeLayer, grassLayer,
  blockShadowLayer, blockLayer, effectLayer, wreckLayer, birdLayer
);

blockLayer.sortableChildren = true;
