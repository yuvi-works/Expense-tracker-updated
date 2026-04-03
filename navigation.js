// The fast theme injection happens inline within each page <head> globally.

document.addEventListener('DOMContentLoaded', () => {
    // 1. Trigger Page Fade In
    document.body.classList.add('fade-in');

    // 2. Dynamic Dark Mode Toggle
    const topHeader = document.querySelector('.page-header');
    
    if (topHeader && !document.getElementById('theme-toggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'theme-toggle';
        
        // Setup initial icon mapping
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        toggleBtn.innerHTML = isDark ? '<i class="ph-fill ph-moon"></i>' : '<i class="ph ph-moon"></i>';
        
        Object.assign(toggleBtn.style, {
            position: 'absolute',
            right: '32px',
            top: '32px',
            background: 'none',
            border: 'none',
            fontSize: '1.75rem',
            color: 'var(--text-color)',
            cursor: 'pointer',
            zIndex: 100,
            transition: 'color 0.2s ease, transform 0.2s ease'
        });

        toggleBtn.addEventListener('mouseenter', () => toggleBtn.style.color = 'var(--accent-color)');
        toggleBtn.addEventListener('mouseleave', () => toggleBtn.style.color = 'var(--text-color)');

        topHeader.style.position = 'relative';
        topHeader.appendChild(toggleBtn);

        // Click Logic
        toggleBtn.addEventListener('click', () => {
            if (document.documentElement.getAttribute('data-theme') === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('ledger-theme', 'light');
                toggleBtn.innerHTML = '<i class="ph ph-moon"></i>';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('ledger-theme', 'dark');
                toggleBtn.innerHTML = '<i class="ph-fill ph-moon"></i>';
            }
        });
    }

    // 3. Highlight Active Nav Item automatically
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    
    navItems.forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href');
        if (href === currentPath) {
            item.classList.add('active');
        }
    });

    // 4. Page Exit Transition via Links
    document.querySelectorAll('a').forEach(anchor => {
        if (!anchor.hasAttribute('href')) return;
        const href = anchor.getAttribute('href');
        // Ignore download links or hashes so CSV and anchor tags work
        if (href.startsWith('#') || href.startsWith('http') || anchor.hasAttribute('download')) return;
        
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.body.classList.remove('fade-in');
            document.body.classList.add('fade-out');
            setTimeout(() => {
                window.location.href = href;
            }, 300);
        });
    });
});
