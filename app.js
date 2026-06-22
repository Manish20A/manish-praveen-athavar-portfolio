/* Main Portfolio JavaScript Logic for Manish Athavar */

// Force browser to start at the top of the page on refresh (disable scroll restoration)
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggling
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // 2. Light/Dark Theme Toggling
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Check for saved theme preference, default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    body.className = savedTheme;
    updateThemeIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (body.classList.contains('dark-theme')) {
                body.classList.replace('dark-theme', 'light-theme');
                localStorage.setItem('theme', 'light-theme');
                updateThemeIcon('light-theme');
            } else {
                body.classList.replace('light-theme', 'dark-theme');
                localStorage.setItem('theme', 'dark-theme');
                updateThemeIcon('dark-theme');
            }
        });
    }

    function updateThemeIcon(theme) {
        if (!themeToggle) return;
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark-theme') {
            icon.className = 'fa-solid fa-sun';
        } else {
            icon.className = 'fa-solid fa-moon';
        }
    }

    // 3. Typewriter Effect
    const typewriterElement = document.getElementById('typewriter-text');
    const roles = [
        'Authentic "Builder"',
        'AI & Cloud Practitioner',
        'Automation Systems Architect',
        'Innovative Full-Stack Developer',
        'Aspiring Software Engineer',
        'ADNOC Schools Graduate',
        'IELTS 6.5 Certified Communicator',
        'Open-Source Contributor',
        'Efficient Script Developer',
        'Analytical Problem Solver'
    ];
    
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        if (!typewriterElement) return;
        
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            typewriterElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typewriterElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentRole.length) {
            // Pause at the end of the word
            isDeleting = true;
            typingSpeed = 2000; // Delay before deleting
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typingSpeed = 500; // Delay before writing next word
        }

        setTimeout(type, typingSpeed);
    }

    // Initialize Typewriter
    if (typewriterElement) {
        setTimeout(type, 1000);
    }

    // 4. Interactive Developer Terminal Shell
    const terminalInput = document.getElementById('terminal-input');
    const terminalBody = document.getElementById('terminal-body');

    if (terminalInput && terminalBody) {
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = terminalInput.value.trim().toLowerCase();
                executeTerminalCommand(command);
                terminalInput.value = '';
            }
        });

        // Double-clicking inside the terminal container focuses input
        const terminalContainer = document.querySelector('.terminal-container');
        if (terminalContainer) {
            terminalContainer.addEventListener('click', () => {
                terminalInput.focus();
            });
        }
    }

    function executeTerminalCommand(cmd) {
        // Create user echo line
        const inputRow = document.createElement('div');
        inputRow.className = 'terminal-row';
        inputRow.innerHTML = `<span class="prompt-symbol">manish@portfolio:~$</span> <span>${escapeHtml(cmd)}</span>`;
        
        // Find prompt row and insert before it
        const promptRow = terminalBody.querySelector('.prompt-row');
        terminalBody.insertBefore(inputRow, promptRow);

        if (cmd === '') return;

        const outputRow = document.createElement('div');
        outputRow.className = 'terminal-row';

        switch (cmd) {
            case 'help':
                outputRow.innerHTML = `
                    <div class="text-command-header">Available Commands:</div>
                    <div>  <span class="highlight">about</span>      - Personal bio and background details</div>
                    <div>  <span class="highlight">skills</span>     - Programming languages and technical strengths</div>
                    <div>  <span class="highlight">projects</span>   - Key software engineering projects with details</div>
                    <div>  <span class="highlight">contact</span>    - Social links and communication profiles</div>
                    <div>  <span class="highlight">repo</span>       - Link to this portfolio's GitHub repository</div>
                    <div>  <span class="highlight">clear</span>      - Clear the console screen</div>
                    <div>  <span class="highlight">help</span>       - Display this assistance list</div>
                `;
                break;
            case 'about':
                outputRow.innerHTML = `
                    <div class="text-command-header">About Manish Praveen Athavar:</div>
                    <div>• 7th-Semester Computer Science & Engineering student at <span class="highlight">Srinivas Institute of Technology</span> (Srinivas University).</div>
                    <div>• International foundations: Attended <span class="highlight">ADNOC Schools</span> in Abu Dhabi, UAE.</div>
                    <div>• Verified global communicator with a documented <span class="highlight">IELTS Score of 6.5</span>.</div>
                    <div>• Dynamic "Builder" mindset: Focused on production workflows, latency optimization, and automated delivery.</div>
                `;
                break;
            case 'skills':
                outputRow.innerHTML = `
                    <div class="text-command-header">Technical Skill Checklist:</div>
                    <div>• <span class="highlight">Languages:</span> JavaScript (ES6+), Python, Java, C/C++, PHP, R, HTML5, CSS3</div>
                    <div>• <span class="highlight">Libraries & Frameworks:</span> Flutter, NodeJS, ExpressJS, Canvas API</div>
                    <div>• <span class="highlight">Databases & Cloud:</span> SQL, MongoDB, Firebase, AWS API Gateway, Vercel</div>
                    <div>• <span class="highlight">AI Core:</span> LLM Prompt Engineering, RAG Architectures, Automation Pipelines</div>
                    <div>• <span class="highlight">Soft Skills:</span> Proactive Leadership, Collaborative Pair-Programming, Public Speaking</div>
                `;
                break;
            case 'projects':
                outputRow.innerHTML = `
                    <div class="text-command-header">Key Projects:</div>
                    <div style="margin-bottom: 0.5rem">
                        <strong>1. LiveScoreX (Chrome Extension):</strong>
                        <div>Ultra-low-latency real-time sports tracker with zero background footprint.</div>
                    </div>
                    <div style="margin-bottom: 0.5rem">
                        <strong>2. CodeMotion (Web Typing Simulator):</strong>
                        <div>Replicates VS Code terminal and workspace to export mock video animations.</div>
                    </div>
                    <div style="margin-bottom: 0.5rem">
                        <strong>3. VidGen-AI (Multimodal Automation Pipeline):</strong>
                        <div>NodeJS system chaining Remotion and Gemini API to generate marketing media.</div>
                    </div>
                    <div style="margin-bottom: 0.5rem">
                        <strong>4. OptiShrink Pro (Image Compressor):</strong>
                        <div>Fully client-side image resizer utilizing HTML5 Canvas. <a href="projects/optishrink/index.html" target="_blank" style="color: var(--secondary)">[Try Demo]</a></div>
                    </div>
                    <div>
                        <strong>5. Savayava NGO (Digital Transformation):</strong>
                        <div>PHP/SQL backend overhaul, scaling monthly web traffic and securing radio features.</div>
                    </div>
                `;
                break;
            case 'contact':
                outputRow.innerHTML = `
                    <div class="text-command-header">Contact & Connections:</div>
                    <div>• <span class="highlight">Email:</span> <a href="mailto:manishathavar20@gmail.com" style="color: #45f3ff">manishathavar20@gmail.com</a></div>
                    <div>• <span class="highlight">LinkedIn:</span> <a href="https://www.linkedin.com/in/manish-athavar-/" target="_blank" style="color: #45f3ff">linkedin.com/in/manish-athavar-</a></div>
                    <div>• <span class="highlight">GitHub:</span> <a href="https://github.com/Manish20A" target="_blank" style="color: #45f3ff">github.com/Manish20A</a></div>
                `;
                break;
            case 'repo':
            case 'github':
                outputRow.innerHTML = `
                    <div class="text-command-header">GitHub Repository Link:</div>
                    <div>• <span class="highlight">Portfolio Code:</span> <a href="https://github.com/Manish20A/manish-praveen-athavar-portfolio" target="_blank" style="color: #45f3ff">github.com/Manish20A/manish-praveen-athavar-portfolio</a></div>
                    <div>• Feel free to star ⭐ the repository if you like the interactive terminal and design!</div>
                `;
                break;
            case 'clear':
                // Remove all rows except the prompt row
                const rows = terminalBody.querySelectorAll('.terminal-row');
                rows.forEach(row => {
                    if (!row.classList.contains('prompt-row')) {
                        row.remove();
                    }
                });
                return; // Return immediately, no outputs
            default:
                outputRow.innerHTML = `<span style="color: #ff5f56">Command not found: "${escapeHtml(cmd)}". Type 'help' to view available options.</span>`;
        }

        terminalBody.insertBefore(outputRow, promptRow);
        
        // Auto scroll terminal to the bottom
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // 7. Active Navigation Link Highlighting on Scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinksList = document.querySelectorAll('.nav-link');

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
     };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinksList.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
});

