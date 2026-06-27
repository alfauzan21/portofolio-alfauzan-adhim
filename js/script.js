document.addEventListener('DOMContentLoaded', () => {
    // 1. Loading Screen (guarded - element may not exist in markup)
    const loader = document.getElementById('loader');

    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
                reveal();
            }, 500);
        }, 1500);
    } else {
        // No loader element present, just run the first reveal pass immediately
        reveal();
    }

    // 2. Set Current Year in Footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // 3. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = mobileMenuBtn.querySelector('i');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        if (mobileMenu.classList.contains('hidden')) {
            menuIcon.classList.remove('bx-x');
            menuIcon.classList.add('bx-menu');
        } else {
            menuIcon.classList.remove('bx-menu');
            menuIcon.classList.add('bx-x');
        }
    });

    // Close mobile menu when a link is clicked
    const mobileLinks = document.querySelectorAll('.mobile-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            menuIcon.classList.remove('bx-x');
            menuIcon.classList.add('bx-menu');
        });
    });

    // 4. Navbar Sticky Effect & Active Link Scroll Spy
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobLinks = document.querySelectorAll('.mobile-link:not([href="#contact"])'); // Exclude contact button style link

    window.addEventListener('scroll', () => {
        // Sticky Navbar
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-glass');
            navbar.classList.replace('bg-dark/50', 'bg-dark/80');
        } else {
            navbar.classList.remove('shadow-glass');
            navbar.classList.replace('bg-dark/80', 'bg-dark/50');
        }

        // Scroll Spy
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });

        mobLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // 5. Typing Animation (Typed.js)
    if (document.getElementById('typed-text')) {
        new Typed('#typed-text', {
            strings: [
                'Front-End Developer',
                'UI/UX Designer',
                'Fotografer',
                'Videografer'
            ],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 2000,
            loop: true,
            cursorChar: '_',
        });
    }

    // 6. Scroll Reveal Animation
    function reveal() {
        const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
        
        for (let i = 0; i < reveals.length; i++) {
            const windowHeight = window.innerHeight;
            const elementTop = reveals[i].getBoundingClientRect().top;
            const elementVisible = 100; // Trigger point
            
            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add('active');
            }
        }
    }

    window.addEventListener('scroll', reveal);
    // Run once immediately so above-the-fold content (and skill bars) animate on load
    reveal();

    // 7. Parallax Effect for Abstract Mesh Background
    const parallax1 = document.getElementById('parallax-1');
    const parallax2 = document.getElementById('parallax-2');
    const parallax3 = document.getElementById('parallax-3');

    if (parallax1 && parallax2 && parallax3) {
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;

            // Damping effect calculations
            const moveX1 = (x - 0.5) * 40; // moves with cursor
            const moveY1 = (y - 0.5) * 40;
            
            const moveX2 = (0.5 - x) * 60; // moves against cursor
            const moveY2 = (0.5 - y) * 60;

            const moveX3 = (x - 0.5) * 20; // subtle movement
            const moveY3 = (0.5 - y) * 20;

            // Apply transform with requestAnimationFrame for smooth performance
            requestAnimationFrame(() => {
                parallax1.style.transform = `translate(${moveX1}px, ${moveY1}px)`;
                parallax2.style.transform = `translate(${moveX2}px, ${moveY2}px)`;
                parallax3.style.transform = `translate(${moveX3}px, ${moveY3}px)`;
            });
        });
    }

    // 8. Theme Toggle (Dark / Light Mode)
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleMobileBtn = document.getElementById('theme-toggle-mobile');

    function initTheme() {
        const storedTheme = localStorage.getItem('theme') || 'dark';
        if (storedTheme === 'light') {
            document.documentElement.classList.add('light');
            updateThemeIcons(true);
        } else {
            document.documentElement.classList.remove('light');
            updateThemeIcons(false);
        }
    }

    function toggleTheme() {
        const isLight = document.documentElement.classList.toggle('light');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        updateThemeIcons(isLight);
    }

    function updateThemeIcons(isLight) {
        const icon = isLight ? 'bx-moon' : 'bx-sun';
        if (themeToggleBtn) {
            themeToggleBtn.querySelector('i').className = `bx ${icon} text-xl`;
        }
        if (themeToggleMobileBtn) {
            themeToggleMobileBtn.querySelector('i').className = `bx ${icon} text-2xl`;
        }
    }

    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
    if (themeToggleMobileBtn) themeToggleMobileBtn.addEventListener('click', toggleTheme);
    initTheme();

    // 9. Load Dynamic Featured Projects
    const featuredGrid = document.getElementById('featured-projects-grid');
    if (featuredGrid && typeof ProjectStore !== 'undefined') {
        const projects = ProjectStore.getProjects();
        // Take latest 3 projects
        const latestThree = projects.slice(0, 3);
        
        featuredGrid.innerHTML = '';
        
        if (latestThree.length === 0) {
            featuredGrid.innerHTML = `
                <div class="col-span-full py-10 text-center">
                    <i class='bx bx-folder-open text-5xl text-gray-600 mb-2'></i>
                    <p class="text-gray-500">Belum ada project yang ditambahkan.</p>
                </div>
            `;
        } else {
            latestThree.forEach((proj, idx) => {
                const card = document.createElement('div');
                const delay = idx * 200;
                card.className = `glass-card rounded-2xl overflow-hidden group border border-glass_border hover:border-gray-500 transition-all duration-500 hover:shadow-white-glow reveal-up active`;
                card.style.animationDelay = `${delay}ms`;
                
                const thumbSrc = proj.thumbnail || getFallbackThumbnail(proj.name);
                
                const techBadges = proj.tech.slice(0, 3).map(t => 
                    `<span class="px-3 py-1 text-xs font-semibold bg-dark/80 backdrop-blur-md rounded-full border border-gray-600 text-white">${t}</span>`
                ).join('');

                let actionButtonsHTML = '';
                if (proj.category === 'Fotografer' || proj.category === 'Videografer') {
                    const buttonText = proj.category === 'Fotografer' ? 'Lihat Foto' : 'Lihat Video';
                    const targetHash = proj.category === 'Fotografer' ? '#foto' : '#video';
                    actionButtonsHTML = `
                        <a href="projects.html${targetHash}" class="flex-1 text-center px-4 py-2 bg-white text-dark hover:bg-gray-200 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-white-glow">${buttonText}</a>
                    `;
                } else {
                    actionButtonsHTML = `
                        <a href="${proj.demoUrl}" ${proj.demoUrl !== '#' ? 'target="_blank"' : ''} class="flex-1 text-center px-4 py-2 bg-white/5 hover:bg-white hover:text-dark border border-gray-700 hover:border-white rounded-lg text-sm font-medium transition-all duration-300">Live Demo</a>
                        <a href="${proj.githubUrl}" ${proj.githubUrl !== '#' ? 'target="_blank"' : ''} class="flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-white hover:text-dark border border-gray-700 rounded-lg transition-all duration-300">
                            <i class='bx bxl-github text-xl'></i>
                        </a>
                    `;
                }

                card.innerHTML = `
                    <div class="relative h-60 overflow-hidden">
                        <div class="absolute inset-0 bg-dark/40 group-hover:bg-dark/10 transition-all duration-500 z-10"></div>
                        <img src="${thumbSrc}" alt="${proj.name}" class="w-full h-full object-cover filter grayscale group-hover:grayscale-[20%] transform group-hover:scale-110 transition-all duration-700">
                        <div class="absolute top-4 right-4 z-20 flex gap-2">
                            ${techBadges}
                        </div>
                    </div>
                    <div class="p-6 relative">
                        <a href="projects.html" class="absolute -top-6 right-6 w-12 h-12 bg-dark rounded-full flex items-center justify-center border border-glass_border group-hover:border-white transition-all duration-300 z-20">
                            <i class='bx bx-link-external text-xl text-gray-400 group-hover:text-white'></i>
                        </a>
                        <span class="text-xs text-gray-500 font-mono block mb-1">${proj.category}</span>
                        <h3 class="text-xl font-bold mb-2 text-gray-200 group-hover:text-white transition-colors duration-300 truncate">${proj.name}</h3>
                        <p class="text-gray-400 text-sm mb-6 line-clamp-3">${proj.description}</p>
                        <div class="flex items-center gap-4">
                            ${actionButtonsHTML}
                        </div>
                    </div>
                `;
                featuredGrid.appendChild(card);
            });
        }
    }

    function getFallbackThumbnail(text) {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
                <rect width="800" height="600" fill="#0f0f0f"/>
                <circle cx="400" cy="300" r="180" fill="none" stroke="#222222" stroke-width="2"/>
                <circle cx="400" cy="300" r="280" fill="none" stroke="#181818" stroke-width="1"/>
                <text x="50%" y="45%" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="38" font-weight="800" fill="#ffffff">&lt;Project/&gt;</text>
                <text x="50%" y="55%" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="20" font-weight="500" fill="#666666">${escapeHtml(text)}</text>
            </svg>
        `;
        return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }

    function escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
});