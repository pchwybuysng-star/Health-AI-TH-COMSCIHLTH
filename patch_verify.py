import re

with open('Script.js', 'r') as f:
    js = f.read()

replacement = r"""
            if (idInput.value === '0000000000000') {
                if (verifyError) verifyError.style.display = 'none';
                if (verifyState) verifyState.style.display = 'none';

                // --- Update UI with Extracted Data ---
                if (window.extractedHealthData) {
                    const metricValues = document.querySelectorAll('.metric-value');
                    
                    if (window.extractedHealthData.ldl && metricValues.length > 3) {
                        metricValues[3].innerHTML = `${window.extractedHealthData.ldl} <span style="font-size: 0.8rem;">mg/dL</span> <br><span style="font-size: 0.7rem; color: var(--success);">(อัปเดตจากไฟล์)</span>`;
                    }
                    if (window.extractedHealthData.fbs && metricValues.length > 4) {
                        metricValues[4].innerHTML = `${window.extractedHealthData.fbs} <span style="font-size: 0.8rem;">mg/dL</span> <br><span style="font-size: 0.7rem; color: var(--success);">(อัปเดตจากไฟล์)</span>`;
                    }
                }
"""

pattern = re.compile(r'if \(idInput\.value === \'0000000000000\'\) \{\s*if \(verifyError\) verifyError\.style\.display = \'none\';\s*if \(verifyState\) verifyState\.style\.display = \'none\';', re.DOTALL)
new_js = pattern.sub(replacement.replace('\\', '\\\\'), js)

with open('Script.js', 'w') as f:
    f.write(new_js)
    
print("Updated verify logic.")
