with open('index.html', 'r') as f:
    html = f.read()
html = html.replace('</a>\n            </nav>', '</a>\n                </div>\n            </nav>')
with open('index.html', 'w') as f:
    f.write(html)
