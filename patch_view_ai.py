import re

with open('index.html', 'r') as f:
    html = f.read()

# 1. New Full-Page Chat UI
new_view_ai = r"""
            <section class="view-section" id="view-ai" style="display: none; height: 100%;">
                <div class="card full-width" style="display: flex; flex-direction: column; height: calc(100vh - 180px); padding: 0; overflow: hidden; box-shadow: var(--shadow-md);">
                    <div class="chat-header" style="background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                        <div class="chat-title" style="font-size: 1.4rem; font-weight: bold; display: flex; align-items: center; gap: 12px;">
                            <span class="icon" style="font-size: 1.8rem;">👨‍⚕️</span> Dr. LabLink (Medical AI)
                        </div>
                        <span style="font-size: 0.85rem; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px;">Powered by Gemini</span>
                    </div>
                    <div class="chat-body" style="flex: 1; padding: 24px; overflow-y: auto; background: #f8fafc; display: flex; flex-direction: column; gap: 16px;">
                        <div class="message ai-message" style="align-self: flex-start; max-width: 80%;">
                            <p style="background: white; padding: 16px 20px; border-radius: 16px; border-bottom-left-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); color: var(--text-main); font-size: 1.05rem; line-height: 1.6;">
                                สวัสดีครับ! ผม Dr. LabLink แพทย์ AI ส่วนตัวของคุณ 🩺<br>
                                คุณสามารถสอบถามเกี่ยวกับผลแล็บล่าสุด, โภชนาการ, หรือวิธีดูแลสุขภาพเพิ่มเติมได้เลยครับ พิมพ์คำถามไว้ด้านล่างได้เลย 👇
                            </p>
                        </div>
                    </div>
                    <div class="chat-footer" style="padding: 20px; background: white; border-top: 1px solid var(--border); display: flex; gap: 12px; align-items: flex-end;">
                        <textarea placeholder="พิมพ์คำถามของคุณที่นี่..." class="chat-input" style="flex: 1; padding: 16px; border: 1px solid var(--border); border-radius: 12px; font-family: inherit; font-size: 1rem; resize: none; outline: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); height: 60px;"></textarea>
                        <button class="chat-send btn-primary" style="padding: 0; width: 60px; height: 60px; border-radius: 12px; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; flex-shrink: 0;">➤</button>
                    </div>
                </div>
            </section>
"""

html = re.sub(r'<section class="view-section" id="view-ai" style="display: none;">.*?</section>', new_view_ai, html, flags=re.DOTALL)

# 2. Delete Floating Chatbot
floating_pattern = r'<input type="checkbox" id="chatbot-toggle" class="chatbot-checkbox">.*?<div class="chatbot-window">.*?</div>\s*</div>\s*</div>'
html = re.sub(floating_pattern, '', html, flags=re.DOTALL)

with open('index.html', 'w') as f:
    f.write(html)
    
print("Full page Chat AI injected and floating widget removed!")
