import re

with open('index.html', 'r') as f:
    html = f.read()

# Locate the floating chatbot which starts with <input type="checkbox" id="chatbot-toggle"
# and ends before <!-- Scripts -->
pattern = re.compile(r'<input type="checkbox" id="chatbot-toggle" class="chatbot-checkbox">.*?</div>\s*<!-- Scripts -->', re.DOTALL)
new_html = pattern.sub('<!-- Scripts -->', html)

with open('index.html', 'w') as f:
    f.write(new_html)
    
print("Old floating chatbot completely wiped!")
