import re

with open('Script.js', 'r') as f:
    js = f.read()

replacement = r"""
                chatBody.appendChild(aiMsg);
                chatBody.scrollTop = chatBody.scrollHeight;

                // --- 3. Voice AI (Speech Synthesis) ---
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const plainText = aiMsg.textContent;
                    const utterance = new SpeechSynthesisUtterance(plainText);
                    utterance.lang = 'th-TH';
                    utterance.rate = 1.15;
                    utterance.pitch = 1.1;
                    window.speechSynthesis.speak(utterance);
                }
"""

pattern = re.compile(r'chatBody\.appendChild\(aiMsg\);\s*chatBody\.scrollTop = chatBody\.scrollHeight;')
new_js = pattern.sub(replacement.replace('\\', '\\\\'), js)

with open('Script.js', 'w') as f:
    f.write(new_js)
    
print("Added Voice AI!")
