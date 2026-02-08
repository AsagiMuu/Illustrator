/**
 * components.js
 * Reusable UI components for AsagiMuu Portfolio
 * Renders navigation, footer, and mobile menu dynamically
 */

/**
 * Render the main navigation bar
 */
function renderNavigation() {
    const nav = document.createElement('nav');
    nav.id = 'main-nav';
    nav.className = 'fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100';

    nav.innerHTML = `
        <div class="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
            <a href="index.html" id="logo-link" class="flex items-center">
                <img id="logo-image" src="./images/ui/2024-09-05_01_AsagiMuu_02.png" alt="AsagiMuu" class="h-[34px]">
            </a>
            
            <div id="desktop-nav" class="hidden md:flex space-x-8 text-[11px] tracking-[0.2em] uppercase font-bold text-gray-400">
                <a href="index.html" class="nav-link hover:text-gray-800 transition">トップ</a>
                <div class="relative group">
                    <a href="gallery.html" class="nav-link hover:text-gray-800 transition block">アート</a>
                    <div class="absolute left-1/2 transform -translate-x-1/2 top-full pt-4 w-32 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                        <div class="bg-white border border-gray-100 shadow-lg rounded-lg overflow-hidden">
                            <a href="gallery.html?from=gallery" class="block px-4 py-3 text-center text-gray-500 hover:text-[#BE4B35] hover:bg-gray-50 text-[10px] tracking-widest whitespace-nowrap">すべて見る</a>
                        </div>
                    </div>
                </div>
                <a href="about.html" class="nav-link hover:text-gray-800 transition">プロフィール</a>
                <div class="relative group">
                    <a href="pricing.html" class="nav-link hover:text-gray-800 transition block">依頼について</a>
                    <div class="absolute left-1/2 transform -translate-x-1/2 top-full pt-4 w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                        <div class="bg-white border border-gray-100 shadow-lg rounded-lg overflow-hidden">
                            <a href="pricing.html" class="block px-4 py-3 text-center text-gray-500 hover:text-[#BE4B35] hover:bg-gray-50 text-[10px] tracking-widest whitespace-nowrap">個人様向け料金プラン</a>
                            <a href="pricing-corporate.html" class="block px-4 py-3 text-center text-gray-500 hover:text-[#BE4B35] hover:bg-gray-50 text-[10px] tracking-widest whitespace-nowrap border-t border-gray-50">企業様向け依頼プラン</a>
                            <a href="terms.html?mode=view" class="block px-4 py-3 text-center text-gray-500 hover:text-[#BE4B35] hover:bg-gray-50 text-[10px] tracking-widest whitespace-nowrap border-t border-gray-50">利用規約</a>
                            <a href="faq.html" class="block px-4 py-3 text-center text-gray-500 hover:text-[#BE4B35] hover:bg-gray-50 text-[10px] tracking-widest whitespace-nowrap border-t border-gray-50">よくある質問</a>
                        </div>
                    </div>
                </div>
                <a href="links.html" class="nav-link hover:text-gray-800 transition">リンク</a>
                <a href="contact.html" class="nav-link hover:text-gray-800 transition">お問い合わせ</a>
            </div>

            <button id="menu-btn" class="md:hidden text-2xl text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            </button>
        </div>
    `;

    return nav;
}

/**
 * Render the mobile menu overlay
 */
function renderMobileMenu() {
    const mobileMenu = document.createElement('div');
    mobileMenu.id = 'mobile-menu';
    mobileMenu.className = 'fixed inset-0 bg-white z-40 transform translate-x-full md:hidden flex flex-col items-center justify-center space-y-8 text-xl tracking-widest uppercase';

    mobileMenu.innerHTML = `
        <a href="index.html">トップ</a>
        <a href="gallery.html">アート</a>
        <a href="about.html">プロフィール</a>
        <a href="pricing.html">依頼について</a>
        <a href="links.html">リンク</a>
        <a href="contact.html">お問い合わせ</a>
        <button id="close-menu" class="absolute top-6 right-6 text-3xl">&times;</button>
    `;

    return mobileMenu;
}

/**
 * Render the footer
 */
function renderFooter() {
    const footer = document.createElement('footer');
    footer.className = 'py-16 text-center text-gray-300 text-[9px] tracking-[0.4em] uppercase border-t border-gray-50 bg-white';
    footer.innerHTML = '&copy; 2025 ASAGIMUU Portfolio';

    return footer;
}

/**
 * Initialize all components
 * Call this function on DOMContentLoaded
 */
function initializeComponents() {
    // Insert navigation at the beginning of body
    const body = document.body;
    body.insertBefore(renderNavigation(), body.firstChild);

    // Insert mobile menu after navigation
    const nav = document.getElementById('main-nav');
    nav.insertAdjacentElement('afterend', renderMobileMenu());

    // Insert footer at the end of body (before any existing footer)
    const existingFooter = document.querySelector('footer');
    if (existingFooter) {
        existingFooter.replaceWith(renderFooter());
    } else {
        body.appendChild(renderFooter());
    }
}

/**
 * Highlight active navigation item based on current page
 */
function highlightActiveNav() {
    const navLinks = document.querySelectorAll('#desktop-nav a.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active-nav-item');
        link.classList.add('hover:text-gray-800');
    });

    const currentPath = window.location.pathname.split("/").pop();
    let activeLink = null;

    if (currentPath === 'index.html' || currentPath === '') {
        activeLink = document.querySelector('a.nav-link[href^="index.html"]');
    } else if (['pricing.html', 'pricing-corporate.html', 'terms.html', 'faq.html', 'workflow.html', 'form.html'].includes(currentPath)) {
        activeLink = document.querySelector('a.nav-link[href="pricing.html"]');
    } else {
        activeLink = document.querySelector(`#desktop-nav a.nav-link[href="${currentPath}"]`);
    }

    if (activeLink) {
        const mainLink = activeLink.closest('.relative.group')?.querySelector('a.nav-link') || activeLink;
        mainLink.classList.add('active-nav-item');
        mainLink.classList.remove('hover:text-gray-800');
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeComponents();
        highlightActiveNav();
    });
} else {
    initializeComponents();
    highlightActiveNav();
}
