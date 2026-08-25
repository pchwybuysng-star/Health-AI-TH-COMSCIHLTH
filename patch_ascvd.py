import re

with open('Script.js', 'r') as f:
    js = f.read()

replacement = r"""
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
                dataHor = [
                    eh.cortisol ? 100 - (eh.cortisol*2) : 65, 
                    eh.tsh ? 80 : 80, 
                    eh.dhea ? 70 : 50, 
                    eh.testosterone ? 75 : 70, 
                    eh.insulin ? 100 - (eh.insulin*2) : 90
                ];
            }

            // --- ASCVD Risk Calculation ---
            // Simplified Framingham formula for Demo (Assumes Male, 45y, Non-Smoker, Non-Diabetic originally)
            // Baseline risk ~1%. Adjust based on extracted factors:
            let ascvdRisk = 1.0;
            if (eh.chol) {
                if (eh.chol > 240) ascvdRisk += 4.5;
                else if (eh.chol > 200) ascvdRisk += 2.0;
                else if (eh.chol > 160) ascvdRisk += 1.0;
            }
            if (eh.hdl) {
                if (eh.hdl < 40) ascvdRisk += 2.0;
                else if (eh.hdl >= 60) ascvdRisk -= 1.0;
            }
            if (eh.bp) {
                // bp is format "120/80"
                const sysMatch = eh.bp.match(/(\d+)\//);
                if (sysMatch) {
                    const sys = parseInt(sysMatch[1]);
                    if (sys > 140) ascvdRisk += 3.0;
                    else if (sys > 130) ascvdRisk += 1.5;
                }
            }
            if (eh.fbs && eh.fbs > 125) ascvdRisk += 4.0; // Diabetes multiplier

            ascvdRisk = Math.max(0.1, ascvdRisk); // Ensure not negative

            const ring = document.getElementById('ascvd-ring');
            const scoreText = document.getElementById('ascvd-score');
            const statusText = document.getElementById('ascvd-status');
            const descText = document.getElementById('ascvd-desc');

            if (ring && scoreText) {
                scoreText.textContent = ascvdRisk.toFixed(1) + "%";
                ring.style.strokeDasharray = `${ascvdRisk}, 100`;

                if (ascvdRisk < 5.0) {
                    ring.style.stroke = "var(--success)";
                    statusText.textContent = "ความเสี่ยงต่ำ (Low Risk)";
                    statusText.style.color = "var(--success)";
                    descText.textContent = "ความเสี่ยงโรคหลอดเลือดหัวใจใน 10 ปีต่ำมาก ค่าพารามิเตอร์ของคุณดีเยี่ยม";
                } else if (ascvdRisk < 7.5) {
                    ring.style.stroke = "var(--warning)";
                    statusText.textContent = "ความเสี่ยงปานกลาง (Borderline Risk)";
                    statusText.style.color = "var(--warning)";
                    descText.textContent = "แนะนำให้ปรับพฤติกรรมการกินและออกกำลังกายเพื่อลดความเสี่ยง";
                } else if (ascvdRisk < 20.0) {
                    ring.style.stroke = "var(--warning)";
                    statusText.textContent = "ความเสี่ยงสูง (Intermediate Risk)";
                    statusText.style.color = "#f59e0b"; // orange
                    descText.textContent = "แพทย์อาจพิจารณาให้ยาลดไขมันกลุ่ม Statin โปรดปรึกษาแพทย์";
                } else {
                    ring.style.stroke = "var(--danger)";
                    statusText.textContent = "ความเสี่ยงสูงมาก (High Risk)";
                    statusText.style.color = "var(--danger)";
                    descText.textContent = "ควรพบแพทย์เฉพาะทางโรคหัวใจทันที เพื่อวางแผนการรักษาเชิงรุก";
                }
            }
        }
"""

pattern = re.compile(r'if \(window\.extractedHealthData\) \{.*?if \(eh\.cortisol \|\| eh\.tsh\) \{.*?\};\s*\}\s*\}', re.DOTALL)
new_js = pattern.sub(replacement.replace('\\', '\\\\'), js)

with open('Script.js', 'w') as f:
    f.write(new_js)
    
print("ASCVD Calculation injected!")
