// Get the HAL title element
const halTitle = document.getElementById('hal-title');
const body = document.body;

// Add dark mode effect when hovering over HAL 9000 title
halTitle.addEventListener('mouseenter', () => {
    body.classList.add('dark-mode');
    
    // Optional: Add glitch effect to ASCII art
    const asciiArt = document.getElementById('ascii-art');
    asciiArt.classList.add('glitch');
});

halTitle.addEventListener('mouseleave', () => {
    body.classList.remove('dark-mode');
    
    const asciiArt = document.getElementById('ascii-art');
    asciiArt.classList.remove('glitch');
});

// Add animated ASCII art variations
const asciiFrames = [
    `    ╔═══════════════════════╗
    ║    ●      HAL      ●  ║
    ║   ┌─────────────┐     ║
    ║   │  ▓▓▓▓▓▓▓▓▓  │     ║
    ║   │  ▓ █████ ▓  │     ║
    ║   │  ▓ █ ● █ ▓  │     ║
    ║   │  ▓ █████ ▓  │     ║
    ║   │  ▓▓▓▓▓▓▓▓▓  │     ║
    ║   └─────────────┘     ║
    ║    ●    9000    ●     ║
    ╚═══════════════════════╝`,
    
    `    ╔═══════════════════════╗
    ║    ○      HAL      ○  ║
    ║   ┌─────────────┐     ║
    ║   │  ░░░░░░░░░  │     ║
    ║   │  ░ ▓▓▓▓▓ ░  │     ║
    ║   │  ░ ▓ ◉ ▓ ░  │     ║
    ║   │  ░ ▓▓▓▓▓ ░  │     ║
    ║   │  ░░░░░░░░░  │     ║
    ║   └─────────────┘     ║
    ║    ○    9000    ○     ║
    ╚═══════════════════════╝`,
    
    `    ╔═══════════════════════╗
    ║    ◉      HAL      ◉  ║
    ║   ┌─────────────┐     ║
    ║   │  ▒▒▒▒▒▒▒▒▒  │     ║
    ║   │  ▒ ░░░░░ ▒  │     ║
    ║   │  ▒ ░ ◯ ░ ▒  │     ║
    ║   │  ▒ ░░░░░ ▒  │     ║
    ║   │  ▒▒▒▒▒▒▒▒▒  │     ║
    ║   └─────────────┘     ║
    ║    ◉    9000    ◉     ║
    ╚═══════════════════════╝`
];

let currentFrame = 0;
let animationInterval;

// Start animation when hovering
halTitle.addEventListener('mouseenter', () => {
    const asciiArt = document.getElementById('ascii-art');
    
    animationInterval = setInterval(() => {
        currentFrame = (currentFrame + 1) % asciiFrames.length;
        asciiArt.textContent = asciiFrames[currentFrame];
    }, 200);
});

// Stop animation when not hovering
halTitle.addEventListener('mouseleave', () => {
    clearInterval(animationInterval);
    currentFrame = 0;
    document.getElementById('ascii-art').textContent = asciiFrames[0];
});

// Add typing effect for the text
function addTypingEffect(element, delay = 50) {
    const text = element.textContent;
    element.textContent = '';
    element.style.opacity = '1';
    
    let index = 0;
    const typeInterval = setInterval(() => {
        if (index < text.length) {
            element.textContent += text[index];
            index++;
        } else {
            clearInterval(typeInterval);
        }
    }, delay);
}

// Apply typing effect on page load
window.addEventListener('load', () => {
    const introText = document.querySelector('.intro-text');
    const outroText = document.querySelector('.outro-text');
    
    setTimeout(() => {
        addTypingEffect(introText, 30);
    }, 500);
    
    setTimeout(() => {
        addTypingEffect(outroText, 30);
    }, 2000);
});

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});