// 6. Contact Form Submission Logic (Global Scope)
window.handleFormSubmit = function(event) {
    event.preventDefault();
    
    const submitBtn = document.querySelector('.btn-submit');
    const successOverlay = document.getElementById('form-success-overlay');
    
    // Read Form Values
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const subject = document.getElementById('user-subject').value;
    const message = document.getElementById('user-message').value;

    // Client-side Validation (simple checks)
    if (!name || !email || !subject || !message) return;

    // Show loading visual state
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
    }

    // Mock API request response (simulate 1.2s delay)
    setTimeout(() => {
        // Save to local storage as an archive database
        const submissions = JSON.parse(localStorage.getItem('contact_messages') || '[]');
        submissions.push({
            name, email, subject, message, date: new Date().toISOString()
        });
        localStorage.setItem('contact_messages', JSON.stringify(submissions));

        // Show Success Overlay
        if (successOverlay) {
            successOverlay.classList.remove('hidden');
        }

        // Reset submit button state
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Send Message</span> <i class="fa-solid fa-paper-plane"></i>';
        }
    }, 1200);
};

window.resetContactForm = function() {
    const contactForm = document.getElementById('contact-form');
    const successOverlay = document.getElementById('form-success-overlay');
    
    if (contactForm) {
        contactForm.reset();
    }
    if (successOverlay) {
        successOverlay.classList.add('hidden');
    }
};

// 7. Interactive Skills Filter Function (Global Scope)
window.filterSkills = function(category, event) {
    // Update active class on filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    if (event) {
        event.currentTarget.classList.add('active');
    }

    const cards = document.querySelectorAll('.skill-card');

    cards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (category === 'all' || cardCat === category) {
            card.classList.remove('filtered-out');
        } else {
            card.classList.add('filtered-out');
        }
    });
};
