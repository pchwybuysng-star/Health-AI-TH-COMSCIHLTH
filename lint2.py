with open('Script.js', 'r') as f:
    text = f.read()

count = 0
for line_no, line in enumerate(text.split('\n')):
    for char in line:
        if char == '{':
            count += 1
        elif char == '}':
            count -= 1
            if count < 0:
                print(f"Excess closing brace at line {line_no+1}: {line}")
                break
    if count < 0:
        break
print("Done, brace count:", count)
