// Envelope Opening Animation
// COMMENTED OUT - Will revisit later
/*
const envelopeOverlay = document.getElementById('envelope-overlay');
const envelopeSeal = document.getElementById('envelope-seal');
const mainContent = document.getElementById('main-content');

// Disable scrolling initially
document.body.style.overflow = 'hidden';

envelopeSeal.addEventListener('click', () => {
    envelopeOverlay.classList.add('opening');
    
    setTimeout(() => {
        envelopeOverlay.classList.add('hidden');
        mainContent.classList.remove('hidden');
        initializeWebsite();
    }, 1500);
});
*/

// Scratch to Reveal Functionality - Declare variables FIRST
let isScratching = false;
let scratchPercentage = 0;
const scratchThreshold = 75; // Percentage to reveal
let isRevealed = false; // Prevent multiple calls to revealDate
let totalScratchedArea = 0; // Track total scratched area in pixels
let canvasArea = 0; // Total canvas area
let initialOpaquePixels = 0; // Track how many pixels were opaque initially (to exclude pre-existing transparent areas)

// Direct initialization without envelope
const mainContent = document.getElementById('main-content');
document.body.style.overflow = 'hidden';
mainContent.classList.remove('hidden');
initializeWebsite();

function initializeScratchCard() {
    const canvas = document.getElementById('scratch-canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get 2d context');
        return;
    }
    
    const scratchSection = document.getElementById('scratch-section');
    
    // Reset scratch state
    isRevealed = false;
    scratchPercentage = 0;
    totalScratchedArea = 0;
    
    // Ensure canvas is visible
    canvas.style.display = 'block';
    
    // Load heart image
    const heartImage = new Image();
    // Note: For local files, we don't set crossOrigin to avoid CORS issues
    // We'll use an alternative tracking method that doesn't require getImageData
    
    heartImage.onload = function() {
        console.log('Heart image loaded successfully', heartImage.width, 'x', heartImage.height);
        
        // Set canvas size to match image or container, maintaining aspect ratio
        // Use larger size for mobile devices
        const isMobile = window.innerWidth <= 768;
        // const sizeMultiplier = isMobile ? 1.0 : 0.9; old
        const sizeMultiplier = isMobile ? 1.5 : 1.3; // Increased from 1.0/0.9 to ensure better coverage
        const maxWidth = window.innerWidth * sizeMultiplier; // Removed constraint to heartImage.width
        const maxHeight = window.innerHeight * sizeMultiplier; // Removed constraint to heartImage.height
        // const maxWidth = Math.min(window.innerWidth * sizeMultiplier, heartImage.width); old 
        // const maxHeight = Math.min(window.innerHeight * sizeMultiplier, heartImage.height); old
        const aspectRatio = heartImage.width / heartImage.height;
        
        let canvasWidth, canvasHeight;
        if (maxWidth / maxHeight > aspectRatio) {
            canvasHeight = maxHeight;
            canvasWidth = canvasHeight * aspectRatio;
        } else {
            canvasWidth = maxWidth;
            canvasHeight = canvasWidth / aspectRatio;
        }
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.width = canvasWidth + 'px';
        canvas.style.height = canvasHeight + 'px';
        canvasArea = canvasWidth * canvasHeight;
        totalScratchedArea = 0; // Reset
        
        // Draw heart image on canvas
        ctx.drawImage(heartImage, 0, 0, canvas.width, canvas.height);
        console.log('Heart image drawn on canvas');
        
        // Capture initial canvas state - count opaque pixels (to exclude pre-existing transparent areas)
        try {
            const initialImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const initialPixels = initialImageData.data;
            let opaqueCount = 0;
            for (let i = 3; i < initialPixels.length; i += 4) {
                if (initialPixels[i] > 0) { // Alpha > 0 means opaque
                    opaqueCount++;
                }
            }
            initialOpaquePixels = opaqueCount;
        } catch (e) {
            // If getImageData fails, assume all pixels are opaque (fallback)
            initialOpaquePixels = canvasArea;
        }
        
        // Initialize scratch functionality after image is loaded
        setupScratchEvents();
    };
    
    heartImage.onerror = function() {
        console.error('Failed to load heart image from:', heartImage.src);
        console.error('Make sure the file exists at: assets/heart_only.png');
        // Fallback: create a simple colored rectangle
        canvas.width = 400;
        canvas.height = 400;
        canvas.style.width = '400px';
        canvas.style.height = '400px';
        canvasArea = 400 * 400;
        totalScratchedArea = 0;
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // For fallback, all pixels are opaque initially
        initialOpaquePixels = canvasArea;
        setupScratchEvents();
    };
    
    console.log('Attempting to load heart image from: assets/heart_only.png');
    heartImage.src = 'assets/heart_only.png';
    
    // Scratch functionality
    let lastX = 0;
    let lastY = 0;
    
    function setupScratchEvents() {
    
    function getEventPos(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.touches ? e.touches[0].clientX : e.clientX) - rect.left,
            y: (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
        };
    }
    
    function scratch(x, y) {
        ctx.globalCompositeOperation = 'destination-out';
        const brushRadius = 30; // Brush radius - smaller for more deliberate scratching
        ctx.lineWidth = brushRadius * 2; // Increased brush size
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Track if this is the first scratch before updating lastX/lastY
        const isFirstScratch = (lastX === 0 && lastY === 0);
        
        // Draw the scratch
        if (isFirstScratch) {
            // First scratch: draw initial point
            ctx.beginPath();
            ctx.arc(x, y, brushRadius, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
        
        // Use getImageData method for accurate pixel counting (primary method)
        // Only count pixels that were opaque initially but are now transparent (actually scratched)
        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            let currentTransparentPixels = 0;
            
            for (let i = 3; i < pixels.length; i += 4) {
                if (pixels[i] === 0) {
                    currentTransparentPixels++;
                }
            }
            
            // Calculate how many NEWLY transparent pixels there are
            // Total transparent now = originally transparent + newly scratched
            // We know: initialOpaquePixels + initialTransparentPixels = canvasArea
            // So: initialTransparentPixels = canvasArea - initialOpaquePixels
            // newlyScratchedPixels = currentTransparentPixels - initialTransparentPixels
            const initialTransparentPixels = canvasArea - initialOpaquePixels;
            const newlyScratchedPixels = Math.max(0, currentTransparentPixels - initialTransparentPixels);
            
            // Calculate percentage based on how much of the initially opaque area is now scratched
            // Only count scratched pixels relative to what was scratchable (initially opaque)
            if (initialOpaquePixels > 0) {
                scratchPercentage = (newlyScratchedPixels / initialOpaquePixels) * 100;
            } else {
                scratchPercentage = 0;
            }
        } catch (e) {
            // Fallback: if getImageData fails (CORS issue), use tracked area method
            // Only add area for strokes (not the first point) to avoid overcounting
            if (!isFirstScratch) {
                const distance = Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2);
                if (distance > 0) {
                    const scratchedArea = distance * (brushRadius * 2) + Math.PI * brushRadius * brushRadius;
                    totalScratchedArea += scratchedArea;
                    // Calculate percentage based on initial opaque pixels
                    if (initialOpaquePixels > 0) {
                        scratchPercentage = (totalScratchedArea / initialOpaquePixels) * 100;
                    } else {
                        scratchPercentage = 0;
                    }
                }
            } else {
                // For first scratch in fallback mode, add minimal area
                const scratchedArea = Math.PI * brushRadius * brushRadius;
                totalScratchedArea += scratchedArea;
                if (initialOpaquePixels > 0) {
                    scratchPercentage = (totalScratchedArea / initialOpaquePixels) * 100;
                } else {
                    scratchPercentage = 0;
                }
            }
        }
        
        // Update last position after calculations
        lastX = x;
        lastY = y;
        
        // Log scratch information
        const remainingPercentage = Math.max(0, 100 - scratchPercentage);
        console.log(`Scratch at area: (${Math.round(x)}, ${Math.round(y)}) | Scratched: ${scratchPercentage.toFixed(2)}% | Remaining: ${remainingPercentage.toFixed(2)}%`);
        
        // Only reveal if threshold is met and not already revealed
        if (scratchPercentage >= scratchThreshold && !isRevealed) {
            isRevealed = true;
            revealDate();
        }
    }
    
    canvas.addEventListener('mousedown', (e) => {
        isScratching = true;
        const pos = getEventPos(e);
        lastX = pos.x;
        lastY = pos.y;
        scratch(pos.x, pos.y);
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (isScratching) {
            const pos = getEventPos(e);
            scratch(pos.x, pos.y);
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        isScratching = false;
        lastX = 0;
        lastY = 0;
    });
    
    canvas.addEventListener('mouseleave', () => {
        isScratching = false;
        lastX = 0;
        lastY = 0;
    });
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isScratching = true;
        const pos = getEventPos(e);
        lastX = pos.x;
        lastY = pos.y;
        scratch(pos.x, pos.y);
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (isScratching) {
            const pos = getEventPos(e);
            scratch(pos.x, pos.y);
        }
    });
    
    canvas.addEventListener('touchend', () => {
        isScratching = false;
        lastX = 0;
        lastY = 0;
    });
    }
}

