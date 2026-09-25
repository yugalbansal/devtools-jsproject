(function () {
    const storageKey = 'devtools-theme';
    const root = document.documentElement;
    const toggle = document.querySelector('.theme-toggle');

    function applyTheme(theme) {
        root.dataset.theme = theme;
        if (toggle) {
            toggle.setAttribute('aria-pressed', String(theme === 'dark'));
        }
    }

    applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');

    if (toggle) {
        toggle.addEventListener('click', function () {
            const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem(storageKey, next);
            applyTheme(next);
        });
    }
})();
