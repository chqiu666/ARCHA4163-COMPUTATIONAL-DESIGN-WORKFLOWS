# SketchRNN Drawing Prediction

A modern web application that uses Google's SketchRNN model to generate artistic drawings. This application provides an intuitive interface for experimenting with AI-generated sketches, featuring real-time drawing prediction with customizable parameters.

## 🎨 Features

### Core Functionality
- **AI Drawing Generation**: Uses pre-trained SketchRNN models to generate drawings
- **Real-time Prediction**: Watch as the AI draws stroke by stroke
- **Multiple Categories**: Choose from 35+ different drawing categories
- **Interactive Controls**: Adjust drawing parameters in real-time

### Drawing Controls
- **Temperature Control**: Adjust creativity vs. predictability (0.1 - 1.0)
- **Drawing Speed**: Control animation speed (10-120 FPS)
- **Stroke Width**: Customize line thickness (1-10px)
- **Drawing Scale**: Adjust overall drawing size (0.5x - 3.0x)
- **Color Options**: Choose custom colors or enable random color mode

### User Interface
- **Modern Design**: Clean, responsive interface inspired by Google's demo
- **Real-time Status**: Track model loading, drawing state, and stroke count
- **Keyboard Shortcuts**: Quick access to common functions
- **Mobile Responsive**: Works on desktop, tablet, and mobile devices

### Additional Features
- **Random Generation**: Generate random drawings with random parameters
- **Image Export**: Save drawings as PNG files
- **Start Point Indicator**: Visual indicator of drawing start position
- **Pause/Resume**: Control drawing playback
- **Multiple Models**: Dynamically load different SketchRNN models

## 🚀 Available Models

The application includes 35+ pre-trained models:

**Animals**: cat, dog, bird, butterfly, elephant, lion, tiger, bear, frog, fish, whale, dolphin, owl, bee, ant, octopus, crab, lobster, penguin, flamingo, parrot, duck, swan, rabbit, squirrel, hedgehog, pig, sheep, cow, horse, kangaroo

**Objects**: flower, face, tree, house, car, spider

## 🛠️ Technical Details

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Graphics**: p5.js for canvas rendering
- **AI Model**: Magenta.js SketchRNN implementation
- **Styling**: Modern CSS with gradients and animations
- **Icons**: Font Awesome

### Architecture
- **Model Loading**: Dynamic loading of SketchRNN models from Google's CDN
- **State Management**: Comprehensive state tracking for drawing and UI
- **Responsive Design**: Grid-based layout with mobile optimizations
- **Performance**: Optimized canvas rendering and model updates

### Key Parameters
- **Pixel Factor**: Set to 2.0 for optimal scaling
- **Canvas Size**: 800x600px for good visibility and performance
- **Frame Rate**: Adjustable from 10-120 FPS
- **Temperature Range**: 0.1-1.0 for controlled creativity
- **Scale Factor**: 0.5x-3.0x for size adjustment

## 🎮 Usage

### Basic Operation
1. **Select Model**: Choose a drawing category from the dropdown
2. **Adjust Parameters**: Set temperature, speed, stroke width, and scale
3. **Start Drawing**: Click "Start Drawing" or press SPACE
4. **Control Playback**: Use pause/resume to control the animation
5. **Save Result**: Click "Save Image" to download the drawing

### Keyboard Shortcuts
- **SPACE**: Start/Pause drawing
- **C**: Clear canvas
- **R**: Generate random drawing
- **S**: Save current drawing

### Parameter Guidelines
- **Low Temperature (0.1-0.3)**: More predictable, typical drawings
- **Medium Temperature (0.4-0.6)**: Balanced creativity and structure
- **High Temperature (0.7-1.0)**: More creative, unpredictable results

- **Scale Factor**: Adjust based on canvas size and desired detail level
- **Drawing Speed**: Higher speeds for quick previews, lower for detailed observation

## 🔧 Setup

### Local Development
1. Clone or download the project files
2. Serve the files using a local web server (required for model loading)
3. Open `index.html` in a modern web browser

### Using Python
```bash
python -m http.server 8000
# Navigate to http://localhost:8000
```

### Using Node.js
```bash
npx http-server
# Navigate to provided URL
```

### Dependencies
All dependencies are loaded via CDN:
- p5.js (v1.7.0)
- Magenta.js SketchRNN (v0.2.0)
- Font Awesome (v6.0.0)
- Google Fonts (Inter)

## 📱 Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile Browsers**: Responsive design

## ⚡ Performance Tips

1. **Model Loading**: First load may take a few seconds
2. **Canvas Size**: Larger scales may reduce performance
3. **Drawing Speed**: Lower FPS for complex drawings
4. **Memory**: Clear canvas regularly for long sessions

## 🎯 Use Cases

- **Education**: Learn about neural networks and AI art generation
- **Art Creation**: Generate unique sketches for inspiration
- **Research**: Experiment with different temperature and scale settings
- **Entertainment**: Create random drawings and share with others

## 🔍 Technical Notes

### Model Information
- Models are pre-trained on Google's Quick, Draw! dataset
- Each model is specific to one drawing category
- Models use LSTM architecture for sequence generation
- Stroke data is normalized and scaled appropriately

### Canvas Scaling
- Proper scaling ensures drawings fit within the canvas
- Pixel factor accounts for different display densities
- Drawing scale allows real-time size adjustments

### State Management
- Comprehensive tracking of drawing state
- RNN hidden states are properly maintained
- UI updates are synchronized with drawing progress

## 📝 License

This project uses open-source libraries:
- Magenta.js: Apache 2.0 License
- p5.js: LGPL License
- Font Awesome: SIL OFL 1.1 License

## 🙏 Acknowledgments

- Google Magenta team for SketchRNN models and research
- Processing Foundation for p5.js
- The Quick, Draw! community for training data
- Font Awesome for icons

---

**Enjoy creating AI-generated art!** 🎨✨