// Gradient Animation Controller
class GradientAnimation {
    constructor() {
        this.canvas = document.getElementById('gradient-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.rightHalf = document.getElementById('interactive-area');
        
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.isActive = false;
        
        this.gradientParams = {
            time: 0,
            radius: 300,
            colors: [
                { r: 0, g: 123, b: 255 },    // Blue
                { r: 255, g: 0, b: 128 },     // Pink
                { r: 0, g: 255, b: 128 },     // Green
                { r: 255, g: 128, b: 0 }      // Orange
            ]
        };
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.rightHalf.addEventListener('mouseenter', () => {
            this.isActive = true;
        });
        
        this.rightHalf.addEventListener('mouseleave', () => {
            this.isActive = false;
        });
        
        this.rightHalf.addEventListener('mousemove', (e) => {
            const rect = this.rightHalf.getBoundingClientRect();
            this.targetX = e.clientX - rect.left;
            this.targetY = e.clientY - rect.top;
        });
        
        this.animate();
    }
    
    resizeCanvas() {
        this.canvas.width = this.rightHalf.offsetWidth;
        this.canvas.height = this.rightHalf.offsetHeight;
    }
    
    createRadialGradient(x, y, time) {
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, this.gradientParams.radius);
        
        // Animate colors based on time
        const colors = this.gradientParams.colors;
        const offset = time * 0.001;
        
        colors.forEach((color, index) => {
            const position = (index / (colors.length - 1));
            const hueShift = Math.sin(offset + index * Math.PI / 2) * 30;
            
            const r = Math.max(0, Math.min(255, color.r + hueShift));
            const g = Math.max(0, Math.min(255, color.g + hueShift));
            const b = Math.max(0, Math.min(255, color.b + hueShift));
            
            gradient.addColorStop(position, `rgb(${r}, ${g}, ${b})`);
        });
        
        return gradient;
    }
    
    animate() {
        this.gradientParams.time += 16; // Approximate 60fps
        
        // Smooth mouse following
        this.mouseX += (this.targetX - this.mouseX) * 0.1;
        this.mouseY += (this.targetY - this.mouseY) * 0.1;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.isActive) {
            // Create multiple gradient layers for depth
            for (let i = 0; i < 3; i++) {
                const offsetX = Math.sin(this.gradientParams.time * 0.0001 + i) * 50;
                const offsetY = Math.cos(this.gradientParams.time * 0.0001 + i) * 50;
                
                const gradient = this.createRadialGradient(
                    this.mouseX + offsetX,
                    this.mouseY + offsetY,
                    this.gradientParams.time + i * 1000
                );
                
                this.ctx.globalAlpha = 0.4;
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
            
            // Add subtle noise effect
            this.addNoiseEffect();
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
    addNoiseEffect() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 20;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
}

// Initialize gradient animation
document.addEventListener('DOMContentLoaded', () => {
    new GradientAnimation();
});