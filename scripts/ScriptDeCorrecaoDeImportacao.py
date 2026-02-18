
import os
import re
import json
import sys

def find_correct_path(search_base_name, all_files):
    candidates = []
    for f in all_files:
        f_normalized = os.path.normpath(f)
        if (
            f_normalized.endswith(os.path.normpath(f"{search_base_name}.ts")) or
            f_normalized.endswith(os.path.normpath(f"{search_base_name}.tsx")) or
            f_normalized.endswith(os.path.normpath(f"{search_base_name}.js")) or
            f_normalized.endswith(os.path.normpath(f"{search_base_name}.jsx")) or
            (os.path.basename(f_normalized).startswith("index") and os.path.dirname(f_normalized).endswith(search_base_name))
        ):
            candidates.append(f)
            
    if len(candidates) == 1:
        return candidates[0]

    if candidates:
        for c in candidates:
            if os.path.basename(os.path.splitext(c)[0]) == search_base_name:
                return c

    return None

def fix_imports(broken_imports_raw, all_files):
    print("Starting import fixing process...")
    fixed_files = set()

    # Regex to find broken imports in the build output
    # Example line: Could not resolve "../services/reelsService" from "Paginas/Reels.tsx"
    pattern = re.compile(r'Could not resolve "(.+?)" from "(.+?)"')

    all_files_normalized = [os.path.normpath(f) for f in all_files]

    for line in broken_imports_raw.strip().split("\n"):
        match = pattern.search(line.strip())
        if not match:
            continue

        old_import, file_path = match.groups()
        file_path = os.path.normpath(file_path.strip())
        old_import = old_import.strip()

        try:
            search_base_name = os.path.basename(old_import)

            correct_target_path = find_correct_path(search_base_name, all_files_normalized)

            if not correct_target_path:
                print(f"  [WARNING] Could not find a unique candidate for import '{search_base_name}' in {file_path}")
                continue

            source_dir = os.path.dirname(file_path)
            # Ensure source_dir is not empty, which means file is in root
            if not source_dir:
                source_dir = '.'
                
            new_relative_path = os.path.relpath(correct_target_path, source_dir)
            
            new_import_path = os.path.splitext(new_relative_path)[0].replace('\\', '/')
            if not new_import_path.startswith('.'):
                 new_import_path = './' + new_import_path

            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Regex to find the import statement in the file content
            # It will match something like: from '../services/reelsService'
            import_statement_regex = re.compile(f'(from\s+)([\'"]){re.escape(old_import)}\2')

            if import_statement_regex.search(content):
                new_content = import_statement_regex.sub(f'\\g<1>\\g<2>{new_import_path}\\g<2>', content)
                if content != new_content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"  [SUCCESS] Fixed import in {file_path}: '{old_import}' -> '{new_import_path}'")
                    fixed_files.add(file_path)
            else:
                print(f"  [WARNING] Could not find import statement for '{old_import}' in {file_path}")

        except Exception as e:
            print(f"  [ERROR] Failed to fix import in {file_path}: {e}")

    print(f"\nProcess finished. {len(fixed_files)} files were modified.")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python ScriptDeCorrecaoDeImportacao.py <build_output_string> <all_files_json_string>")
        sys.exit(1)

    build_output = sys.argv[1]
    all_files_json = sys.argv[2]
    
    all_files = json.loads(all_files_json)
    
    fix_imports(build_output, all_files)
