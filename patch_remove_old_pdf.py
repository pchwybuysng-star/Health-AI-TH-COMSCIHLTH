import re

with open('Script.js', 'r') as f:
    js = f.read()

# Remove the old initExportPDF function
pattern = re.compile(r'// 7\. Export PDF Logic\s*function initExportPDF\(\) \{.*?(?=// 8\.|\nfunction initTrendsChart|\n\n)', re.DOTALL)
new_js = pattern.sub('', js)

# Also remove the call to initExportPDF in the top DOMContentLoaded, 
# because my new one is anonymous!
new_js = new_js.replace('initExportPDF();\n', '')

with open('Script.js', 'w') as f:
    f.write(new_js)
    
print("Old PDF logic removed!")
