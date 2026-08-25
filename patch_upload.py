import re

with open('Script.js', 'r') as f:
    js = f.read()

replacement = r"""
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
        if (scanningText) scanningText.textContent = "AI กำลังสกัดข้อมูลจาก " + file.name + "...";

        try {
            let extractedText = "";
            
            // PDF Parsing
            if (file.type === 'application/pdf' && window.pdfjsLib) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({data: new Uint8Array(arrayBuffer)}).promise;
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    extractedText += content.items.map(item => item.str).join(' ') + " ";
                }
            } 
            // Image OCR Parsing
            else if (file.type.startsWith('image/') && window.Tesseract) {
                if (scanningText) scanningText.textContent = "AI กำลังอ่านภาพ (OCR) อาจใช้เวลาสักครู่...";
                const result = await Tesseract.recognize(file, 'eng+tha', {
                    logger: m => {
                        if(m.status === 'recognizing text' && scanningText) {
                            scanningText.textContent = "AI กำลังอ่านภาพ (OCR): " + Math.round(m.progress * 100) + "%";
                        }
                    }
                });
                extractedText = result.data.text;
            } 
            // Plain text parsing
            else {
                extractedText = await file.text();
            }

            console.log("Extracted Health Data:", extractedText);
            
            // Simple Keyword Parsing (for hackathon demo)
            window.extractedHealthData = {};
            
            // Find LDL (e.g. "LDL 130" or "LDL-Cholesterol 145")
            const ldlMatch = extractedText.match(/LDL.*?(\d{2,3})/i);
            if (ldlMatch) window.extractedHealthData.ldl = parseInt(ldlMatch[1]);
            
            // Find FBS / Glucose (e.g. "FBS 95" or "Glucose 102")
            const fbsMatch = extractedText.match(/(?:FBS|Glucose).*?(\d{2,3})/i);
            if (fbsMatch) window.extractedHealthData.fbs = parseInt(fbsMatch[1]);

            // Find ALT / SGPT
            const altMatch = extractedText.match(/(?:ALT|SGPT).*?(\d{2,3})/i);
            if (altMatch) window.extractedHealthData.alt = parseInt(altMatch[1]);

            if (scanningText) scanningText.textContent = "สกัดข้อมูลสำเร็จ! พบค่า: " + JSON.stringify(window.extractedHealthData);
            
            // Wait a moment so user can see success
            await new Promise(r => setTimeout(r, 1000));
            
        } catch (err) {
            console.error("Extraction error:", err);
            if (scanningText) scanningText.textContent = "AI ไม่สามารถอ่านไฟล์ได้ แต่เราจะจำลองข้อมูลให้...";
            await new Promise(r => setTimeout(r, 1500));
        }

        // Proceed to ID Verification
        if (loadingState) loadingState.style.display = 'none';
        if (verifyState) {
            verifyState.style.display = 'block';
            if (idInput) {
                idInput.value = '';
                if (verifyError) verifyError.style.display = 'none';
                idInput.focus();
            }
        }
        
        // Reset input so they can upload same file again if needed
        realFileUpload.value = '';
    });
"""

# Replace the block
pattern = re.compile(r'if \(!uploadBtn\) return;\s*uploadBtn\.addEventListener\(\'click\', \(\) => \{.*?\n    \}\);', re.DOTALL)
new_js = pattern.sub(replacement, js)

with open('Script.js', 'w') as f:
    f.write(new_js)
    
print("Updated upload simulation logic.")
