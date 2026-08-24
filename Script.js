// Script.js - Refactored for Stability & Interactive Enhancements

let isAuthenticated = false;

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNavigation();
    initUploadSimulation();
    initChatbot();
    initThemeToggle();
    init3DTilt();
    initExportPDF();
    initTrendsChart();
    
    // Set initial view
    const uploadNav = document.getElementById('nav-upload');
    if (uploadNav) uploadNav.click();
});

// 1. Navigation System (Upgraded with GSAP)
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-menu .nav-item[data-target]');
    let currentViewId = null;

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            
            if (targetId === currentViewId) return;

            // Authentication Check
            if (!isAuthenticated && targetId !== 'view-upload') {
                alert("🔒 กรุณาอัปโหลดผลตรวจและยืนยันตัวตน เพื่อเข้าถึงข้อมูลสุขภาพ");
                return;
            }
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            const oldView = currentViewId ? document.getElementById(currentViewId) : null;
            const newView = document.getElementById(targetId);

            const showNewView = () => {
                if(newView) {
                    newView.style.display = 'block';
                    newView.classList.add('active');
                    
                    if (typeof gsap !== 'undefined') {
                        gsap.fromTo(newView, 
                            { opacity: 0, y: 30 }, 
                            { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
                        );
                        
                        // Stagger animate cards inside new view
                        gsap.fromTo(newView.querySelectorAll('.card, .metric-card, .plan-column'), 
                            { opacity: 0, y: 20 },
                            { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 }
                        );
                    } else {
                        newView.style.opacity = '1';
                        newView.style.transform = 'translateY(0)';
                    }

                    // Fix Chart.js rendering issue when unhidden
                    if (targetId === 'view-trends') {
                        setTimeout(() => {
                            window.dispatchEvent(new Event('resize'));
                            window.dispatchEvent(new Event('trends-opened'));
                        }, 50);
                    }
                }
                currentViewId = targetId;
            };

            if (oldView && typeof gsap !== 'undefined') {
                gsap.to(oldView, { 
                    opacity: 0, 
                    y: -20, 
                    duration: 0.3, 
                    onComplete: () => {
                        oldView.style.display = 'none';
                        oldView.classList.remove('active');
                        showNewView();
                    }
                });
            } else {
                if(oldView) {
                    oldView.style.display = 'none';
                    oldView.classList.remove('active');
                }
                showNewView();
            }
        });
    });
}

