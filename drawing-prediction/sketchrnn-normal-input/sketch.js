// SketchRNN Drawing Prediction Application
// Inspired by Google's demo with enhanced features

// Global variables
let model;
let modelName = 'cat';
let modelLoaded = false;
let isDrawing = false;
let isPaused = false;

// Drawing state variables
let x, y; // Current position
let dx, dy; // Deltas (offsets)
let pen_down, pen_up, pen_end; // Pen states
let prev_pen = [1, 0, 0]; // Previous pen state
let rnn_state; // RNN hidden state
let pdf; // Probability distribution function

// Drawing parameters
let temperature = 0.5;
let drawingSpeed = 60; // fps
let strokeWidth = 2;
let drawingScale = 1.0;
let currentColor;
let randomColors = false;
let showStartPoint = true;

// Canvas and UI variables
let canvasWidth = 800;
let canvasHeight = 600;
let strokeCount = 0;
let startX, startY;

// Model list for easy access
const availableModels = [
    'cat', 'dog', 'bird', 'butterfly', 'flower', 'face', 'tree', 'house', 'car', 'spider',
    'elephant', 'lion', 'tiger', 'bear', 'frog', 'fish', 'whale', 'dolphin', 'owl', 'bee',
    'ant', 'octopus', 'crab', 'lobster', 'penguin', 'flamingo', 'parrot', 'duck', 'swan',
    'rabbit', 'squirrel', 'hedgehog', 'pig', 'sheep', 'cow', 'horse', 'kangaroo'
];

// Color palettes for random colors
const colorPalettes = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#B19CD9',
    '#FFD93D', '#6BCF7F', '#FF8A65', '#A8E6CF', '#FF7E79', '#87CEEB'
];

function setup() {
    // Create canvas with proper sizing
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('p5-container');
    
    // Set initial drawing properties
    background(255);
    frameRate(drawingSpeed);
    
    // Initialize UI
    initializeUI();
    
    // Load initial model
    loadModel(modelName);
    
    // Set initial position to center
    startX = x = canvasWidth / 2;
    startY = y = canvasHeight / 3;
    
    // Set initial color
    currentColor = color('#2196F3');
}

function draw() {
    // Only draw if model is loaded and drawing is active
    if (!modelLoaded || !isDrawing || isPaused) {
        return;
    }
    
    // Check if drawing is finished
    if (prev_pen[2] == 1) {
        stopDrawing();
        return;
    }
    
    // Update RNN state with current pen states
    rnn_state = model.update([dx, dy, pen_down, pen_up, pen_end], rnn_state);
    
    // Get probability distribution from RNN state
    pdf = model.getPDF(rnn_state, temperature);
    
    // Sample next pen states from probability distribution
    [dx, dy, pen_down, pen_up, pen_end] = model.sample(pdf);
    
    // Apply scaling factor
    dx *= drawingScale;
    dy *= drawingScale;
    
    // Draw line if pen is down
    if (prev_pen[0] == 1) {
        // Set stroke properties
        if (randomColors) {
            currentColor = color(random(colorPalettes));
        }
        stroke(currentColor);
        strokeWeight(strokeWidth);
        strokeCap(ROUND);
        strokeJoin(ROUND);
        
        // Draw line from previous to current position
        line(x, y, x + dx, y + dy);
        
        strokeCount++;
    }
    
    // Update position
    x += dx;
    y += dy;
    
    // Update previous pen state
    prev_pen = [pen_down, pen_up, pen_end];
    
    // Update UI
    updateStatus();
}

function loadModel(modelName) {
    setLoadingState(true);
    updateStatus('Loading model...', modelName);
    
    // Clear previous drawing
    clearCanvas();
    
    const modelUrl = `https://storage.googleapis.com/quickdraw-models/sketchRNN/large_models/${modelName}.gen.json`;
    
    model = new ms.SketchRNN(modelUrl);
    
    // Wait for model to load
    const checkModelLoaded = () => {
        if (model.isLoaded()) {
            modelLoaded = true;
            setLoadingState(false);
            initializeDrawingState();
            updateStatus('Ready', modelName);
            console.log(`Model ${modelName} loaded successfully`);
        } else {
            setTimeout(checkModelLoaded, 100);
        }
    };
    
    checkModelLoaded();
}

function initializeDrawingState() {
    // Set pixel factor for proper scaling
    model.setPixelFactor(2.0);
    
    // Initialize pen states
    [dx, dy, pen_down, pen_up, pen_end] = model.zeroInput();
    
    // Reset RNN state
    rnn_state = model.zeroState();
    
    // Reset drawing state
    isDrawing = false;
    isPaused = false;
    strokeCount = 0;
    
    // Reset position
    x = startX;
    y = startY;
    
    // Reset previous pen state
    prev_pen = [1, 0, 0];
}

function startDrawing() {
    if (!modelLoaded) {
        alert('Please wait for the model to load!');
        return;
    }
    
    clearCanvas();
    initializeDrawingState();
    
    isDrawing = true;
    isPaused = false;
    
    // Show start point if enabled
    if (showStartPoint) {
        drawStartPoint();
    }
    
    updateButtons();
    updateStatus('Drawing...', modelName);
}

