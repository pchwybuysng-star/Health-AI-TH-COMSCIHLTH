// Script.js - Refactored for Stability & Interactive Enhancements

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initUploadSimulation();
    initChatbot();
    initThemeToggle();
    init3DTilt();
    
    // Set initial view
    const uploadNav = document.getElementById('nav-upload');
    if (uploadNav) uploadNav.click();
});

// 1. Navigation System
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-menu .nav-item[data-target]');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            const views = document.querySelectorAll('.view-section');
            views.forEach(view => {
                if (view.id === targetId) {
                    view.style.display = 'block';
                    void view.offsetWidth; 
                    view.style.opacity = '1';
                    view.style.transform = 'translateY(0)';
                    view.classList.add('active');
                } else {
                    view.style.opacity = '0';
                    view.style.transform = 'translateY(10px)';
                    view.classList.remove('active');
                    setTimeout(() => {
                        view.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// 2. Upload Simulation
function initUploadSimulation() {
    const uploadBtn = document.getElementById('btn-upload');
    if (!uploadBtn) return;

    uploadBtn.addEventListener('click', () => {
        const loadingState = document.getElementById('loadingState');
        const scanningText = document.getElementById('scanningText');
        
        uploadBtn.style.display = 'none';
        if (loadingState) loadingState.style.display = 'block';

        const texts = [
            "AI กำลังสกัดข้อมูล...",
            "กำลังวิเคราะห์ค่าตับ...",
            "กำลังจำลองไขมันในเลือด...",
            "กำลังประเมินระบบภูมิคุ้มกัน..."
        ];
        let textIndex = 0;
        
        const textInterval = setInterval(() => {
            textIndex++;
            if(textIndex < texts.length && scanningText) {
                scanningText.textContent = texts[textIndex];
            }
        }, 700);

        setTimeout(() => {
            clearInterval(textInterval);
            
            const dashboardNav = document.getElementById('nav-dashboard');
            if (dashboardNav) dashboardNav.click();

            setTimeout(() => {
                uploadBtn.style.display = 'inline-block';
                if (loadingState) loadingState.style.display = 'none';
                if (scanningText) scanningText.textContent = texts[0];
            }, 500);

            animateHealthScore();
        }, 3000);
    });
}

// 3. Health Score Animation
function animateHealthScore() {
    const progressCircle = document.querySelector('.circular-progress');
    if(!progressCircle) return;
    
    progressCircle.style.background = `conic-gradient(var(--success) 0deg, var(--border) 0deg)`;
    
    const targetScore = parseInt(progressCircle.getAttribute('data-progress')) || 85;
    const scoreElement = document.querySelector('.score-number');

    let currentScore = 0;
    const duration = 1500;
    const intervalTime = 20;
    const step = targetScore / (duration / intervalTime);

    const timer = setInterval(() => {
        currentScore += step;
        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(timer);
        }

        if(scoreElement) scoreElement.textContent = Math.round(currentScore);

        const degrees = (currentScore / 100) * 360;
        progressCircle.style.background = `conic-gradient(var(--success) ${degrees}deg, var(--border) 0deg)`;
    }, intervalTime);
}

// 4. Interactive Chatbot Logic
function initChatbot() {
    const chatInput = document.querySelector('.chat-input');
    const chatSendBtn = document.querySelector('.chat-send');
    const chatBody = document.querySelector('.chat-body');

    if (chatInput && chatSendBtn && chatBody) {
        const sendMessage = () => {
            const text = chatInput.value.trim();
            if (!text) return;

            const userMsg = document.createElement('div');
            userMsg.className = 'message user-message';
            userMsg.innerHTML = `<p>${text}</p>`;
            chatBody.appendChild(userMsg);
            
            chatInput.value = '';
            chatBody.scrollTop = chatBody.scrollHeight;

            const typingMsg = document.createElement('div');
            typingMsg.className = 'message ai-message typing-indicator';
            typingMsg.innerHTML = `<p>กำลังวิเคราะห์ข้อมูล...</p>`;
            chatBody.appendChild(typingMsg);
            chatBody.scrollTop = chatBody.scrollHeight;

            setTimeout(() => {
                if(chatBody.contains(typingMsg)) chatBody.removeChild(typingMsg);
                
                const aiMsg = document.createElement('div');
                aiMsg.className = 'message ai-message';
                
                if (text.includes('น้ำตาล') || text.toLowerCase().includes('fbs')) {
                    aiMsg.innerHTML = `<p><strong>เรื่องน้ำตาล (FBS):</strong> ค่าของคุณอยู่ที่ 88 mg/dL ซึ่งอยู่ในเกณฑ์ปกติเยี่ยมมากครับ! พยายามรักษาการกินคาร์บเชิงซ้อนต่อไปนะครับ 👏</p>`;
                } else if (text.includes('ไขมัน') || text.toLowerCase().includes('ldl') || text.includes('คอเลสเตอรอล')) {
                    aiMsg.innerHTML = `<p><strong>เรื่องไขมันในเลือด:</strong> แม้ว่า LDL จะ 130 (ปริ่มเกณฑ์) แต่คุณมี HDL ถึง 55 ช่วยดึงไขมันทิ้งได้ดีครับ แนะนำให้ออกกำลังกายแบบคาร์ดิโอเพิ่มสัปดาห์ละ 2-3 วันครับ 🏃‍♂️</p>`;
                } else if (text.toLowerCase().includes('eosinophil') || text.includes('ภูมิแพ้')) {
                    aiMsg.innerHTML = `<p><strong>เรื่องภูมิแพ้:</strong> ค่า Eosinophil ที่ 4% บ่งชี้ว่าร่างกายกำลังสู้กับสารก่อภูมิแพ้ครับ ลองทำความสะอาดห้องนอนและหลีกเลี่ยงฝุ่นดูนะครับ 🧹</p>`;
                } else {
                    aiMsg.innerHTML = `<p>คำถามที่ดีครับ! จากผลแล็บโดยรวมของคุณอยู่ในเกณฑ์ที่ยอดเยี่ยม หากมีอาการผิดปกติใดๆ ควรปรึกษาแพทย์เฉพาะทางร่วมด้วยนะครับ 🏥</p>`;
                }

                chatBody.appendChild(aiMsg);
                chatBody.scrollTop = chatBody.scrollHeight;
            }, 1200);
        };

        chatSendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
}

// 5. Theme Toggle Feature
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.toggle('dark-mode');
            const icon = themeToggle.querySelector('.icon');
            
            if (document.body.classList.contains('dark-mode')) {
                if(icon) icon.textContent = '☀️';
                themeToggle.innerHTML = `<span class="icon">☀️</span> โหมดสว่าง`;
            } else {
                if(icon) icon.textContent = '🌙';
                themeToggle.innerHTML = `<span class="icon">🌙</span> โหมดกลางคืน`;
            }
        });
    }
}

// 6. 3D Tilt Effect Initialization
function init3DTilt() {
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".score-card, .metric-card, .plan-column, .action-plan-card"), {
            max: 3,
            speed: 400,
            glare: true,
            "max-glare": 0.1,
        });
    }
}