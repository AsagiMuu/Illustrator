// common.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. 画像保存・ドラッグ防止 (Image Protection)
    document.addEventListener('contextmenu', e => {
        if (e.target.tagName === 'IMG') e.preventDefault();
    });
    document.addEventListener('dragstart', e => {
        if (e.target.tagName === 'IMG') e.preventDefault();
    });

    // 2. モバイルメニューの初期化 (Mobile Menu)
    setupMobileMenu();
});

// モバイルメニューの制御関数
function setupMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenuBtn = document.getElementById('close-menu');
    const mobileMenuLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

    if (!mobileMenu) return;

    const openMenu = () => mobileMenu.classList.remove('translate-x-full');
    const closeMenu = () => mobileMenu.classList.add('translate-x-full');

    if (menuBtn) menuBtn.addEventListener('click', openMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
    mobileMenuLinks.forEach(link => link.addEventListener('click', closeMenu));
}

// 3. 共通データの読み込み関数 (JSON取得 & ロゴ設定)
async function loadCommonData() {
    try {
        if (typeof SITE_DATA === 'undefined') {
            console.error("SITE_DATA is not defined. Make sure site-data.js is loaded.");
            return {};
        }

        const data = { 
            ...SITE_DATA.portfolio, 
            ...SITE_DATA.commission, 
            ...SITE_DATA.profile 
        };
        
        // ロゴ画像の設定 (ID: logo-image がある場合)
        const logoImage = document.getElementById('logo-image');
        if (logoImage && data.logo) logoImage.src = data.logo;

        return data;
    } catch (error) {
        console.error("共通データの読み込みに失敗しました:", error);
        return {};
    }
}