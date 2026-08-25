import re

with open('Script.js', 'r') as f:
    js = f.read()

replacement = r"""
            const geminiKey = localStorage.getItem('gemini_api_key');
"""

pattern = re.compile(r"const geminiKey = localStorage\.getItem\('gemini_api_key'\) \|\| 'AQ\.Ab8RN6JBBUzA6dPo85bJkFElejy7EVNd3k9kjqPmC4IoqNoyrQ';")
new_js = pattern.sub(replacement, js)

with open('Script.js', 'w') as f:
    f.write(new_js)
    
print("Hardcoded key removed!")
