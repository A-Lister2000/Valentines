/**
 * Professional Valentine's Prank Project
 * Main Logic Script
 */

"use strict";

document.addEventListener('DOMContentLoaded', () => {
    initTailwind();
    initPrankLogic();
    initAudioPlayer();
});

/**
 * Initialize Audio Player (Autoplay handling + Toggle Button)
 */
/**
 * Initialize Audio Player (Autoplay handling + Toggle Button)
 */
function initAudioPlayer() {
    const audio = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicBtn');
    const musicIndicator = document.getElementById('musicIndicator');
    const icon = musicBtn ? musicBtn.querySelector('span') : null;

    if (!audio || !musicBtn) return;

    audio.volume = 0.5;
    let isPlaying = false;

    // Function to update UI state
    const updateUI = (playing) => {
        if (playing) {
            icon.innerText = 'music_note';
            icon.classList.add('text-primary');
            musicBtn.classList.add('animate-pulse-slow');
            if (musicIndicator) musicIndicator.classList.add('hidden'); // Hide indicator when playing
        } else {
            icon.innerText = 'music_off';
            icon.classList.remove('text-primary');
            musicBtn.classList.remove('animate-pulse-slow');
        }
        isPlaying = playing;
    };

    // Function to try playing audio
    const tryPlay = () => {
        audio.play().then(() => {
            console.log("Audio playing");
            updateUI(true);
            // Remove interaction listeners once playing
            document.removeEventListener('click', tryPlay);
            document.removeEventListener('touchstart', tryPlay);
            document.removeEventListener('keydown', tryPlay);
        }).catch(error => {
            console.log('Audio play failed (waiting for interaction):', error);
            updateUI(false);
            if (musicIndicator) musicIndicator.classList.remove('hidden');
        });
    };

    // Try to play immediately (autoplay)
    tryPlay();

    // Also attach listeners for "any activity" to start music if autoplay failed
    document.addEventListener('click', tryPlay);
    document.addEventListener('touchstart', tryPlay);
    document.addEventListener('keydown', tryPlay);

    // Toggle button listener (always works)
    musicBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent affecting other elements

        if (audio.paused) {
            tryPlay();
        } else {
            audio.pause();
            updateUI(false);
        }
    });
}

/**
 * Initialize Tailwind Configuration
 */
function initTailwind() {
    if (typeof tailwind !== 'undefined') {
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#E60023",
                        "background-light": "#fdf8f9",
                        "background-dark": "#221019",
                    },
                    fontFamily: {
                        "display": ["Plus Jakarta Sans", "sans-serif"]
                    },
                    borderRadius: {
                        "DEFAULT": "1rem",
                        "lg": "2rem",
                        "xl": "3rem",
                        "full": "9999px"
                    },
                },
            },
        };
    }
}

/**
 * Initialize Prank Interaction Logic
 */
function initPrankLogic() {
    const noBtn = document.getElementById('noButton');
    const yesBtn = document.getElementById('yesBtn');
    const playArea = document.getElementById('playArea');

    // Only run if elements exist on the current page
    if (!noBtn || !yesBtn || !playArea) return;

    let yesScale = 1;
    const dangerRadius = 120; // Radius where "No" starts running

    /**
     * Set initial position of the 'No' button next to 'Yes'
     */
    function setInitialPosition() {
        if (!playArea || !yesBtn || !noBtn) return;

        const containerRect = playArea.getBoundingClientRect();
        const yesRect = yesBtn.getBoundingClientRect();

        // Calculate position relative to container
        // Place to the right of Yes button with some gap
        const initialX = (yesRect.right - containerRect.left) + 40;
        const initialY = (yesRect.top - containerRect.top) + (yesRect.height - noBtn.offsetHeight) / 2;

        // Ensure it's within bounds
        const maxX = containerRect.width - noBtn.offsetWidth;
        const x = Math.min(initialX, maxX - 10);

        noBtn.style.transform = `translate(${x}px, ${initialY}px)`;
    }

    // Run initial position after a slight delay to ensure layout is settled
    setTimeout(setInitialPosition, 100);
    window.addEventListener('resize', setInitialPosition);

    /**
     * Move the 'No' button to a random safe position
     * @param {Event} e - The event triggering the escape (mouse or touch)
     */
    function escapeNo(e) {
        const containerRect = playArea.getBoundingClientRect();
        const btnRect = noBtn.getBoundingClientRect();

        const maxX = containerRect.width - btnRect.width;
        const maxY = containerRect.height - btnRect.height;

        // Mouse position (if triggered by event)
        const mx = e ? (e.clientX || (e.touches ? e.touches[0].clientX : 0)) : 0;
        const my = e ? (e.clientY || (e.touches ? e.touches[0].clientY : 0)) : 0;

        let newX, newY, dist;

        // Retry up to 10 times to find a safe spot far from mouse
        for (let i = 0; i < 10; i++) {
            newX = Math.random() * maxX;
            newY = Math.random() * maxY;

            // Convert new container-relative coord to screen coord to check distance
            const screenX = containerRect.left + newX + btnRect.width / 2;
            const screenY = containerRect.top + newY + btnRect.height / 2;

            dist = Math.hypot(mx - screenX, my - screenY);

            if (dist > 150) { // Safe distance from mouse
                break;
            }
        }

        // Apply move
        noBtn.style.transform = `translate(${newX}px, ${newY}px)`;

        // Grow YES button as punishment/incentive
        growYes();
    }

    /**
     * Increase the size of the 'Yes' button
     */
    function growYes() {
        // Limit growth based on screen size to prevent overflow
        const isMobile = window.innerWidth < 768; // Tailwind 'md' breakpoint
        const maxScale = isMobile ? 1.5 : 2.5;

        if (yesScale < maxScale) {
            yesScale += 0.08;
            yesBtn.style.transform = `scale(${yesScale})`;

            // Enhance glow/shadow based on size
            const shadowIntensity = (yesScale - 1) * 20 + 20;
            yesBtn.style.boxShadow = `0 10px ${shadowIntensity}px -5px rgba(230,0,35,${0.5 + (yesScale - 1) * 0.3})`;
        }
    }

    // Event Listeners

    // 1. Proximity Dodge (Desktop)
    window.addEventListener('mousemove', (e) => {
        const rect = noBtn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const dist = Math.hypot(e.clientX - cx, e.clientY - cy);

        if (dist < dangerRadius) {
            escapeNo(e);
        }
    });

    // 2. Hover Dodge (Backup)
    noBtn.addEventListener('mouseenter', (e) => {
        escapeNo(e);
    });

    // 3. Click/Touch Dodge (Mobile + Anti-click)
    noBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        escapeNo(e);
    });

    // Prevent click default action
    noBtn.addEventListener('click', (e) => {
        e.preventDefault();
    });
}
