import re

with open('Script.js', 'r') as f:
    js = f.read()

replacement = r"""
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
"""

pattern = re.compile(r'// --- Update UI with Extracted Data ---.*?if \(window\.extractedHealthData\.fbs && metricValues\.length > 4\) \{.*?\}\s*\}', re.DOTALL)
new_js = pattern.sub(replacement.replace('\\', '\\\\'), js)

with open('Script.js', 'w') as f:
    f.write(new_js)
    
print("JS patched for Anatomy and Health Age!")
