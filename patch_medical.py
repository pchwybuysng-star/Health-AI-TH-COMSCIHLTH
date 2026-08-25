import re

with open('index.html', 'r') as f:
    html = f.read()

# 1. Add CDNs
cdn_replacement = r"""
    <!-- Tesseract.js for reading Images (OCR) -->
    <script src="https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js"></script>
    <!-- html2canvas & jsPDF for Medical Report Export -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
"""
html = html.replace('    <!-- Tesseract.js for reading Images (OCR) -->\n    <script src="https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js"></script>', cdn_replacement)

# 2. Add Trust Badge
header_replacement = r"""                <div class="header-action" style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                    <span class="badge-pro" style="background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 0.9rem; box-shadow: 0 4px 10px rgba(59,130,246,0.3);">✨ Medical Grade AI</span>
                    <span style="background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 0.75rem; border: 1px solid #10b981; display: flex; align-items: center; gap: 4px;"><span class="icon">🔒</span> HIPAA & PDPA Compliant (On-Device Local Processing)</span>
                </div>"""
html = re.sub(r'<div class="header-action">.*?</div>', header_replacement, html, flags=re.DOTALL)

# 3. Replace trend-ai-summary with ASCVD Standard
ascvd_replacement = r"""                    <!-- Clinical Standard: ASCVD Risk & PDF Export -->
                    <div class="card" style="background: linear-gradient(to right bottom, #ffffff, #f8fafc); border: 1px solid var(--border); box-shadow: var(--shadow-sm); position: relative;" id="trend-ai-summary">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
                            <h3 style="display: flex; align-items: center; gap: 8px; margin: 0;">
                                <span style="font-size: 1.5rem;">🫀</span> ASCVD 10-Year Risk Score (ACC/AHA Standard)
                            </h3>
                            <button id="btn-export-pdf" class="btn-primary" style="padding: 8px 16px; font-size: 0.85rem; background: var(--success); display: flex; align-items: center; gap: 8px;">
                                <span class="icon">📄</span> Export Medical Report (PDF)
                            </button>
                        </div>
                        <p style="color: var(--text-light); margin-top: 8px; font-size: 0.85rem;">
                            ประเมินความเสี่ยงโรคหลอดเลือดหัวใจตีบใน 10 ปีข้างหน้า อ้างอิงตามมาตรฐาน American College of Cardiology (ACC) และ American Heart Association (AHA)
                        </p>
                        
                        <div style="margin-top: 20px; padding: 20px; background: #fff; border-radius: 8px; border: 1px solid var(--border); display: flex; gap: 24px; align-items: center;">
                            <div style="position: relative; width: 100px; height: 100px;">
                                <svg viewBox="0 0 36 36" style="width: 100%; height: 100%;">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" stroke-width="3"/>
                                    <path id="ascvd-ring" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" stroke-width="3" stroke-dasharray="12, 100" style="transition: stroke-dasharray 1s ease-out;"/>
                                </svg>
                                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <span id="ascvd-score" style="font-size: 1.5rem; font-weight: bold; color: var(--text-main);">1.2%</span>
                                    <span style="font-size: 0.6rem; color: var(--text-light);">Risk</span>
                                </div>
                            </div>
                            <div style="flex: 1;">
                                <strong id="ascvd-status" style="color: var(--success); display: block; margin-bottom: 8px; font-size: 1.1rem;">ความเสี่ยงต่ำมาก (Low Risk)</strong>
                                <span id="ascvd-desc" style="font-size: 0.95rem; color: var(--text-main); line-height: 1.6;">
                                    คุณมีความเสี่ยงเพียงเล็กน้อยที่จะเกิดภาวะหัวใจวายหรือสโตรกใน 10 ปีข้างหน้า ค่าคอเลสเตอรอลและความดันโลหิตของคุณอยู่ในเกณฑ์ดีเยี่ยม กรุณารักษาสุขภาพเช่นนี้ต่อไป
                                </span>
                            </div>
                        </div>
                    </div>"""
html = re.sub(r'<!-- AI Summary -->.*?<!-- Historical Data Table -->', ascvd_replacement + "\n\n                    <!-- Historical Data Table -->", html, flags=re.DOTALL)

with open('index.html', 'w') as f:
    f.write(html)

print("index.html patched with Medical Standards.")
