with open('Script.js', 'r') as f:
    js = f.read()

# Currently it looks like this at the end of PDF logic:
#         });
#     }
# });
# 
# 
# // --- Gemini API Key Logic ---

js = js.replace("        });\n    }\n});\n\n\n// --- Gemini", "        });\n    });\n});\n\n\n// --- Gemini")

with open('Script.js', 'w') as f:
    f.write(js)
    
