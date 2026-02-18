
import os
import re

def check_imports(directory):
    bad_imports = []
    
    for root, dirs, files in os.walk(directory):
        if "node_modules" in dirs:
            dirs.remove("node_modules")

        for file in files:
            if file.endswith((".ts", ".tsx")):
                file_path = os.path.join(root, file)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                except UnicodeDecodeError:
                    print(f"Skipping file due to encoding error: {file_path}")
                    continue

                # Updated regex to handle from "..." and from \'...\'
                import_statements = re.findall(r'from\s+[\'"](.+?)[\'"]', content)
                
                for imp in import_statements:
                    if imp.startswith("."):
                        imported_file_path = os.path.normpath(os.path.join(os.path.dirname(file_path), imp))
                        
                        possible_extensions = [".ts", ".tsx", "/index.ts", "/index.tsx", ".js", ".jsx"]
                        
                        found = False
                        
                        # Case 1: Direct path to a file
                        if any(imported_file_path.endswith(ext) for ext in possible_extensions):
                            if os.path.exists(imported_file_path):
                                found = True
                        
                        # Case 2: Path to a directory (check for index file)
                        elif os.path.isdir(imported_file_path):
                            for ext in possible_extensions:
                                if os.path.exists(os.path.join(imported_file_path, "index" + ext)):
                                    found = True
                                    break
                        
                        # Case 3: Path without extension
                        else:
                            for ext in possible_extensions:
                                if os.path.exists(imported_file_path + ext):
                                    found = True
                                    break
                        
                        if not found:
                            bad_imports.append({
                                "file": file_path,
                                "import": imp,
                                "resolved_path": imported_file_path
                            })

    return bad_imports

if __name__ == "__main__":
    project_directory = "." 
    broken_imports = check_imports(project_directory)
    
    if broken_imports:
        print("Broken imports found:")
        for item in broken_imports:
            print(f"  File: {item['file']}, Import: {item['import']}, Expected Path: {item['resolved_path']}")
    else:
        print("No broken imports found.")

