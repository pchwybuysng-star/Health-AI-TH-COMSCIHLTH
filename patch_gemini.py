import re

with open('Script.js', 'r') as f:
    js = f.read()

replacement = r"""
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

                fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            { role: "user", parts: [{ text: sysPrompt + "\nคำถามจากผู้ป่วย: " + text }] }
                        ]
                    })
                }).then(res => res.json()).then(data => {
                    if (data.candidates && data.candidates.length > 0) {
                        const aiText = data.candidates[0].content.parts[0].text;
                        handleAIResponse(aiText);
                    } else {
                        handleAIResponse("ขออภัยครับ AI ไม่สามารถตอบได้ในขณะนี้ กรุณาลองใหม่");
                    }
                }).catch(err => {
                    handleAIResponse("เกิดข้อผิดพลาดในการเชื่อมต่อ Gemini API ตรวจสอบ Key ของคุณในตั้งค่า");
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
"""

pattern = re.compile(r'setTimeout\(\(\) => \{\s*if \(chatBody\.contains\(typingMsg\)\) chatBody\.removeChild\(typingMsg\);\s*const aiMsg = document\.createElement\(\'div\'\);.*?window\.speechSynthesis\.speak\(utterance\);\s*\}\s*\}, 1200\);', re.DOTALL)
new_js = pattern.sub(replacement.replace('\\', '\\\\'), js)

# Also add Settings Logic
settings_logic = r"""
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
"""

new_js += "\n" + settings_logic

with open('Script.js', 'w') as f:
    f.write(new_js)
    
print("Gemini API logic injected!")