// 2. Upload Simulation
function initUploadSimulation() {
    const uploadBtn = document.getElementById('btn-upload');
    const btnBackDashboard = document.getElementById('btn-back-dashboard');
    const btnUploadNew = document.getElementById('btn-upload-new');
    
    // ID Verify elements
    const verifyState = document.getElementById('upload-verify-state');
    const btnVerifyId = document.getElementById('btn-verify-id');
    const idInput = document.getElementById('id-card-input');
    const verifyError = document.getElementById('verify-error-msg');
    
    if (!uploadBtn) return;

    uploadBtn.addEventListener('click', () => {
        const loadingState = document.getElementById('loadingState');
        const scanningText = document.getElementById('scanningText');
        const uploadInitial = document.getElementById('upload-initial-state');
        const uploadSuccess = document.getElementById('upload-success-state');
        
        if(uploadInitial) uploadInitial.style.display = 'none';
        if (loadingState) loadingState.style.display = 'block';
        if (verifyState) verifyState.style.display = 'none';

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
            if (scanningText) scanningText.textContent = texts[0];
            
            // Show Verify State instead of jumping to dashboard
            if (loadingState) loadingState.style.display = 'none';
            if (verifyState) {
                verifyState.style.display = 'block';
                if(idInput) {
                    idInput.value = '';
                    if(verifyError) verifyError.style.display = 'none';
                    idInput.focus();
                }
            }
        }, 3000);
    });

    if (btnVerifyId && idInput) {
        btnVerifyId.addEventListener('click', () => {
            if (idInput.value === '0000000000000') {
                if(verifyError) verifyError.style.display = 'none';
                if(verifyState) verifyState.style.display = 'none';
                
                // Unlock UI
                isAuthenticated = true;
                document.body.classList.remove('pre-auth'); // Reveal the app shell

                const lockedNavs = document.querySelectorAll('.locked-nav');
                lockedNavs.forEach(nav => nav.classList.remove('locked-nav'));
                const chatbotFab = document.getElementById('chatbot-fab');
                if (chatbotFab) chatbotFab.style.display = 'flex';
                
                // UX Flow Change: Hide Upload Nav, Show "Back to Home" at bottom
                const navUpload = document.getElementById('nav-upload');
                const navHomeBottom = document.getElementById('nav-home-bottom');
                if (navUpload) navUpload.style.display = 'none';
                if (navHomeBottom) navHomeBottom.style.display = 'flex';

                const uploadSuccess = document.getElementById('upload-success-state');
                if (uploadSuccess) uploadSuccess.style.display = 'block';
                
                // Navigate to Dashboard
                const dashboardNav = document.getElementById('nav-dashboard');
                if (dashboardNav) dashboardNav.click();

                animateHealthScore();
            } else {
                if(verifyError) verifyError.style.display = 'block';
            }
        });
        
        // Allow pressing Enter to verify
        idInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                btnVerifyId.click();
            }
        });
    }

    if (btnBackDashboard) {
        btnBackDashboard.addEventListener('click', () => {
            const dashboardNav = document.getElementById('nav-dashboard');
            if (dashboardNav) dashboardNav.click();
        });
    }

    const resetToHomeFlow = () => {
        const uploadInitial = document.getElementById('upload-initial-state');
        const uploadSuccess = document.getElementById('upload-success-state');
        if(uploadSuccess) uploadSuccess.style.display = 'none';
        if(uploadInitial) uploadInitial.style.display = 'block';
        
        // FIX: Re-lock the UI when starting a new upload
        isAuthenticated = false;
        document.body.classList.add('pre-auth'); // Hide the app shell

        const allNavs = document.querySelectorAll('.nav-menu .nav-item');
        allNavs.forEach(nav => {
            if (nav.id !== 'nav-upload' && nav.id !== 'theme-toggle' && nav.id !== 'nav-home-bottom') {
                nav.classList.add('locked-nav');
            }
        });
        const chatbotFab = document.getElementById('chatbot-fab');
        if (chatbotFab) chatbotFab.style.display = 'none';

        // Revert sidebar changes
        const navUpload = document.getElementById('nav-upload');
        const navHomeBottom = document.getElementById('nav-home-bottom');
        if (navUpload) {
            navUpload.style.display = 'flex';
            navUpload.click(); // Force navigate to view-upload
        }
        if (navHomeBottom) navHomeBottom.style.display = 'none';
    };

    if (btnUploadNew) {
        btnUploadNew.addEventListener('click', resetToHomeFlow);
    }
    
    const navHomeBtn = document.getElementById('nav-home-bottom');
    if (navHomeBtn) {
        navHomeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetToHomeFlow();
        });
    }
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
                    aiMsg.innerHTML = `<p><strong>เรื่องภูมิแพ้ (Eosinophil):</strong> ค่า Eosinophil ที่ 4% บ่งชี้ว่าร่างกายกำลังสู้กับสารก่อภูมิแพ้ครับ ลองทำความสะอาดห้องนอนและหลีกเลี่ยงฝุ่นดูนะครับ 🧹</p>`;
                } else if (text.includes('ตับ') || text.toLowerCase().includes('ast') || text.toLowerCase().includes('alt')) {
                    aiMsg.innerHTML = `<p><strong>การทำงานของตับ:</strong> ค่า ALT ของคุณอยู่ที่ 45 U/L (สูงเล็กน้อย) อาจเกิดจากการพักผ่อนน้อยหรือทานยาบางชนิด แนะนำให้งดแอลกอฮอล์และทานโปรตีนพืชเพิ่มครับ 🥦</p>`;
                } else if (text.includes('ไทรอยด์') || text.toLowerCase().includes('tsh')) {
                    aiMsg.innerHTML = `<p><strong>ระบบฮอร์โมนไทรอยด์:</strong> ค่า TSH ของคุณอยู่ที่ 2.1 mIU/L (ปกติ) ระบบเผาผลาญพื้นฐานทำงานได้ดีมากครับ ไม่มีภาวะอ้วนจากไทรอยด์แฝงแน่นอน! ✨</p>`;
                } else if (text.includes('ความเครียด') || text.toLowerCase().includes('cortisol')) {
                    aiMsg.innerHTML = `<p><strong>ระดับความเครียด (Cortisol):</strong> พบว่าค่าสูงถึง 19.5 ug/dL ซึ่งอาจทำให้คุณรู้สึกอ่อนเพลียหรือนอนไม่หลับ แนะนำนั่งสมาธิก่อนนอน และลดกาแฟช่วงบ่ายครับ ☕️</p>`;
                } else if (text.includes('ซีด') || text.includes('เลือด') || text.toLowerCase().includes('hb')) {
                    aiMsg.innerHTML = `<p><strong>ความสมบูรณ์เม็ดเลือดแดง (Hb):</strong> อยู่ที่ 13.5 g/dL ปกติครับ! ร่างกายลำเลียงออกซิเจนได้ดี ไม่พบภาวะโลหิตจางครับ 🩸</p>`;
                } else {
                    aiMsg.innerHTML = `<p>คำถามที่ดีครับ! จากผลแล็บโดยรวมของคุณอยู่ในเกณฑ์ที่ยอดเยี่ยม 🌟 หากมีอาการเฉพาะทางอื่นๆ ลองปรึกษาในหมวด <strong>คลังความรู้ MedTech</strong> ได้นะครับ!</p>`;
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
        VanillaTilt.init(document.querySelectorAll(".score-card, .metric-card, .plan-column, .action-plan-card, .meal-card"), {
            max: 3,
            speed: 400,
            glare: true,
            "max-glare": 0.1,
        });
    }
}

