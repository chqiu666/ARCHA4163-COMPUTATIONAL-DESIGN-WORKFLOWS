var sketch1 = function(p) {
  var canvasWidth = 800;
  var canvasHeight = 400;
  var gridSpacing = 40;
  var canvas;
  var palette;

  p.setup = function() {
    canvas = p.createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container-2d-1');
    // 定义调色板
    palette = [
      p.color(220, 190, 170),  // warm beige
      p.color(180, 200, 220),  // light blue-gray
      p.color(120, 100, 90),   // muted brown
      p.color(200, 80, 60),    // deep red
      p.color(80, 90, 100),    // cool gray
      p.color(255, 255, 255, 40) // translucent white
    ];
    generateArt();
  };

  // p.draw = function() {
  //   p.background(250);
  //   //drawGrid();
  //   generateArt();
  // };

  function drawGrid() {
    // ...existing code...
  }

  function generateArt() {
    p.noStroke();
    p.rectMode(p.CENTER);
    
    for (let i = 0; i < 40; i++) {
      let w = p.random(60, 160);
      let h = p.random(40, 120);
      let x = p.random(p.width);
      let y = p.random(p.height);
      let angle = p.random([-p.QUARTER_PI, 0, p.HALF_PI]);

      p.push();
      p.translate(x, y);
      p.rotate(angle);
      p.fill(palette[Math.floor(p.random(palette.length))]);
      p.rect(0, 0, w, h);
      p.pop();
    }
  }
};

// Create the instance
var myp5_1 = new p5(sketch1, 'canvas-container-2d-1');