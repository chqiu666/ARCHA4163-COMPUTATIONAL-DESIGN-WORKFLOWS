# CDW Courseworks - Fixed Landing Page

This repository contains the fixed version of the CDW Courseworks landing page with the following improvements:

## Fixed Issues

1. **Blue-White Radial Gradient Animation**: Fixed the non-functioning gradient animation on the left side of the page. The gradient now properly animates with a smooth radial pattern.

2. **Hover Effects**: Added interactive hover effects to all navigation links including:
   - Backslash (\) prefix animation that appears when hovering
   - Color change to blue (#0198ff)
   - Subtle horizontal translation for visual feedback

3. **Left Side Effects on Hover**: When hovering over any navigation link:
   - The gradient section inverts colors (reverse effect)
   - ASCII art overlay appears with p5.js-inspired effects

## Two Versions Available

### 1. index.html (With Camera Access)
- Uses p5.js library to create real ASCII art from camera input
- Provides more dynamic and realistic ASCII effect
- Requires camera permissions

### 2. index_no_camera.html (No Camera Required)
- Uses JavaScript to generate animated ASCII patterns
- No external dependencies or permissions required
- Lighter weight and works everywhere

## Features

- Responsive design that adapts to mobile screens
- Custom font loading (Diatype Variable)
- Smooth animations and transitions
- Clean, modern interface maintaining the original aesthetic
- All text remains in English as requested

## Usage

Simply open either `index.html` or `index_no_camera.html` in a modern web browser. Choose based on whether you want the camera-based ASCII effect or the simulated version.

## Browser Compatibility

Works best in modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Credits

- Original design: Yuhang Qiu, Columbia GSAPP 2025
- ASCII art effect inspired by p5.js library