function pauseDrawing() {
    isPaused = !isPaused;
    updateButtons();
    updateStatus(isPaused ? 'Paused' : 'Drawing...', modelName);
}

function stopDrawing() {
    isDrawing = false;
    isPaused = false;
    updateButtons();
    updateStatus('Finished', modelName);
}

function clearCanvas() {
    background(255);
    strokeCount = 0;
    if (showStartPoint && modelLoaded) {
        drawStartPoint();
    }
    updateStatus();
}

function drawStartPoint() {
    push();
    fill(color('#FF4444'));
    noStroke();
    circle(startX, startY, 8);
    fill(255);
    circle(startX, startY, 4);
    pop();
}

function generateRandomDrawing() {
    // Select random model
    const randomModel = random(availableModels);
    document.getElementById('modelSelect').value = randomModel;
    
    // Randomize some parameters
    temperature = random(0.2, 0.8);
    document.getElementById('temperatureSlider').value = temperature;
    document.getElementById('tempValue').textContent = temperature.toFixed(2);
    
    drawingScale = random(0.8, 1.5);
    document.getElementById('scaleSlider').value = drawingScale;
    document.getElementById('scaleValue').textContent = drawingScale.toFixed(1);
    
    // Load new model and start drawing
    modelName = randomModel;
    loadModel(modelName);
    
    // Start drawing after a short delay
    setTimeout(() => {
        if (modelLoaded) {
            startDrawing();
        }
    }, 1000);
}

function saveImage() {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    save(`sketchrnn_${modelName}_${timestamp}.png`);
}

function setLoadingState(loading) {
    const overlay = document.querySelector('.canvas-overlay');
    if (loading) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

function updateButtons() {
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    
    startBtn.disabled = !modelLoaded || isDrawing;
    pauseBtn.disabled = !isDrawing;
    
    if (isPaused) {
        pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
    } else {
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    }
}

function updateStatus(state = null, model = null) {
    if (state) {
        document.getElementById('drawingState').textContent = state;
    }
    if (model) {
        document.getElementById('currentModel').textContent = model.charAt(0).toUpperCase() + model.slice(1);
    }
    document.getElementById('strokeCount').textContent = strokeCount;
}

function initializeUI() {
    // Model selection
    const modelSelect = document.getElementById('modelSelect');
    modelSelect.innerHTML = '';
    availableModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model.charAt(0).toUpperCase() + model.slice(1);
        modelSelect.appendChild(option);
    });
    modelSelect.value = modelName;
    
    // Event listeners for controls
    modelSelect.addEventListener('change', (e) => {
        modelName = e.target.value;
        loadModel(modelName);
    });
    
    document.getElementById('temperatureSlider').addEventListener('input', (e) => {
        temperature = parseFloat(e.target.value);
        document.getElementById('tempValue').textContent = temperature.toFixed(2);
    });
    
    document.getElementById('speedSlider').addEventListener('input', (e) => {
        drawingSpeed = parseInt(e.target.value);
        frameRate(drawingSpeed);
        document.getElementById('speedValue').textContent = drawingSpeed;
    });
    
    document.getElementById('strokeWidth').addEventListener('input', (e) => {
        strokeWidth = parseFloat(e.target.value);
        document.getElementById('strokeValue').textContent = strokeWidth;
    });
    
    document.getElementById('scaleSlider').addEventListener('input', (e) => {
        drawingScale = parseFloat(e.target.value);
        document.getElementById('scaleValue').textContent = drawingScale.toFixed(1);
    });
    
    document.getElementById('colorPicker').addEventListener('change', (e) => {
        currentColor = color(e.target.value);
    });
    
    document.getElementById('randomColors').addEventListener('change', (e) => {
        randomColors = e.target.checked;
    });
    
    document.getElementById('showStartPoint').addEventListener('change', (e) => {
        showStartPoint = e.target.checked;
        if (showStartPoint && !isDrawing) {
            drawStartPoint();
        } else if (!showStartPoint) {
            clearCanvas();
        }
    });
    
    // Button event listeners
    document.getElementById('startBtn').addEventListener('click', startDrawing);
    document.getElementById('pauseBtn').addEventListener('click', pauseDrawing);
    document.getElementById('clearBtn').addEventListener('click', clearCanvas);
    document.getElementById('randomBtn').addEventListener('click', generateRandomDrawing);
    document.getElementById('saveBtn').addEventListener('click', saveImage);
    
    // Initial UI update
    updateButtons();
    updateStatus('Initializing...', 'Loading');
}

// Utility functions for better user experience
function windowResized() {
    // Keep canvas size consistent
    resizeCanvas(canvasWidth, canvasHeight);
}

// Keyboard shortcuts
function keyPressed() {
    switch (key.toLowerCase()) {
        case ' ':
            if (isDrawing) {
                pauseDrawing();
            } else {
                startDrawing();
            }
            break;
        case 'c':
            clearCanvas();
            break;
        case 'r':
            generateRandomDrawing();
            break;
        case 's':
            saveImage();
            break;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('SketchRNN Drawing Prediction initialized');
    console.log('Keyboard shortcuts: SPACE (start/pause), C (clear), R (random), S (save)');
});