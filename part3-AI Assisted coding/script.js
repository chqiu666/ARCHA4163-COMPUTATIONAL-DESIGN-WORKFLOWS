let blocks = [];
let selectedBlock = null;
let isDragging = false;
let isScaling = false;
let scalingTarget = null;
let pressStartTime = 0;
let pressStartPos = null;

const palette = [
  [215, 38, 56],   // Red
  [0, 0, 0],       // Black
  [255, 255, 255], // White
  [244, 195, 0],   // Yellow
  [36, 70, 142],   // Blue
  [160, 160, 160]  // Gray
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  angleMode(RADIANS);
  noStroke();

  for (let i = 0; i < 8; i++) {
    blocks.push(generateRandomBlock(random(width), random(height)));
  }
}

function draw() {
  background(240);

  for (let b of blocks) {
    push();
    translate(b.x, b.y);
    rotate(b.angle);
    fill(b.color);
    rect(0, 0, b.w, b.h);
    pop();

    b.angle += b.rotationSpeed;
  }

  if (selectedBlock && !isDragging && !isScaling) {
    if (millis() - pressStartTime > 600) {
      isScaling = true;
      scalingTarget = selectedBlock;
    }
  }

  if (isScaling && scalingTarget) {
    scalingTarget.w *= 1.01;
    scalingTarget.h *= 1.01;
  }
}

function mousePressed() {
  selectedBlock = getBlockUnderMouse();
  isDragging = false;
  isScaling = false;
  scalingTarget = null;
  pressStartTime = millis();
  pressStartPos = createVector(mouseX, mouseY);
}

function mouseDragged() {
  if (selectedBlock) {
    let moved = dist(mouseX, mouseY, pressStartPos.x, pressStartPos.y);
    if (moved > 5) {
      isDragging = true;
      isScaling = false;
      scalingTarget = null;
      selectedBlock.x = mouseX;
      selectedBlock.y = mouseY;
    }
  }
}

function mouseReleased() {
  selectedBlock = null;
  isDragging = false;
  isScaling = false;
  scalingTarget = null;
}

function doubleClicked() {
  let b = getBlockUnderMouse();
  if (b) {
    blocks = blocks.filter(x => x !== b);
  }
}

function mouseClicked() {
  if (!getBlockUnderMouse()) {
    blocks.push(generateRandomBlock(mouseX, mouseY));
  }
}

function generateRandomBlock(x, y) {
  let w = random(80, 280);
  let h = random(40, 180);
  let angle = random(-PI / 4, PI / 4);
  let col = color(...random(palette));
  let rotationSpeed = random(-0.005, 0.005);
  return { x, y, w, h, angle, color: col, rotationSpeed };
}

function getBlockUnderMouse() {
  for (let i = blocks.length - 1; i >= 0; i--) {
    let b = blocks[i];
    let dx = mouseX - b.x;
    let dy = mouseY - b.y;
    let angle = -b.angle;
    let rx = dx * cos(angle) - dy * sin(angle);
    let ry = dx * sin(angle) + dy * cos(angle);
    if (abs(rx) <= b.w / 2 && abs(ry) <= b.h / 2) {
      return b;
    }
  }
  return null;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function hideTitle() {
  const h1 = document.querySelector(".typography h1");
  if (h1) h1.style.display = "none";
}
