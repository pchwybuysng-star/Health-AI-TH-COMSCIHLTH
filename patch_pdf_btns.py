import re

with open('index.html', 'r') as f:
    html = f.read()

# Fix duplicate ID
html = html.replace('<button class="btn-primary" id="btn-export-pdf" style="padding: 8px 16px;">ดาวน์โหลด</button>', '<button class="btn-primary" id="btn-export-pdf-settings" style="padding: 8px 16px;">ดาวน์โหลด</button>')

with open('index.html', 'w') as f:
    f.write(html)

with open('Script.js', 'r') as f:
    js = f.read()

replacement = r"""
document.addEventListener('DOMContentLoaded', () => {
    const btnsExport = document.querySelectorAll('#btn-export-pdf, #btn-export-pdf-settings');
    
    btnsExport.forEach(btnExport => {
        btnExport.addEventListener('click', async () => {
"""

pattern = re.compile(r"document\.addEventListener\('DOMContentLoaded', \(\) => \{\s*const btnExport = document\.getElementById\('btn-export-pdf'\);\s*if \(btnExport\) \{\s*btnExport\.addEventListener\('click', async \(\) => \{")
new_js = pattern.sub(replacement, js)

# Also fix the closing braces for forEach
new_js = new_js.replace("});\n    }\n});\n// --- Gemini API Key Logic ---", "});\n    });\n});\n\n// --- Gemini API Key Logic ---")

with open('Script.js', 'w') as f:
    f.write(new_js)
    
print("Duplicate btn-export-pdf IDs fixed!")
