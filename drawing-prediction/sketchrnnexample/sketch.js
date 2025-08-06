// SketchRNN AI Drawing Studio - Enhanced Version
// Based on the official Magenta.js SketchRNN demo with modern improvements

// Global variables
let sketchRNN;
let currentStroke;
let seedPath = [];
let currentModel = 'bird';
let temperature = 0.5;
let isDrawing = false;
let isAIDrawing = false;
let strokeCount = 0;
let pen = 'down';
let x, y;
let canvas;

// Drawing state
let allStrokes = [];
let currentPath = [];

// UI state
let sidebarCollapsed = false;
let instructionsVisible = true;

// Available models with their proper names
const availableModels = [
    'bird', 'cat', 'dog', 'flower', 'face', 'pig', 
    'ant', 'bus', 'fish', 'house', 'tree', 'butterfly',
    'apple', 'bear', 'bicycle', 'book', 'car', 'circle',
    'cloud', 'elephant', 'guitar', 'monkey', 'moon', 'star'
];

function preload() {
    console.log('Preloading SketchRNN model:', currentModel);
    updateStatus('Loading AI model...', 'loading');
    loadModel(currentModel);
}

function setup() {
    // Calculate canvas size for full screen (leaving space for sidebar)
    let canvasWidth = windowWidth - (sidebarCollapsed ? 40 : 300);
    let canvasHeight = windowHeight - 40;
    
    // Ensure minimum canvas size
    canvasWidth = max(canvasWidth, 400);
    canvasHeight = max(canvasHeight, 400);
    
    // Create canvas and attach to specific container
    canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    
    // Set up drawing event handlers
    canvas.mousePressed(startDrawing);
    canvas.mouseReleased(stopDrawing);
    canvas.touchStarted(startDrawing);
    canvas.touchEnded(stopDrawing);
    
    // Initial setup
    background(255);
    stroke(0);
    strokeWeight(3);
    fill(0);
    
    // Initialize UI
    updateModelDisplay();
    updateStrokeCount();
    updateDrawingStatus('Ready to draw');
    
    console.log('Canvas setup complete:', canvasWidth, 'x', canvasHeight);
}

function draw() {
    // Handle user drawing
    if (isDrawing && mouseIsPressed) {
        handleUserDrawing();
    }
    
    // Handle AI drawing
    if (isAIDrawing && currentStroke) {
        handleAIDrawing();
    }
}

function handleUserDrawing() {
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        let strokeData = {
            dx: mouseX - pmouseX,
            dy: mouseY - pmouseY,
            pen: 'down'
        };
        
        // Draw the line
        line(pmouseX, pmouseY, mouseX, mouseY);
        
        // Add to current path
        currentPath.push(strokeData);
        seedPath.push(strokeData);
        
        // Update drawing position
        x = mouseX;
        y = mouseY;
    }
}

function handleAIDrawing() {
    if (!currentStroke) return;
    
    // Handle different pen states
    if (currentStroke.pen === 'end') {
        finishAIDrawing();
        return;
    }
    
    if (currentStroke.pen === 'down') {
        // Draw the AI stroke
        stroke(200, 0, 0); // Red color for AI strokes
        strokeWeight(2);
        line(x, y, x + currentStroke.dx, y + currentStroke.dy);
        
        // Reset to black for user strokes
        stroke(0);
        strokeWeight(3);
    }
    
    // Update position
    x += currentStroke.dx;
    y += currentStroke.dy;
    
    // Clear current stroke and request next one
    currentStroke = null;
    
    // Continue AI drawing
    if (sketchRNN && isAIDrawing) {
        sketchRNN.generate(gotStrokePath);
    }
}

function startDrawing() {
    if (!sketchRNN) {
        console.log('Model not loaded yet');
        return false;
    }
    
    isDrawing = true;
    isAIDrawing = false;
    currentPath = [];
    x = mouseX;
    y = mouseY;
    
    updateDrawingStatus('Drawing...');
    return false; // Prevent default
}

