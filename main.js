document.addEventListener('DOMContentLoaded', () => {
    // --- 1. متغيرات العناصر الأساسية ---
    const grid = document.querySelector('.projects-grid');
    const filterBtns = document.querySelectorAll('.filter-btns button');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const underline = document.querySelector('.nav-underline'); 
    const navLinks = document.querySelectorAll('nav ul li a');

    // --- 2. نظام المشاريع ---
    let projectCards = Array.from(grid.querySelectorAll('.project-card')).reverse();
    const cardsPerPage = 6;
    let currentIndex = cardsPerPage;
    let activeFilter = 'all';

    // إعادة بناء الشبكة بالترتيب المعكوس مرة واحدة عند البداية
    if(grid) {
        grid.innerHTML = '';
        projectCards.forEach(card => {
            grid.appendChild(card);
            // إضافة زر الرابط الخارجي لكل كارت فوراً عند البناء
            setupCardButtons(card);
        });
    }

    function setupCardButtons(card) {
        if (card.querySelector('.card-btns')) return; // منع التكرار
        const viewBtn = card.querySelector('.open-modal');
        const linkHref = card.querySelector('.project-link').href;
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
            }, 50 * index);
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

    // --- 3. وظيفة تحريك خط الهيدر ---
    function moveUnderline() {
        const activeLink = document.querySelector('nav a.active');
        const navUl = document.querySelector('nav ul');
        if (activeLink && underline && navUl) {
            const linkRect = activeLink.getBoundingClientRect();
            const navRect = navUl.getBoundingClientRect();
            underline.style.width = `${linkRect.width - 30}px`;
            underline.style.transform = `translateX(${linkRect.left - navRect.left + 15}px)`;
            underline.style.opacity = "1";
        }
    }

    // --- 4. نظام مراقبة السكاشن ---
    const sections = document.querySelectorAll('section, #home');
    const observerOptions = { root: null, rootMargin: '-20% 0px -55% 0px', threshold: 0 };
    let skillsAnimated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
                moveUnderline();

                if (id === 'skills' && !skillsAnimated) {
                    document.querySelectorAll('.progress-line span').forEach(bar => {
                        bar.style.width = bar.getAttribute('data-skill') + '%';
                    });
                    skillsAnimated = true;
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
    window.addEventListener('resize', moveUnderline);

    // --- 5. المودال ---
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

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('open-modal') || e.target.parentElement.classList.contains('open-modal')) {
            const btn = e.target.closest('.open-modal');
            const card = btn.closest('.project-card');
            const hidden = card.querySelector('.hidden-info');
            document.getElementById('modal-title').innerText = card.querySelector('h3').innerText;
            document.getElementById('modal-cat').innerText = card.querySelector('.category').innerText;
            document.getElementById('modal-img').src = card.querySelector('img').src;
            document.getElementById('modal-desc').innerText = hidden.querySelector('.full-desc').innerText;
            document.getElementById('modal-year').innerText = hidden.querySelector('.project-year').innerText;
            document.getElementById('modal-link').href = hidden.querySelector('.project-link').href;
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    });

    const hideModal = () => { modal.style.display = 'none'; document.body.style.overflow = 'auto'; };
    closeBtn.onclick = hideModal;
    modal.querySelector('.modal-bg').onclick = hideModal;

    // --- 6. AI Chat (Gemini) المصحح ---
    const API_KEY = "AIzaSyBwNEmtUPAMEgzGfLS3a4Z_9hgMJLMcREU"; 
    const SYSTEM_PROMPT = `You are Malek's personal AI Assistant. 
    Bio: Developer (1+ year), Designer (3+ years), 30+ projects.
    Links: GitHub "Am8li8", WhatsApp +201031660042, CV at "img/cv.pdf".
    Answer briefly and professionally.`;

    async function getGeminiResponse(message) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: SYSTEM_PROMPT + "\nUser: " + message }] }]
                })
            });
            const data = await response.json();
            if (data.candidates && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            }
            throw new Error("Invalid response");
        } catch (error) {
            console.error("AI Error:", error);
            return "I'm having trouble connecting. Please contact Malek directly on WhatsApp.";
        }
    }

    window.handleMessage = async () => {
        const userInput = document.getElementById('user-msg');
        const text = userInput.value.trim();
        if (!text) return;
        appendMessage(text, 'user');
        userInput.value = '';
        const loadingMsg = appendMessage("Thinking...", 'ai');
        const aiResponse = await getGeminiResponse(text);
        loadingMsg.innerText = aiResponse;
    };

    function appendMessage(text, side) {
        const div = document.createElement('div');
        div.className = `msg ${side}`;
        div.innerText = text;
        const chatBody = document.getElementById('ai-chat-body');
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
        return div;
    }

    document.getElementById('send-msg').onclick = window.handleMessage;
    document.getElementById('user-msg').onkeypress = (e) => { if(e.key === 'Enter') window.handleMessage(); };

    // --- 7. Cursor Ring ---
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(ring);
    let mX = 0, mY = 0, cX = 0, cY = 0;
    window.addEventListener('mousemove', e => { mX = e.clientX; mY = e.clientY; });
    function renderCursor() {
        cX += (mX - cX) * 0.2; cY += (mY - cY) * 0.2;
        ring.style.transform = `translate(${cX - 20}px, ${cY - 20}px)`;
        requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // القيمة الأولية
    updateDisplay();
    setTimeout(moveUnderline, 500);
});