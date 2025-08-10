// ASCII Effect using p5.js
let asciiDiv;
let density = '  .:-=+*#%@';
let video;
let asciiEffect;

class ASCIIEffect {
    constructor() {
        this.rightHalf = document.getElementById('interactive-area');
        this.asciiOverlay = document.getElementById('ascii-overlay');
        this.isActive = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.time = 0;
        
        this.init();
    }
    
    init() {
        // Track mouse movement
        this.rightHalf.addEventListener('mouseenter', () => {
            this.isActive = true;
            this.asciiOverlay.style.opacity = '1';
        });
        
        this.rightHalf.addEventListener('mouseleave', () => {
            this.isActive = false;
            this.asciiOverlay.style.opacity = '0.3';
        });
        
        this.rightHalf.addEventListener('mousemove', (e) => {
            const rect = this.rightHalf.getBoundingClientRect();
            this.mouseX = (e.clientX - rect.left) / rect.width;
            this.mouseY = (e.clientY - rect.top) / rect.height;
        });
        
        this.generateASCII();
        setInterval(() => this.updateASCII(), 50); // Update ASCII at 20fps
    }
    
    generateASCII() {
        const width = Math.floor(this.rightHalf.offsetWidth / 8); // Character width
        const height = Math.floor(this.rightHalf.offsetHeight / 12); // Character height
        let ascii = '';
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const distX = Math.abs(x / width - this.mouseX);
                const distY = Math.abs(y / height - this.mouseY);
                const dist = Math.sqrt(distX * distX + distY * distY);
                
                // Create ripple effect based on mouse distance and time
                const wave = Math.sin(dist * 10 - this.time * 0.1) * 0.5 + 0.5;
                const noise = Math.random() * 0.3;
                const intensity = (wave + noise) * (1 - dist);
                
                // Map intensity to ASCII character
                const charIndex = Math.floor(intensity * density.length);
                ascii += density[Math.max(0, Math.min(charIndex, density.length - 1))];
            }
            ascii += '\n';
        }
        
        this.asciiOverlay.textContent = ascii;
    }
    
    updateASCII() {
        if (this.isActive) {
            this.time += 1;
            this.generateASCII();
        }
    }
}

// P5.js sketch for enhanced visual effects
function setup() {
    // Create a p5 canvas that sits behind the ASCII
    let rightHalf = document.getElementById('interactive-area');
    let canvas = createCanvas(rightHalf.offsetWidth, rightHalf.offsetHeight);
    canvas.parent('interactive-area');
    canvas.position(0, 0);
    canvas.style('position', 'absolute');
    canvas.style('z-index', '-1');
    
    noStroke();
}

function draw() {
    // This runs only when needed for performance
    if (frameCount % 3 !== 0) return;
    
    background(0, 10); // Slight trail effect
    
    // Create particle effects that complement the ASCII
    if (mouseX > width / 2) { // Only in right half
        for (let i = 0; i < 3; i++) {
            let x = mouseX + random(-50, 50);
            let y = mouseY + random(-50, 50);
            let size = random(2, 8);
            let alpha = random(20, 60);
            
            fill(
                random(100, 255),
                random(100, 255),
                random(100, 255),
                alpha
            );
            
            ellipse(x, y, size);
        }
    }
}

function windowResized() {
    let rightHalf = document.getElementById('interactive-area');
    resizeCanvas(rightHalf.offsetWidth, rightHalf.offsetHeight);
}

// Initialize ASCII effect after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    asciiEffect = new ASCIIEffect();
});