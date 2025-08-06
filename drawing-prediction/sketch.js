// Global variables for handpose model
let handpose;
let video;
let predictions = [];

// Global variables for drawing
let isDrawing = false;
let strokePath = [];
let allStrokes = [];
let lastX = 0, lastY = 0;

// Global variables for SketchRNN
let sketchRNN;
let currentCategory = 'flower';
let currentStroke;
let x, y;
let nextPen = 'down';
let seedPath = [];
let isAIDrawing = false;

// Gesture recognition variables
let lastGesture = '';
let gestureStartTime = 0;
const GESTURE_DELAY = 500; // Reduced delay for better responsiveness

// Available SketchRNN categories
const categories = ['flower', 'cat', 'pig', 'face'];

function setup() {
    // Create canvas that fills the screen
    createCanvas(windowWidth, windowHeight);
    
    // Setup drawing context
    strokeWeight(3);
    stroke(51);
    noFill();
    
    // Initialize video capture
    video = createCapture(VIDEO);
    video.size(160, 120);
    video.hide(); // Hide the video element since we'll display it manually
    
    // Place video in the container
    video.parent('video-container');
    
    // Update status
    updateStatus('Loading hand tracking model...');
    
    // Initialize handpose model - use the same approach as working examples
    handpose = ml5.handpose(video, modelReady);
    
    // Set up handpose event listener
    handpose.on("predict", gotHands);
    
    // Load initial SketchRNN model
    loadSketchRNN(currentCategory);
    
    // Set initial drawing position
    x = width / 2;
    y = height / 2;
    
    // Set initial category as active
    selectCategory('flower');
}

function modelReady() {
    console.log("Handpose model ready!");
    updateStatus('Hand tracking ready! Show your hand to start drawing.');
    updateDebugInfo();
}

function gotHands(results) {
    predictions = results;
    
    if (predictions.length > 0) {
        const hand = predictions[0];
        analyzeGesture(hand);
    } else {
        if (isDrawing) {
            finishStroke();
        }
        updateGestureDisplay('No hand detected');
    }
    updateDebugInfo();
}

function analyzeGesture(hand) {
    // Use the same landmark access method as the working examples
    const landmarks = hand.landmarks;
    if (!landmarks || landmarks.length < 21) return;
    
    // Get key finger points - using same indices as working examples
    const indexTip = landmarks[8];
    const indexPip = landmarks[6]; 
    const thumbTip = landmarks[4];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const wrist = landmarks[0];
    
    // Calculate distances for gesture recognition
    const thumbIndexDist = dist(thumbTip[0], thumbTip[1], indexTip[0], indexTip[1]);
    const fingersUp = countFingersUp(landmarks);
    
    // Improved gesture detection with more stable thresholds
    let currentGesture = '';
    
    if (thumbIndexDist < 50) { // Slightly increased threshold for stability
        // Pinch gesture (thumb and index close)
        currentGesture = 'pinch';
        handlePinchGesture(indexTip[0], indexTip[1]);
    } else if (fingersUp >= 4) {
        // Open palm (4 or more fingers up)
        currentGesture = 'palm';
        handlePalmGesture();
    } else if (fingersUp === 1 && isIndexFingerUp(landmarks)) {
        // Index finger pointing - improved detection
        currentGesture = 'point';
        handlePointingGesture(indexTip[0], indexTip[1]);
    } else {
        currentGesture = 'none';
        if (isDrawing) {
            finishStroke();
        }
    }
    
    // Update gesture display
    const gestureNames = {
        'pinch': '🤏 Pinch (Click)',
        'palm': '✋ Open Palm (Clear)',
        'point': '👉 Pointing (Draw)',
        'none': '✊ No gesture'
    };
    
    updateGestureDisplay(gestureNames[currentGesture] || 'Detecting...');
    
    // Update gesture timing
    if (currentGesture !== lastGesture) {
        lastGesture = currentGesture;
        gestureStartTime = millis();
    }
}

