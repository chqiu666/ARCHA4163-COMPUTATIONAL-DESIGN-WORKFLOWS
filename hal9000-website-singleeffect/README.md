# HAL 9000 Website Clone

A minimalist website clone of https://558444.cargo.site/ with an added interactive ASCII art effect.

## Features

- Minimalist dark theme design
- HAL 9000 title with custom typography
- Interactive hover effect that transforms the title into ASCII art
- Glitch animation during the transition
- Fully responsive design

## Interactive Effect

When you hover over the "HAL 9000" heading:
1. The original text fades out
2. An ASCII art version appears with a green glow effect
3. A subtle glitch animation plays during the transition
4. The background gets a subtle radial gradient effect

## Technologies Used

- HTML5
- CSS3 (with CSS Variables and Transitions)
- Vanilla JavaScript
- Google Fonts (Inter)

## Local Development

To run the website locally:

```bash
# Navigate to the project directory
cd hal9000-website

# Start a simple HTTP server
python3 -m http.server 8080
```

Then open http://localhost:8080 in your browser.

## File Structure

```
hal9000-website/
├── index.html      # Main HTML structure
├── styles.css      # Styling and animations
├── script.js       # Interactive effects and ASCII art
└── README.md       # This file
```