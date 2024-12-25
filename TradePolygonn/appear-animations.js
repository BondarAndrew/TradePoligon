document.addEventListener('DOMContentLoaded', () => {
    // Функция для проверки видимости элемента
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        return rect.top <= windowHeight * 0.85;
    }

    // Добавляем класс анимации ко всем элементам
    function addAnimationClass(elements, className, baseDelay = 0) {
        elements.forEach((element, index) => {
            element.classList.add('appear-animation');
            element.classList.add(className);
            element.style.animationDelay = `${baseDelay + (index * 0.15)}s`;
        });
    }

    // Анимируем все основные элементы
    const sections = document.querySelectorAll('section');
    const cards = document.querySelectorAll('.feature-card, .crypto-card, .course-card, .pricing-card');
    const stats = document.querySelectorAll('.stat-item');
    const textBlocks = document.querySelectorAll('.hero-content, .section-content, .about-content');
    const steps = document.querySelectorAll('.quick-start-step');
    const forms = document.querySelectorAll('form, .contact-form');
    const lists = document.querySelectorAll('.faq-list, .course-list, .crypto-list');

    // Применяем разные анимации к разным типам элементов
    addAnimationClass(sections, 'fade-in');
    addAnimationClass(cards, 'slide-up', 0.2);
    addAnimationClass(stats, 'scale-in', 0.3);
    addAnimationClass(textBlocks, 'fade-in-left', 0.1);
    addAnimationClass(steps, 'slide-up', 0.2);
    addAnimationClass(forms, 'fade-in-right', 0.3);
    addAnimationClass(lists, 'fade-in', 0.2);

    // Функция для проверки и добавления класса видимости
    function checkVisibility() {
        const elements = document.querySelectorAll('.appear-animation');
        elements.forEach(element => {
            if (isInViewport(element) && !element.classList.contains('appeared')) {
                element.classList.add('appeared');
            }
        });
    }

    // Запускаем проверку при скролле
    window.addEventListener('scroll', () => {
        requestAnimationFrame(checkVisibility);
    });

    // Запускаем первичную проверку
    checkVisibility();
});
