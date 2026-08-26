import re

with open('Script.js', 'r') as f:
    js = f.read()

# Delete the orphaned code
pattern = re.compile(r'\n\n    btnExport\.addEventListener\(\'click\'.*?\}\s*// 8\. Trends Chart \(Chart\.js\)', re.DOTALL)
new_js = pattern.sub('\n\n// 8. Trends Chart (Chart.js)', js)

with open('Script.js', 'w') as f:
    f.write(new_js)
    
print("Orphaned PDF code removed!")
