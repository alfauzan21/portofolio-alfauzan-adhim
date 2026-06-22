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
});