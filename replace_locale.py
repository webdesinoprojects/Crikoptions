import os

files_changed = 0
for root, _, files in os.walk('Frontend/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content.replace('.toLocaleString()', '.toLocaleString("en-IN")')
            new_content = new_content.replace('.toLocaleString(undefined,', '.toLocaleString("en-IN",')
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                files_changed += 1
                print(f'Changed {path}')

print(f'Total files changed: {files_changed}')
