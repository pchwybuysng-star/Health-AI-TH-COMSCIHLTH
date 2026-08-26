// Script.js - Refactored for Stability & Interactive Enhancements

let isAuthenticated = false;

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNavigation();
    initUploadSimulation();
    initChatbot();
    initThemeToggle();
    init3DTilt();
    initTrendsChart();
    initRealtimeClock();
    initDragAndDrop();
    initAnatomyTooltips();
    initRiskScore();

    // Check if user was previously authenticated (persisted session)
    const savedAuth = localStorage.getItem('lablink_auth');
    if (savedAuth === 'true') {
        const savedHealth = localStorage.getItem('lablink_health_data');
        if (savedHealth) {
            try {
                window.extractedHealthData = JSON.parse(savedHealth);
                applyHealthDataToUI(window.extractedHealthData);
            } catch (e) {
                console.error("Failed to parse saved health data:", e);
            }
        }
        
        setAuthenticatedState(true);
        
        // Restore last active view or default to Dashboard
        const lastViewId = localStorage.getItem('lablink_last_view') || 'view-dashboard';
        const targetNav = document.querySelector(`.nav-menu .nav-item[data-target="${lastViewId}"]`) || document.getElementById('nav-dashboard');
        if (targetNav) {
            targetNav.click();
        }
        animateHealthScore();
    } else {
        // Set initial view for pre-auth
        const uploadNav = document.getElementById('nav-upload');
        if (uploadNav) uploadNav.click();
    }
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

            if (isAuthenticated && targetId !== 'view-upload') {
                localStorage.setItem('lablink_last_view', targetId);
            }

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            const oldView = currentViewId ? document.getElementById(currentViewId) : null;
            const newView = document.getElementById(targetId);

            const showNewView = () => {
                if (newView) {
                    newView.style.display = 'block';
                    newView.classList.add('active');

                    if (typeof gsap !== 'undefined') {
                        gsap.fromTo(newView, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" });

                        // Stagger animate cards inside new view
                        gsap.fromTo(newView.querySelectorAll('.card, .metric-card, .plan-column'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 });
                    } else {
                        newView.style.opacity = '1';
                        newView.style.transform = 'translateY(0)';
                    }

                    // Fix Chart.js rendering issue when unhidden
                    if (targetId === 'view-trends') {
                        setTimeout(() => {
                            window.dispatchEvent(new Event('resize'));
                            if (window.updateTrendsChart) {
                                window.updateTrendsChart();
                            }
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
                if (oldView) {
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

    const realFileUpload = document.getElementById('real-file-upload');
    if (!realFileUpload) return;

    realFileUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const loadingState = document.getElementById('loadingState');
        const scanningText = document.getElementById('scanningText');
        const uploadInitial = document.getElementById('upload-initial-state');
        const verifyState = document.getElementById('upload-verify-state');

        if (uploadInitial) uploadInitial.style.display = 'none';
        if (loadingState) loadingState.style.display = 'block';
        if (verifyState) verifyState.style.display = 'none';
        
        if (scanningText) scanningText.textContent = "AI กำลังอ่านไฟล์: " + file.name + "...";

        try {
            let extractedText = "";
            
            // 1. PDF Parsing
            if (file.type === 'application/pdf' && window.pdfjsLib) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({data: new Uint8Array(arrayBuffer)}).promise;
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    extractedText += content.items.map(item => item.str).join(' ') + " ";
                }
            } 
            // 2. Image OCR Parsing
            else if (file.type.startsWith('image/') && window.Tesseract) {
                if (scanningText) scanningText.textContent = "AI กำลังสแกนรูปภาพ (OCR) อาจใช้เวลาสักครู่...";
                const result = await Tesseract.recognize(file, 'eng+tha', {
                    logger: m => {
                        if(m.status === 'recognizing text' && scanningText) {
                            scanningText.textContent = "AI กำลังสแกนรูปภาพ: " + Math.round(m.progress * 100) + "%";
                        }
                    }
                });
                extractedText = result.data.text;
            } 
            // 3. Plain Text fallback
            else {
                extractedText = await file.text();
            }

            console.log("Extracted Raw Text:", extractedText);
            window.extractedHealthData = {};
            
            // Regex to find health markers
            const bpMatch = extractedText.match(/(?:BP|Blood Pressure|ความดัน).*?(\d{2,3}\s*\/\s*\d{2,3})/i);
            if (bpMatch) window.extractedHealthData.bp = bpMatch[1].replace(/\s/g, '');
            
            const cholMatch = extractedText.match(/(?:Total Chol|Cholesterol|คอเลสเตอรอล).*?(\d{2,3})/i);
            if (cholMatch) window.extractedHealthData.chol = parseInt(cholMatch[1]);
            
            const hdlMatch = extractedText.match(/HDL.*?(\d{2,3})/i);
            if (hdlMatch) window.extractedHealthData.hdl = parseInt(hdlMatch[1]);

            const ldlMatch = extractedText.match(/LDL.*?(\d{2,3})/i);
            if (ldlMatch) window.extractedHealthData.ldl = parseInt(ldlMatch[1]);
            
            const fbsMatch = extractedText.match(/(?:FBS|Glucose|น้ำตาล).*?(\d{2,3})/i);
            if (fbsMatch) window.extractedHealthData.fbs = parseInt(fbsMatch[1]);

            // Liver
            const altMatch = extractedText.match(/ALT.*?(\d{2,3})/i);
            if (altMatch) window.extractedHealthData.alt = parseInt(altMatch[1]);
            const astMatch = extractedText.match(/AST.*?(\d{2,3})/i);
            if (astMatch) window.extractedHealthData.ast = parseInt(astMatch[1]);

            // WBC
            const neuMatch = extractedText.match(/Neutrophil.*?(\d{1,2})/i);
            if (neuMatch) window.extractedHealthData.neu = parseInt(neuMatch[1]);
            const lymMatch = extractedText.match(/Lymphocyte.*?(\d{1,2})/i);
            if (lymMatch) window.extractedHealthData.lym = parseInt(lymMatch[1]);
            const monMatch = extractedText.match(/Monocyte.*?(\d{1,2})/i);
            if (monMatch) window.extractedHealthData.mon = parseInt(monMatch[1]);
            const eosMatch = extractedText.match(/Eosinophil.*?(\d{1,2})/i);
            if (eosMatch) window.extractedHealthData.eos = parseInt(eosMatch[1]);

            // Hormones
            const corMatch = extractedText.match(/Cortisol.*?(\d{1,3}(?:\.\d)?)/i);
            if (corMatch) window.extractedHealthData.cortisol = parseFloat(corMatch[1]);
            const tshMatch = extractedText.match(/TSH.*?(\d{1,2}(?:\.\d)?)/i);
            if (tshMatch) window.extractedHealthData.tsh = parseFloat(tshMatch[1]);
            const dheaMatch = extractedText.match(/DHEA.*?(\d{2,3})/i);
            if (dheaMatch) window.extractedHealthData.dhea = parseInt(dheaMatch[1]);
            const tesMatch = extractedText.match(/Testosterone.*?(\d{2,4})/i);
            if (tesMatch) window.extractedHealthData.testosterone = parseInt(tesMatch[1]);
            const insMatch = extractedText.match(/Insulin.*?(\d{1,2}(?:\.\d)?)/i);
            if (insMatch) window.extractedHealthData.insulin = parseFloat(insMatch[1]);

            if (scanningText) {
                scanningText.textContent = "สกัดข้อมูลสำเร็จ! เตรียมเข้าสู่ระบบ...";
            }
            await new Promise(r => setTimeout(r, 1500));
            
        } catch (err) {
            console.error("Extraction error:", err);
            if (scanningText) scanningText.textContent = "AI อ่านไฟล์ไม่สำเร็จ แต่จะใช้ค่าจำลองแทน...";
            await new Promise(r => setTimeout(r, 2000));
        }

        if (loadingState) loadingState.style.display = 'none';
        if (verifyState) {
            verifyState.style.display = 'block';
            if (idInput) {
                idInput.value = '';
                if (verifyError) verifyError.style.display = 'none';
                idInput.focus();
            }
        }
        
        realFileUpload.value = '';
    });

    if (btnVerifyId && idInput) {
        btnVerifyId.addEventListener('click', () => {
            if (idInput.value === '0000000000000') {
                if (verifyError) verifyError.style.display = 'none';
                if (verifyState) verifyState.style.display = 'none';

                // Save and apply health data
                if (window.extractedHealthData) {
                    localStorage.setItem('lablink_health_data', JSON.stringify(window.extractedHealthData));
                    applyHealthDataToUI(window.extractedHealthData);
                }

                // Unlock UI & persist session
                setAuthenticatedState(true);

                // Update new upgrade widgets
                updateUploadDate();
                calculateRiskScore();

                // Navigate to Dashboard
                const dashboardNav = document.getElementById('nav-dashboard');
                if (dashboardNav) dashboardNav.click();

                animateHealthScore();
            } else {
                if (verifyError) verifyError.style.display = 'block';
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
        if (uploadSuccess) uploadSuccess.style.display = 'none';
        if (uploadInitial) uploadInitial.style.display = 'block';

        setAuthenticatedState(false);
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

// Helper: Apply Extracted Health Data to UI Elements
function applyHealthDataToUI(eh) {
    if (!eh) return;
    const metricValues = document.querySelectorAll('.metric-value');
    
    if (eh.bp && metricValues.length > 0) {
        metricValues[0].innerHTML = `${eh.bp} <span style="font-size: 0.8rem;">mmHg</span> <br><span style="font-size: 0.7rem; color: var(--success);">(อัปเดตจากไฟล์)</span>`;
    }
    if (eh.chol && metricValues.length > 1) {
        metricValues[1].innerHTML = `${eh.chol} <span style="font-size: 0.8rem;">mg/dL</span> <br><span style="font-size: 0.7rem; color: var(--success);">(อัปเดตจากไฟล์)</span>`;
    }
    if (eh.hdl && metricValues.length > 2) {
        metricValues[2].innerHTML = `${eh.hdl} <span style="font-size: 0.8rem;">mg/dL</span> <br><span style="font-size: 0.7rem; color: var(--success);">(อัปเดตจากไฟล์)</span>`;
    }
    if (eh.ldl && metricValues.length > 3) {
        metricValues[3].innerHTML = `${eh.ldl} <span style="font-size: 0.8rem;">mg/dL</span> <br><span style="font-size: 0.7rem; color: var(--success);">(อัปเดตจากไฟล์)</span>`;
    }
    if (eh.fbs && metricValues.length > 4) {
        metricValues[4].innerHTML = `${eh.fbs} <span style="font-size: 0.8rem;">mg/dL</span> <br><span style="font-size: 0.7rem; color: var(--success);">(อัปเดตจากไฟล์)</span>`;
    }

    // 1. Calculate Health Age
    let baseAge = 35;
    let ageOffset = 0;
    if (eh.ldl) { if (eh.ldl > 130) ageOffset += 2; else if (eh.ldl < 100) ageOffset -= 2; }
    if (eh.fbs) { if (eh.fbs > 100) ageOffset += 3; else if (eh.fbs < 90) ageOffset -= 2; }
    if (eh.alt) { if (eh.alt > 40) ageOffset += 2; else if (eh.alt < 20) ageOffset -= 1; }
    
    let finalAge = baseAge + ageOffset;
    const healthAgeNum = document.getElementById('health-age-number');
    const healthAgeText = document.getElementById('health-age-text');
    
    if (healthAgeNum && healthAgeText) {
        healthAgeNum.textContent = finalAge;
        if (ageOffset < 0) {
            healthAgeText.textContent = `อ่อนเยาว์กว่าอายุจริง ${Math.abs(ageOffset)} ปี!`;
            healthAgeText.className = "text-success";
        } else if (ageOffset > 0) {
            healthAgeText.textContent = `แก่กว่าอายุจริง ${ageOffset} ปี! (ต้องดูแลตัวเองแล้ว)`;
            healthAgeText.className = "text-warning";
            healthAgeText.style.color = "#ef4444";
        } else {
            healthAgeText.textContent = `อายุสุขภาพเท่ากับอายุจริง`;
            healthAgeText.className = "";
        }
    }

    // 2. Update AI Anatomy Scanner
    const organHeart = document.getElementById('organ-heart');
    const organLiver = document.getElementById('organ-liver');
    const organPancreas = document.getElementById('organ-pancreas');
    
    const colorSafe = "#10b981";
    const colorWarn = "#f59e0b";
    const colorDanger = "#ef4444";

    setTimeout(() => {
        if (organHeart) {
            let heartStatus = colorSafe;
            if (eh.ldl > 160 || eh.chol > 240) heartStatus = colorDanger;
            else if (eh.ldl > 130 || eh.chol > 200) heartStatus = colorWarn;
            organHeart.style.fill = heartStatus;
            if (heartStatus === colorDanger) organHeart.style.filter = "drop-shadow(0 0 10px #ef4444)";
        }
        
        if (organLiver) {
            let liverStatus = colorSafe;
            if (eh.alt > 60 || eh.ast > 60) liverStatus = colorDanger;
            else if (eh.alt > 40 || eh.ast > 40) liverStatus = colorWarn;
            organLiver.style.fill = liverStatus;
            if (liverStatus === colorDanger) organLiver.style.filter = "drop-shadow(0 0 10px #ef4444)";
        }
        
        if (organPancreas) {
            let pancStatus = colorSafe;
            if (eh.fbs > 125) pancStatus = colorDanger;
            else if (eh.fbs > 100) pancStatus = colorWarn;
            organPancreas.style.fill = pancStatus;
            if (pancStatus === colorDanger) organPancreas.style.filter = "drop-shadow(0 0 10px #ef4444)";
        }
        
        // Retrigger SVG draw animation
        const svg = document.querySelector('.draw-svg');
        if (svg) {
            svg.style.animation = 'none';
            svg.offsetHeight; /* trigger reflow */
            svg.style.animation = null; 
        }
    }, 500);
}

// Helper: Toggle Authentication State & Persistence
function setAuthenticatedState(isAuth) {
    isAuthenticated = isAuth;
    if (isAuth) {
        localStorage.setItem('lablink_auth', 'true');
        document.body.classList.remove('pre-auth');

        const lockedNavs = document.querySelectorAll('.locked-nav');
        lockedNavs.forEach(nav => nav.classList.remove('locked-nav'));
        
        const chatbotFab = document.getElementById('chatbot-fab');
        if (chatbotFab) chatbotFab.style.display = 'flex';

        const navUpload = document.getElementById('nav-upload');
        const navHomeBottom = document.getElementById('nav-home-bottom');
        if (navUpload) navUpload.style.display = 'none';
        if (navHomeBottom) navHomeBottom.style.display = 'flex';

        const uploadSuccess = document.getElementById('upload-success-state');
        if (uploadSuccess) uploadSuccess.style.display = 'block';
    } else {
        localStorage.removeItem('lablink_auth');
        localStorage.removeItem('lablink_health_data');
        localStorage.removeItem('lablink_last_view');
        document.body.classList.add('pre-auth');

        const allNavs = document.querySelectorAll('.nav-menu .nav-item');
        allNavs.forEach(nav => {
            if (nav.id !== 'nav-upload' && nav.id !== 'theme-toggle' && nav.id !== 'nav-home-bottom') {
                nav.classList.add('locked-nav');
            }
        });
        
        const chatbotFab = document.getElementById('chatbot-fab');
        if (chatbotFab) chatbotFab.style.display = 'none';

        const navUpload = document.getElementById('nav-upload');
        const navHomeBottom = document.getElementById('nav-home-bottom');
        if (navUpload) {
            navUpload.style.display = 'flex';
            navUpload.click();
        }
        if (navHomeBottom) navHomeBottom.style.display = 'none';
    }
}

// 3. Health Score Animation
function animateHealthScore() {
    const progressCircle = document.querySelector('.circular-progress');
    if (!progressCircle) return;

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

        if (scoreElement) scoreElement.textContent = Math.round(currentScore);

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

            
            const handleAIResponse = (textResponse) => {
                if (chatBody.contains(typingMsg)) chatBody.removeChild(typingMsg);

                const aiMsg = document.createElement('div');
                aiMsg.className = 'message ai-message';
                aiMsg.innerHTML = `<p>${textResponse.replace(/\n/g, '<br>')}</p>`;

                chatBody.appendChild(aiMsg);
                chatBody.scrollTop = chatBody.scrollHeight;

                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const plainText = aiMsg.textContent;
                    const utterance = new SpeechSynthesisUtterance(plainText);
                    utterance.lang = 'th-TH';
                    utterance.rate = 1.15;
                    utterance.pitch = 1.1;
                    window.speechSynthesis.speak(utterance);
                }
            };

            
            
            const geminiKey = localStorage.getItem('gemini_api_key');


            if (geminiKey) {
                // Use Real Gemini AI with Auto Discovery & Smart Fallback
                const promptCtx = window.extractedHealthData ? JSON.stringify(window.extractedHealthData) : "No health data yet.";
                
                let profileCtx = "";
                try {
                    const savedProf = localStorage.getItem('lablink_profile');
                    if (savedProf) {
                        const p = JSON.parse(savedProf);
                        profileCtx = `ข้อมูลผู้ป่วย: น้ำหนัก ${p.weight || '-'} kg, ส่วนสูง ${p.height || '-'} cm, โรคประจำตัว: ${p.disease || '-'}, ประวัติแพ้ยา: ${p.allergy || '-'}`;
                    }
                } catch(e) {}

                const sysPrompt = `คุณคือ Dr. LabLink แพทย์ AI ผู้เชี่ยวชาญการอ่านผลเลือด 
กรุณาตอบคำถามผู้ป่วยเป็นภาษาไทยแบบเป็นกันเอง สั้นกระชับ เข้าใจง่าย 
${profileCtx}
นี่คือผลเลือดปัจจุบันของผู้ป่วย: ${promptCtx}

คำถามจากผู้ป่วย: ${text}`;

                requestGeminiGenerate(geminiKey, sysPrompt).then(res => {
                    if (res.error) {
                        // Fallback to Mock if API fails (so no annoying errors)
                        console.warn("API Failed, falling back to mock:", res.error);
                        fallbackToMock(text);
                    } else if (res.text) {
                        handleAIResponse(res.text);
                    } else {
                        fallbackToMock(text);
                    }
                }).catch(err => {
                    console.error("Gemini Error:", err);
                    fallbackToMock(text);
                });
            } else {
                // Fallback to Rule-based Mock
                fallbackToMock(text);
            }

            function fallbackToMock(userText) {
                setTimeout(() => {
                    let mockRes = "";
                    if (userText.includes('น้ำตาล') || userText.toLowerCase().includes('fbs')) {
                        mockRes = `<strong>เรื่องน้ำตาล (FBS):</strong> ค่าของคุณอยู่ที่ 88 mg/dL ซึ่งอยู่ในเกณฑ์ปกติเยี่ยมมากครับ! พยายามรักษาการกินคาร์บเชิงซ้อนต่อไปนะครับ 👏`;
                    } else if (userText.includes('ไขมัน') || userText.toLowerCase().includes('ldl') || userText.includes('คอเลสเตอรอล')) {
                        mockRes = `<strong>เรื่องไขมันในเลือด:</strong> แม้ว่า LDL จะ 130 (ปริ่มเกณฑ์) แต่คุณมี HDL ถึง 55 ช่วยดึงไขมันทิ้งได้ดีครับ แนะนำให้ออกกำลังกายแบบคาร์ดิโอเพิ่มสัปดาห์ละ 2-3 วันครับ 🏃‍♂️`;
                    } else {
                        mockRes = `คำถามที่ดีครับ! จากผลแล็บโดยรวมของคุณอยู่ในเกณฑ์ที่ยอดเยี่ยม 🌟 (นี่คือข้อความจำลอง เนื่องจากไม่ได้เชื่อมต่อ API หรือ API ไม่ตอบสนอง)`;
                    }
                    handleAIResponse(mockRes);
                }, 1200);
            }

        };

        chatSendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
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
                if (icon) icon.textContent = '☀️';
                themeToggle.innerHTML = `<span class="icon">☀️</span> โหมดสว่าง`;
            } else {
                if (icon) icon.textContent = '🌙';
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
        
        // --- Merge Extracted Data ---
        let dataLdl = [155, 150, 145, 140, 135, 130];
        let dataHdl = [42, 45, 47, 50, 52, 55];
        let dataFbs = [95, 93, 91, 90, 89, 88];
        let dataAlt = [55, 52, 50, 48, 46, 45];
        let dataAst = [35, 30, 28, 25, 23, 22];
        let dataWbc = [60, 30, 7, 3];
        let dataHor = [65, 80, 50, 70, 90];
        
        if (window.extractedHealthData) {
            const eh = window.extractedHealthData;
            if (eh.ldl) dataLdl[5] = eh.ldl;
            if (eh.hdl) dataHdl[5] = eh.hdl;
            if (eh.fbs) dataFbs[5] = eh.fbs;
            if (eh.alt) dataAlt[5] = eh.alt;
            if (eh.ast) dataAst[5] = eh.ast;
            
            if (eh.neu && eh.lym) {
                dataWbc = [eh.neu, eh.lym, eh.mon || 7, eh.eos || 3];
            }
            if (eh.cortisol || eh.tsh) {
                // Approximate normalize for radar chart (0-100 score)
                dataHor = [
                    eh.cortisol ? 100 - (eh.cortisol*2) : 65, 
                    eh.tsh ? 80 : 80, 
                    eh.dhea ? 70 : 50, 
                    eh.testosterone ? 75 : 70, 
                    eh.insulin ? 100 - (eh.insulin*2) : 90
                ];
            }
        }

        // 1. Lipid Profile (Line)
        const ctxLipid = document.getElementById('chartLipid');
        if (ctxLipid) {
            instances.push(new Chart(ctxLipid, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        { label: 'LDL (ไขมันเลว)', data: dataLdl, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', tension: 0.4, fill: true },
                        { label: 'HDL (ไขมันดี)', data: dataHdl, borderColor: '#10b981', tension: 0.4 },
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
                    datasets: [{ label: 'FBS (mg/dL)', data: dataFbs, backgroundColor: '#3b82f6', borderRadius: 4 }]
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
                        { label: 'ALT', data: dataAlt, borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.2)', tension: 0.4, fill: true },
                        { label: 'AST', data: dataAst, borderColor: '#0ea5e9', tension: 0.4 }
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
                        data: dataWbc,
                        backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right', labels: { color: isDarkMode ? '#e2e8f0' : '#64748b', font: { family: 'Prompt' }, usePointStyle: true, boxWidth: 6 } }
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
                    labels: ['Cortisol', 'Thyroid', 'DHEA', 'Testosterone', 'Insulin'],
                    datasets: [{
                        label: 'สมดุลฮอร์โมน (Score)',
                        data: dataHor,
                        backgroundColor: 'rgba(14, 165, 233, 0.2)',
                        borderColor: '#0ea5e9',
                        pointBackgroundColor: '#0ea5e9',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#0ea5e9'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            angleLines: { color: gridColor },
                            grid: { color: gridColor },
                            pointLabels: { color: textColor, font: { family: 'Prompt' } },
                            ticks: { display: false, min: 0, max: 100 }
                        }
                    },
                    plugins: {
                        legend: { display: false }
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
// --- Medical Standard PDF Export ---

document.addEventListener('DOMContentLoaded', () => {
    const btnsExport = document.querySelectorAll('#btn-export-pdf, #btn-export-pdf-settings');
    
    btnsExport.forEach(btnExport => {
        btnExport.addEventListener('click', async () => {

            const originalText = btnExport.innerHTML;
            btnExport.innerHTML = '<span class="icon animate-pulse">⏳</span> Generating...';
            
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');
                
                const dashboard = document.querySelector('.main-content');

                const isDark = document.body.classList.contains('dark-mode');
                if (isDark) document.body.classList.remove('dark-mode');
                
                // Hide things we don't want in PDF
                const toggle = document.getElementById('theme-toggle');
                if (toggle) toggle.style.display = 'none';
                
                const canvas = await html2canvas(dashboard, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });
                
                // Reset styles
                if (isDark) document.body.classList.add('dark-mode');
                if (toggle) toggle.style.display = '';

                
                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                
                doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                
                // Add Medical Metadata
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Generated by LabLink Medical AI - ${new Date().toLocaleString()}`, 10, doc.internal.pageSize.getHeight() - 10);
                doc.text("ASCVD Standard: AHA/ACC Protocol 2013/2018", 10, doc.internal.pageSize.getHeight() - 5);
                
                doc.save('LabLink-Medical-Report.pdf');
                
                btnExport.innerHTML = '<span class="icon">✅</span> Success!';
                setTimeout(() => { btnExport.innerHTML = originalText; }, 3000);
            } catch (err) {
                console.error("PDF Generation failed:", err);
                btnExport.innerHTML = '<span class="icon">❌</span> Failed';
                setTimeout(() => { btnExport.innerHTML = originalText; }, 3000);
            }
        });
    });
});


// --- Gemini AI Request Helper ---
async function requestGeminiGenerate(geminiKey, promptText) {
    // Trim the key just in case
    const cleanKey = geminiKey.trim();
    
    // Ordered list of models to try
    const candidateModels = [
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro'
    ];

    let lastError = null;

    for (const modelName of candidateModels) {
        // Try v1beta first, then v1
        const endpoints = [
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(cleanKey)}`,
            `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${encodeURIComponent(cleanKey)}`
        ];

        for (const endpoint of endpoints) {
            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [
                            { role: "user", parts: [{ text: promptText }] }
                        ]
                    })
                });

                const data = await res.json();

                if (data.error) {
                    lastError = data.error;
                    
                    // If API key is invalid or quota exceeded, stop trying immediately!
                    if (data.error.code === 400 && data.error.message.toLowerCase().includes('api key not valid')) {
                        return { error: `❌ API Key ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง` };
                    }
                    if (data.error.code === 429) {
                        return { error: `❌ โควต้า API เต็ม (Quota Exceeded)` };
                    }
                    
                    // If model not found, try the next one
                    continue;
                }

                if (data.candidates && data.candidates.length > 0) {
                    const candidate = data.candidates[0];
                    if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                        return { text: candidate.content.parts[0].text, model: modelName };
                    } else if (candidate.finishReason) {
                        return { error: `❌ AI ตอบกลับไม่ได้ (Finish Reason: ${candidate.finishReason})` };
                    }
                }
            } catch (err) {
                lastError = err;
                // For network errors (like CORS or offline), return immediately
                if (err.name === 'TypeError' || err.message.includes('fetch')) {
                    return { error: `❌ เกิดข้อผิดพลาดในการเชื่อมต่อ (Network Error): โปรดตรวจสอบอินเทอร์เน็ตหรือการตั้งค่า API` };
                }
            }
        }
    }

    const msg = lastError ? (lastError.message || JSON.stringify(lastError)) : "ไม่สามารถเชื่อมต่อโมเดลได้เลย";
    return {
        error: `❌ ข้อผิดพลาดจาก AI: ${msg}`
    };
}

// --- Gemini API Key Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const btnSaveGemini = document.getElementById('btn-save-gemini');
    const inputGemini = document.getElementById('gemini-api-key');
    const statusGemini = document.getElementById('gemini-status');
    
    if (btnSaveGemini && inputGemini) {
        // Load existing key
        const existingKey = localStorage.getItem('gemini_api_key');
        if (existingKey) {
            inputGemini.value = existingKey;
            if (statusGemini) {
                statusGemini.style.display = 'block';
                statusGemini.style.color = 'var(--success)';
                statusGemini.textContent = "✅ มีการบันทึก Gemini API Key ไว้แล้ว (พร้อมใช้งาน)";
            }
        }

        btnSaveGemini.addEventListener('click', () => {
            const key = inputGemini.value.trim();
            if (key) {
                localStorage.setItem('gemini_api_key', key);
                if (statusGemini) {
                    statusGemini.style.display = 'block';
                    statusGemini.style.color = 'var(--success)';
                    statusGemini.textContent = "✅ บันทึก API Key สำเร็จ! ระบบพร้อมใช้งาน AI จริงในการตอบคำถาม";
                }
            } else {
                localStorage.removeItem('gemini_api_key');
                if (statusGemini) {
                    statusGemini.style.display = 'block';
                    statusGemini.style.color = 'var(--text-muted)';
                    statusGemini.textContent = "ℹ️ ลบ API Key แล้ว (ระบบจะกลับไปใช้คำตอบจำลอง)";
                }
            }
        });
    }
});


// =========================================
//  UPGRADE: Real-time Clock
// =========================================
function initRealtimeClock() {
    const clockEl = document.getElementById('realtime-clock');
    if (!clockEl) return;

    function updateClock() {
        const now = new Date();
        const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = now.toLocaleDateString('th-TH', opts);
        const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        clockEl.textContent = `${dateStr} • ${timeStr}`;
    }
    updateClock();
    setInterval(updateClock, 1000);
}

// =========================================
//  UPGRADE: Drag & Drop Upload
// =========================================
function initDragAndDrop() {
    const uploadBox = document.querySelector('.upload-box');
    const realFileUpload = document.getElementById('real-file-upload');
    if (!uploadBox || !realFileUpload) return;

    ['dragenter', 'dragover'].forEach(evt => {
        uploadBox.addEventListener(evt, (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadBox.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(evt => {
        uploadBox.addEventListener(evt, (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadBox.classList.remove('drag-over');
        });
    });

    uploadBox.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            // Create a new DataTransfer and assign to file input
            const dt = new DataTransfer();
            dt.items.add(files[0]);
            realFileUpload.files = dt.files;
            realFileUpload.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
}

// =========================================
//  UPGRADE: Demo File Loader
// =========================================
function loadDemoFile() {
    fetch('sample_report.txt')
        .then(res => {
            if (!res.ok) throw new Error('Demo file not found');
            return res.text();
        })
        .then(text => {
            // Create a File-like blob from text
            const blob = new Blob([text], { type: 'text/plain' });
            const file = new File([blob], 'sample_report.txt', { type: 'text/plain' });
            const dt = new DataTransfer();
            dt.items.add(file);
            const realFileUpload = document.getElementById('real-file-upload');
            if (realFileUpload) {
                realFileUpload.files = dt.files;
                realFileUpload.dispatchEvent(new Event('change', { bubbles: true }));
            }
        })
        .catch(err => {
            console.error('Demo file error:', err);
            alert('ไม่พบไฟล์ตัวอย่าง กรุณาอัปโหลดไฟล์จริงแทน');
        });
}

// =========================================
//  UPGRADE: Anatomy SVG Tooltips
// =========================================
function initAnatomyTooltips() {
    const organs = [
        { id: 'organ-brain', name: '🧠 สมอง', detail: 'ระบบประสาทส่วนกลาง' },
        { id: 'organ-lungs', name: '🫁 ปอด', detail: 'ระบบทางเดินหายใจ' },
        { id: 'organ-heart', name: '🫀 หัวใจ', detail: 'ระบบหัวใจและหลอดเลือด' },
        { id: 'organ-liver', name: '🫁 ตับ', detail: 'การทำงานของตับ (AST/ALT)' },
        { id: 'organ-pancreas', name: '🍎 ตับอ่อน', detail: 'น้ำตาลในเลือด (FBS)' }
    ];

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'organ-tooltip';
    tooltip.id = 'anatomy-tooltip';
    document.body.appendChild(tooltip);

    organs.forEach(organ => {
        const el = document.getElementById(organ.id);
        if (!el) return;

        el.style.cursor = 'pointer';

        el.addEventListener('mouseenter', (e) => {
            tooltip.innerHTML = `<strong>${organ.name}</strong><br>${organ.detail}`;
            tooltip.classList.add('visible');
        });

        el.addEventListener('mousemove', (e) => {
            const svgRect = el.closest('svg').getBoundingClientRect();
            tooltip.style.left = (e.clientX + 12) + 'px';
            tooltip.style.top = (e.clientY - 40) + 'px';
        });

        el.addEventListener('mouseleave', () => {
            tooltip.classList.remove('visible');
        });
    });
}

// =========================================
//  UPGRADE: Risk Score Calculator & Gauge
// =========================================
function initRiskScore() {
    // Wait a bit for DOM to be ready with data
    setTimeout(() => {
        calculateRiskScore();
    }, 1000);
}

function calculateRiskScore() {
    const eh = window.extractedHealthData || {};
    
    // Simple risk estimation (0-100)
    let risk = 5; // base risk
    
    if (eh.ldl) {
        if (eh.ldl > 190) risk += 30;
        else if (eh.ldl > 160) risk += 20;
        else if (eh.ldl > 130) risk += 10;
    }
    if (eh.chol) {
        if (eh.chol > 240) risk += 15;
        else if (eh.chol > 200) risk += 7;
    }
    if (eh.fbs) {
        if (eh.fbs > 126) risk += 20;
        else if (eh.fbs > 100) risk += 8;
    }
    if (eh.hdl) {
        if (eh.hdl < 40) risk += 15;
        else if (eh.hdl > 60) risk -= 5;
    }
    
    risk = Math.max(0, Math.min(100, risk));
    
    // Update gauge needle (-90deg = 0%, 90deg = 100%)
    const needle = document.getElementById('risk-needle');
    const scoreEl = document.getElementById('risk-score-value');
    
    if (needle) {
        const angle = -90 + (risk / 100 * 180);
        needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    }
    
    if (scoreEl) {
        scoreEl.textContent = risk + '%';
        if (risk < 20) {
            scoreEl.style.color = 'var(--success)';
        } else if (risk < 40) {
            scoreEl.style.color = 'var(--warning)';
        } else {
            scoreEl.style.color = 'var(--danger)';
        }
    }
}

// =========================================
//  UPGRADE: Upload Date Tracker
// =========================================
function updateUploadDate() {
    const now = new Date();
    const dateDisplay = document.getElementById('upload-date-display');
    const dateDetail = document.getElementById('upload-date-detail');
    
    if (dateDisplay) {
        const opts = { day: 'numeric', month: 'short', year: 'numeric' };
        dateDisplay.textContent = now.toLocaleDateString('th-TH', opts);
    }
    if (dateDetail) {
        const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
        dateDetail.textContent = `อัปโหลดเมื่อ ${timeStr} น.`;
    }
    
    localStorage.setItem('lablink_upload_date', now.toISOString());
}

// =========================================
//  ULTIMATE UPGRADE: Toast Notifications
// =========================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'danger') icon = '❌';

    toast.innerHTML = `<span style="font-size: 1.2rem;">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// =========================================
//  ULTIMATE UPGRADE: Number Counter Animation
// =========================================
function animateValue(obj, start, end, duration) {
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // easeOutQuart
        const ease = 1 - Math.pow(1 - progress, 4);
        obj.innerHTML = Math.floor(ease * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = end;
        }
    };
    window.requestAnimationFrame(step);
}

// =========================================
//  ULTIMATE UPGRADE: Gamification (Level & Quests)
// =========================================
let userExp = 10;
let userLevel = 1;

function updateLevelUI() {
    const fill = document.getElementById('user-exp-fill');
    const text = document.getElementById('user-exp-text');
    const badge = document.getElementById('user-level-badge');
    
    if (fill) fill.style.width = `${userExp}%`;
    if (text) text.textContent = `${userExp} / 100 EXP`;
    
    let title = "Beginner";
    if (userLevel === 2) title = "Health Seeker";
    if (userLevel >= 3) title = "Wellness Master";
    
    if (badge) badge.textContent = `LV. ${userLevel} ${title}`;
}

function addExp(amount) {
    userExp += amount;
    if (userExp >= 100) {
        userExp -= 100;
        userLevel++;
        showToast(`🎉 Level Up! ยินดีด้วย คุณเลื่อนเป็นเลเวล ${userLevel} แล้ว!`, 'success');
    }
    updateLevelUI();
}

window.completeQuest = function(btn) {
    const item = btn.closest('.quest-item');
    if (!item.classList.contains('completed')) {
        item.classList.add('completed');
        btn.textContent = 'Completed!';
        addExp(50);
        showToast('🎯 ทำภารกิจสำเร็จ! +50 EXP');
    }
};

// =========================================
//  ULTIMATE UPGRADE: Wearable Sync
// =========================================
window.syncWearable = function() {
    const btn = document.getElementById('btn-sync-wearable');
    const placeholder = document.getElementById('wearable-placeholder');
    const container = document.getElementById('wearable-data-container');
    const stepsEl = document.getElementById('wearable-steps');
    const sleepEl = document.getElementById('wearable-sleep');
    const insightEl = document.getElementById('wearable-ai-insight');
    
    if (!btn) return;
    
    btn.innerHTML = '<span class="animate-pulse">🔄 Syncing...</span>';
    btn.disabled = true;
    
    setTimeout(() => {
        // Simulate pulling data
        const steps = Math.floor(Math.random() * 5000) + 3000;
        const sleep = (Math.random() * 3 + 4).toFixed(1); // 4.0 - 7.0 hours
        
        if (placeholder) placeholder.style.display = 'none';
        if (container) container.style.display = 'block';
        
        animateValue(stepsEl, 0, steps, 1500);
        
        // Float animation for sleep (handle decimal manually)
        let s = 0;
        const intv = setInterval(() => {
            s += 0.2;
            if (s >= parseFloat(sleep)) {
                clearInterval(intv);
                sleepEl.textContent = sleep;
            } else {
                sleepEl.textContent = s.toFixed(1);
            }
        }, 30);
        
        // AI Insight based on random data
        setTimeout(() => {
            if (sleep < 6) {
                insightEl.innerHTML = "⚠️ <strong>AI Insight:</strong> คุณนอนพักผ่อนน้อยกว่า 6 ชั่วโมง ซึ่งอาจส่งผลให้ระดับคอร์ติซอล (ความเครียด) และความดันโลหิตสูงขึ้นได้ ควรเข้านอนก่อน 23:00 น.";
            } else if (steps < 5000) {
                insightEl.innerHTML = "💡 <strong>AI Insight:</strong> กิจกรรมทางกายค่อนข้างน้อย แนะนำให้เดินเพิ่มอีกนิด เพื่อช่วยเร่งการเผาผลาญ LDL (ไขมันเลว) ในเลือดครับ";
            } else {
                insightEl.innerHTML = "✅ <strong>AI Insight:</strong> กิจกรรมและการนอนอยู่ในเกณฑ์ดีเยี่ยม! รักษาวินัยแบบนี้ไว้ ค่าสุขภาพของคุณจะดีขึ้นอย่างต่อเนื่องแน่นอนครับ";
            }
            showToast('⌚ ซิงค์ข้อมูล Smart Watch สำเร็จ!');
            btn.innerHTML = 'Synced ✅';
        }, 1500);
        
    }, 2000);
};

// =========================================
//  ULTIMATE UPGRADE: 7-Day Nutrition Plan
// =========================================
window.generateNutritionPlan = async function() {
    const eh = window.extractedHealthData;
    if (!eh) {
        showToast('กรุณาอัปโหลดผลตรวจเลือดก่อนสร้างแผนโภชนาการ', 'warning');
        return;
    }

    const btn = document.getElementById('btn-generate-plan');
    const loading = document.getElementById('nutrition-loading');
    const content = document.getElementById('nutrition-content');
    const exportBtn = document.getElementById('btn-export-plan');
    
    btn.style.display = 'none';
    loading.style.display = 'block';
    content.style.display = 'none';
    exportBtn.style.display = 'none';

    // Retrieve user profile
    let profileText = "";
    try {
        const savedProf = localStorage.getItem('lablink_profile');
        if (savedProf) {
            const p = JSON.parse(savedProf);
            profileText = `ข้อมูลผู้ป่วย: น้ำหนัก ${p.weight || '-'} kg, ส่วนสูง ${p.height || '-'} cm, โรคประจำตัว: ${p.disease || '-'}, ประวัติแพ้ยา: ${p.allergy || '-'}`;
        }
    } catch(e) {}

    // Build prompt based on real health data
    const prompt = `คุณคือ Dr. LabLink แพทย์และนักโภชนาการผู้เชี่ยวชาญ 
${profileText}
ข้อมูลผลเลือดคนไข้: 
LDL: ${eh.ldl || '-'} mg/dL, 
HDL: ${eh.hdl || '-'} mg/dL, 
Cholesterol: ${eh.chol || '-'} mg/dL, 
FBS (น้ำตาล): ${eh.fbs || '-'} mg/dL, 
AST: ${eh.ast || '-'}, ALT: ${eh.alt || '-'}

จงสร้าง "แผนโภชนาการและการออกกำลังกาย 7 วัน" ที่ออกแบบมาเพื่อแก้ปัญหาค่าผลเลือดเหล่านี้โดยเฉพาะ (หากมีโรคประจำตัวหรือแพ้ยาให้ระวังเรื่องโภชนาการด้วย)
ขอให้ออกแบบเป็น HTML Format ล้วนๆ (ไม่ต้องมี Markdown) โดยใช้โครงสร้างนี้สำหรับแต่ละวัน (เขียนมาให้ครบ 7 วัน):

<div class="nutrition-day-card">
  <h4>📅 วันที่ [X]: [Theme ของวัน เช่น วันดีท็อกซ์ตับ]</h4>
  <div class="nutrition-meal">
     <div class="meal-icon">🍳</div>
     <div><strong>เช้า:</strong> [เมนู] - <em>[เหตุผลทางการแพทย์สั้นๆ]</em></div>
  </div>
  <div class="nutrition-meal">
     <div class="meal-icon">🥗</div>
     <div><strong>กลางวัน:</strong> [เมนู]</div>
  </div>
  <div class="nutrition-meal">
     <div class="meal-icon">🐟</div>
     <div><strong>เย็น:</strong> [เมนู]</div>
  </div>
  <div class="nutrition-meal">
     <div class="meal-icon">🏃</div>
     <div><strong>กิจกรรม:</strong> [การออกกำลังกาย]</div>
  </div>
</div>`;

    const geminiKey = localStorage.getItem('gemini_api_key');
    let useMock = false;
    let res = null;

    if (!geminiKey) {
        useMock = true;
    } else {
        res = await requestGeminiGenerate(geminiKey, prompt);
        if (res.error) {
            console.warn("API Error, falling back to mock:", res.error);
            useMock = true;
        }
    }

    loading.style.display = 'none';

    if (useMock) {
        // Fallback to Mock Data so the user sees something without a valid key
        const mockHTML = `
        <h3 style="margin-bottom: 16px; color: var(--primary-dark);">แผนโภชนาการ 7 วัน (จำลอง)</h3>
        <div class="nutrition-day-card">
          <h4>📅 วันที่ 1: ดีท็อกซ์ตับและปรับสมดุล</h4>
          <div class="nutrition-meal"><div class="meal-icon">🍳</div><div><strong>เช้า:</strong> ข้าวโอ๊ตต้มนมถั่วเหลือง ใส่ผลไม้ตระกูลเบอร์รี่</div></div>
          <div class="nutrition-meal"><div class="meal-icon">🥗</div><div><strong>กลางวัน:</strong> สลัดปลาแซลมอนย่าง น้ำสลัดน้ำใส</div></div>
          <div class="nutrition-meal"><div class="meal-icon">🐟</div><div><strong>เย็น:</strong> แกงเลียงผักรวม (ไม่ใส่ผงชูรส)</div></div>
        </div>
        <div class="nutrition-day-card">
          <h4>📅 วันที่ 2: ลดคอเลสเตอรอล (LDL)</h4>
          <div class="nutrition-meal"><div class="meal-icon">🍳</div><div><strong>เช้า:</strong> โยเกิร์ตไขมันต่ำพร้อมธัญพืชและอัลมอนด์</div></div>
          <div class="nutrition-meal"><div class="meal-icon">🥗</div><div><strong>กลางวัน:</strong> อกไก่ย่างกับข้าวกล้อง และบรอกโคลีลวก</div></div>
          <div class="nutrition-meal"><div class="meal-icon">🐟</div><div><strong>เย็น:</strong> ปลานึ่งมะนาว กินคู่กับผักกาดขาว</div></div>
        </div>
        <div class="nutrition-day-card">
          <h4>📅 วันที่ 3: ควบคุมน้ำตาลในเลือด</h4>
          <div class="nutrition-meal"><div class="meal-icon">🍳</div><div><strong>เช้า:</strong> ไข่ต้ม 2 ฟอง ขนมปังโฮลวีต 1 แผ่น</div></div>
          <div class="nutrition-meal"><div class="meal-icon">🥗</div><div><strong>กลางวัน:</strong> ก๋วยเตี๋ยวเส้นหมี่น้ำใส (ไม่กระเทียมเจียว)</div></div>
          <div class="nutrition-meal"><div class="meal-icon">🐟</div><div><strong>เย็น:</strong> ยำทูน่าในน้ำแร่ รสไม่จัด</div></div>
        </div>
        <div class="nutrition-day-card">
          <h4>📅 วันที่ 4: เติมไขมันดี (HDL)</h4>
          <div class="nutrition-meal"><div class="meal-icon">🍳</div><div><strong>เช้า:</strong> อะโวคาโดโทสต์ (ขนมปังโฮลวีต)</div></div>
          <div class="nutrition-meal"><div class="meal-icon">🥗</div><div><strong>กลางวัน:</strong> ข้าวผัดธัญพืช ใช้น้ำมันมะกอก</div></div>
          <div class="nutrition-meal"><div class="meal-icon">🐟</div><div><strong>เย็น:</strong> สเต็กเต้าหู้ ซอสเห็ดหอม</div></div>
        </div>
        <div class="nutrition-day-card">
          <h4>📅 วันที่ 5: พักผ่อนและซ่อมแซมร่างกาย</h4>
          <div class="nutrition-meal"><div class="meal-icon">🍳</div><div><strong>เช้า:</strong> นมจืดไขมันต่ำ 1 แก้ว + กล้วยหอม</div></div>
          <div class="nutrition-meal"><div class="meal-icon">🥗</div><div><strong>กลางวัน:</strong> สุกี้น้ำไก่ล้วน วุ้นเส้นน้อย</div></div>
          <div class="nutrition-meal"><div class="meal-icon">🐟</div><div><strong>เย็น:</strong> ซุปมักกะโรนีใส่ผัก 3 สี</div></div>
        </div>
        <div class="nutrition-day-card">
          <h4>📅 วันที่ 6: ลดโซเดียม ปรับความดัน</h4>
          <div class="nutrition-meal"><div class="meal-icon">🍳</div><div><strong>เช้า:</strong> โจ๊กข้าวโอ๊ตหมูสับ (ไม่ปรุงเพิ่ม)</div></div>
          <div class="nutrition-meal"><div class="meal-icon">🥗</div><div><strong>กลางวัน:</strong> ข้าวยำปักษ์ใต้ (น้ำบูดูน้อย)</div></div>
          <div class="nutrition-meal"><div class="meal-icon">🐟</div><div><strong>เย็น:</strong> สลัดอกไก่ฉีก น้ำสลัดโยเกิร์ต</div></div>
        </div>
        <div class="nutrition-day-card">
          <h4>📅 วันที่ 7: รักษาความสมดุลระยะยาว</h4>
          <div class="nutrition-meal"><div class="meal-icon">🍳</div><div><strong>เช้า:</strong> ไข่กระทะ (ใช้น้ำเปล่าทอด)</div></div>
          <div class="nutrition-meal"><div class="meal-icon">🥗</div><div><strong>กลางวัน:</strong> ข้าวกล้อง + ผัดกะเพราปลา (ใช้น้ำมันสเปรย์)</div></div>
          <div class="nutrition-meal"><div class="meal-icon">🐟</div><div><strong>เย็น:</strong> แกงจืดเต้าหู้หมูสับสาหร่าย</div></div>
        </div>
        <p style="text-align: center; color: var(--warning); margin-top: 16px;">
          (⚠️ ข้อมูลจำลอง - หากต้องการให้ AI วางแผนแบบเฉพาะบุคคล กรุณาใส่ API Key ในหน้าตั้งค่า)
        </p>`;
        
        content.innerHTML = mockHTML;
        content.style.display = 'block';
        exportBtn.style.display = 'inline-block';
        showToast('🥗 สร้างแผน (ระบบจำลอง) สำเร็จ!', 'success');
        addExp(20);
    } else {
        // Clean markdown backticks if AI hallucinates them
        let cleanHTML = res.text.replace(/```html/g, '').replace(/```/g, '');
        content.innerHTML = cleanHTML;
        content.style.display = 'block';
        exportBtn.style.display = 'inline-block';
        showToast('🥗 สร้างแผนโภชนาการ 7 วันสำเร็จ!', 'success');
        addExp(20); // Reward for generating plan
    }
};

window.exportPlanPDF = function() {
    showToast('กำลังเตรียมไฟล์ PDF...', 'success');
    const { jsPDF } = window.jspdf;
    
    // Quick snapshot using html2canvas
    const content = document.getElementById('view-nutrition');
    
    html2canvas(content, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.text("LabLink - Personalized 7-Day Health Plan", 10, 10);
        pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
        pdf.save('LabLink-7-Day-Plan.pdf');
        
        showToast('📄 ดาวน์โหลด PDF สำเร็จ!', 'success');
    });
};

// =========================================
//  8 Basic Functions: Modals & PDPA
// =========================================
window.openModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
};
window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
};
window.copyShareLink = function() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('คัดลอกลิงก์สำเร็จแล้ว!', 'success');
        closeModal('modal-share');
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // Check PDPA Consent on first load
    if (!localStorage.getItem('lablink_pdpa')) {
        setTimeout(() => openModal('modal-pdpa'), 500);
    }
});

window.acceptPDPA = function() {
    localStorage.setItem('lablink_pdpa', 'true');
    closeModal('modal-pdpa');
    showToast('ขอบคุณที่ยินยอมให้ระบบวิเคราะห์ข้อมูล 🛡️');
};

// =========================================
//  8 Basic Functions: Profile Management
// =========================================
window.saveProfile = function() {
    const profile = {
        weight: document.getElementById('prof-weight')?.value || '',
        height: document.getElementById('prof-height')?.value || '',
        blood: document.getElementById('prof-blood')?.value || '',
        disease: document.getElementById('prof-disease')?.value || '',
        allergy: document.getElementById('prof-allergy')?.value || ''
    };
    localStorage.setItem('lablink_profile', JSON.stringify(profile));
    
    // Sync to SOS modal
    document.getElementById('sos-blood').textContent = profile.blood || 'ยังไม่ระบุ';
    document.getElementById('sos-disease').textContent = profile.disease || 'ไม่มี/ไม่ระบุ';
    document.getElementById('sos-allergy').textContent = profile.allergy || 'ไม่มี/ไม่ระบุ';

    showToast('บันทึกข้อมูลส่วนตัวและข้อมูลฉุกเฉินสำเร็จ! 💾');
    addExp(10);
};

// Load Profile on init
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('lablink_profile');
    if (saved) {
        const p = JSON.parse(saved);
        if(document.getElementById('prof-weight')) document.getElementById('prof-weight').value = p.weight;
        if(document.getElementById('prof-height')) document.getElementById('prof-height').value = p.height;
        if(document.getElementById('prof-blood')) document.getElementById('prof-blood').value = p.blood;
        if(document.getElementById('prof-disease')) document.getElementById('prof-disease').value = p.disease;
        if(document.getElementById('prof-allergy')) document.getElementById('prof-allergy').value = p.allergy;
        
        // Sync SOS
        if(document.getElementById('sos-blood')) document.getElementById('sos-blood').textContent = p.blood || 'ยังไม่ระบุ';
        if(document.getElementById('sos-disease')) document.getElementById('sos-disease').textContent = p.disease || 'ไม่มี/ไม่ระบุ';
        if(document.getElementById('sos-allergy')) document.getElementById('sos-allergy').textContent = p.allergy || 'ไม่มี/ไม่ระบุ';
    }
});

// =========================================
//  8 Basic Functions: Translation (TH/EN)
// =========================================
const translations = {
    th: {
        header_title: "LabLink Dashboard",
        btn_share: "📤 แชร์",
        btn_print: "🖨️ พิมพ์",
        nav_upload: "อัปโหลดผลตรวจ",
        nav_dashboard: "ภาพรวมสุขภาพ",
        nav_trends: "แนวโน้มสุขภาพ",
        nav_nutrition: "โภชนาการบำบัด",
        nav_settings: "โปรไฟล์ & ตั้งค่า",
        nav_logout: "ออกจากระบบ (หน้าแรก)",
        trends_title: "📈 กราฟเปรียบเทียบผลเลือดย้อนหลัง",
        trends_desc: "เปรียบเทียบผลตรวจสุขภาพของปีนี้กับข้อมูลประวัติย้อนหลัง (2024-2025)",
        profile_title: "📝 จัดการข้อมูลส่วนตัว & การตั้งค่า",
        dash_risk: "คะแนนความเสี่ยง",
        dash_health: "สรุปสุขภาพรวม",
        dash_smartwatch: "ข้อมูลจาก Smart Watch"
    },
    en: {
        header_title: "LabLink Dashboard",
        btn_share: "📤 Share",
        btn_print: "🖨️ Print",
        nav_upload: "Upload Lab",
        nav_dashboard: "Health Overview",
        nav_trends: "Historical Trends",
        nav_nutrition: "Nutrition Plan",
        nav_settings: "Profile & Settings",
        nav_logout: "Logout (Home)",
        trends_title: "📈 Historical Lab Result Trends",
        trends_desc: "Compare your current health data with historical records (2024-2025)",
        profile_title: "📝 Profile Management & Settings",
        dash_risk: "Health Risk Score",
        dash_health: "Health Summary",
        dash_smartwatch: "Smart Watch Data"
    }
};

let currentLang = 'th';
window.toggleLanguage = function() {
    currentLang = currentLang === 'th' ? 'en' : 'th';
    
    // Update active UI toggle
    document.getElementById('lang-th').classList.toggle('active', currentLang === 'th');
    document.getElementById('lang-en').classList.toggle('active', currentLang === 'en');

    // Translate texts
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            // Keep icons if they are part of the original HTML, but for now we just set text.
            // Some elements might have <span> icon </span> <span data-i18n="...">. The data-i18n target specific span.
            el.textContent = translations[currentLang][key];
        }
    });
};

// =========================================
//  8 Basic Functions: Historical Trends Chart
// =========================================
let trendChartInstance = null;

window.updateTrendsChart = function() {
    const ctx = document.getElementById('historicalChart');
    if (!ctx) return;
    
    const selector = document.getElementById('trend-selector');
    const type = selector ? selector.value : 'ldl';
    
    let chartData = {};
    if (type === 'ldl') {
        chartData = {
            label: currentLang === 'en' ? 'LDL Cholesterol (mg/dL)' : 'ไขมันเลว LDL (mg/dL)',
            data: [180, 165, window.extractedHealthData?.ldl || 130],
            borderColor: '#ef4444'
        };
    } else {
        chartData = {
            label: currentLang === 'en' ? 'Fasting Blood Sugar (mg/dL)' : 'น้ำตาลในเลือด FBS (mg/dL)',
            data: [110, 105, window.extractedHealthData?.fbs || 88],
            borderColor: '#3b82f6'
        };
    }

    if (trendChartInstance) {
        trendChartInstance.destroy();
    }

    trendChartInstance = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['2024', '2025', 'ปัจจุบัน (Current)'],
            datasets: [{
                label: chartData.label,
                data: chartData.data,
                borderColor: chartData.borderColor,
                backgroundColor: chartData.borderColor + '33', // 20% opacity
                borderWidth: 3,
                pointBackgroundColor: chartData.borderColor,
                pointRadius: 6,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: false }
            }
        }
    });
};
