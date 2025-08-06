//variable for handpose ml model
let handpose;
//variable to store the video feed
let video;
//array for hand point predictions
let predictions = [];
function setup() {
  // create the canvas
 createCanvas(640, 480);
  /* capture the video feed and set it to the width and height of the current canvas */
 video = createCapture(VIDEO);
 video.size(width, height);

  /* print to let us know that handpose model (which is initialized on the next line) is loading */
  print("loading")
  // call modelReady() when it is loaded
  handpose = ml5.handpose(video, modelReady);
  // Hide the video element, and just show the canvas
  video.hide();
}
// when the model is ready, a message appears in the console and it predicts where each landmark should be placed
function modelReady() {
  console.log("Model ready!");
    // when handpose is ready, do the detection
    handpose.on("predict", function(results) {
    predictions = results;
  });
  //calls the handpose.predict method on img to predict landmarks and fingers
  handpose.predict(video);
}
function draw() {
  // render the video feed
  image(video, 0, 0, width, height);
  // We can call a function to draw using the keypoints
  drawObject();
}
// A function to draw a ball at the tip of the finger
function drawObject() {
  if (predictions.length > 0) {
    let prediction = predictions[0];
    let x = prediction.annotations.indexFinger[3][0]
    let y = prediction.annotations.indexFinger[3][1]
    print(prediction, x, y)
    noStroke();   
    // Access the tip of the finger in the last element of the finger.points list (element with index 3) and draw the ellipse using its x-y coordinates and round them to the nearest integer
    ellipse(round(x), round(y), 33, 33);
  }
}