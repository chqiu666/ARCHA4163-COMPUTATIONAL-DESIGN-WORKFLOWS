# Sketch-RNN Demo - Local Copy

This is a complete local copy of the Magenta Sketch-RNN demo from https://magenta.tensorflow.org/assets/sketch_rnn_demo/index.html

## What's included:

- **index.html** - The main demo page (modified to use local resources)
- **lib/** - All JavaScript libraries needed to run the demo:
  - p5.min.js - p5.js drawing library
  - p5.dom.min.js - p5.js DOM manipulation
  - sketch_rnn.js - Core sketch-rnn functionality
  - numjs.js - Numerical computation library
  - mobile-detect.min.js - Mobile device detection
  - bird.gen.js - Pre-trained bird model
- **img/** - All image assets:
  - Icon images for UI buttons (info, shuffle, clear, share)
  - firetruck_grid.png - Social media preview image

## How to use:

1. Open `index.html` in a web browser
2. Start drawing on the canvas
3. Watch as the neural network attempts to complete your drawing
4. Use the controls to switch between different models or clear the canvas

## Features:

- Interactive drawing canvas
- Neural network prediction completion
- Multiple pre-trained models (accessible via dropdown)
- Mobile-responsive design
- Completely self-contained (no internet connection required)

## Original source:

This demo is based on the research paper "A Neural Representation of Sketch Drawings" and the Magenta project by Google.
Original demo: https://magenta.tensorflow.org/sketch-rnn-demo