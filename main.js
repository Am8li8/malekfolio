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


    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(ring);

    let mX = 0, mY = 0; // موقع الماوس
    let cX = 0, cY = 0; // موقع الدائرة

    window.addEventListener('mousemove', e => {
        mX = e.clientX;
        mY = e.clientY;
    });

    // حلقة الأنيميشن: أداء 120 إطار في الثانية
    function render() {
        // تنعيم الحركة (كلما قل الرقم 0.1 زادت "السيولة")
        cX += (mX - cX) * 0.3;
        cY += (mY - cY) * 0.3;

        ring.style.transform = `translate(${cX - 20}px, ${cY - 20}px)`;
        
        requestAnimationFrame(render);
    }
    render();

    // التفاعل مع العناصر
    const targets = document.querySelectorAll('a, button, .project-card, .icons a');
    targets.forEach(t => {
        t.addEventListener('mouseenter', () => ring.classList.add('cursor-active'));
        t.addEventListener('mouseleave', () => ring.classList.remove('cursor-active'));
    });



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

    // 2. إضافة زر الرابط الخارجي بجانب زر Details في كل كارت تلقائياً
    document.querySelectorAll('.project-card').forEach(card => {
        const infoDiv = card.querySelector('.project-info');
        const viewBtn = card.querySelector('.open-modal');
        const linkHref = card.querySelector('.project-link').href;

        // وضع الأزرار في حاوية واحدة
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
    });

    // 3. منطق فتح المودال
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

    // 4. وظائف الإغلاق (X, Overlay, Esc)
    const hideModal = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    closeBtn.onclick = hideModal;
    modal.querySelector('.modal-bg').onclick = hideModal;

    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && modal.style.display === 'flex') hideModal();
    });



// --- إعدادات الشات بوت ---
const API_KEY = "AIzaSyBwNEmtUPAMEgzGfLS3a4Z_9hgMJLMcREU";
const chatToggle = document.getElementById('ai-chat-toggle');
const chatWindow = document.getElementById('ai-chat-window');
const closeChat = document.getElementById('close-chat');
const sendBtn = document.getElementById('send-msg');
const userInput = document.getElementById('user-msg');
const chatBody = document.getElementById('ai-chat-body');

const SYSTEM_PROMPT = `You are Malek's personal AI Assistant. 
Bio: Developer (1+ year), Designer (3+ years), 30+ projects. 
Links: GitHub "Am8li8", WhatsApp +201031660042, CV at "img/cv.pdf".`;

// فتح وإغلاق الشات
if (chatToggle) {
    chatToggle.addEventListener('click', () => {
        chatWindow.style.display = (chatWindow.style.display === 'flex') ? 'none' : 'flex';
    });
}

if (closeChat) {
    closeChat.addEventListener('click', () => {
        chatWindow.style.display = 'none';
    });
}

// دالة إرسال الرسائل
async function handleMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user');
    userInput.value = '';
    const loadingMsg = appendMessage("Thinking...", 'ai');

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: SYSTEM_PROMPT + "\nUser: " + text }] }]
            })
        });
        const data = await response.json();
        loadingMsg.innerText = data.candidates[0].content.parts[0].text;
    } catch (error) {
        loadingMsg.innerText = "Connection error. Try again!";
    }
}

function appendMessage(text, side) {
    const div = document.createElement('div');
    div.className = `msg ${side}`;
    div.innerText = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
    return div;
}

sendBtn.onclick = handleMessage;
userInput.onkeypress = (e) => { if (e.key === 'Enter') handleMessage(); };
});