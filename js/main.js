/**
 * js/main.js
 * Global UI interactions for SOLE site:
 * - Smooth scrolling, modals, carousels
 * - Hero animations and parallax
 * - Wishlist toggles and general accessibility helpers
 * Keep file responsibilities narrow; consider modularizing if it grows.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Set active state on nav links based on current page
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav a, .footer-grid a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('nav-active');
        } else if (currentPath === '' && href === 'index.html') {
             link.classList.add('nav-active');
        }
    });

    // Click-to-show overlay on mobile for gallery and product cards
    const interactiveCards = document.querySelectorAll('.gallery-card, .product-card');
    interactiveCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Only apply on mobile/tablet widths
            if (window.innerWidth <= 768) {
                // If the user clicks the like button or delete button, let that work normally
                if (e.target.closest('.like-btn, .delete-btn')) return;

                if (!this.classList.contains('show-overlay')) {
                    // First click: prevent navigation and show overlay
                    e.preventDefault();
                    
                    // Close any other open overlays first
                    interactiveCards.forEach(c => {
                        if (c !== this) c.classList.remove('show-overlay');
                    });
                    
                    this.classList.add('show-overlay');
                } else {
                    // Second click: let the link navigate normally
                    // No e.preventDefault() here
                }
            }
        });
    });

    // Mobile Burger Menu Toggle
    const burgerMenuBtn = document.getElementById('burgerMenuBtn');
    const mainNav = document.getElementById('mainNav');
    
    if (burgerMenuBtn && mainNav) {
        burgerMenuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            const icon = burgerMenuBtn.querySelector('i');
            if (mainNav.classList.contains('active')) {
                icon.classList.remove('ph-list');
                icon.classList.add('ph-x');
            } else {
                icon.classList.remove('ph-x');
                icon.classList.add('ph-list');
                // Close any open dropdowns when closing the main menu
                mainNav.querySelectorAll('.nav-item-dropdown').forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });

        // Toggle dropdowns on mobile with smooth transition matching specification accordions
        const dropdowns = mainNav.querySelectorAll('.nav-item-dropdown');
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('a');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const isActive = dropdown.classList.contains('active');
                    
                    // Close other dropdowns
                    dropdowns.forEach(other => {
                        if (other !== dropdown) {
                            other.classList.remove('active');
                            const otherMenu = other.querySelector('.dropdown-menu');
                            if (otherMenu) otherMenu.style.maxHeight = '0px';
                        }
                    });

                    dropdown.classList.toggle('active');
                    if (!isActive) {
                        menu.style.maxHeight = menu.scrollHeight + 'px';
                    } else {
                        menu.style.maxHeight = '0px';
                    }
                }
            });
        });

        // Close menu when clicking a link (especially useful on mobile)
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                // If it's a dropdown toggle, don't close the menu
                if (link.classList.contains('dropdown-toggle')) {
                    return;
                }
                
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    const icon = burgerMenuBtn.querySelector('i');
                    icon.classList.remove('ph-x');
                    icon.classList.add('ph-list');
                }
            });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Contact Form Submission & Overlay
    const contactForm = document.getElementById('contactForm');
    const contactOverlay = document.getElementById('contactOverlay');
    
    if (contactForm && contactOverlay) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Show overlay
            contactOverlay.style.display = 'flex';
            setTimeout(() => {
                contactOverlay.classList.add('active');
            }, 10);
            contactForm.reset();
        });

        // Close overlay when clicking outside the message
        contactOverlay.addEventListener('click', (e) => {
            if (!e.target.closest('.contact-overlay-content')) {
                contactOverlay.classList.remove('active');
                setTimeout(() => {
                    contactOverlay.style.display = 'none';
                }, 500); // Matches CSS transition duration
            }
        });
    }

    // Like button toggle with aria & keyboard support
    const likeBtns = document.querySelectorAll('.like-btn');
    likeBtns.forEach(btn => {
        btn.setAttribute('role', 'button');
        btn.setAttribute('tabindex', '0');
        btn.setAttribute('aria-pressed', 'false');

        const toggle = (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            const icon = btn.querySelector('i');
            const pressed = btn.getAttribute('aria-pressed') === 'true';
            
            if (!pressed) {
                if (icon) {
                    icon.classList.remove('ph-heart');
                    icon.classList.add('ph-fill', 'ph-heart');
                    icon.style.color = 'var(--color-accent)';
                }
                btn.setAttribute('aria-pressed', 'true');
                btn.classList.add('liked');
            } else {
                if (icon) {
                    icon.classList.remove('ph-fill', 'ph-heart');
                    icon.classList.add('ph-heart');
                    icon.style.color = ''; 
                }
                btn.setAttribute('aria-pressed', 'false');
                btn.classList.remove('liked');
            }
        };

        btn.addEventListener('click', toggle);
        btn.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') {
                ev.preventDefault();
                toggle();
            }
        });
    });

    // Textarea counter (max symbols)
    const counterWrappers = document.querySelectorAll('.textarea-wrapper');
    counterWrappers.forEach(wrapper => {
        const textarea = wrapper.querySelector('textarea');
        const counter = wrapper.querySelector('.textarea-counter');
        if (!textarea || !counter) return;

        const max = Number(textarea.getAttribute('maxlength')) || 400;
        const update = () => {
            const len = (textarea.value || '').length;
            counter.textContent = `${len}/${max}`;
        };

        textarea.addEventListener('input', update);
        update();
    });

    // Parallax effect for intro section frames (throttled for performance)
    const introWrappers = document.querySelectorAll('.intro-image-wrapper');
    const throttle = (fn, wait = 100) => {
        let last = 0;
        return (...args) => {
            const now = Date.now();
            if (now - last >= wait) {
                last = now;
                fn(...args);
            }
        };
    };

    const handleParallax = () => {
        introWrappers.forEach((wrapper, index) => {
            const rect = wrapper.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const speed = index === 0 ? -0.1 : 0.1;
                const yPos = (window.innerHeight / 2 - rect.top) * speed;
                wrapper.style.transform = `translateY(${yPos}px)`;
            }
        });
    };

    window.addEventListener('scroll', throttle(handleParallax, 80));

    // Services Carousel & Modal Logic
    const servicesData = [
        { title: "Bespoke furniture", desc: "Custom Sketching: We transform your ideas into precise digital concepts tailored to your lifestyle.\n\nMaster Craftsmanship: Artisans carefully handcraft each piece, combining traditional joinery with modern precision.\n\nWorkshop Updates: We share photo or video updates during production so you can feel connected to the process.", image: "assets/service_bespoke.jpg" },
        { title: "Material Selection & Consultation", desc: "Texture Matching: We analyze your interior’s lighting to recommend the perfect materials, textures, and shades.\n\nTactile Samples: You can explore samples and view real finishes before making your final choice.\n\nDurability Check: We select the optimal material hardness and protective coatings based on your daily usage.", image: "assets/service_material.png" },
        { title: "On-Site Measurements", desc: "Millimeter Precision: Our team takes ultra-accurate measurements to eliminate any margin of error.\n\nTechnical Inspection: We check floor levels, wall structures, and hidden elements like wiring or baseboards.\n\nErgonomic Flow: We map out the space to ensure the future piece leaves plenty of room for comfortable movement.", image: "assets/service_measurements.png" },
        { title: "Layout design", desc: "3D Visualization: We create realistic models so you can see the true scale of the furniture in your room.\n\nClearance Mapping: Using 2D blueprints, we ensure all doors, drawers, and walkways function effortlessly.\n\nFinal Approval: We refine the digital layout together until it completely matches your vision before manufacturing.", image: "assets/service_design.jpg" }
    ];

    const serviceSlides = document.querySelectorAll('.service-slide');
    const btnPrevService = document.getElementById('btn-prev-service');
    const btnNextService = document.getElementById('btn-next-service');
    let currentSlide = 0;

    function updateCarousel() {
        const isMobile = window.innerWidth <= 768;
        
        serviceSlides.forEach((slide, i) => {
            if (isMobile) {
                // Vertical Layout
                const spacing = 20;
                let y = 0;
                if (i === currentSlide) {
                    y = 0; // Active slide
                    slide.style.opacity = '1';
                    slide.style.visibility = 'visible';
                } else if (i < currentSlide) {
                    y = - (currentSlide - i) * 20; // Stack above with small offset
                    slide.style.opacity = '0.5';
                    slide.style.visibility = 'hidden';
                } else {
                    y = (i - currentSlide) * 20; // Stack below
                    slide.style.opacity = '0.5';
                    slide.style.visibility = 'hidden';
                }
                slide.style.transform = `translateY(${y}px)`;
                slide.style.zIndex = i === currentSlide ? 10 : (i < currentSlide ? i : servicesData.length - i);
            } else {
                // Original Desktop Horizontal Layout
                const offset = 176; 
                const cardWidth = 704; 
                const spacing = 40; 

                let x = 0;
                if (i <= currentSlide) {
                    x = i * offset; 
                } else {
                    x = currentSlide * offset + (i - currentSlide) * (cardWidth + spacing);
                }
                slide.style.transform = `translateX(${x}px)`;
                slide.style.zIndex = i + 1;
                slide.style.opacity = '1';
                slide.style.visibility = 'visible';
            }
        });
    }

    if (serviceSlides.length > 0) {
        updateCarousel();
        window.addEventListener('resize', updateCarousel); // Update on resize

        if (btnNextService) {
            btnNextService.addEventListener('click', () => {
                currentSlide = Math.min(currentSlide + 1, serviceSlides.length - 1);
                updateCarousel();
            });
        }
        
        if (btnPrevService) {
            btnPrevService.addEventListener('click', () => {
                currentSlide = Math.max(currentSlide - 1, 0);
                updateCarousel();
            });
        }
    }

    // Modal
    const servicesModal = document.getElementById('servicesModal');
    const servicesModalBackdrop = document.getElementById('servicesModalBackdrop');
    const modalTitle = document.getElementById('modalServiceTitle');
    const modalDesc = document.getElementById('modalServiceDesc');
    const modalImage = document.getElementById('modalServiceImage');
    const closeServicesModal = document.getElementById('closeServicesModal');
    const prevModalBtn = document.getElementById('prevServiceBtn');
    const nextModalBtn = document.getElementById('nextServiceBtn');
    let modalIndex = 0;

    function updateModalContent() {
        if (!modalTitle || !modalDesc || !modalImage) return;
        modalTitle.textContent = servicesData[modalIndex].title;
        modalDesc.textContent = servicesData[modalIndex].desc;
        modalImage.src = servicesData[modalIndex].image;
        modalImage.alt = servicesData[modalIndex].title;
    }

    function openServicesModal(index) {
        modalIndex = index;
        updateModalContent();
        document.body.style.overflow = 'hidden'; // Prevent scroll
        servicesModalBackdrop.style.display = 'block';
        servicesModal.style.display = 'flex';
        setTimeout(() => {
            servicesModalBackdrop.classList.add('active');
            servicesModal.classList.add('active');
        }, 10);
    }

    function closeServicesModalFunc() {
        document.body.style.overflow = ''; // Restore scroll
        servicesModalBackdrop.classList.remove('active');
        servicesModal.classList.remove('active');
        setTimeout(() => {
            servicesModalBackdrop.style.display = 'none';
            servicesModal.style.display = 'none';
        }, 300);
    }

    if (servicesModal) {
        serviceSlides.forEach((card, index) => {
            card.addEventListener('click', () => openServicesModal(index));
        });
        // Click on backdrop to close
        if (servicesModalBackdrop) servicesModalBackdrop.addEventListener('click', closeServicesModalFunc);
        
        if (prevModalBtn) {
            prevModalBtn.addEventListener('click', () => {
                modalIndex = (modalIndex - 1 + servicesData.length) % servicesData.length;
                updateModalContent();
            });
        }
        if (nextModalBtn) {
            nextModalBtn.addEventListener('click', () => {
                modalIndex = (modalIndex + 1) % servicesData.length;
                updateModalContent();
            });
        }
    }
    
    // Toggle button color swapping
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('orange')) {
                btn.classList.remove('orange');
                btn.classList.add('brown');
            } else {
                btn.classList.remove('brown');
                btn.classList.add('orange');
            }
        });
    });

    // Hero frame automatic random animation
    const heroSlides = document.querySelectorAll('.hero-animated-slide');
    if (heroSlides.length > 1) {
        // Find the index of the initially active slide
        let currentIndex = Array.from(heroSlides).findIndex(slide => slide.classList.contains('active'));
        if (currentIndex === -1) currentIndex = 0;
        
        function getNextRandomIndex(currentIdx, totalCount) {
            if (totalCount <= 1) return 0;
            let nextIdx = currentIdx;
            while (nextIdx === currentIdx) {
                nextIdx = Math.floor(Math.random() * totalCount);
            }
            return nextIdx;
        }

        // Faster hero rotation speed
        setInterval(() => {
            const nextIndex = getNextRandomIndex(currentIndex, heroSlides.length);
            // Ensure we remove active from ALL slides just in case
            heroSlides.forEach(slide => slide.classList.remove('active'));
            heroSlides[nextIndex].classList.add('active');
            currentIndex = nextIndex;
        }, 1000);
    }

    // Ensure catalogue images are lazy-loaded for performance
    document.querySelectorAll('.catalogue-container img').forEach(img => {
        if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    });

    // Morphing Title Characters Animation
    const morphChars = document.querySelectorAll('.morph-char');
    if (morphChars.length > 0) {
        let hasAnimated = false;
        let animationInterval = null;

        function startAnimationLoop() {
            if (animationInterval) clearInterval(animationInterval);
            animationInterval = setInterval(() => {
                hasAnimated = !hasAnimated;
                morphChars.forEach(char => {
                    char.classList.toggle('animate', hasAnimated);
                });
            }, 2300);
        }

        function initializeMorphChars(isResize = false) {
            // Temporarily reset state to measure natural static widths
            morphChars.forEach(char => {
                char.classList.remove('animate');
                char.style.removeProperty('--w-upper-raw');
                char.style.removeProperty('--w-lower-raw');
            });
            
            // Force a DOM layout recalculation to ensure accurate measurements
            document.body.offsetHeight;
            
            // Measure actual layout dimensions for uppercase and lowercase variants
            morphChars.forEach(char => {
                const upper = char.querySelector('.char-upper');
                const lower = char.querySelector('.char-lower');
                if (upper && lower) {
                    const wUpper = upper.getBoundingClientRect().width;
                    const wLower = lower.getBoundingClientRect().width;
                    char.style.setProperty('--w-upper-raw', wUpper);
                    char.style.setProperty('--w-lower-raw', wLower);
                }
            });
            
            if (!isResize) {
                hasAnimated = false;
                startAnimationLoop();
            } else {
                morphChars.forEach(char => {
                    char.classList.toggle('animate', hasAnimated);
                });
                startAnimationLoop();
            }
        }

        // Run measurements after custom fonts are loaded to ensure correct widths
        if (document.fonts) {
            // Force load Glendale font specifically to avoid fallback font measurements
            document.fonts.load("1em Glendale").then(() => {
                setTimeout(() => initializeMorphChars(false), 100);
            }).catch(() => {
                // Fallback to ready promise if loading fails
                document.fonts.ready.then(() => {
                    setTimeout(() => initializeMorphChars(false), 100);
                });
            });
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => initializeMorphChars(false), 100);
            });
        }

        // Handle page resize with a debounce
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                initializeMorphChars(true);
            }, 150);
        });
    }
});
