import re

with open('Script.js', 'r') as f:
    js = f.read()

replacement = r"""
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
"""

pattern = re.compile(r'const labels = \[\'ม\.ค\.\', \'ก\.พ\.\', \'มี\.ค\.\', \'เม\.ย\.\', \'พ\.ค\.\', \'มิ\.ย\.\'\];\s*// 1\. Lipid Profile \(Line\).*?options: commonOptions\s*\}\)\);\s*\}', re.DOTALL)
new_js = pattern.sub(replacement.replace('\\', '\\\\'), js)

with open('Script.js', 'w') as f:
    f.write(new_js)
    
print("Updated chart logic part 1.")
