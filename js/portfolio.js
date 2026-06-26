/**
 * Portfolio Projects Viewer Script
 * Handles dynamic grid rendering, filtering, sorting, pagination, and details modal.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if ProjectStore is available
    if (typeof ProjectStore === 'undefined') {
        console.error('ProjectStore is not loaded! Make sure project-store.js is imported.');
        return;
    }

    // State Management
    let projects = [];
    let filteredProjects = [];
    let currentPage = 1;
    const itemsPerPage = 10;

    // DOM Elements
    const gridContainer = document.getElementById('websites-grid-container');
    const loadingEl = document.getElementById('grid-loading');
    const emptyEl = document.getElementById('grid-empty');

    // Multimedia DOM Elements
    const fotoGridContainer = document.getElementById('foto-grid-container');
    const fotoEmptyEl = document.getElementById('foto-empty');
    const videoGridContainer = document.getElementById('video-grid-container');
    const videoEmptyEl = document.getElementById('video-empty');

    // Controls
    const searchInput = document.getElementById('portfolio-search');
    const filterCategory = document.getElementById('portfolio-filter-category');
    const sortSelect = document.getElementById('portfolio-sort');

    // Modals
    const detailModal = document.getElementById('project-detail-modal');
    const closeDetailBtn = document.getElementById('close-detail-modal');
    
    // Detail Modal Elements
    const detailCategory = document.getElementById('detail-category');
    const detailName = document.getElementById('detail-name');
    const detailThumbnail = document.getElementById('detail-thumbnail');
    const detailDate = document.getElementById('detail-date');
    const detailStatus = document.getElementById('detail-status');
    const detailDescription = document.getElementById('detail-description');
    const detailTechContainer = document.getElementById('detail-tech');
    const detailDemoBtn = document.getElementById('detail-demo-btn');
    const detailGithubBtn = document.getElementById('detail-github-btn');

    // Pagination
    const paginationContainer = document.getElementById('grid-pagination-container');
    const paginationInfo = document.getElementById('grid-pagination-info');
    const pageNumbersContainer = document.getElementById('grid-page-numbers-container');
    const btnPrevPage = document.getElementById('grid-btn-prev');
    const btnNextPage = document.getElementById('grid-btn-next');

    // ==========================================
    // THEME TOGGLER (DARK / LIGHT MODE)
    // ==========================================
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

    // ==========================================
    // LOAD & SYNC DATA
    // ==========================================
    function init() {
        showLoading();
        setTimeout(() => {
            projects = ProjectStore.getProjects();
            filterAndRender();
        }, 400);
    }

    // Listen to changes in project store
    window.addEventListener('portfolio-data-changed', (e) => {
        projects = e.detail.projects;
        filterAndRender();
    });

    // ==========================================
    // FILTER, SEARCH, SORT & DISPLAY
    // ==========================================
    function filterAndRender() {
        const query = searchInput.value.toLowerCase().trim();
        const cat = filterCategory.value;
        const sort = sortSelect.value;

        // 1. Filter
        filteredProjects = projects.filter(proj => {
            // Exclude multimedia categories from the websites panel
            if (proj.category === 'Fotografer' || proj.category === 'Videografer') {
                return false;
            }

            const matchesQuery = proj.name.toLowerCase().includes(query) || 
                                 proj.description.toLowerCase().includes(query) ||
                                 proj.tech.some(t => t.toLowerCase().includes(query));
            
            // Standard category filtering
            const matchesCat = !cat || proj.category === cat;

            return matchesQuery && matchesCat;
        });

        // 2. Sort
        if (sort === 'terbaru') {
            filteredProjects.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sort === 'terlama') {
            filteredProjects.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        // Adjust page boundaries
        const maxPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;
        if (currentPage > maxPages) {
            currentPage = maxPages;
        }

        renderGrid();
        renderMultimedia();
    }

    function renderGrid() {
        gridContainer.innerHTML = '';
        
        if (filteredProjects.length === 0) {
            emptyEl.classList.remove('hidden');
            paginationContainer.classList.add('hidden');
            return;
        }

        emptyEl.classList.add('hidden');
        paginationContainer.classList.remove('hidden');

        // Page calculation
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredProjects.length);
        const paginatedItems = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

        paginatedItems.forEach((proj, idx) => {
            const card = document.createElement('div');
            // Adding dynamic delay styles matching original template
            const delayClass = `delay-${(idx % 3) * 100}`;
            card.className = `glass-card project-card rounded-2xl overflow-hidden group reveal-up active ${delayClass}`;
            
            const thumbSrc = proj.thumbnail || getFallbackThumbnail(proj.name);
            
            // Badges string
            const techBadges = proj.tech.map(t => 
                `<span class="px-2.5 py-0.5 text-xs font-semibold bg-dark/80 backdrop-blur-md rounded-full border border-white/10 text-gray-300">${t}</span>`
            ).join('');

            card.innerHTML = `
                <div class="relative h-56 overflow-hidden">
                    <div class="absolute inset-0 bg-dark/40 group-hover:bg-dark/10 transition-all duration-500 z-10"></div>
                    <img src="${thumbSrc}" alt="${proj.name}" class="w-full h-full object-cover filter grayscale group-hover:grayscale-[20%] transform group-hover:scale-110 transition-all duration-700">
                    <div class="absolute top-4 right-4 z-20 flex flex-wrap gap-2 justify-end">
                        ${techBadges}
                    </div>
                </div>
                <div class="p-6 relative">
                    <button class="btn-detail-trigger absolute -top-6 right-6 w-12 h-12 bg-dark rounded-full flex items-center justify-center border border-white/10 group-hover:border-white transition-all duration-300 z-20" data-id="${proj.id}" title="Lihat Detail Proyek">
                        <i class='bx bx-zoom-in text-xl text-gray-400 group-hover:text-white pointer-events-none'></i>
                    </button>
                    <div class="text-xs text-gray-500 font-mono mb-1.5 flex justify-between items-center">
                        <span>${proj.category}</span>
                        <span>${formatDate(proj.date)}</span>
                    </div>
                    <h3 class="text-xl font-bold mb-2 text-gray-200 group-hover:text-white transition-colors block truncate" title="${proj.name}">${proj.name}</h3>
                    <p class="text-gray-400 text-sm mb-5 leading-relaxed line-clamp-3">${proj.description}</p>
                    <div class="flex items-center gap-3">
                        <a href="${proj.demoUrl}" ${proj.demoUrl !== '#' ? 'target="_blank"' : ''} class="flex-1 text-center px-4 py-2 bg-white/5 hover:bg-white hover:text-dark border border-gray-700 hover:border-white rounded-lg text-sm font-medium transition-all duration-300">Live Demo</a>
                        <a href="${proj.githubUrl}" ${proj.githubUrl !== '#' ? 'target="_blank"' : ''} class="flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-white hover:text-dark border border-gray-700 rounded-lg transition-all duration-300" title="GitHub Repository">
                            <i class='bx bxl-github text-xl'></i>
                        </a>
                        <button class="btn-detail-trigger px-3 py-2 bg-white/5 border border-gray-700 hover:border-white rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-all" data-id="${proj.id}">
                            Detail
                        </button>
                    </div>
                </div>
            `;

            gridContainer.appendChild(card);
        });

        // Update Pagination Info
        paginationInfo.textContent = `Menampilkan ${startIndex + 1}-${endIndex} dari ${filteredProjects.length} project`;
        renderPaginationButtons();
    }

    function renderPaginationButtons() {
        const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
        
        btnPrevPage.disabled = currentPage === 1;
        btnNextPage.disabled = currentPage === totalPages || totalPages === 0;

        pageNumbersContainer.innerHTML = '';
        
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            const isActive = i === currentPage;
            btn.className = `w-8 h-8 rounded-lg text-xs font-mono font-bold border transition-colors flex items-center justify-center ${
                isActive 
                    ? 'bg-white text-dark border-white font-extrabold shadow-white-glow' 
                    : 'border-white/10 hover:border-white text-gray-400 hover:text-white'
            }`;
            btn.textContent = i;
            btn.addEventListener('click', () => {
                currentPage = i;
                window.scrollTo({ top: gridContainer.offsetTop - 120, behavior: 'smooth' });
                renderGrid();
            });
            pageNumbersContainer.appendChild(btn);
        }
    }

    btnPrevPage.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            window.scrollTo({ top: gridContainer.offsetTop - 120, behavior: 'smooth' });
            renderGrid();
        }
    });

    btnNextPage.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            window.scrollTo({ top: gridContainer.offsetTop - 120, behavior: 'smooth' });
            renderGrid();
        }
    });

    // Wire events
    searchInput.addEventListener('input', () => {
        currentPage = 1;
        simulateSearchEffects(filterAndRender);
    });
    filterCategory.addEventListener('change', () => {
        currentPage = 1;
        simulateSearchEffects(filterAndRender);
    });
    sortSelect.addEventListener('change', () => {
        currentPage = 1;
        simulateSearchEffects(filterAndRender);
    });

    function showLoading() {
        loadingEl.classList.remove('hidden');
        gridContainer.classList.add('hidden');
        emptyEl.classList.add('hidden');
        paginationContainer.classList.add('hidden');
    }

    function simulateSearchEffects(callback) {
        gridContainer.style.opacity = '0.3';
        setTimeout(() => {
            callback();
            gridContainer.style.opacity = '1';
        }, 150);
    }

    // ==========================================
    // DETAIL MODAL LOGIC
    // ==========================================
    
    // Delegation listener for detail clicks
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.btn-detail-trigger');
        if (trigger) {
            const id = trigger.dataset.id;
            const project = ProjectStore.getProjectById(id);
            if (project) {
                showDetailModal(project);
            }
        }
    });

    function showDetailModal(proj) {
        detailCategory.textContent = proj.category;
        detailName.textContent = proj.name;
        detailThumbnail.src = proj.thumbnail || getFallbackThumbnail(proj.name);
        detailDate.textContent = formatDate(proj.date);
        detailDescription.textContent = proj.description;

        // Status badge
        detailStatus.textContent = proj.status;
        detailStatus.className = `inline-block px-2.5 py-0.5 rounded-full border text-xs font-semibold ${
            proj.status === 'Selesai'
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-950/20 border-amber-500/30 text-amber-400'
        }`;

        // Tech list
        detailTechContainer.innerHTML = proj.tech.map(t => 
            `<span class="px-2.5 py-1 text-xs font-semibold bg-white/5 border border-white/10 rounded-lg text-gray-300">${t}</span>`
        ).join('');

        // Action URLs
        detailDemoBtn.href = proj.demoUrl;
        if (proj.demoUrl === '#') {
            detailDemoBtn.classList.add('opacity-40', 'pointer-events-none');
        } else {
            detailDemoBtn.classList.remove('opacity-40', 'pointer-events-none');
        }

        detailGithubBtn.href = proj.githubUrl;
        if (proj.githubUrl === '#') {
            detailGithubBtn.classList.add('opacity-40', 'pointer-events-none');
        } else {
            detailGithubBtn.classList.remove('opacity-40', 'pointer-events-none');
        }

        detailModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    if (closeDetailBtn) {
        closeDetailBtn.addEventListener('click', closeDetailModal);
    }
    if (detailModal) {
        detailModal.addEventListener('click', (e) => {
            if (e.target === detailModal) closeDetailModal();
        });
    }

    function closeDetailModal() {
        detailModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    // Escape Key mapped in parent script/projects page also
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && detailModal && detailModal.classList.contains('open')) {
            closeDetailModal();
        }
    });

    // ==========================================
    // HELPERS
    // ==========================================
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;

        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
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

    function renderMultimedia() {
        if (!fotoGridContainer || !videoGridContainer) return;

        fotoGridContainer.innerHTML = '';
        videoGridContainer.innerHTML = '';

        const photoProjects = projects.filter(p => p.category === 'Fotografer');
        const videoProjects = projects.filter(p => p.category === 'Videografer');

        // Sort both by date latest first
        photoProjects.sort((a, b) => new Date(b.date) - new Date(a.date));
        videoProjects.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Render Fotografer
        if (photoProjects.length === 0) {
            fotoEmptyEl.classList.remove('hidden');
        } else {
            fotoEmptyEl.classList.add('hidden');
            photoProjects.forEach((proj, idx) => {
                const card = document.createElement('div');
                const delayClass = `delay-${(idx % 2) * 100 + 100}`;
                card.className = `glass-card project-card rounded-2xl overflow-hidden cursor-pointer group reveal-up active ${delayClass} open-photo-modal`;
                card.dataset.albumTitle = proj.name;
                card.dataset.albumDesc = proj.description;
                card.dataset.photos = JSON.stringify(proj.photos || []);

                const thumbSrc = proj.thumbnail || getFallbackThumbnail(proj.name);
                const countPhotos = (proj.photos || []).length;
                
                card.innerHTML = `
                    <div class="relative h-56 overflow-hidden">
                        <div class="absolute inset-0 bg-dark/40 group-hover:bg-dark/10 transition-all duration-500 z-10"></div>
                        <img src="${thumbSrc}" alt="${proj.name}" class="w-full h-full object-cover filter grayscale group-hover:grayscale-[20%] transform group-hover:scale-110 transition-all duration-700">
                        <div class="absolute top-4 right-4 z-20">
                            <span class="px-3 py-1 text-xs font-semibold bg-dark/80 backdrop-blur-md rounded-full border border-gray-600 text-white">${countPhotos} Foto</span>
                        </div>
                        <div class="absolute bottom-4 left-4 z-20 flex items-center gap-2 text-white/60 text-sm">
                            <i class='bx bx-camera text-lg'></i> Klik untuk lihat
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="flex items-start justify-between">
                            <div>
                                <h3 class="text-xl font-bold text-gray-200 group-hover:text-white transition-colors mb-1">${proj.name}</h3>
                                <p class="text-gray-500 text-sm font-mono">${formatDate(proj.date)}</p>
                            </div>
                            <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-dark group-hover:border-white transition-all duration-300 shrink-0">
                                <i class='bx bx-expand-alt text-lg'></i>
                            </div>
                        </div>
                        <p class="text-gray-400 text-sm mt-3 leading-relaxed line-clamp-2">${proj.description}</p>
                    </div>
                `;
                fotoGridContainer.appendChild(card);
            });
        }

        // Render Videografer
        if (videoProjects.length === 0) {
            videoEmptyEl.classList.remove('hidden');
        } else {
            videoEmptyEl.classList.add('hidden');
            videoProjects.forEach((proj, idx) => {
                const card = document.createElement('div');
                const delayClass = `delay-${(idx % 2) * 100 + 100}`;
                card.className = `glass-card project-card rounded-2xl overflow-hidden cursor-pointer group reveal-up active ${delayClass} open-video-modal`;
                card.dataset.videoTitle = proj.name;
                card.dataset.videoDesc = proj.description;
                card.dataset.videoDate = formatDate(proj.date);
                card.dataset.videoUrl = proj.videoUrl || '';
                card.dataset.videoType = 'youtube';

                const thumbSrc = proj.thumbnail || getFallbackThumbnail(proj.name);
                
                card.innerHTML = `
                    <div class="relative h-56 overflow-hidden">
                        <div class="absolute inset-0 bg-dark/50 group-hover:bg-dark/20 transition-all duration-500 z-10 flex items-center justify-center">
                            <div class="w-16 h-16 rounded-full bg-white/10 border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:text-dark transition-all duration-300">
                                <i class='bx bx-play text-3xl text-white group-hover:text-dark'></i>
                            </div>
                        </div>
                        <img src="${thumbSrc}" alt="${proj.name}" class="w-full h-full object-cover filter grayscale group-hover:grayscale-[30%] transition-all duration-700">
                        <div class="absolute top-4 right-4 z-20">
                            <span class="px-3 py-1 text-xs font-semibold bg-dark/80 backdrop-blur-md rounded-full border border-gray-600 text-white">${proj.tech[0] || 'Video'}</span>
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="flex items-start justify-between">
                            <div>
                                <h3 class="text-xl font-bold text-gray-200 group-hover:text-white transition-colors mb-1">${proj.name}</h3>
                                <p class="text-gray-500 text-sm font-mono">${formatDate(proj.date)}</p>
                            </div>
                            <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-dark group-hover:border-white transition-all duration-300 shrink-0">
                                <i class='bx bx-play text-lg'></i>
                            </div>
                        </div>
                        <p class="text-gray-400 text-sm mt-3 leading-relaxed line-clamp-2">${proj.description}</p>
                    </div>
                `;
                videoGridContainer.appendChild(card);
            });
        }
    }

    function escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    // Launch
    init();
});
