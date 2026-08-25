import re

with open('index.html', 'r') as f:
    html = f.read()

replacement = r"""
                        <div class="setting-group" style="margin-top: 30px;">
                            <h4 style="display: flex; align-items: center; gap: 8px;"><span class="icon">✨</span> Gemini AI Core Integration</h4>
                            <div class="setting-item" style="display: flex; flex-direction: column; align-items: flex-start; gap: 12px; background: rgba(59, 130, 246, 0.05); border: 1px solid var(--primary); padding: 16px; border-radius: 8px;">
                                <div>
                                    <strong style="color: var(--primary-dark);">Google Gemini API Key</strong>
                                    <p class="text-sm" style="margin-top: 4px;">เปิดใช้งาน AI ของแท้สำหรับแชทบอทและการวิเคราะห์ผลแล็บ (ดึงข้อมูล Context ผลเลือดปัจจุบันไปวิเคราะห์สด)</p>
                                </div>
                                <div style="display: flex; gap: 8px; width: 100%;">
                                    <input type="password" id="gemini-api-key" placeholder="Paste your Gemini API Key here (AIzaSy...)" style="flex: 1; padding: 10px; border: 1px solid var(--border); border-radius: 6px; font-family: monospace;">
                                    <button class="btn-primary" id="btn-save-gemini" style="padding: 10px 20px;">บันทึก Key</button>
                                </div>
                                <p id="gemini-status" style="font-size: 0.85rem; color: var(--success); display: none;">✅ เชื่อมต่อ Gemini AI สำเร็จ! บอทจะใช้ AI จริงในการตอบคำถาม</p>
                            </div>
                        </div>

                        <div class="setting-group" style="margin-top: 30px;">
                            <h4>บัญชีผู้ใช้</h4>
"""

pattern = re.compile(r'<div class="setting-group">\s*<h4>บัญชีผู้ใช้</h4>')
new_html = pattern.sub(replacement, html)

with open('index.html', 'w') as f:
    f.write(new_html)
    
print("Settings patched with Gemini input!")
