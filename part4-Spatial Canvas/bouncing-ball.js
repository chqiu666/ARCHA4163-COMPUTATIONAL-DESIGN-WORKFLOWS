var sketch2 = function(p) {
  let rects = [];
  let maxRects = 30; // 最多保留多少个矩形

  p.setup = function() {
    let canvas = p.createCanvas(800, 400);
    canvas.parent('canvas-container-2d-2');
    p.noStroke();
    p.frameRate(30);
  };

  p.draw = function() {
    p.background(245, 240, 235); // 柔和背景

    // 定期生成新矩形
    if (p.frameCount % 60 === 0) {
      rects.push(generateRothkoRect());
      if (rects.length > maxRects) {
        rects.shift(); // 删除最旧的
      }
    }

    // 绘制并更新
    for (let i = 0; i < rects.length; i++) {
      let r = rects[i];

      // 动画展开
      if (!r.expanded) {
        if (r.direction === 'left') {
          r.w += 10;
          if (r.w >= p.width * r.targetRatio) {
            r.w = p.width * r.targetRatio;
            r.expanded = true;
          }
        } else if (r.direction === 'right') {
          r.x -= 10;
          r.w += 10;
          if (r.w >= p.width * r.targetRatio) {
            r.x = p.width - p.width * r.targetRatio;
            r.w = p.width * r.targetRatio;
            r.expanded = true;
          }
        }
      }

      p.fill(...r.color, 190);
      p.rect(r.x, r.y, r.w, r.h);
    }
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
    ];

    let color = p.random(rothkoPalette);
    let isPrimary = p.random() < 0.4;
    let ratio = isPrimary ? p.random(0.7, 1.0) : p.random(0.05, 0.3);
    let direction = p.random(['left', 'right']);
    let h = p.random(p.height * 0.2, p.height * 0.9);
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
