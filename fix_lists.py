import re
with open('index.html', 'r') as f:
    html = f.read()

# Fix </ul>
html = html.replace('</nav>\n                        </div>', '</ul>\n                        </div>')

# Wrap pairs in <li>
def wrap_li(match):
    return '<li>\n' + match.group(1) + '\n</li>'

html = re.sub(r'(\s*<div class="action-icon">.*?</div>\s*<div class="action-text">.*?</div>\s*)', r'<li>\1</li>', html, flags=re.DOTALL)

with open('index.html', 'w') as f:
    f.write(html)
