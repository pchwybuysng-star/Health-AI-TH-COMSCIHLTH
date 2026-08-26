with open('Script.js', 'r') as f:
    text = f.read()

count = 0
for i, char in enumerate(text):
    if char == '{':
        count += 1
    elif char == '}':
        count -= 1
        if count < 0:
            print(f"Excess closing brace at index {i}")
            break
print("Final brace count:", count)
