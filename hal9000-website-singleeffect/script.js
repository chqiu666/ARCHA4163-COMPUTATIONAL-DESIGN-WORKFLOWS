// ASCII Art for HAL 9000
const asciiArt = `
 ██╗  ██╗ █████╗ ██╗      █████╗  ██████╗  ██████╗  ██████╗ 
 ██║  ██║██╔══██╗██║     ██╔══██╗██╔═████╗██╔═████╗██╔═████╗
 ███████║███████║██║     ╚██████║██║██╔██║██║██╔██║██║██╔██║
 ██╔══██║██╔══██║██║      ╚═══██║████╔╝██║████╔╝██║████╔╝██║
 ██║  ██║██║  ██║███████╗ █████╔╝╚██████╔╝╚██████╔╝╚██████╔╝
 ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚════╝  ╚═════╝  ╚═════╝  ╚═════╝ 
`;

// Alternative more compact ASCII art
const compactAsciiArt = `
╦ ╦╔═╗╦    ╔═╗╔═╗╔═╗╔═╗
╠═╣╠═╣║    ╚═╗║ ║║ ║║ ║
╩ ╩╩ ╩╩═╝  ╚═╝╚═╝╚═╝╚═╝
`;

// Get elements
const halTitle = document.getElementById('hal-title');
const asciiContainer = document.getElementById('ascii-art');
const body = document.body;

// Set ASCII art content
asciiContainer.textContent = asciiArt;

// Add hover event listeners
halTitle.addEventListener('mouseenter', () => {
    asciiContainer.classList.add('show');
    body.classList.add('ascii-active');
});

halTitle.addEventListener('mouseleave', () => {
    asciiContainer.classList.remove('show');
    body.classList.remove('ascii-active');
});

// Optional: Add glitch effect
let glitchInterval;

halTitle.addEventListener('mouseenter', () => {
    // Start glitch effect
    glitchInterval = setInterval(() => {
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
        const originalText = asciiArt;
        let glitchedText = '';
        
        for (let i = 0; i < originalText.length; i++) {
            if (originalText[i] === '\n' || originalText[i] === ' ') {
                glitchedText += originalText[i];
            } else if (Math.random() < 0.05) {
                glitchedText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
            } else {
                glitchedText += originalText[i];
            }
        }
        
        asciiContainer.textContent = glitchedText;
    }, 100);
    
    // Reset to original after a short delay
    setTimeout(() => {
        clearInterval(glitchInterval);
        asciiContainer.textContent = asciiArt;
    }, 300);
});

halTitle.addEventListener('mouseleave', () => {
    clearInterval(glitchInterval);
    asciiContainer.textContent = asciiArt;
});