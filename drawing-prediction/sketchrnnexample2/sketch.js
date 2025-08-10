let sketchRNN
let currentStroke
let x, y
let nextPen = 'down'
let seedPath = []
let personDrawing = false
let currentModel = 'bird'

function preload() {
  sketchRNN = ml5.sketchRNN(currentModel)
  //type in the 'quotation' box an object you want to draw, for example: bird, cat, dog, flower, and the sketchRNN will try to finish it for you
}

function switchModel(modelName) {
  currentModel = modelName
  sketchRNN = ml5.sketchRNN(modelName)
  console.log('切换到模型:', modelName)
  
  // 更新按钮状态
  document.querySelectorAll('.model-btn').forEach(btn => btn.classList.remove('active'))
  document.getElementById(modelName + '-btn').classList.add('active')
  
  restartDrawing()
}

function restartDrawing() {
  background(255)
  seedPath = []
  currentStroke = null
  nextPen = 'down'
  personDrawing = false
  x = width / 2
  y = height / 2
  loop()
  console.log('重新开始绘制')
}

function startDrawing() {
  personDrawing = true
  x = mouseX
  y = mouseY
}

function sketchRNNStart() {
  personDrawing = false
  sketchRNN.generate(seedPath,gotStrokePath);
}

function setup() {
  let canvas = createCanvas(1920, 1080);
  canvas.mousePressed(startDrawing)
  canvas.mouseReleased(sketchRNNStart)
  console.log("model.loaded")
  //sketchRNN.generate(gotStrokePath);
 // x = width / 2
 // y = height / 2
  background(255)
}

function draw() {

  stroke(0)
  strokeWeight(4)

  //background(220);
  if (personDrawing) {
    let strokePath = {
      dx: mouseX - pmouseX,
      dy: mouseY - pmouseY,
      pen: 'down'
    }
    line(x, y, x + strokePath.dx, y + strokePath.dy)
    x += strokePath.dx
    y += strokePath.dy

    seedPath.push(strokePath)
  }

  if (currentStroke) {


    if (nextPen == "end") {
      noLoop()
      return;
    }

    if (nextPen == "down") {
      line(x, y, x + currentStroke.dx, y + currentStroke.dy)
    }

    x += currentStroke.dx
    y += currentStroke.dy
    nextPen = currentStroke.pen
    currentStroke = null
    sketchRNN.generate(gotStrokePath);
  }
}

function gotStrokePath(error, strokePath) {
  console.log(strokePath);
  currentStroke = strokePath
}