function stopDrawing() {
    if (!isDrawing) return;
    
    isDrawing = false;
    
    if (currentPath.length > 0) {
        allStrokes.push([...currentPath]);
        strokeCount++;
        updateStrokeCount();
        
        // Start AI completion after a short delay
        setTimeout(() => {
            if (seedPath.length > 3 && sketchRNN) {
                startAIDrawing();
            }
        }, 500);
    }
    
    updateDrawingStatus('AI completing...');
    return false; // Prevent default
}

function startAIDrawing() {
    if (!sketchRNN || isAIDrawing) return;
    
    isAIDrawing = true;
    updateDrawingStatus('AI drawing...');
    
    // Create a copy of the seed path for the AI
    let aiSeedPath = seedPath.map(stroke => ({
        dx: stroke.dx,
        dy: stroke.dy,
        pen: stroke.pen
    }));
    
    // Start AI generation
    sketchRNN.generate(aiSeedPath, gotStrokePath);
}

function finishAIDrawing() {
    isAIDrawing = false;
    updateDrawingStatus('Ready to draw');
    console.log('AI drawing complete');
}

function gotStrokePath(error, strokePath) {
    if (error) {
        console.error('SketchRNN error:', error);
        isAIDrawing = false;
        updateDrawingStatus('Error occurred');
        return;
    }
    
    if (strokePath && isAIDrawing) {
        currentStroke = strokePath;
    }
}

// Model Management
function loadModel(modelName) {
    console.log('Loading model:', modelName);
    updateStatus('Loading ' + modelName + ' model...', 'loading');
    
    try {
        sketchRNN = ml5.sketchRNN(modelName, modelReady);
        currentModel = modelName;
    } catch (error) {
        console.error('Error loading model:', error);
        updateStatus('Failed to load model', 'error');
    }
}

function modelReady() {
    console.log('SketchRNN model loaded:', currentModel);
    updateStatus('Model ready: ' + currentModel, 'ready');
    updateModelDisplay();
    updateDrawingStatus('Ready to draw');
}

function selectModel(modelName) {
    if (modelName === currentModel) return;
    
    console.log('Switching to model:', modelName);
    
    // Update UI immediately
    updateModelButtons(modelName);
    
    // Clear canvas and reset state
    clearCanvas();
    
    // Load new model
    loadModel(modelName);
}

// UI Control Functions
function clearCanvas() {
    background(255);
    seedPath = [];
    allStrokes = [];
    currentPath = [];
    currentStroke = null;
    strokeCount = 0;
    isDrawing = false;
    isAIDrawing = false;
    
    updateStrokeCount();
    updateDrawingStatus('Canvas cleared');
    
    console.log('Canvas cleared');
}

function generateRandom() {
    if (!sketchRNN) {
        console.log('Model not loaded yet');
        return;
    }
    
    clearCanvas();
    
    // Start AI drawing from center
    x = width / 2;
    y = height / 2;
    
    updateDrawingStatus('Generating random drawing...');
    
    // Generate random starting stroke
    seedPath = [{dx: 0, dy: 0, pen: 'down'}];
    
    setTimeout(() => {
        startAIDrawing();
    }, 100);
}

function updateTemperature(value) {
    temperature = parseFloat(value);
    document.getElementById('temperatureValue').textContent = value;
    
    // Update model temperature if supported
    if (sketchRNN && sketchRNN.setTemperature) {
        sketchRNN.setTemperature(temperature);
    }
    
    console.log('Temperature updated to:', temperature);
}