// 7. Export PDF Logic
function initExportPDF() {
    const btnExport = document.getElementById('btn-export-pdf');
    if (!btnExport) return;

    btnExport.addEventListener('click', () => {
        // Switch to dashboard view temporarily to capture it
        const dashboardNav = document.getElementById('nav-dashboard');
        if (dashboardNav) dashboardNav.click();

        const originalText = btnExport.innerText;
        btnExport.innerText = "กำลังสร้าง PDF...";
        btnExport.disabled = true;

        // Allow UI to render the dashboard before capturing
        setTimeout(() => {
            const element = document.getElementById('view-dashboard');
            
            const opt = {
                margin:       [10, 10, 10, 10],
                filename:     'LabLink-Health-Report.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, logging: false },
                jsPDF:        { unit: 'mm', format: 'a3', orientation: 'portrait' }
            };

            // Call html2pdf
            if (typeof html2pdf !== 'undefined') {
                html2pdf().set(opt).from(element).save().then(() => {
                    // Reset button text
                    const settingsNav = document.getElementById('nav-settings');
                    if (settingsNav) settingsNav.click();
                    
                    btnExport.innerText = originalText;
                    btnExport.disabled = false;
                });
            } else {
                alert("ระบบไม่พบไลบรารีสำหรับสร้าง PDF กรุณาลองใหม่อีกครั้ง");
                btnExport.innerText = originalText;
                btnExport.disabled = false;
            }
        }, 500);
    });
}