function countFingersUp(landmarks) {
    let count = 0;
    
    // Thumb - check if tip is to the right of the middle joint (for right hand)
    if (landmarks[4][0] > landmarks[3][0]) count++;
    
    // Other fingers - check if tip is above the pip joint
    const fingerTips = [8, 12, 16, 20];
    const fingerPips = [6, 10, 14, 18];
    
    for (let i = 0; i < fingerTips.length; i++) {
        if (landmarks[fingerTips[i]][1] < landmarks[fingerPips[i]][1]) {
            count++;
        }
    }
    
    return count;
}

function isIndexFingerUp(landmarks) {
    // More accurate detection - index finger should be significantly higher than pip
    return landmarks[8][1] < landmarks[6][1] - 10;
}

function handlePointingGesture(fingerX, fingerY) {
    if (!isAIDrawing) {
        if (!isDrawing) {
            startDrawing(fingerX, fingerY);
        } else {
            continueDrawing(fingerX, fingerY);
        }
    }
}

function handlePinchGesture(fingerX, fingerY) {
    if (millis() - gestureStartTime > GESTURE_DELAY) {
        handleButtonClick(fingerX, fingerY);
    }
}

function handlePalmGesture() {
    if (millis() - gestureStartTime > GESTURE_DELAY) {
        clearCanvas();
    }
}

function handleButtonClick(x, y) {
    // Convert coordinates and check if over any button
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            button.click();
        }
    });
}

function startDrawing(x, y) {
    isDrawing = true;
    lastX = x;
    lastY = y;
    strokePath = [{dx: 0, dy: 0, pen: 'down'}];
    
    // Draw initial point
    beginShape();
    noFill();
    vertex(x, y);
}

function continueDrawing(x, y) {
    if (!isDrawing) return;
    
    // Add to stroke path for SketchRNN
    const dx = x - lastX;
    const dy = y - lastY;
    strokePath.push({dx: dx, dy: dy, pen: 'down'});
    
    // Draw line
    vertex(x, y);
    
    lastX = x;
    lastY = y;
}

function finishStroke() {
    if (!isDrawing) return;
    
    isDrawing = false;
    endShape();
    
    if (strokePath.length > 3) { // Reduced minimum stroke length
        // Add pen up at the end - follow exact format from working example
        strokePath[strokePath.length - 1].pen = 'up';
        seedPath = seedPath.concat(strokePath);
        allStrokes.push(strokePath);
        
        // Trigger AI completion after fewer strokes for better interaction
        if (allStrokes.length >= 1 && sketchRNN && !isAIDrawing) {
            generateAICompletion();
        }
    }
    strokePath = [];
}

function generateAICompletion() {
    if (!sketchRNN || isAIDrawing) return;
    
    updateStatus('Generating AI completion...');
    isAIDrawing = true;
    
    // Use current drawing position
    x = lastX || width / 2;
    y = lastY || height / 2;
    
    // Generate from seed path - use the exact API from working example
    if (seedPath.length > 0) {
        sketchRNN.generate(seedPath, gotStrokePath);
    } else {
        // Generate from scratch if no seed
        sketchRNN.generate(gotStrokePath);
    }
}

function gotStrokePath(error, strokePath) {
    if (error) {
        console.error('SketchRNN error:', error);
        isAIDrawing = false;
        updateStatus('AI generation failed. Continue drawing!');
        return;
    }
    
    currentStroke = strokePath;
}

function loadSketchRNN(category) {
    updateStatus(`Loading ${category} model...`);
    
    // Load SketchRNN model - exact same API as working example
    sketchRNN = ml5.sketchRNN(category, sketchRNNReady);
}

function sketchRNNReady() {
    console.log(`SketchRNN ${currentCategory} model loaded!`);
    updateStatus(`Ready! ${currentCategory} AI model loaded. Show your hand to start drawing.`);
    updateDebugInfo();
}

