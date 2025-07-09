var sketch2 = function(p) {
  let rects = [];
  let maxRects = 30;

  p.setup = function() {
    let canvas = p.createCanvas(800, 400);
    canvas.parent('canvas-container-2d-2');
    p.noStroke();
    p.frameRate(30);
  };

  p.draw = function() {
    p.background(164,19,29); // 柔和背景

    // 绘制所有矩形
    for (let i = 0; i < rects.length; i++) {
      let r = rects[i];

      // 动画展开
      if (!r.expanded) {
        if (r.direction === 'left') {
          r.w += 4;
          if (r.w >= p.width * r.targetRatio) {
            r.w = p.width * r.targetRatio;
            r.expanded = true;
          }
        } else if (r.direction === 'right') {
          r.x -= 4;
          r.w += 4;
          if (r.w >= p.width * r.targetRatio) {
            r.x = p.width - p.width * r.targetRatio;
            r.w = p.width * r.targetRatio;
            r.expanded = true;
          }
        }
      }

      p.fill(...r.color, 220); // 降低透明度，更贴近 Rothko
      p.rect(r.x, r.y, r.w, r.h);
    }
  };

  // 交互添加矩形
  p.mousePressed = function() {
    if (rects.length >= maxRects) {
      rects.shift();
    }
    rects.push(generateRothkoRect());
  };

  function generateRothkoRect() {
    const rothkoPalette = [
      [180, 40, 40],
      [240, 180, 50],
      [70, 60, 130],
      [200, 90, 40],
      [90, 10, 10],
      [255, 200, 160],
      [40, 20, 60],
      [120, 60, 30],
      [30, 20, 10],
    ];

    let color = p.random(rothkoPalette);
    let isPrimary = p.random() < 0.5;
    let ratio = isPrimary ? p.random(0.9, 1.0) : p.random(0.75, 0.86);
    let direction = p.random(['left', 'right']);
    let h = p.random(p.height * 0.3, p.height * 0.9);
    let y = p.random(p.height - h);

    return {
      x: direction === 'left' ? 0 : p.width,
      y: y,
      w: 0,
      h: h,
      direction: direction,
      color: color,
      targetRatio: ratio,
      expanded: false
    };
  }
};

// Create the instance
var myp5_2 = new p5(sketch2, 'canvas-container-2d-2');
