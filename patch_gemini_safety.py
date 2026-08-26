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
                        ],
                        safetySettings: [
                            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
                            { category: "HARM_CATEGORY_MEDICAL", threshold: "BLOCK_NONE" }
                        ]
                    })
                }).then(res => res.json()).then(data => {
                    if (data.error) {
                        console.error("Gemini API Error:", data.error);
                        handleAIResponse(`❌ ข้อผิดพลาดจาก AI: ${data.error.message} <br><br>👉 โปรดตรวจสอบว่า API Key ถูกต้องหรือไม่`);
                        return;
                    }
                    if (data.candidates && data.candidates.length > 0) {
                        const candidate = data.candidates[0];
                        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                            handleAIResponse(candidate.content.parts[0].text);
                        } else {
                            handleAIResponse(`❌ AI ไม่สามารถตอบได้ (Finish Reason: ${candidate.finishReason}) อาจติดเรื่อง Safety Filter ทางการแพทย์`);
                        }
                    } else {
                        handleAIResponse("ขออภัยครับ AI ไม่สามารถตอบได้ในขณะนี้ กรุณาลองใหม่");
                    }
                }).catch(err => {
                    console.error("Fetch Error:", err);
                    handleAIResponse("❌ เกิดข้อผิดพลาดในระบบ (โปรดตรวจสอบ Console)");
                });
"""

pattern = re.compile(r'fetch\(`https://generativelanguage\.googleapis\.com.*?\}\)\.catch\(err => \{.*?\}\);', re.DOTALL)
new_js = pattern.sub(replacement.replace('\\', '\\\\'), js)

with open('Script.js', 'w') as f:
    f.write(new_js)
    
print("Gemini API safety and parsing fixed!")
