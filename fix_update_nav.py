with open('update_nav.py', 'r') as f:
    code = f.read()
code = code.replace('</a>\n            </nav>"""', '</a>\n                </div>\n            </nav>"""')
with open('update_nav.py', 'w') as f:
    f.write(code)
