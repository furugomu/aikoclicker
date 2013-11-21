var canvas = document.getElementById('canvas');
var ASSETS = "./assets/";
var queue = new createjs.LoadQueue(location.protocol!='file:');
var stage = new createjs.Stage(canvas);
createjs.Touch.enable(stage);
stage.enableMouseOver();
var background = new createjs.Container();
stage.addChild(background);

var sourceRects = {
  n: new createjs.Rectangle(91, 29, 442, 442),
  'n+': new createjs.Rectangle(106, 66, 261, 261),
  a: new createjs.Rectangle(98, 70, 258, 258),
}

function main() {
  createjs.Ticker.addEventListener('tick', function() {
    stage.update();
  });

  // ろーでぃんぐ
  var nowLoading = new createjs.Text('Loading', '96px sans-serif');
  nowLoading.x = (canvas.width - nowLoading.getBounds().width) / 2;
  nowLoading.y = 200;
  stage.addChild(nowLoading);

  queue.loadManifest([
    {id: 'n', src: ASSETS+'n.png'},
    {id: 'n+', src: ASSETS+'n+.png'},
    {id: 'a', src: ASSETS+'a.png'},
//    {id: 'egao', src: ASSETS+'n-egao.jpg'},
    {id: 'bg', src: ASSETS+'bg.jpg'},
  ]);
  queue.on('complete', function() {
    stage.removeChild(nowLoading);
    // 背景
    var bgImage = queue.getResult('bg');
    var bmp = new createjs.Bitmap(bgImage);
    bmp.scaleX = bmp.scaleY = canvas.width / bgImage.width;
    background.addChild(bmp);

    // 大きなクッキー
    var bigCookie = createBigCookie();
    bigCookie.x = canvas.width / 2;
    bigCookie.y = 200;
    stage.addChild(bigCookie);
  });
}

function randomAiko() {
  var a = ['n', 'n+', 'a'];
  return a[Math.floor(Math.random()*a.length)];
}

function createBigCookie() {
  var cookie = createCookie('n');

  // handle mouse events
  var scale = function(scale) {
    createjs.Tween.get(cookie).to({scaleX: scale, scaleY: scale}, 100);
  }
  cookie.on('mouseover', function() {
    scale(1.05);
  });
  cookie.on('mousedown', function() {
    scale(0.98);
    cookie.on('pressup', function() {
      scale(1.05);
    }, null, true);
  });
  cookie.on('mouseout', function() {
    scale(1);
    cookie.removeAllEventListeners('pressup');
  });
  cookie.on('click', function(e) {
    var id = randomAiko();
    var spark = createSpark(id, e.stageX, e.stageY);
    stage.addChild(spark);
    var rain = createRain(id);
    background.addChild(rain);
  });

  return cookie;
}

function random(lo, hi) {
  return Math.random() * (hi-lo) + lo;
};

// 飛び散るやつ
function createSpark(imageId, x, y) {
  var vx = random(-4, 4);
  var vy = random(-8, -1);
  var cookie = createFallingCookie(imageId, vx, vy);
  cookie.mouseEnabled = false;

  cookie.x = x;
  cookie.y = y;
  cookie.rotation = random(0, 360);
  cookie.scaleX = cookie.scaleY = random(0.08, 0.2);

  createjs.Tween.get(cookie).to({alpha: 0}, 600).call(function() {
    stage.removeChild(cookie);
    delete cookie;
  });

  return cookie;
}

// 上から降ってくるやつ
function createRain(imageId) {
  var cookie = createFallingCookie(imageId, 0, 0);

  cookie.scaleX = cookie.scaleY = 0.3;
  cookie.x = random(0, canvas.width);
  cookie.y = -60;
  cookie.rotation = random(0, 360);

  createjs.Tween.get(cookie).wait(500).to({alpha: 0}, random(1000, 1500)).call(function() {
    stage.removeChild(cookie);
    delete cookie;
  });

  return cookie;
}

// 落ちるクッキー
function createFallingCookie(imageId, vx, vy) {
  var cookie = createCookie(imageId);

  if (vx == null) vx = 0;
  if (vy == null) vy = 0;
  var gravity = 1;
  cookie.on('tick', function() {
    cookie.x += vx;
    cookie.y += vy;
    vy += gravity;
  });

  return cookie;
}

var cookieCache = {};
function createCookie(id) {
  return _createCookie(id);
  if (cookieCache[id]) return cookieCache[id].clone();
  cookieCache[id] = _createCookie(id);
  return cookieCache[id];
}

function _createCookie(id) {
  var width = 300, height = 300;
  var cookie = new createjs.Container();
  var image = queue.getResult(id);
  var bmp = new createjs.Bitmap(image);
  bmp.sourceRect = sourceRects[id];
  cookie.addChild(bmp);

  // よい大きさにする
  bmp.scaleX = width / bmp.sourceRect.width;
  bmp.scaleY = height / bmp.sourceRect.height;

  // まるくする
  var cx = width / 2, cy = height / 2;
  var r = Math.min(cx, cy);
  cookie.regX = cx;
  cookie.regY = cy;

  var mask = new createjs.Shape();
  mask.graphics.beginRadialGradientFill(
    ['rgba(0,0,0,1)', 'rgba(0,0,0,0)'], [0, 1],
    cx, cy, r * 0.8,
    cx, cy, r);
  mask.graphics.drawRect(0, 0, width, height);
  mask.cache(0, 0, width, height);
  cookie.filters = [
    new createjs.AlphaMaskFilter(mask.cacheCanvas),
  ];
  cookie.cache(0, 0, width, height);
  return cookie;
}

main();

