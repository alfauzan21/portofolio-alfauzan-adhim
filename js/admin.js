/**
 * Admin Dashboard Interactivity Script
 * Manages CRUD actions, form validation, JSON backups, and theme toggling.
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
    let activeDeleteId = null;

    // DOM Elements
    const tableBody = document.getElementById('projects-table-body');
    const tableLoading = document.getElementById('table-loading');
    const tableEmpty = document.getElementById('table-empty');
    
    // Search & Filter Inputs
    const searchInput = document.getElementById('search-input');
    const filterCategory = document.getElementById('filter-category');
    const filterStatus = document.getElementById('filter-status');

    // Stats
    const statTotal = document.getElementById('stat-total');
    const statSelesai = document.getElementById('stat-selesai');
    const statProgress = document.getElementById('stat-progress');
    const statTopCategory = document.getElementById('stat-top-category');

    // Modals
    const projectModal = document.getElementById('project-modal');
    const confirmModal = document.getElementById('confirm-modal');
    const resetConfirmModal = document.getElementById('reset-confirm-modal');

    // Form Fields
    const projectForm = document.getElementById('project-form');
    const formTitle = document.getElementById('modal-title');
    const formProjectId = document.getElementById('form-project-id');
    const formName = document.getElementById('form-name');
    const formCategory = document.getElementById('form-category');
    const formStatus = document.getElementById('form-status');
    const formDescription = document.getElementById('form-description');
    const formTech = document.getElementById('form-tech');
    const formDemo = document.getElementById('form-demo');
    const formGithub = document.getElementById('form-github');
    const formDate = document.getElementById('form-date');
    const formThumbnail = document.getElementById('form-thumbnail');
    
    // Thumbnail Preview Elements
    const thumbnailFilename = document.getElementById('thumbnail-filename');
    const thumbnailPreviewContainer = document.getElementById('thumbnail-preview-container');
    const thumbnailPreviewImg = document.getElementById('thumbnail-preview-img');
    const btnRemoveThumbnail = document.getElementById('btn-remove-thumbnail');
    let base64Thumbnail = '';

    // Multimedia Elements
    const videoUrlFieldContainer = document.getElementById('video-url-field-container');
    const formVideoUrl = document.getElementById('form-video-url');
    const photoAlbumEditorContainer = document.getElementById('photo-album-editor-container');
    const albumPhotoCounter = document.getElementById('album-photo-counter');
    const albumPhotosList = document.getElementById('album-photos-list');
    const btnAddAlbumPhoto = document.getElementById('btn-add-album-photo');
    const albumPhotoFileInput = document.getElementById('album-photo-file-input');
    let currentAlbumPhotos = [];

    // Buttons
    const btnAddProject = document.getElementById('btn-add-project');
    const btnExport = document.getElementById('btn-export');
    const btnImportTrigger = document.getElementById('btn-import-trigger');
    const importFileInput = document.getElementById('import-file-input');
    const btnResetDb = document.getElementById('btn-reset-db');
    
    // Pagination Elements
    const paginationContainer = document.getElementById('pagination-container');
    const paginationInfo = document.getElementById('pagination-info');
    const pageNumbersContainer = document.getElementById('page-numbers-container');
    const btnPrevPage = document.getElementById('btn-prev-page');
    const btnNextPage = document.getElementById('btn-next-page');

    // Year footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // ==========================================
    // TOAST NOTIFICATIONS
    // ==========================================
    const toastContainer = document.getElementById('toast-container');

    /**
     * Show premium toast notification.
     * @param {string} message - Toast content
     * @param {'success'|'error'} type - Style type
     */
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = type === 'success' ? 'bx-check-circle' : 'bx-error-circle';
        toast.innerHTML = `
            <i class='bx ${icon} text-${type === 'success' ? 'white' : 'red-500'}'></i>
            <span class="text-sm font-medium">${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Trigger reflow for transition
        toast.offsetHeight;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3000);
    }

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
        showToast(isLight ? 'Mode Terang diaktifkan' : 'Mode Gelap diaktifkan', 'success');
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

    themeToggleBtn.addEventListener('click', toggleTheme);
    themeToggleMobileBtn.addEventListener('click', toggleTheme);
    initTheme();

    // ==========================================
    // PARALLAX BACKGROUND
    // ==========================================
    const parallax1 = document.getElementById('parallax-1');
    const parallax2 = document.getElementById('parallax-2');

    if (parallax1 && parallax2) {
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;

            const moveX1 = (x - 0.5) * 30;
            const moveY1 = (y - 0.5) * 30;
            
            const moveX2 = (0.5 - x) * 45;
            const moveY2 = (0.5 - y) * 45;

            requestAnimationFrame(() => {
                parallax1.style.transform = `translate(${moveX1}px, ${moveY1}px)`;
                parallax2.style.transform = `translate(${moveX2}px, ${moveY2}px)`;
            });
        });
    }

    // ==========================================
    // INITIALIZATION & RE-RENDER
    // ==========================================
    function loadData() {
        tableLoading.classList.remove('hidden');
        tableBody.innerHTML = '';
        tableEmpty.classList.add('hidden');
        
        setTimeout(() => {
            projects = ProjectStore.getProjects();
            filterAndRender();
            renderStats();
            tableLoading.classList.add('hidden');
        }, 300);
    }

    // Listen to changes in project store
    window.addEventListener('portfolio-data-changed', (e) => {
        projects = e.detail.projects;
        filterAndRender();
        renderStats();
    });

    // ==========================================
    // STATISTICS CALCULATION
    // ==========================================
    function renderStats() {
        statTotal.textContent = projects.length;
        
        const completed = projects.filter(p => p.status === 'Selesai').length;
        statSelesai.textContent = completed;
        
        const progress = projects.filter(p => p.status === 'On Progress').length;
        statProgress.textContent = progress;

        // Top Category
        const cats = {};
        projects.forEach(p => {
            cats[p.category] = (cats[p.category] || 0) + 1;
        });
        
        let topCat = '-';
        let maxCount = 0;
        for (const cat in cats) {
            if (cats[cat] > maxCount) {
                maxCount = cats[cat];
                topCat = cat;
            }
        }
        statTopCategory.textContent = topCat;
    }

    // ==========================================
    // FILTER, SEARCH, SORT & PAGINATION
    // ==========================================
    function filterAndRender() {
        const query = searchInput.value.toLowerCase().trim();
        const cat = filterCategory.value;
        const status = filterStatus.value;

        filteredProjects = projects.filter(proj => {
            const matchesQuery = proj.name.toLowerCase().includes(query) || 
                                 proj.description.toLowerCase().includes(query) ||
                                 proj.tech.some(t => t.toLowerCase().includes(query));
            const matchesCat = !cat || proj.category === cat;
            const matchesStatus = !status || proj.status === status;

            return matchesQuery && matchesCat && matchesStatus;
        });

        // Re-adjust page boundaries if index goes out
        const maxPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;
        if (currentPage > maxPages) {
            currentPage = maxPages;
        }

        renderTable();
    }

    function renderTable() {
        tableBody.innerHTML = '';
        
        if (filteredProjects.length === 0) {
            tableEmpty.classList.remove('hidden');
            paginationContainer.classList.add('hidden');
            return;
        }

        tableEmpty.classList.add('hidden');
        paginationContainer.classList.remove('hidden');

        // Page window index calculation
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredProjects.length);
        const paginatedItems = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

        paginatedItems.forEach(proj => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-white/[0.02] transition-colors';
            
            // Format status badge
            const statusClass = proj.status === 'Selesai' 
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
                : 'bg-amber-950/20 border-amber-500/30 text-amber-400';
            
            // Image Fallback
            const thumbSrc = proj.thumbnail || getFallbackThumbnail(proj.name);

            tr.innerHTML = `
                <td class="align-middle">
                    <div class="w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-black flex items-center justify-center shrink-0">
                        <img src="${thumbSrc}" alt="${proj.name}" class="w-full h-full object-cover">
                    </div>
                </td>
                <td class="font-bold text-white text-sm align-middle">
                    <span class="block truncate max-w-[200px] sm:max-w-xs" title="${proj.name}">${proj.name}</span>
                </td>
                <td class="text-gray-400 text-sm align-middle">${proj.category}</td>
                <td class="text-gray-400 font-mono text-xs align-middle">${formatDate(proj.date)}</td>
                <td class="align-middle">
                    <span class="inline-block px-2.5 py-0.5 rounded-full border text-xs font-semibold ${statusClass}">${proj.status}</span>
                </td>
                <td class="text-right align-middle">
                    <div class="flex items-center justify-end gap-2">
                        <button class="btn-edit w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors" data-id="${proj.id}" title="Edit Project">
                            <i class='bx bx-edit text-base pointer-events-none'></i>
                        </button>
                        <button class="btn-delete w-8 h-8 rounded-lg border border-red-950/30 hover:border-red-500 flex items-center justify-center text-red-500 hover:bg-red-950/20 transition-all" data-id="${proj.id}" title="Hapus Project">
                            <i class='bx bx-trash text-base pointer-events-none'></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        // Update Pagination controls
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
                renderTable();
            });
            pageNumbersContainer.appendChild(btn);
        }
    }

    btnPrevPage.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    btnNextPage.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });

    // Wire search & filtering change listeners
    searchInput.addEventListener('input', () => {
        currentPage = 1;
        filterAndRender();
    });
    filterCategory.addEventListener('change', () => {
        currentPage = 1;
        filterAndRender();
    });
    filterStatus.addEventListener('change', () => {
        currentPage = 1;
        filterAndRender();
    });

    // ==========================================
    // MODAL STATE MANAGEMENT
    // ==========================================
    function openModal(modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    // Attach click events to close buttons across modals
    document.querySelectorAll('.modal-close-btn, .modal-overlay').forEach(el => {
        el.addEventListener('click', (e) => {
            // Ensure click is directly on container overlay or specifically close button
            if (e.target.classList.contains('modal-overlay') || e.target.closest('.modal-close-btn') || e.target.id === 'btn-confirm-cancel' || e.target.id === 'btn-reset-cancel') {
                const openModalEl = e.target.closest('.modal-overlay');
                if (openModalEl) closeModal(openModalEl);
            }
        });
    });

    // Escape Key mapping for closing modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modals = [projectModal, confirmModal, resetConfirmModal];
            modals.forEach(modal => {
                if (modal.classList.contains('open')) closeModal(modal);
            });
        }
    });

    // ==========================================
    // THUMBNAIL FILE UPLOAD TO BASE64
    // ==========================================
    formThumbnail.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Size check (Limit to 1.5MB to save localStorage limits)
        if (file.size > 1.5 * 1024 * 1024) {
            showToast('Ukuran gambar melebihi batas 1.5MB!', 'error');
            formThumbnail.value = '';
            return;
        }

        thumbnailFilename.textContent = file.name;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            base64Thumbnail = event.target.result;
            thumbnailPreviewImg.src = base64Thumbnail;
            thumbnailPreviewContainer.classList.remove('hidden');
        };
        reader.onerror = () => {
            showToast('Gagal memproses file gambar.', 'error');
        };
        reader.readAsDataURL(file);
    });

    btnRemoveThumbnail.addEventListener('click', () => {
        base64Thumbnail = '';
        formThumbnail.value = '';
        thumbnailFilename.textContent = 'Pilih file gambar...';
        thumbnailPreviewContainer.classList.add('hidden');
        thumbnailPreviewImg.src = '';
    });

    // ==========================================
    // MULTIMEDIA PHOTO ALBUM EDITOR FUNCTIONS
    // ==========================================
    function renderAlbumPhotos() {
        albumPhotosList.innerHTML = '';
        albumPhotoCounter.textContent = `${currentAlbumPhotos.length} Foto`;

        currentAlbumPhotos.forEach((photo, idx) => {
            const item = document.createElement('div');
            item.className = 'flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5';
            item.innerHTML = `
                <div class="w-14 h-14 rounded-lg overflow-hidden border border-white/10 bg-black flex items-center justify-center shrink-0">
                    <img src="${photo.src}" class="w-full h-full object-cover">
                </div>
                <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="text" placeholder="Caption foto..." value="${escapeHtml(photo.caption || '')}" data-idx="${idx}" class="album-caption-input px-3 py-1.5 rounded-lg border border-white/10 bg-black/40 text-white text-xs focus:outline-none focus:border-white w-full">
                    <input type="text" placeholder="Tanggal/Keterangan..." value="${escapeHtml(photo.date || '')}" data-idx="${idx}" class="album-date-input px-3 py-1.5 rounded-lg border border-white/10 bg-black/40 text-white text-xs focus:outline-none focus:border-white w-full">
                </div>
                <button type="button" data-idx="${idx}" class="btn-remove-album-photo w-8 h-8 rounded-lg border border-red-950/30 hover:border-red-500 flex items-center justify-center text-red-500 hover:bg-red-950/20 transition-all shrink-0" title="Hapus Foto">
                    <i class='bx bx-trash text-base pointer-events-none'></i>
                </button>
            `;
            albumPhotosList.appendChild(item);
        });
    }

    // Input handlers for photo captions/dates in album (using event delegation)
    albumPhotosList.addEventListener('input', (e) => {
        const input = e.target;
        const idx = parseInt(input.dataset.idx, 10);
        if (isNaN(idx)) return;

        if (input.classList.contains('album-caption-input')) {
            currentAlbumPhotos[idx].caption = input.value;
        } else if (input.classList.contains('album-date-input')) {
            currentAlbumPhotos[idx].date = input.value;
        }
    });

    // Remove photo from album handler
    albumPhotosList.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-remove-album-photo');
        if (btn) {
            const idx = parseInt(btn.dataset.idx, 10);
            if (!isNaN(idx)) {
                currentAlbumPhotos.splice(idx, 1);
                renderAlbumPhotos();
            }
        }
    });

    // Add Photo to Album trigger
    btnAddAlbumPhoto.addEventListener('click', () => {
        albumPhotoFileInput.click();
    });

    // Handle album photo file selection
    albumPhotoFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Size check for album photo (Limit to 1.5MB)
        if (file.size > 1.5 * 1024 * 1024) {
            showToast('Ukuran gambar album melebihi batas 1.5MB!', 'error');
            albumPhotoFileInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            currentAlbumPhotos.push({
                src: event.target.result,
                caption: '',
                date: ''
            });
            renderAlbumPhotos();
            // Scroll to the bottom of the list
            albumPhotosList.scrollTop = albumPhotosList.scrollHeight;
        };
        reader.onerror = () => {
            showToast('Gagal memproses file gambar album.', 'error');
        };
        reader.readAsDataURL(file);

        // Reset so same file can be uploaded again
        albumPhotoFileInput.value = '';
    });

    // Handle conditional fields visibility on category change
    formCategory.addEventListener('change', () => {
        const cat = formCategory.value;
        if (cat === 'Videografer') {
            videoUrlFieldContainer.classList.remove('hidden');
            photoAlbumEditorContainer.classList.add('hidden');
        } else if (cat === 'Fotografer') {
            videoUrlFieldContainer.classList.add('hidden');
            photoAlbumEditorContainer.classList.remove('hidden');
            renderAlbumPhotos();
        } else {
            videoUrlFieldContainer.classList.add('hidden');
            photoAlbumEditorContainer.classList.add('hidden');
        }
    });

    // ==========================================
    // ADD & EDIT PROJECT SUBMIT ACTIONS
    // ==========================================
    btnAddProject.addEventListener('click', () => {
        // Prepare Form for Add Mode
        projectForm.reset();
        formProjectId.value = '';
        formTitle.textContent = 'Tambah Project Baru';
        
        // Clear base64 and preview states
        base64Thumbnail = '';
        thumbnailFilename.textContent = 'Pilih file gambar...';
        thumbnailPreviewContainer.classList.add('hidden');
        thumbnailPreviewImg.src = '';

        // Reset multimedia inputs & hidden containers
        currentAlbumPhotos = [];
        formVideoUrl.value = '';
        videoUrlFieldContainer.classList.add('hidden');
        photoAlbumEditorContainer.classList.add('hidden');

        // Default to current date
        formDate.value = new Date().toISOString().split('T')[0];

        openModal(projectModal);
    });

    // Event delegation on table body for Edit & Delete buttons
    tableBody.addEventListener('click', (e) => {
        const btnEdit = e.target.closest('.btn-edit');
        const btnDelete = e.target.closest('.btn-delete');

        if (btnEdit) {
            const id = btnEdit.dataset.id;
            const project = ProjectStore.getProjectById(id);
            if (project) {
                prepareEditForm(project);
            }
        } else if (btnDelete) {
            activeDeleteId = btnDelete.dataset.id;
            openModal(confirmModal);
        }
    });

    function prepareEditForm(proj) {
        projectForm.reset();
        formTitle.textContent = 'Edit Project';
        formProjectId.value = proj.id;
        
        formName.value = proj.name;
        formCategory.value = proj.category;
        formStatus.value = proj.status;
        formDescription.value = proj.description;
        formTech.value = proj.tech.join(', ');
        formDemo.value = proj.demoUrl === '#' ? '' : proj.demoUrl;
        formGithub.value = proj.githubUrl === '#' ? '' : proj.githubUrl;
        formDate.value = proj.date;

        // Load image state
        base64Thumbnail = proj.thumbnail;
        if (base64Thumbnail) {
            thumbnailFilename.textContent = 'Gambar tersimpan';
            thumbnailPreviewImg.src = base64Thumbnail;
            thumbnailPreviewContainer.classList.remove('hidden');
        } else {
            thumbnailFilename.textContent = 'Pilih file gambar...';
            thumbnailPreviewContainer.classList.add('hidden');
            thumbnailPreviewImg.src = '';
        }

        // Handle multimedia properties loading
        if (proj.category === 'Videografer') {
            videoUrlFieldContainer.classList.remove('hidden');
            photoAlbumEditorContainer.classList.add('hidden');
            formVideoUrl.value = proj.videoUrl || '';
            currentAlbumPhotos = [];
        } else if (proj.category === 'Fotografer') {
            videoUrlFieldContainer.classList.add('hidden');
            photoAlbumEditorContainer.classList.remove('hidden');
            currentAlbumPhotos = JSON.parse(JSON.stringify(proj.photos || []));
            renderAlbumPhotos();
            formVideoUrl.value = '';
        } else {
            videoUrlFieldContainer.classList.add('hidden');
            photoAlbumEditorContainer.classList.add('hidden');
            currentAlbumPhotos = [];
            formVideoUrl.value = '';
        }

        openModal(projectModal);
    }

    // Submit Validation & DB Operations
    projectForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Inputs Checking
        const nameVal = formName.value.trim();
        const catVal = formCategory.value;
        const statusVal = formStatus.value;
        const descVal = formDescription.value.trim();
        const techVal = formTech.value.trim();
        const demoVal = formDemo.value.trim();
        const githubVal = formGithub.value.trim();
        const dateVal = formDate.value;

        if (!nameVal || !catVal || !statusVal || !descVal || !techVal || !dateVal) {
            showToast('Mohon lengkapi semua field wajib (*)!', 'error');
            return;
        }

        // 2. URL Validations
        if (demoVal && !isValidUrl(demoVal)) {
            showToast('Format Link Demo tidak valid! Gunakan format URL lengkap.', 'error');
            return;
        }
        if (githubVal && !isValidUrl(githubVal)) {
            showToast('Format Link GitHub tidak valid! Gunakan format URL lengkap.', 'error');
            return;
        }

        // 3. Category specific validations
        if (catVal === 'Videografer') {
            const videoUrlVal = formVideoUrl.value.trim();
            if (!videoUrlVal) {
                showToast('Mohon isi Link Video Embed untuk kategori Videografer!', 'error');
                return;
            }
        }

        const projectPayload = {
            name: nameVal,
            category: catVal,
            status: statusVal,
            description: descVal,
            tech: techVal,
            demoUrl: demoVal || '#',
            githubUrl: githubVal || '#',
            date: dateVal,
            thumbnail: base64Thumbnail,
            videoUrl: catVal === 'Videografer' ? formVideoUrl.value.trim() : '',
            photos: catVal === 'Fotografer' ? currentAlbumPhotos : []
        };

        const id = formProjectId.value;
        if (id) {
            // EDIT ACTION
            const success = ProjectStore.updateProject(id, projectPayload);
            if (success) {
                showToast('Project berhasil diperbarui!', 'success');
            } else {
                showToast('Gagal memperbarui project.', 'error');
            }
        } else {
            // CREATE ACTION
            ProjectStore.addProject(projectPayload);
            showToast('Project baru berhasil ditambahkan!', 'success');
        }

        closeModal(projectModal);
    });

    // ==========================================
    // DELETE ACTION OPERATIONS
    // ==========================================
    document.getElementById('btn-confirm-ok').addEventListener('click', () => {
        if (activeDeleteId) {
            const success = ProjectStore.deleteProject(activeDeleteId);
            if (success) {
                showToast('Project berhasil dihapus!', 'success');
            } else {
                showToast('Gagal menghapus project.', 'error');
            }
            activeDeleteId = null;
            closeModal(confirmModal);
        }
    });

    // ==========================================
    // BACKUP OPERATIONS (EXPORT / IMPORT JSON)
    // ==========================================
    
    // EXPORT JSON
    btnExport.addEventListener('click', () => {
        try {
            const dataStr = ProjectStore.exportJSON();
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `backup-portfolio-${new Date().toISOString().split('T')[0]}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            showToast('Backup data JSON berhasil diunduh.', 'success');
        } catch (e) {
            showToast('Gagal mengekspor data.', 'error');
        }
    });

    // IMPORT JSON TRIGGER
    btnImportTrigger.addEventListener('click', () => {
        importFileInput.click();
    });

    importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = ProjectStore.importJSON(event.target.result);
            if (result.success) {
                showToast(result.message, 'success');
                currentPage = 1;
                loadData();
            } else {
                showToast(result.message, 'error');
            }
            // Clear input so file can be chosen again
            importFileInput.value = '';
        };
        reader.onerror = () => {
            showToast('Gagal membaca file backup.', 'error');
            importFileInput.value = '';
        };
        reader.readAsText(file);
    });

    // ==========================================
    // RESET DATABASE OPERATIONS
    // ==========================================
    btnResetDb.addEventListener('click', () => {
        openModal(resetConfirmModal);
    });

    document.getElementById('btn-reset-ok').addEventListener('click', () => {
        ProjectStore.resetDatabase();
        showToast('Database berhasil direset ke setelan awal!', 'success');
        currentPage = 1;
        loadData();
        closeModal(resetConfirmModal);
    });

    // ==========================================
    // UTILITY HELPER FUNCTIONS
    // ==========================================
    
    /**
     * Regex check for full website urls
     * @param {string} string 
     * @returns {boolean}
     */
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;  
        }
    }

    /**
     * Parse date string to format 'DD MMMM YYYY' in Indonesian
     * @param {string} dateStr - YYYY-MM-DD 
     * @returns {string}
     */
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

    /**
     * Return SVG drawing as a base64 background string.
     * Generates a sleek dark default thumbnail with text.
     * @param {string} text - Title of project 
     */
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

    // Kickstart load
    loadData();
});
