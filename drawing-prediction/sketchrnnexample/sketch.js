let sketchRNN
let currentStroke
let x, y
let nextPen = 'down'
let seedPath = []
let personDrawing = false

function preload() {
  sketchRNN = ml5.sketchRNN('bird')
  //type in the 'quotation' box an object you want to draw, for example: bird, cat, dog, flower, and the sketchRNN will try to finish it for you
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
  let canvas = createCanvas(400, 400);
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