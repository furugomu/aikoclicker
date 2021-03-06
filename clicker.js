var canvas = document.getElementById('canvas');
canvas.addEventListener('selectstart', function(e) {e.preventDefault()}, false);
var ASSETS = "./assets/";
var queue = new createjs.LoadQueue(location.protocol!='file:');
var stage = new createjs.Stage(canvas);
createjs.Touch.enable(stage);
stage.enableMouseOver();
var background = new createjs.Container();
stage.addChild(background);

var aikoResources = {
  n: {
    src: ASSETS+'n.png',
    rect: new createjs.Rectangle(91, 29, 442, 442),
  },
  'n+': {
    src: ASSETS+'n+.png',
    rect: new createjs.Rectangle(106, 66, 261, 261),
  },
  v: {
    src: ASSETS+'v.png',
    rect: new createjs.Rectangle(93, 75, 270, 270),
  },
  'v+': {
    src: ASSETS+'v+.png',
    rect: new createjs.Rectangle(103, 72, 277, 277),
  },
  f: {
    src: ASSETS+'f.png',
    rect: new createjs.Rectangle(123, 69, 266, 266),
  },
  'f+': {
    src: ASSETS+'f+.png',
    rect: new createjs.Rectangle(120, 64, 263, 263),
  },
  a: {
    src: ASSETS+'a.png',
    rect: new createjs.Rectangle(98, 70, 258, 258),
  },
  'a+': {
    src: ASSETS+'a+.png',
    rect: new createjs.Rectangle(117, 62, 266, 266),
  },
  y: {
    src: ASSETS+'y.jpg',
    rect: new createjs.Rectangle(44, 0, 400, 400),
  },
  'y+': {
    src: ASSETS+'y+.jpg',
    rect: new createjs.Rectangle(34, 0, 400, 400),
  },
};

function main() {
  createjs.Ticker.addEventListener('tick', function() {
    stage.update();
  });

  // ろーでぃんぐ
  var nowLoading = new createjs.Text('Loading', '96px sans-serif');
  nowLoading.x = (canvas.width - nowLoading.getBounds().width) / 2;
  nowLoading.y = 200;
  stage.addChild(nowLoading);

  queue.loadFile({id: 'bg', src: ASSETS+'bg.jpg'});
  queue.loadFile({id: 'egao', src: ASSETS+'n-egao.png'});
  for (var id in aikoResources) {
    queue.loadFile({id: id, src: aikoResources[id].src});
  }
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

var aikoIds = null;
function randomAiko() {
  if (!aikoIds) {
    aikoIds = [];
    for (var id in aikoResources) aikoIds.push(id);
  }
  return aikoIds[Math.floor(Math.random()*aikoIds.length)];
}

function createBigCookie() {
  var cookie = createCookie('n');

  // 笑顔をのっける
  var egao = new createjs.Bitmap(queue.getResult('egao'));
  cookie.addChild(egao);
  var rect = aikoResources['n'].rect;
  egao.scaleX = 300 / rect.width; // TODO: ここの300をどうにかしたい
  egao.scaleY = 300 / rect.width;
  egao.x = (190 - rect.x) * egao.scaleX;
  egao.y = (200 - rect.y) * egao.scaleY;
  egao.alpha = 0;
  egao.mouseEnabled = false;

  // handle mouse events
  var scale = function(scale) {
    createjs.Tween.get(cookie).to({scaleX: scale, scaleY: scale}, 100);
  }
  cookie.on('mouseover', function() {
    scale(1.05);
  });
  cookie.on('mousedown', function() {
    scale(0.98);
    createjs.Tween.get(egao).to({alpha: 1}, 100);
    cookie.on('pressup', function(e) {
      scale(1.05);
      createjs.Tween.get(egao).to({alpha: 0}, 0);
    }, null, true);
  });
  cookie.on('mouseout', function() {
    scale(1);
    createjs.Tween.get(egao).to({alpha: 0}, 0);
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

  cookie.scaleX = cookie.scaleY = 0.4;
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
  cookie.regX = width / 2;
  cookie.regY = height / 2;
  var image = queue.getResult(id);
  var bmp = new createjs.Bitmap(image);
  bmp.sourceRect = aikoResources[id].rect;
  cookie.addChild(bmp);

  var bmpWidth = bmp.sourceRect.width;
  var bmpHeight = bmp.sourceRect.height;

  // よい大きさにする
  bmp.scaleX = width / bmpWidth;
  bmp.scaleY = height / bmpHeight;

  // まるくする
  var cx = bmpWidth / 2, cy = bmpHeight / 2;
  var r = Math.min(cx, cy);

  var mask = new createjs.Shape();
  mask.graphics.beginRadialGradientFill(
    ['rgba(0,0,0,1)', 'rgba(0,0,0,0)'], [0, 1],
    cx, cy, r * 0.8,
    cx, cy, r);
  mask.graphics.drawRect(0, 0, bmpWidth, bmpHeight);
  mask.cache(0, 0, bmpWidth, bmpHeight);
  bmp.filters = [
    new createjs.AlphaMaskFilter(mask.cacheCanvas),
  ];
  bmp.cache(0, 0, bmpWidth, bmpHeight);
  return cookie;
}

main();

