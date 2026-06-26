/**
 * Project Store - Shared data layer utilizing Local Storage.
 * Handles CRUD operations, backup import/export, and initial seed data.
 */

const PROJECTS_STORE_KEY = 'portfolio_projects_data';

// Initial default projects to populate Local Storage if empty.
const DEFAULT_PROJECTS = [
    {
        id: 'default-cafe-mgmt',
        name: 'Cafe Management System',
        category: 'Web Development',
        description: 'A modern cafe management and employee attendance system built with Laravel, featuring a minimalist dashboard, real-time status updates, and interactive data visualization.',
        tech: ['Laravel', 'Tailwind CSS'],
        demoUrl: 'https://demo.example.com/cafe',
        githubUrl: 'https://github.com/example/cafe-management',
        date: '2024-04-12',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        status: 'Selesai',
        createdAt: 1712876400000,
        photos: [],
        videoUrl: ''
    },
    {
        id: 'default-ecommerce-app',
        name: 'E-Commerce Mobile App',
        category: 'Mobile App',
        description: 'A fully functional e-commerce mobile application with cross-platform support. Features include user authentication, product catalog, cart management, and secure checkout process.',
        tech: ['Flutter', 'Firebase'],
        demoUrl: 'https://demo.example.com/shop',
        githubUrl: 'https://github.com/example/ecommerce-flutter',
        date: '2024-02-22',
        thumbnail: 'https://images.unsplash.com/photo-1607799279861-4ddbc4d69b91?auto=format&fit=crop&w=800&q=80',
        status: 'Selesai',
        createdAt: 1708556400000,
        photos: [],
        videoUrl: ''
    },
    {
        id: 'default-dashboard-ui',
        name: 'Corporate Dashboard UI',
        category: 'UI/UX Design',
        description: 'A premium, glassmorphism-inspired administrative dashboard designed in Figma and converted to a responsive, interactive web interface using modern JavaScript and CSS.',
        tech: ['Laravel', 'JavaScript', 'Figma'],
        demoUrl: 'https://mystiquebanyuwangigroup.co.id/',
        githubUrl: 'https://github.com/example/dashboard-ui',
        date: '2024-01-15',
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        status: 'Selesai',
        createdAt: 1705273200000,
        photos: [],
        videoUrl: ''
    },
    {
        id: 'default-personal-portfolio',
        name: 'Personal Portfolio Website',
        category: 'Web Development',
        description: 'A sleek, monochromatic personal portfolio website featuring glassmorphism UI, parallax background, animated scroll reveals, and a fully responsive layout.',
        tech: ['HTML5', 'Tailwind CSS', 'JavaScript'],
        demoUrl: 'https://demo.example.com/portfolio',
        githubUrl: 'https://github.com/example/portfolio-vanilla',
        date: '2023-12-05',
        thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
        status: 'Selesai',
        createdAt: 1701730800000,
        photos: [],
        videoUrl: ''
    },
    {
        id: 'default-school-system',
        name: 'School Management System',
        category: 'Web Development',
        description: 'A complete school management platform including student data, grade management, class scheduling, and attendance tracking with role-based access control.',
        tech: ['PHP', 'MySQL'],
        demoUrl: 'https://demo.example.com/school',
        githubUrl: 'https://github.com/example/school-management',
        date: '2023-11-12',
        thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
        status: 'Selesai',
        createdAt: 1699743600000,
        photos: [],
        videoUrl: ''
    },
    {
        id: 'default-landing-page',
        name: 'Product Landing Page',
        category: 'Web Development',
        description: 'High-converting, animated product landing page with scroll-triggered animations, interactive feature sections, and optimized performance across all devices.',
        tech: ['HTML5', 'CSS3', 'JavaScript'],
        demoUrl: 'https://demo.example.com/landing',
        githubUrl: 'https://github.com/example/product-landing',
        date: '2023-09-17',
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        status: 'Selesai',
        createdAt: 1694905200000,
        photos: [],
        videoUrl: ''
    },
    {
        id: 'default-mountain-photo',
        name: 'Mountain Photography',
        category: 'Fotografer',
        description: 'Foto dokumentasi yang mengabadikan keindahan panorama pegunungan serta momen perjalanan selama kegiatan pendakian. Setiap gambar merekam suasana alam, kebersamaan, dan pengalaman yang menjadi bagian dari petualangan di alam terbuka.',
        tech: ['Dokumentasi', 'Landscape'],
        demoUrl: '#',
        githubUrl: '#',
        date: '2024-04-12',
        thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
        status: 'Selesai',
        createdAt: 1712876400000,
        videoUrl: '',
        photos: [
            {"src":"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80","caption":"Mountain Peak at Sunrise","date":"15 Maret 2024"},
            {"src":"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1000&q=80","caption":"Solitude","date":"20 Maret 2024"},
            {"src":"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=80","caption":"Between Trees","date":"5 April 2024"},
            {"src":"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1000&q=80","caption":"Golden Hour Peak","date":"12 April 2024"}
        ]
    },
    {
        id: 'default-short-film',
        name: 'Short Film — Kartini : Silent but Loud',
        category: 'Videografer',
        description: '"Silent but Loud" adalah video yang terinspirasi dari semangat perjuangan R.A. Kartini. Melalui visual yang sederhana namun penuh makna, video ini menggambarkan bahwa suara perempuan tidak selalu harus lantang untuk membawa perubahan. Sebuah penghormatan terhadap keberanian, pendidikan, dan emansipasi yang terus menginspirasi hingga saat ini.',
        tech: ['Short Film', 'Documentary'],
        demoUrl: '#',
        githubUrl: '#',
        date: '2023-12-20',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1000&q=80',
        status: 'Selesai',
        createdAt: 1703030400000,
        videoUrl: 'https://www.youtube.com/embed/qBTQvam_a-o',
        photos: []
    },
    {
        id: 'default-mountain-video',
        name: 'Mountain Rante 2025',
        category: 'Videografer',
        description: 'Sebuah video dokumentasi yang mengabadikan perjalanan pendakian gunung, menampilkan keindahan alam, petualangan, dan pengalaman tak terlupakan di setiap langkah perjalanan.',
        tech: ['Vlog', 'Editing'],
        demoUrl: '#',
        githubUrl: '#',
        date: '2023-07-05',
        thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=80',
        status: 'Selesai',
        createdAt: 1688515200000,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        photos: []
    }
];

