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

// Gesture recognition variables - simplified
let lastGesture = '';
let gestureStartTime = 0;
const GESTURE_DELAY = 300; // Reduced for better responsiveness

// Coordinate smoothing variables
let smoothedX = 0, smoothedY = 0;
let coordHistory = [];
const SMOOTH_FACTOR = 0.3; // Higher = more smoothing
const HISTORY_LENGTH = 5;

// Video to canvas mapping variables
let videoScaleX = 1, videoScaleY = 1;
let videoOffsetX = 0, videoOffsetY = 0;

// Available SketchRNN categories
const categories = ['flower', 'cat', 'pig', 'face'];

function setup() {
    // Create canvas that fills the screen
    createCanvas(windowWidth, windowHeight);
    
    // Setup drawing context
    strokeWeight(3);
    stroke(51);
    noFill();
    
    // Initialize video capture with proper settings
    video = createCapture(VIDEO);
    video.size(160, 120);
    video.hide(); // Hide the video element since we'll display it manually
    
    // Calculate video to canvas mapping - fix coordinate system
    calculateVideoMapping();
    
    // Place video in the container
    video.parent('video-container');
    
    // Update status
    updateStatus('Loading hand tracking model...');
    
    // Initialize handpose model with optimized settings
    handpose = ml5.handpose(video, {
        flipHorizontal: true, // Mirror the video to match natural gestures
        maxContinuousChecks: Infinity,
        detectionConfidence: 0.8,
        scoreThreshold: 0.75,
        iouThreshold: 0.3
    }, modelReady);
    
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

function calculateVideoMapping() {
    // Calculate scale factors to map video coordinates to canvas coordinates
    videoScaleX = width / 160; // video width is 160
    videoScaleY = height / 120; // video height is 120
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
    
    // Map video coordinates to canvas coordinates and apply mirroring
    const mappedIndexX = (160 - indexTip[0]) * videoScaleX; // Flip horizontally
    const mappedIndexY = indexTip[1] * videoScaleY;
    
    // Apply coordinate smoothing to reduce jitter
    const smoothedCoords = smoothCoordinates(mappedIndexX, mappedIndexY);
    
    // Count fingers up for gesture detection
    const fingersUp = countFingersUp(landmarks);
    
    // Simplified gesture detection - only two states
    let currentGesture = '';
    
    if (fingersUp === 1 && isIndexFingerUp(landmarks)) {
        // Index finger pointing - drawing mode
        currentGesture = 'point';
        handlePointingGesture(smoothedCoords.x, smoothedCoords.y);
    } else if (fingersUp >= 4) {
        // Open palm - clear mode (but only through button)
        currentGesture = 'palm';
        if (isDrawing) {
            finishStroke();
        }
    } else {
        // Any other gesture - stop drawing
        currentGesture = 'none';
        if (isDrawing) {
            finishStroke();
        }
    }
    
    // Update gesture display - simplified
    const gestureNames = {
        'point': '👉 Drawing Mode',
        'palm': '✋ Open Palm',
        'none': '✊ Not Drawing'
    };
    
    updateGestureDisplay(gestureNames[currentGesture] || 'Detecting...');
    
    // Update gesture timing
    if (currentGesture !== lastGesture) {
        lastGesture = currentGesture;
        gestureStartTime = millis();
    }
}

function smoothCoordinates(x, y) {
    // Add current coordinates to history
    coordHistory.push({x: x, y: y});
    
    // Keep only recent history
    if (coordHistory.length > HISTORY_LENGTH) {
        coordHistory.shift();
    }
    
    // Calculate smoothed coordinates using exponential moving average
    if (coordHistory.length > 0) {
        smoothedX = smoothedX * (1 - SMOOTH_FACTOR) + x * SMOOTH_FACTOR;
        smoothedY = smoothedY * (1 - SMOOTH_FACTOR) + y * SMOOTH_FACTOR;
    } else {
        smoothedX = x;
        smoothedY = y;
    }
    
    return {x: smoothedX, y: smoothedY};
}

function countFingersUp(landmarks) {
    let count = 0;
    
    // Thumb - check if tip is to the left of the middle joint (for mirrored view)
    if (landmarks[4][0] < landmarks[3][0]) count++;
    
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
    return landmarks[8][1] < landmarks[6][1] - 15; // Increased threshold for stability
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

// Remove pinch gesture handling - no more clicking with gestures

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
    
    // Only draw if movement is significant to reduce noise
    const minMovement = 3;
    if (dist(x, y, lastX, lastY) < minMovement) return;
    
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
    
    // Draw index fingertip with mapped coordinates
    if (landmarks && landmarks.length > 8) {
        const indexTip = landmarks[8];
        
        // Map and mirror coordinates
        const mappedX = (160 - indexTip[0]) * videoScaleX;
        const mappedY = indexTip[1] * videoScaleY;
        
        fill(255, 0, 0);
        noStroke();
        ellipse(mappedX, mappedY, 15, 15);
        
        // Also draw thumb tip for gesture debugging
        const thumbTip = landmarks[4];
        const mappedThumbX = (160 - thumbTip[0]) * videoScaleX;
        const mappedThumbY = thumbTip[1] * videoScaleY;
        
        fill(0, 255, 0);
        ellipse(mappedThumbX, mappedThumbY, 12, 12);
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
    // Clear coordinate history to avoid artifacts
    coordHistory = [];
    smoothedX = 0;
    smoothedY = 0;
    updateStatus('Canvas cleared!');
}

function retrySetup() {
    updateStatus('Retrying camera setup...');
    
    // Reset variables
    predictions = [];
    isDrawing = false;
    isAIDrawing = false;
    coordHistory = [];
    smoothedX = 0;
    smoothedY = 0;
    
    // Try to reinitialize
    setTimeout(() => {
        if (video) {
            handpose = ml5.handpose(video, {
                flipHorizontal: true,
                maxContinuousChecks: Infinity,
                detectionConfidence: 0.8,
                scoreThreshold: 0.75,
                iouThreshold: 0.3
            }, modelReady);
            handpose.on("predict", gotHands);
        }
    }, 1000);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    calculateVideoMapping(); // Recalculate mapping when window resizes
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
        Strokes: ${allStrokes.length}<br>
        Coordinates: (${Math.round(smoothedX)}, ${Math.round(smoothedY)})
    `;
}