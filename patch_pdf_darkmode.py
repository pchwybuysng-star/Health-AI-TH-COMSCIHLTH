import re

with open('Script.js', 'r') as f:
    js = f.read()

replacement = r"""
                const isDark = document.body.classList.contains('dark-mode');
                if (isDark) document.body.classList.remove('dark-mode');
                
                // Hide things we don't want in PDF
                const toggle = document.getElementById('theme-toggle');
                if (toggle) toggle.style.display = 'none';
                
                const canvas = await html2canvas(dashboard, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });
                
                // Reset styles
                if (isDark) document.body.classList.add('dark-mode');
                if (toggle) toggle.style.display = '';
"""

pattern = re.compile(r"// Set light background for clean medical look\s*document\.body\.style\.background = '#ffffff';\s*const dashboard = document\.querySelector\('\.main-content'\);\s*// Hide things we don't want in PDF.*?if \(toggle\) toggle\.style\.display = '';", re.DOTALL)
new_js = pattern.sub("const dashboard = document.querySelector('.main-content');\n" + replacement, js)

with open('Script.js', 'w') as f:
    f.write(new_js)
    
print("PDF dark mode bug fixed!")
