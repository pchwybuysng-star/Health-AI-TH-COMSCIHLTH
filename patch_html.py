import re

with open('index.html', 'r') as f:
    html = f.read()

replacement_score = r"""                    <div class="card glass-card score-card">
                        <h3>อายุสุขภาพของคุณ (Health Age)</h3>
                        <div class="circular-progress" data-progress="85" style="width: 140px; height: 140px; margin: 0 auto; position: relative;">
                            <div class="inner-circle" style="width: 120px; height: 120px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                                <span class="score-number" id="health-age-number" style="font-size: 3.5rem; line-height: 1;">28</span>
                                <span style="font-size: 1.1rem; color: var(--text-light); font-weight: 500;">ปี</span>
                            </div>
                        </div>
                        <div class="score-info" style="margin-top: 20px;">
                            <h4 class="text-success" id="health-age-text">อ่อนเยาว์กว่าอายุจริง 7 ปี!</h4>
                            <p style="color: var(--text-light); font-size: 0.9rem; margin-top: 8px;">(เทียบจากอายุจริง 35 ปี) AI ประเมินจากผลเลือดและการทำงานของตับ</p>
                        </div>
                    </div>"""

html = re.sub(r'<div class="card glass-card score-card">.*?</div>\s*</div>\s*<!-- Updated Quick Metrics \(5 items\) -->', 
              replacement_score + "\n\n                    <!-- Updated Quick Metrics (5 items) -->", html, flags=re.DOTALL)

replacement_scanner = r"""
                    <!-- AI Body Scanner -->
                    <div class="card full-width" style="margin-bottom: 24px; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at center, rgba(14, 165, 233, 0.05) 0%, transparent 70%); pointer-events: none;"></div>
                        <div class="card-header-flex">
                            <h3><span class="icon animate-pulse" style="display: inline-block;">👁️‍🗨️</span> AI Anatomy Scanner (วิเคราะห์ความเสี่ยงอวัยวะ)</h3>
                            <span class="badge-pro" style="background: var(--primary); color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem;">Real-time</span>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px 0;">
                            <svg viewBox="0 0 200 300" style="width: 100%; max-height: 350px; drop-shadow: 0 0 20px rgba(14, 165, 233, 0.3);">
                                <!-- Outline Torso -->
                                <path d="M100,20 C130,20 140,50 140,70 C140,100 120,110 100,110 C80,110 60,100 60,70 C60,50 70,20 100,20 Z" fill="none" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="4,4" class="dark-mode-stroke"/>
                                <path d="M60,110 C80,105 120,105 140,110 C160,120 175,160 175,200 C175,260 150,300 120,300 L80,300 C50,300 25,260 25,200 C25,160 40,120 60,110 Z" fill="none" stroke="#e2e8f0" stroke-width="2" class="dark-mode-stroke"/>
                                
                                <!-- Brain -->
                                <path id="organ-brain" d="M100,30 C120,30 125,50 125,65 C125,80 110,95 100,95 C90,95 75,80 75,65 C75,50 80,30 100,30 Z" fill="#10b981" opacity="0.6" style="transition: fill 1s, drop-shadow 1s;"/>
                                
                                <!-- Lungs -->
                                <path id="organ-lungs" d="M95,130 C85,120 60,130 50,170 C40,210 70,210 90,200 Z M105,130 C115,120 140,130 150,170 C160,210 130,210 110,200 Z" fill="#10b981" opacity="0.4" style="transition: fill 1s;"/>

                                <!-- Heart -->
                                <path id="organ-heart" d="M100,150 C115,135 135,145 125,170 C115,195 100,205 100,205 C100,205 85,195 75,170 C65,145 85,135 100,150 Z" fill="#10b981" opacity="0.8" style="transition: fill 1s, filter 1s;"/>
                                
                                <!-- Liver -->
                                <path id="organ-liver" d="M60,210 C85,200 125,205 135,230 C145,250 110,245 75,235 C65,230 55,220 60,210 Z" fill="#10b981" opacity="0.7" style="transition: fill 1s;"/>

                                <!-- Pancreas / Blood Sugar -->
                                <path id="organ-pancreas" d="M90,240 C115,230 135,245 115,260 C95,270 75,255 90,240 Z" fill="#10b981" opacity="0.9" style="transition: fill 1s;"/>
                            </svg>
                            
                            <div style="display: flex; gap: 20px; margin-top: 20px; font-size: 0.9rem;">
                                <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 12px; height: 12px; background: #10b981; border-radius: 50%;"></div> ปกติ (Optimal)</div>
                                <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 12px; height: 12px; background: #f59e0b; border-radius: 50%;"></div> เฝ้าระวัง (Warning)</div>
                                <div style="display: flex; align-items: center; gap: 6px;"><div style="width: 12px; height: 12px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 8px #ef4444;"></div> อันตราย (Critical)</div>
                            </div>
                        </div>
                    </div>
"""

html = re.sub(r'<!-- Executive Summary Table -->', replacement_scanner + "\n                    <!-- Executive Summary Table -->", html)

with open('index.html', 'w') as f:
    f.write(html)

print("HTML patched for Health Age and Body Scanner!")