class ProjectStore {
    /**
     * Fetch all projects from Local Storage.
     * Initializes default projects if store is empty.
     * @returns {Array} List of projects.
     */
    static getProjects() {
        const stored = localStorage.getItem(PROJECTS_STORE_KEY);
        if (!stored) {
            this.saveProjects(DEFAULT_PROJECTS);
            return DEFAULT_PROJECTS;
        }
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing stored projects, resetting to default.', e);
            this.saveProjects(DEFAULT_PROJECTS);
            return DEFAULT_PROJECTS;
        }
    }

    /**
     * Save projects array to Local Storage.
     * @param {Array} projects 
     */
    static saveProjects(projects) {
        localStorage.setItem(PROJECTS_STORE_KEY, JSON.stringify(projects));
        this._triggerChange();
    }

    /**
     * Retrieve a specific project by ID.
     * @param {string} id 
     * @returns {Object|null}
     */
    static getProjectById(id) {
        const projects = this.getProjects();
        return projects.find(p => p.id === id) || null;
    }

    /**
     * Add a new project record.
     * @param {Object} data - Project details
     * @returns {Object} Added project
     */
    static addProject(data) {
        const projects = this.getProjects();
        const newProject = {
            id: 'proj-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            name: data.name,
            category: data.category,
            description: data.description,
            tech: Array.isArray(data.tech) ? data.tech : data.tech.split(',').map(t => t.trim()).filter(t => t),
            demoUrl: data.demoUrl,
            githubUrl: data.githubUrl,
            date: data.date,
            thumbnail: data.thumbnail || '', // Base64 or URL
            status: data.status || 'Selesai',
            videoUrl: data.videoUrl || '',
            photos: Array.isArray(data.photos) ? data.photos : [],
            createdAt: Date.now()
        };
        projects.unshift(newProject); // Add to beginning (latest first)
        this.saveProjects(projects);
        return newProject;
    }

    /**
     * Update an existing project record.
     * @param {string} id 
     * @param {Object} data 
     * @returns {boolean} Success state
     */
    static updateProject(id, data) {
        const projects = this.getProjects();
        const index = projects.findIndex(p => p.id === id);
        if (index === -1) return false;

        const original = projects[index];
        projects[index] = {
            ...original,
            name: data.name !== undefined ? data.name : original.name,
            category: data.category !== undefined ? data.category : original.category,
            description: data.description !== undefined ? data.description : original.description,
            tech: data.tech !== undefined ? (Array.isArray(data.tech) ? data.tech : data.tech.split(',').map(t => t.trim()).filter(t => t)) : original.tech,
            demoUrl: data.demoUrl !== undefined ? data.demoUrl : original.demoUrl,
            githubUrl: data.githubUrl !== undefined ? data.githubUrl : original.githubUrl,
            date: data.date !== undefined ? data.date : original.date,
            thumbnail: data.thumbnail !== undefined ? data.thumbnail : original.thumbnail,
            status: data.status !== undefined ? data.status : original.status,
            videoUrl: data.videoUrl !== undefined ? data.videoUrl : original.videoUrl,
            photos: data.photos !== undefined ? data.photos : original.photos
        };

        this.saveProjects(projects);
        return true;
    }

    /**
     * Delete a project record.
     * @param {string} id 
     * @returns {boolean} Success state
     */
    static deleteProject(id) {
        const projects = this.getProjects();
        const initialLength = projects.length;
        const filtered = projects.filter(p => p.id !== id);
        if (filtered.length === initialLength) return false;

        this.saveProjects(filtered);
        return true;
    }

    /**
     * Completely clear storage and seed initial defaults.
     */
    static resetDatabase() {
        this.saveProjects(DEFAULT_PROJECTS);
    }

    /**
     * Export all project records to JSON string.
     * @returns {string} JSON string
     */
    static exportJSON() {
        const projects = this.getProjects();
        return JSON.stringify(projects, null, 2);
    }

    /**
     * Import projects from a JSON string.
     * Performs schema validation on imported data.
     * @param {string} jsonString 
     * @returns {Object} { success: boolean, message: string }
     */
    static importJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (!Array.isArray(data)) {
                return { success: false, message: 'Format data JSON harus berupa array.' };
            }
            
            // Simple validation schema check
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                if (!item.name || !item.category || !item.description) {
                    return { success: false, message: `Baris data ke-${i + 1} tidak memiliki field wajib (Nama, Kategori, atau Deskripsi).` };
                }
            }

            // Standardize items
            const parsed = data.map(item => ({
                id: item.id || 'proj-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                name: item.name,
                category: item.category,
                description: item.description,
                tech: Array.isArray(item.tech) ? item.tech : (item.tech || '').split(',').map(t => t.trim()).filter(t => t),
                demoUrl: item.demoUrl || '#',
                githubUrl: item.githubUrl || '#',
                date: item.date || new Date().toISOString().split('T')[0],
                thumbnail: item.thumbnail || '',
                status: item.status || 'Selesai',
                videoUrl: item.videoUrl || '',
                photos: Array.isArray(item.photos) ? item.photos : [],
                createdAt: item.createdAt || Date.now()
            }));

            this.saveProjects(parsed);
            return { success: true, message: `Berhasil mengimpor ${parsed.length} proyek.` };
        } catch (e) {
            return { success: false, message: 'Gagal mengurai file JSON. Pastikan file valid.' };
        }
    }

    /**
     * Trigger a custom event to notify all components in the current tab.
     * @private
     */
    static _triggerChange() {
        const event = new CustomEvent('portfolio-data-changed', {
            detail: { projects: this.getProjects() }
        });
        window.dispatchEvent(event);
    }
}