// 8. Trends Chart (Chart.js)
function initTrendsChart() {
    let instances = [];
    
    const renderCharts = () => {
        // Destroy old instances
        instances.forEach(chart => chart.destroy());
        instances = [];

        const isDarkMode = document.body.classList.contains('dark-mode');
        const textColor = isDarkMode ? '#e2e8f0' : '#64748b';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
        
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { color: textColor, font: { family: 'Prompt' }, usePointStyle: true, boxWidth: 8 } },
                tooltip: { mode: 'index', intersect: false, titleFont: { family: 'Prompt' }, bodyFont: { family: 'Prompt' } }
            },
            scales: {
                y: { grid: { color: gridColor }, ticks: { color: textColor } },
                x: { grid: { color: gridColor }, ticks: { color: textColor } }
            }
        };

        const labels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'];

        // 1. Lipid Profile (Line)
        const ctxLipid = document.getElementById('chartLipid');
        if (ctxLipid) {
            instances.push(new Chart(ctxLipid, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        { label: 'LDL (ไขมันเลว)', data: [155, 150, 145, 140, 135, 130], borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', tension: 0.4, fill: true },
                        { label: 'HDL (ไขมันดี)', data: [42, 45, 47, 50, 52, 55], borderColor: '#10b981', tension: 0.4 },
                        { label: 'Triglycerides', data: [160, 155, 150, 148, 145, 140], borderColor: '#f59e0b', tension: 0.4, borderDash: [5, 5] }
                    ]
                },
                options: commonOptions
            }));
        }

        // 2. Blood Sugar (Bar)
        const ctxSugar = document.getElementById('chartSugar');
        if (ctxSugar) {
            instances.push(new Chart(ctxSugar, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{ label: 'FBS (mg/dL)', data: [95, 93, 91, 90, 89, 88], backgroundColor: '#3b82f6', borderRadius: 4 }]
                },
                options: commonOptions
            }));
        }

        // 3. Liver Enzymes (Line Fill)
        const ctxLiver = document.getElementById('chartLiver');
        if (ctxLiver) {
            instances.push(new Chart(ctxLiver, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        { label: 'ALT', data: [55, 52, 50, 48, 46, 45], borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.2)', tension: 0.4, fill: true },
                        { label: 'AST', data: [35, 30, 28, 25, 23, 22], borderColor: '#0ea5e9', tension: 0.4 }
                    ]
                },
                options: commonOptions
            }));
        }

        // 4. WBC (Doughnut)
        const ctxBlood = document.getElementById('chartBlood');
        if (ctxBlood) {
            instances.push(new Chart(ctxBlood, {
                type: 'doughnut',
                data: {
                    labels: ['Neutrophil', 'Lymphocyte', 'Monocyte', 'Eosinophil'],
                    datasets: [{
                        data: [60, 30, 7, 3],
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right', labels: { color: textColor, font: { family: 'Prompt' }, boxWidth: 12 } }
                    },
                    cutout: '70%'
                }
            }));
        }

        // 5. Hormones (Radar)
        const ctxHormone = document.getElementById('chartHormone');
        if (ctxHormone) {
            instances.push(new Chart(ctxHormone, {
                type: 'radar',
                data: {
                    labels: ['TSH (ไทรอยด์)', 'Free T3', 'Free T4', 'Cortisol (เครียด)', 'Testosterone'],
                    datasets: [{
                        label: 'ระดับปัจจุบัน',
                        data: [80, 70, 75, 60, 85], // Normalized to 100
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        borderColor: '#6366f1',
                        pointBackgroundColor: '#6366f1',
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        r: {
                            angleLines: { color: gridColor },
                            grid: { color: gridColor },
                            pointLabels: { color: textColor, font: { family: 'Prompt', size: 10 } },
                            ticks: { display: false, max: 100, min: 0 }
                        }
                    }
                }
            }));
        }

        // Chart.js instances are now initialized and will animate automatically
    };

    // Re-render when the view is opened to fix 0px height bug
    window.addEventListener('trends-opened', () => {
        renderCharts();
    });

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            setTimeout(renderCharts, 50);
        });
    }
}

// 9. Particle Background (tsParticles)
function initParticles() {
    if (typeof tsParticles === 'undefined') return;

    tsParticles.load("tsparticles", {
        fpsLimit: 60,
        particles: {
            number: {
                value: 60,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: ["#3b82f6", "#8b5cf6", "#10b981"]
            },
            shape: {
                type: "circle"
            },
            opacity: {
                value: 0.3,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: true,
                    speed: 2,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: "#94a3b8",
                opacity: 0.2,
                width: 1
            },
            move: {
                enable: true,
                speed: 1.5,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: {
                    enable: true,
                    mode: "grab"
                },
                onclick: {
                    enable: true,
                    mode: "push"
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 140,
                    line_linked: {
                        opacity: 0.5
                    }
                },
                push: {
                    particles_nb: 3
                }
            }
        },
        retina_detect: true
    });
}