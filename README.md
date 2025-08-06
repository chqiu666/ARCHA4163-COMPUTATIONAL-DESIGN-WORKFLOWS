# Hand Drawing with SketchRNN

A web application that combines hand tracking with AI-powered drawing completion using SketchRNN. Draw with your hand gestures and let AI complete your artwork!

## 🎨 Features

- **Hand Gesture Drawing**: Use your index finger as a drawing tool
- **AI Drawing Completion**: SketchRNN AI completes your drawings based on selected categories
- **Multiple Categories**: Choose from Flower, Cat, Pig, Face, or Random selection
- **Gesture Controls**: 
  - 👉 **Point with index finger** - Draw on canvas
  - 🤏 **Pinch (thumb + index finger)** - Click buttons
  - ✋ **Open palm** - Clear canvas
- **Real-time Hand Tracking**: Live webcam feed with hand landmark detection
- **Fullscreen Canvas**: Immersive drawing experience

## 🚀 Getting Started

### Prerequisites

- Modern web browser with webcam access
- HTTPS connection (required for webcam access)

### Installation

1. Clone or download this repository
2. Start a local web server:
   ```bash
   python3 -m http.server 8000
   # or
   python -m SimpleHTTPServer 8000
   ```
3. Open your browser and navigate to `http://localhost:8000`
4. Allow webcam access when prompted

## 🎮 How to Use

1. **Allow Camera Access**: Grant permission for webcam access
2. **Position Your Hand**: Show your hand to the camera (top-right corner)
3. **Select a Category**: Use pinch gesture to click on category buttons (left side)
4. **Start Drawing**: Point with your index finger and move to draw
5. **AI Completion**: After drawing a few strokes, the AI will complete your drawing
6. **Clear Canvas**: Show an open palm to clear the canvas

## 🤖 AI Models

The application uses:
- **ml5.js HandPose**: For real-time hand tracking and gesture recognition
- **SketchRNN**: For AI-powered drawing completion in categories:
  - Flower 🌸
  - Cat 🐱
  - Pig 🐷
  - Face 😊
  - Random (randomly selects one of the above)

## 🎯 Gesture Recognition

The application recognizes three main gestures:

### Drawing Gesture
- **Trigger**: Index finger extended, other fingers down
- **Action**: Draws on the canvas following finger movement
- **Visual**: Red dot appears on index fingertip

### Click Gesture  
- **Trigger**: Thumb and index finger pinched together (< 40px apart)
- **Action**: Clicks buttons when cursor is over them
- **Delay**: 1-second delay to prevent accidental clicks

### Clear Gesture
- **Trigger**: Open palm with 4+ fingers extended
- **Action**: Clears the entire canvas
- **Delay**: 1-second delay to prevent accidental clearing

## 🛠 Technical Details

### Technologies Used
- **TensorFlow.js**: Core machine learning framework
- **MediaPipe Handpose**: Hand landmark detection
- **ml5.js**: Simplified ML library for SketchRNN and HandPose
- **HTML5 Canvas**: Drawing surface
- **Vanilla JavaScript**: Application logic

### Browser Compatibility
- Chrome 80+ (recommended)
- Firefox 75+
- Safari 13+
- Edge 80+

### Performance Tips
- Use good lighting for better hand detection
- Keep hand clearly visible in camera view
- Avoid complex backgrounds
- Use HTTPS for production deployment

## 🔧 Configuration

Key parameters that can be adjusted in the code:

```javascript
const GESTURE_DELAY = 1000; // Delay for gesture stability (ms)
const PINCH_THRESHOLD = 40; // Distance threshold for pinch detection (px)
const MIN_STROKES_FOR_AI = 3; // Minimum strokes before AI completion
```

## 📱 Mobile Support

While the application works on mobile devices, it's optimized for desktop use with webcams. Mobile performance may vary depending on device capabilities.

## 🐛 Troubleshooting

### Common Issues

1. **Camera not working**
   - Ensure HTTPS connection
   - Check browser permissions
   - Try refreshing the page

2. **Hand not detected**
   - Improve lighting conditions
   - Move closer to camera
   - Show full hand in view

3. **Gestures not working**
   - Make clear, distinct gestures
   - Wait for gesture delay period
   - Check hand orientation

4. **AI not completing drawings**
   - Draw at least 3 strokes
   - Ensure model is loaded
   - Check browser console for errors

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **ml5.js** community for the amazing machine learning library
- **Google MediaPipe** for hand tracking technology
- **Google Magenta** for the SketchRNN model
- **p5.js** tutorials for hand tracking inspiration

## 🔗 References

- [ml5.js HandPose Documentation](https://learn.ml5js.org/#/reference/handpose)
- [SketchRNN Paper](https://arxiv.org/abs/1704.03477)
- [MediaPipe Hands](https://mediapipe.dev/solutions/hands)
- [p5.js Hand Tracking Tutorial](https://p5js.org/tutorials/speak-with-your-hands/)