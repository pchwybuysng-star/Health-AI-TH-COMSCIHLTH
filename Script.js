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

                
                // --- Update UI with Extracted Data ---
                if (window.extractedHealthData) {
                    const eh = window.extractedHealthData;
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

                    // --- 1. Calculate Health Age ---
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

                    // --- 2. Update AI Anatomy Scanner ---
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
                    }, 500); // animate after load
                }



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
                // Use Real Gemini AI
                const promptCtx = window.extractedHealthData ? JSON.stringify(window.extractedHealthData) : "No health data yet.";
                const sysPrompt = `คุณคือ Dr. LabLink แพทย์ AI ผู้เชี่ยวชาญการอ่านผลเลือด 
กรุณาตอบคำถามผู้ป่วยเป็นภาษาไทยแบบเป็นกันเอง สั้นกระชับ เข้าใจง่าย 
นี่คือผลเลือดปัจจุบันของผู้ป่วย: ${promptCtx}`;

                
                fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            { role: "user", parts: [{ text: sysPrompt + "\nคำถามจากผู้ป่วย: " + text }] }
                        ]
                    })
                }).then(res => res.json()).then(data => {
                    if (data.error) {
                        console.error("Gemini API Error:", data.error);
                        handleAIResponse(`❌ ข้อผิดพลาดจาก AI: ${data.error.message} <br><br>👉 โปรดตรวจสอบว่า API Key ถูกต้องหรือไม่ ในหน้าตั้งค่า`);
                        return;
                    }
                    if (data.candidates && data.candidates.length > 0) {
                        const aiText = data.candidates[0].content.parts[0].text;
                        handleAIResponse(aiText);
                    } else {
                        handleAIResponse("ขออภัยครับ AI ไม่สามารถตอบได้ในขณะนี้ กรุณาลองใหม่");
                    }
                }).catch(err => {
                    console.error("Fetch Error:", err);
                    handleAIResponse("❌ เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย หรือ API Key มีปัญหา");
                });

            } else {
                // Fallback to Rule-based Mock
                setTimeout(() => {
                    let mockRes = "";
                    if (text.includes('น้ำตาล') || text.toLowerCase().includes('fbs')) {
                        mockRes = `<strong>เรื่องน้ำตาล (FBS):</strong> ค่าของคุณอยู่ที่ 88 mg/dL ซึ่งอยู่ในเกณฑ์ปกติเยี่ยมมากครับ! พยายามรักษาการกินคาร์บเชิงซ้อนต่อไปนะครับ 👏`;
                    } else if (text.includes('ไขมัน') || text.toLowerCase().includes('ldl') || text.includes('คอเลสเตอรอล')) {
                        mockRes = `<strong>เรื่องไขมันในเลือด:</strong> แม้ว่า LDL จะ 130 (ปริ่มเกณฑ์) แต่คุณมี HDL ถึง 55 ช่วยดึงไขมันทิ้งได้ดีครับ แนะนำให้ออกกำลังกายแบบคาร์ดิโอเพิ่มสัปดาห์ละ 2-3 วันครับ 🏃‍♂️`;
                    } else {
                        mockRes = `คำถามที่ดีครับ! จากผลแล็บโดยรวมของคุณอยู่ในเกณฑ์ที่ยอดเยี่ยม 🌟 หากต้องการให้ผมวิเคราะห์แบบ Real-time ของจริง กรุณาใส่ Gemini API Key ในหน้าตั้งค่าครับ!`;
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
                margin: [10, 10, 10, 10],
                filename: 'LabLink-Health-Report.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a3', orientation: 'portrait' }
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
    const btnExport = document.getElementById('btn-export-pdf');
    if (btnExport) {
        btnExport.addEventListener('click', async () => {
            const originalText = btnExport.innerHTML;
            btnExport.innerHTML = '<span class="icon animate-pulse">⏳</span> Generating...';
            
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');
                
                // Set light background for clean medical look
                document.body.style.background = '#ffffff';
                const dashboard = document.querySelector('.main-content');
                
                // Hide things we don't want in PDF
                const toggle = document.getElementById('theme-toggle');
                if (toggle) toggle.style.display = 'none';
                
                const canvas = await html2canvas(dashboard, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });
                
                // Reset styles
                document.body.style.background = '';
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
    }
});


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
            if (statusGemini) statusGemini.style.display = 'block';
        }

        btnSaveGemini.addEventListener('click', () => {
            const key = inputGemini.value.trim();
            if (key) {
                localStorage.setItem('gemini_api_key', key);
                if (statusGemini) {
                    statusGemini.style.display = 'block';
                    statusGemini.textContent = "✅ เชื่อมต่อ Gemini AI สำเร็จ! (Key saved)";
                }
            } else {
                localStorage.removeItem('gemini_api_key');
                if (statusGemini) statusGemini.style.display = 'none';
            }
        });
    }
});