function revealDate() {
    const scratchSection = document.getElementById('scratch-section');
    const firstSection = document.querySelector('.section-1');
    const mainContent = document.getElementById('main-content');
    
    if (!firstSection) {
        console.error('Section 1 not found');
        return;
    }
    
    console.log('Revealing date, showing section 1');
    
    // Ensure main-content is visible
    if (mainContent) {
        mainContent.classList.remove('hidden');
        mainContent.style.setProperty('display', 'block', 'important');
        mainContent.style.setProperty('visibility', 'visible', 'important');
    }
    
    // Prepare section 1 but keep it hidden initially
    firstSection.classList.remove('hidden');
    firstSection.classList.add('revealed');
    firstSection.style.setProperty('display', 'flex', 'important');
    firstSection.style.setProperty('visibility', 'visible', 'important');
    firstSection.style.setProperty('pointer-events', 'auto', 'important');
    firstSection.style.setProperty('position', 'relative', 'important');
    firstSection.style.setProperty('z-index', '1', 'important');
    firstSection.style.setProperty('opacity', '0', 'important'); // Start with opacity 0 for fade-in
    
    // Fade out scratch section first (1 second fadeout)
    if (scratchSection) {
        scratchSection.style.transition = 'opacity 1s ease-out';
        scratchSection.style.opacity = '0';
        scratchSection.style.pointerEvents = 'none'; // Disable interaction during fadeout
        
        // After fadeout completes, hide it completely and show section 1
        setTimeout(() => {
            scratchSection.style.zIndex = '-1';
            scratchSection.classList.add('hidden');
            scratchSection.style.setProperty('display', 'none', 'important');
            scratchSection.style.setProperty('visibility', 'hidden', 'important');
            
            // Scroll to top to ensure section is in view
            window.scrollTo({ top: 0, behavior: 'instant' });
            
            // Force immediate reflow to ensure styles are applied
            void firstSection.offsetHeight;
            
            // Wait for browser to process the changes
            requestAnimationFrame(() => {
                // Force another reflow
                void firstSection.offsetHeight;
                
                // Fade in the section
                setTimeout(() => {
                    firstSection.style.setProperty('opacity', '1', 'important');
                    firstSection.style.animation = 'fadeInUp 1.5s ease forwards';
                    
                    // Create lanterns immediately when section starts fading in (no delay)
                    createLanterns();
                    
                    // Enable scrolling after first section fades in
                    setTimeout(() => {
                        document.body.style.overflow = 'auto';
                        
                        // Show section 2 immediately
                        const section2 = document.querySelector('.section-2');
                        if (section2) {
                            section2.style.opacity = '1';
                        }
                        
                        // Show other sections (section-3, section-4, section-5) after section-2
                        const otherSections = document.querySelectorAll('.section:not(.section-1):not(.section-2)');
                        otherSections.forEach(section => {
                            section.style.opacity = '1';
                        });
                    }, 1500);
                }, 100);
            });
        }, 1000); // Wait for fadeout to complete (1 second)
    }
}

