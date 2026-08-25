import re

with open('Script.js', 'r') as f:
    js = f.read()

replacement = r"""
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
"""

pattern = re.compile(r'fetch\(`https://generativelanguage\.googleapis\.com.*?\}\)\.catch\(err => \{.*?\}\);', re.DOTALL)
new_js = pattern.sub(replacement.replace('\\', '\\\\'), js)

with open('Script.js', 'w') as f:
    f.write(new_js)
    
print("Gemini API fixed!")
