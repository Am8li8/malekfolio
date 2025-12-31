document.addEventListener('DOMContentLoaded', () => {
    // --- 1. متغيرات العناصر الأساسية ---
    const grid = document.querySelector('.projects-grid');
    const filterBtns = document.querySelectorAll('.filter-btns button');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const underline = document.querySelector('.nav-underline'); 
    const navLinks = document.querySelectorAll('nav ul li a');

    // --- 2. نظام المشاريع (عكس الترتيب + الفلترة + تحميل المزيد) ---
    let projectCards = Array.from(grid.querySelectorAll('.project-card')).reverse();
    const cardsPerPage = 6;
    let currentIndex = cardsPerPage;
    let activeFilter = 'all';

    // إعادة بناء الشبكة بالترتيب المعكوس
    if(grid) {
        grid.innerHTML = '';
        projectCards.forEach(card => grid.appendChild(card));
    }

    function updateDisplay() {
        const filteredCards = projectCards.filter(card => {
            const category = card.getAttribute('data-category');
            return activeFilter === 'all' || category === activeFilter;
        });

        projectCards.forEach(card => {
            card.style.display = 'none';
            card.style.opacity = '0';
        });

        filteredCards.slice(0, currentIndex).forEach((card, index) => {
            card.style.display = 'flex';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                card.style.transition = '0.4s ease';
            }, 10 * index);
        });

        if (loadMoreBtn) {
            loadMoreBtn.parentElement.style.display = currentIndex >= filteredCards.length ? 'none' : 'block';
        }
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btns button.active').classList.remove('active');
            btn.classList.add('active');
            activeFilter = btn.getAttribute('data-filter');
            currentIndex = cardsPerPage;
            updateDisplay();
        });
    });

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentIndex += cardsPerPage;
            updateDisplay();
        });
    }

    // --- 3. وظيفة تحريك خط الهيدر السلس (Underline) ---
    function moveUnderline() {
        const activeLink = document.querySelector('nav a.active');
        const navUl = document.querySelector('nav ul');

        if (activeLink && underline && navUl) {
            const linkRect = activeLink.getBoundingClientRect();
            const navRect = navUl.getBoundingClientRect();
            
            const width = linkRect.width - 30;
            const leftPosition = linkRect.left - navRect.left + 15;

            underline.style.width = `${width}px`;
            underline.style.transform = `translateX(${leftPosition}px)`;
            underline.style.opacity = "1";
        }
    }

    // --- 4. نظام مراقبة السكاشن وتحريك المهارات (المصحح) ---
    const sections = document.querySelectorAll('section, #home');
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -55% 0px',
        threshold: 0
    };

    // متغير لمنع تكرار أنميشن المهارات واختفائه
    let skillsAnimated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                // تحديث الروابط النشطة
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                        requestAnimationFrame(moveUnderline);
                    }
                });

                // --- تحريك المهارات مرة واحدة فقط ---
                if (id === 'skills' && !skillsAnimated) {
                    const bars = document.querySelectorAll('.progress-line span');
                    bars.forEach(bar => {
                        const targetWidth = bar.getAttribute('data-skill'); 
                        // تم حذف السطر اللي بيصفر العرض عشان ما يختفيش ويرجع
                        bar.style.width = targetWidth + '%';
                    });
                    skillsAnimated = true; // تم التنفيذ بنجاح
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    window.addEventListener('resize', moveUnderline);

    // التشغيل الأولي
    updateDisplay();
    setTimeout(moveUnderline, 200);
});