// Floating Lanterns with Parallax - Across all sections
function createLanterns() {
    const container = document.getElementById('lanterns-container');
    const numLanterns = 6;
    
    // Clear any existing lanterns
    container.innerHTML = '';
    
    // Create lanterns that will float across all sections
    for (let i = 0; i < numLanterns; i++) {
        const lantern = document.createElement('div');
        lantern.className = 'lantern';
        
        // Position across the full viewport height (all sections)
        const startX = Math.random() * 100;
        const startY = Math.random() * 100; // Spread across all sections
        const delay = Math.random() * 1.5; // Reduced from 5s to 1.5s for faster start
        const duration = 15 + Math.random() * 10;
        
        lantern.style.left = startX + '%';
        lantern.style.top = startY + '%';
        lantern.style.animationDelay = delay + 's';
        lantern.style.animationDuration = duration + 's';
        lantern.style.opacity = '0'; // Start invisible for fade-in
        lantern.style.transition = 'opacity 0.8s ease-in'; // Smooth fade-in
        
        container.appendChild(lantern);
        
        // Fade in the lantern after a brief delay
        setTimeout(() => {
            lantern.style.opacity = '0.8';
        }, delay * 1000 + 100); // Fade in slightly after animation starts
    }
}

// Parallax effect for lanterns on scroll - Across all sections
let lastScrollY = 0;