function draw() {
    background(255);
    
    // Draw all completed strokes
    stroke(51);
    strokeWeight(3);
    for (let stroke of allStrokes) {
        drawStrokeData(stroke, false);
    }
    
    // Draw current stroke if drawing
    if (isDrawing && strokePath.length > 0) {
        stroke(51);
        strokeWeight(3);
        drawStrokeData(strokePath, true);
    }
    
    // Draw AI-generated strokes - exactly like working SketchRNN example
    if (currentStroke && isAIDrawing) {
        // Set AI stroke style
        stroke(255, 100, 100);
        strokeWeight(2);
        
        if (nextPen === "end") {
            isAIDrawing = false;
            updateStatus('AI completion finished! Continue drawing or clear to start over.');
            currentStroke = null;
            return;
        }

        if (nextPen === "down") {
            line(x, y, x + currentStroke.dx, y + currentStroke.dy);
        }

        x += currentStroke.dx;
        y += currentStroke.dy;
        nextPen = currentStroke.pen;
        currentStroke = null;
        
        // Continue generating - same pattern as working example
        if (sketchRNN) {
            sketchRNN.generate(gotStrokePath);
        }
    }
    
    // Draw hand landmarks if hand is detected
    if (predictions.length > 0) {
        drawHandLandmarks(predictions[0]);
    }
}

function drawStrokeData(strokeData, isCurrentStroke) {
    if (strokeData.length === 0) return;
    
    beginShape();
    noFill();
    
    let px = isCurrentStroke ? (lastX - strokeData.reduce((sum, s) => sum + s.dx, 0)) : x;
    let py = isCurrentStroke ? (lastY - strokeData.reduce((sum, s) => sum + s.dy, 0)) : y;
    
    vertex(px, py);
    
    for (let point of strokeData) {
        px += point.dx;
        py += point.dy;
        if (point.pen === 'down') {
            vertex(px, py);
        } else {
            endShape();
            beginShape();
            vertex(px, py);
        }
    }
    endShape();
}

function drawHandLandmarks(hand) {
    const landmarks = hand.landmarks;
    
    // Draw index fingertip like in the working example
    if (landmarks && landmarks.length > 8) {
        const indexTip = landmarks[8];
        fill(255, 0, 0);
        noStroke();
        ellipse(indexTip[0], indexTip[1], 10, 10);
        
        // Also draw thumb tip for gesture debugging
        const thumbTip = landmarks[4];
        fill(0, 255, 0);
        ellipse(thumbTip[0], thumbTip[1], 8, 8);
    }
}

function selectCategory(category) {
    currentCategory = category;
    
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Clear current drawing when switching categories
    clearCanvas();
    
    // Load new SketchRNN model
    loadSketchRNN(currentCategory);
}

function clearCanvas() {
    allStrokes = [];
    strokePath = [];
    seedPath = [];
    isDrawing = false;
    isAIDrawing = false;
    currentStroke = null;
    nextPen = 'down';
    x = width / 2;
    y = height / 2;
    updateStatus('Canvas cleared!');
}

function retrySetup() {
    updateStatus('Retrying camera setup...');
    
    // Reset variables
    predictions = [];
    isDrawing = false;
    isAIDrawing = false;
    
    // Try to reinitialize
    setTimeout(() => {
        if (video) {
            handpose = ml5.handpose(video, modelReady);
            handpose.on("predict", gotHands);
        }
    }, 1000);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// Utility functions
function updateStatus(message) {
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent = message;
    }
    console.log('Status:', message);
}

function updateGestureDisplay(gesture) {
    const gestureElement = document.getElementById('gesture');
    if (gestureElement) {
        gestureElement.textContent = gesture;
    }
}

function updateDebugInfo() {
    const debugElement = document.getElementById('debug');
    if (!debugElement) return;
    
    const cameraStatus = video && video.elt && video.elt.readyState === 4 ? 'Ready' : 'Not ready';
    const handposeStatus = handpose ? 'Loaded' : 'Not loaded';
    const sketchRNNStatus = sketchRNN ? 'Loaded' : 'Loading...';
    const handsDetected = predictions.length > 0 ? 'Yes' : 'No';
    
    debugElement.innerHTML = `
        Camera: ${cameraStatus}<br>
        HandPose: ${handposeStatus}<br>
        SketchRNN: ${sketchRNNStatus}<br>
        Category: ${currentCategory}<br>
        Hands: ${handsDetected}<br>
        Strokes: ${allStrokes.length}
    `;
}