function downloadDrawing() {
    if (!canvas) return;
    
    let timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let filename = `sketchrnn_${currentModel}_${timestamp}.png`;
    
    saveCanvas(canvas, filename);
    updateDrawingStatus('Drawing saved');
    
    console.log('Drawing saved as:', filename);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    
    sidebarCollapsed = !sidebarCollapsed;
    
    if (sidebarCollapsed) {
        sidebar.classList.add('collapsed');
        toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    } else {
        sidebar.classList.remove('collapsed');
        toggleBtn.innerHTML = '<i class="fas fa-times"></i>';
    }
    
    // Resize canvas after sidebar toggle
    setTimeout(() => {
        resizeCanvasToWindow();
    }, 300);
}

function toggleInstructions() {
    const instructions = document.getElementById('instructions');
    instructionsVisible = !instructionsVisible;
    
    instructions.style.display = instructionsVisible ? 'block' : 'none';
}

// UI Update Functions
function updateStatus(message, type = '') {
    const statusBar = document.getElementById('statusBar');
    statusBar.textContent = message;
    statusBar.className = 'status-bar ' + type;
}

function updateModelDisplay() {
    document.getElementById('currentModel').textContent = currentModel;
    updateModelButtons(currentModel);
}

function updateModelButtons(activeModel) {
    const buttons = document.querySelectorAll('.model-btn');
    buttons.forEach(btn => {
        const model = btn.getAttribute('data-model');
        if (model === activeModel) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function updateStrokeCount() {
    document.getElementById('strokeCount').textContent = strokeCount;
}

function updateDrawingStatus(status) {
    document.getElementById('drawingStatus').textContent = status;
}

// Window and Canvas Management
function windowResized() {
    resizeCanvasToWindow();
}

function resizeCanvasToWindow() {
    let canvasWidth = windowWidth - (sidebarCollapsed ? 40 : 300);
    let canvasHeight = windowHeight - 40;
    
    canvasWidth = max(canvasWidth, 400);
    canvasHeight = max(canvasHeight, 400);
    
    resizeCanvas(canvasWidth, canvasHeight);
    background(255);
    
    // Redraw all strokes
    redrawAllStrokes();
}

function redrawAllStrokes() {
    background(255);
    
    stroke(0);
    strokeWeight(3);
    
    // Redraw user strokes
    allStrokes.forEach(strokePath => {
        if (strokePath.length > 0) {
            let currentX = strokePath[0].x || width/2;
            let currentY = strokePath[0].y || height/2;
            
            strokePath.forEach(point => {
                if (point.pen === 'down') {
                    line(currentX, currentY, currentX + point.dx, currentY + point.dy);
                }
                currentX += point.dx;
                currentY += point.dy;
            });
        }
    });
}

// Keyboard Shortcuts
function keyPressed() {
    switch (key.toLowerCase()) {
        case 'c':
            clearCanvas();
            break;
        case 'r':
            generateRandom();
            break;
        case 's':
            downloadDrawing();
            break;
        case 'h':
            toggleInstructions();
            break;
        case ' ':
            toggleSidebar();
            break;
    }
}

// Touch Support for Mobile
function touchStarted() {
    return startDrawing();
}

function touchEnded() {
    return stopDrawing();
}

function touchMoved() {
    if (isDrawing) {
        return false; // Prevent scrolling
    }
}

// Prevent context menu on canvas
function contextMenu() {
    return false;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    console.log('SketchRNN AI Drawing Studio initialized');
    
    // Set initial model button as active
    updateModelButtons('bird');
    
    // Add some helpful console messages
    console.log('Keyboard shortcuts:');
    console.log('C - Clear canvas');
    console.log('R - Random drawing');
    console.log('S - Save drawing');
    console.log('H - Toggle help');
    console.log('Space - Toggle sidebar');
});

// Export functions for HTML onclick handlers
window.clearCanvas = clearCanvas;
window.generateRandom = generateRandom;
window.selectModel = selectModel;
window.updateTemperature = updateTemperature;
window.downloadDrawing = downloadDrawing;
window.toggleSidebar = toggleSidebar;
window.toggleInstructions = toggleInstructions;