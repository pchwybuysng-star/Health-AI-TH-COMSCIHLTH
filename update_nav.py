import re

with open('/Users/panaoonchuayboonsong/Desktop/lablink-hackathon/index.html', 'r') as f:
    content = f.read()

new_nav = """            <ul class="nav-menu">
                <li><a href="#" class="nav-item active" id="nav-upload" data-target="view-upload">
                    <span class="icon">📤</span> <span data-i18n="nav_upload">อัปโหลดผลตรวจ</span>
                </a></li>
                <li><a href="#" class="nav-item locked-nav" id="nav-dashboard" data-target="view-dashboard">
                    <span class="icon">📊</span> <span data-i18n="nav_dashboard">ภาพรวมสุขภาพ</span>
                </a></li>
                <li><a href="#" class="nav-item locked-nav" id="nav-trends" data-target="view-trends">
                    <span class="icon">📈</span> <span data-i18n="nav_trends">แนวโน้มสุขภาพ</span>
                </a></li>
                <li><a href="#" class="nav-item locked-nav" id="nav-ai" data-target="view-ai">
                    <span class="icon">🧠</span> ปรึกษา AI แพทย์
                </a></li>
                <li><a href="#" class="nav-item locked-nav" id="nav-nutrition" data-target="view-nutrition">
                    <span class="icon">🥗</span> <span data-i18n="nav_nutrition">โภชนาการบำบัด</span>
                </a></li>
                <li><a href="#" class="nav-item locked-nav" id="nav-academy" data-target="view-academy">
                    <span class="icon">🎓</span> คลังความรู้ MedTech
                </a></li>
                <li><a href="#" class="nav-item" id="theme-toggle"><span class="icon">🌙</span> โหมดกลางคืน</a></li>
                <li><a href="#" class="nav-item" id="nav-settings" data-target="view-settings">
                    <span class="icon">⚙️</span> <span data-i18n="nav_settings">โปรไฟล์ & ตั้งค่า</span>
                </a></li>
                <li style="display: none;" id="nav-home-bottom-wrapper"><a href="#" class="nav-item" id="nav-home-bottom" style="margin-top: auto; color: var(--warning); border-top: 1px solid var(--border); padding-top: 12px;" data-target="view-dashboard">
                    <span class="icon">🏠</span> <span data-i18n="nav_dashboard">ภาพรวมสุขภาพ</span>
                </a></li>
            </ul>"""

content = re.sub(r'<nav class="nav-menu">.*?</nav>', new_nav, content, flags=re.DOTALL)

with open('/Users/panaoonchuayboonsong/Desktop/lablink-hackathon/index.html', 'w') as f:
    f.write(content)
print("Nav list updated")
