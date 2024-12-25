document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.module');
    const navItems = document.querySelectorAll('.nav-item');

    // Добавляем плавную прокрутку при клике на пункты меню
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Функция debounce для оптимизации производительности
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) / 2
        );
    }

    function updateActiveNavItem() {
        sections.forEach((section, index) => {
            if (isElementInViewport(section)) {
                navItems.forEach(item => {
                    item.classList.remove('active');
                    item.style.animation = '';
                });
                
                navItems[index].classList.add('active');
                navItems[index].style.animation = 'highlightNav 0.5s ease forwards';
            }
        });
    }

    const debouncedUpdateActiveNavItem = debounce(updateActiveNavItem, 100);
    window.addEventListener('scroll', debouncedUpdateActiveNavItem);
    
    updateActiveNavItem();
});