function updateLanternParallax() {
    const scrollY = window.scrollY;
    const scrollDelta = scrollY - lastScrollY;
    
    // Apply parallax to lanterns across all sections
    document.querySelectorAll('.lantern').forEach((lantern, index) => {
        const speed = 0.3 + (index % 3) * 0.15;
        const currentLeft = parseFloat(lantern.style.left) || 0;
        const newLeft = currentLeft + (scrollDelta * speed * 0.05);
        
        // Keep lanterns within viewport horizontally
        if (newLeft > 100) {
            lantern.style.left = '0%';
        } else if (newLeft < 0) {
            lantern.style.left = '100%';
        } else {
            lantern.style.left = newLeft + '%';
        }
        
        // Keep lanterns visible at all times across all sections
        lantern.style.opacity = '0.8';
    });
    
    lastScrollY = scrollY;
}

// Background image changes on scroll
function updateSectionBackgrounds() {
    const sections = document.querySelectorAll('.section');
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollY + windowHeight / 2 >= sectionTop && scrollY <= sectionBottom) {
            const bgImage = section.getAttribute('data-bg');
            if (bgImage && !section.style.backgroundImage.includes(bgImage)) {
                section.style.backgroundImage = `url(${bgImage})`;
            }
        }
    });
}

// Initialize backgrounds on load
function initializeBackgrounds() {
    const sections = document.querySelectorAll('.section');
    sections.forEach((section) => {
        const bgImage = section.getAttribute('data-bg');
        if (bgImage) {
            section.style.backgroundImage = `url(${bgImage})`;
        }
    });
}

// Google Maps Integration
function initializeMap() {
    const mapButton = document.getElementById('map-button');
    
    // Google Maps link provided
    const googleMapsUrl = 'https://maps.app.goo.gl/2ckkdyWYHhFDmEVU6';
    
    mapButton.addEventListener('click', () => {
        window.open(googleMapsUrl, '_blank');
    });
}

// Smooth scroll behavior
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize website after envelope opens
function initializeWebsite() {
    // Show scratch section
    const scratchSection = document.getElementById('scratch-section');
    if (scratchSection) {
        scratchSection.style.display = 'flex';
    }
    
    // Keep section-1 hidden initially (will show after scratch reveal)
    const firstSection = document.querySelector('.section-1');
    if (firstSection) {
        firstSection.classList.add('hidden');
    }
    
    initializeScratchCard();
    initializeMap();
    initializeSmoothScroll();
    initializeBackgrounds();
    
    // Hide other sections initially
    const otherSections = document.querySelectorAll('.section:not(.section-1)');
    otherSections.forEach(section => {
        section.style.opacity = '0';
    });
    
    // Event listeners (but scrolling disabled until date revealed)
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateLanternParallax();
                updateSectionBackgrounds();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Create lanterns will be triggered after date reveal and first section fades in
}

// Handle window resize
window.addEventListener('resize', () => {
    const canvas = document.getElementById('scratch-canvas');
    const scratchSection = document.getElementById('scratch-section');
    if (canvas && scratchSection && !scratchSection.classList.contains('hidden')) {
        // Reinitialize scratch card on resize
        initializeScratchCard();
    }
});

