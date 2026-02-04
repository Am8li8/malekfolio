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
            // تحديث عرض حاوية زر "Load More" بناءً على النتائج
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

    // --- 4. نظام مراقبة السكاشن وتحريك المهارات ---
    const sections = document.querySelectorAll('section, #home');
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -55% 0px',
        threshold: 0
    };

    let skillsAnimated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                        requestAnimationFrame(moveUnderline);
                    }
                });

                if (id === 'skills' && !skillsAnimated) {
                    const bars = document.querySelectorAll('.progress-line span');
                    bars.forEach(bar => {
                        const targetWidth = bar.getAttribute('data-skill'); 
                        bar.style.width = targetWidth + '%';
                    });
                    skillsAnimated = true; 
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
    window.addEventListener('resize', moveUnderline);

    // --- 5. الكرسر المطور (Custom Smooth Cursor) ---
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(ring);

    let mX = 0, mY = 0; 
    let cX = 0, cY = 0; 

    window.addEventListener('mousemove', e => {
        mX = e.clientX;
        mY = e.clientY;
    });

    function render() {
        cX += (mX - cX) * 0.3;
        cY += (mY - cY) * 0.3;
        ring.style.transform = `translate(${cX - 20}px, ${cY - 20}px)`;
        requestAnimationFrame(render);
    }
    render();

    const interactiveTargets = document.querySelectorAll('a, button, .project-card, .icons a');
    interactiveTargets.forEach(t => {
        t.addEventListener('mouseenter', () => ring.classList.add('cursor-active'));
        t.addEventListener('mouseleave', () => ring.classList.remove('cursor-active'));
    });

    // --- 6. مودال المشاريع (Modal System) ---
    const modalHTML = `
        <div id="project-modal" class="modal-wrapper">
            <div class="modal-bg"></div>
            <div class="modal-box">
                <button class="close-btn">&times;</button>
                <div class="modal-img-holder"><img id="modal-img" src="" alt=""></div>
                <div class="modal-txt-holder">
                    <div class="modal-head">
                        <h2 id="modal-title" style="font-size:1.5em"></h2>
                        <span id="modal-year"></span>
                    </div>
                    <span id="modal-cat" style="color:#4f6cf5; font-size:0.9em"></span>
                    <p id="modal-desc"></p>
                    <a id="modal-link" href="#" target="_blank" class="view-btn" style="width:100%; text-align:center">Visit Project</a>
                </div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('project-modal');
    const closeBtn = modal.querySelector('.close-btn');

    // إنشاء أزرار الكروت تلقائياً
    document.querySelectorAll('.project-card').forEach(card => {
        const viewBtn = card.querySelector('.open-modal');
        const hiddenLink = card.querySelector('.project-link');
        
        if (viewBtn && hiddenLink) {
            const linkHref = hiddenLink.href;
            const btnContainer = document.createElement('div');
            btnContainer.className = 'card-btns';
            
            const linkBtn = document.createElement('a');
            linkBtn.href = linkHref;
            linkBtn.target = '_blank';
            linkBtn.className = 'icon-link';
            linkBtn.innerHTML = '<i class="fa-solid fa-link"></i>';

            viewBtn.parentNode.insertBefore(btnContainer, viewBtn);
            btnContainer.appendChild(viewBtn);
            btnContainer.appendChild(linkBtn);
        }
    });

    // فتح المودال
    document.querySelectorAll('.open-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.project-card');
            const hidden = card.querySelector('.hidden-info');

            document.getElementById('modal-title').innerText = card.querySelector('h3').innerText;
            document.getElementById('modal-cat').innerText = card.querySelector('.category').innerText;
            document.getElementById('modal-img').src = card.querySelector('img').src;
            document.getElementById('modal-desc').innerText = hidden.querySelector('.full-desc').innerText;
            document.getElementById('modal-year').innerText = hidden.querySelector('.project-year').innerText;
            document.getElementById('modal-link').href = hidden.querySelector('.project-link').href;

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });

    const hideModal = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    closeBtn.onclick = hideModal;
    modal.querySelector('.modal-bg').onclick = hideModal;
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && modal.style.display === 'flex') hideModal();
    });

    // --- 7. قائمة الزر الأيمن المخصصة (Context Menu) ---
    const cmHTML = `
        <div id="custom-cm" class="custom-cm">
            <div class="cm-item" onclick="window.history.back()"><i class="fa-solid fa-arrow-left"></i> Back</div>
            <div class="cm-item" onclick="window.location.reload()"><i class="fa-solid fa-rotate-right"></i> Reload</div>
            <div class="cm-divider"></div>
            <div id="cm-copy" class="cm-item"><i class="fa-solid fa-copy"></i> Copy Text</div>
            <div class="cm-item" id="generate-qr"><i class="fa-solid fa-qrcode"></i> Page QR Code</div>
            <div class="cm-divider"></div>
            <div class="cm-item" onclick="window.print()"><i class="fa-solid fa-print"></i> Print Page</div>
            <div class="cm-item" onclick="window.scrollTo({top: 0, behavior: 'smooth'})"><i class="fa-solid fa-arrow-up"></i> Scroll to Top</div>
        </div>
        
        <div id="qr-modal" class="qr-modal">
            <h3>Scan QR Code</h3>
            <div id="qr-container"></div>
            <p style="font-size:12px; color:#888; margin-top:10px;">Share Portfolio</p>
            <button class="view-btn" style="margin-top:15px; width:100%" onclick="document.getElementById('qr-modal').classList.remove('active')">Close</button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', cmHTML);

    const cm = document.getElementById('custom-cm');
    const copyBtn = document.getElementById('cm-copy');
    const qrModal = document.getElementById('qr-modal');

    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const selectedText = window.getSelection().toString();
        if (selectedText.length > 0) {
            copyBtn.classList.remove('disabled');
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(selectedText);
                cm.classList.remove('active');
            };
        } else {
            copyBtn.classList.add('disabled');
            copyBtn.onclick = null;
        }

        let x = e.clientX, y = e.clientY;
        const winW = window.innerWidth, winH = window.innerHeight;
        const cmW = cm.offsetWidth, cmH = cm.offsetHeight;

        if (x + cmW > winW) x = winW - cmW - 10;
        if (y + cmH > winH) y = winH - cmH - 10;

        cm.style.left = `${x}px`;
        cm.style.top = `${y}px`;
        cm.classList.add('active');
    });

    document.getElementById('generate-qr').onclick = () => {
        const pageUrl = window.location.href;
        const qrContainer = document.getElementById('qr-container');
        qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${pageUrl}" alt="QR">`;
        qrModal.classList.add('active');
        cm.classList.remove('active');
    };

    document.addEventListener('click', (e) => {
        if (!qrModal.contains(e.target)) cm.classList.remove('active');
    });

    // --- الإطلاق الأولي ---
    updateDisplay();
    setTimeout(moveUnderline, 200);
});