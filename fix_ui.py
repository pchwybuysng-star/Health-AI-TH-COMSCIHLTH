import re
with open('index.html', 'r') as f:
    html = f.read()

# Change ul back to nav
html = html.replace('<ul class="nav-menu">', '<nav class="nav-menu">')
html = html.replace('</ul>', '</nav>')
# Remove <li> and </li>
html = html.replace('<li>', '')
html = html.replace('</li>', '')

with open('index.html', 'w') as f:
    f.write(html)
