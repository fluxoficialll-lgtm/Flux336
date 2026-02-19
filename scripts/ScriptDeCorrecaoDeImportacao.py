
import os
import re

# Mapeamento de aliases para caminhos (do tsconfig.json)
ALIASES = {
    "@/Paginas/": "Paginas/",
    "@/ServiçosDoFrontend/": "ServiçosDoFrontend/",
    "@/componentes/": "componentes/",
    "@/hooks/": "hooks/",
    "@/tipos/": "types/",
    "@/database/": "database/",
    "@/utils/": "utils/",
    "@/": ""
}

# Diretório raiz do projeto
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

def get_files_to_process():
    """Encontra todos os arquivos .ts e .tsx no projeto."""
    files_to_process = []
    for root, _, files in os.walk(ROOT_DIR):
        if "node_modules" in root:
            continue
        for file in files:
            if file.endswith((".ts", ".tsx")):
                files_to_process.append(os.path.join(root, file))
    return files_to_process

def fix_imports_in_file(file_path):
    """Corrige as importações relativas em um único arquivo."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Erro ao ler {file_path}: {e}")
        return

    # Regex para encontrar importações relativas
    import_regex = re.compile(r"from\s+['\"]((?:\.\.\/)+.*?)(?:\.tsx?)?['\"]")
    
    updated_content = content
    found_and_fixed = False
    
    lines = content.split('\n')
    updated_lines = []

    for line in lines:
        match = import_regex.search(line)
        if match:
            original_path = match.group(1)
            
            # Resolve o caminho absoluto do import
            absolute_import_path = os.path.normpath(os.path.join(os.path.dirname(file_path), original_path))
            relative_to_root = os.path.relpath(absolute_import_path, ROOT_DIR)

            # Encontra o alias correspondente
            for alias, alias_path in ALIASES.items():
                # Garante que o alias_path não seja uma string vazia para evitar falsos positivos
                if alias_path and relative_to_root.startswith(alias_path):
                    new_import_path = os.path.join(alias, os.path.relpath(relative_to_root, alias_path)).replace("\\\\", "/")
                    # Remove a extensão .ts ou .tsx do final, se houver
                    if new_import_path.endswith('.ts'):
                        new_import_path = new_import_path[:-3]
                    if new_import_path.endswith('.tsx'):
                        new_import_path = new_import_path[:-4]

                    print(f"Corrigido em {os.path.basename(file_path)}: '{original_path}' -> '{new_import_path}'")
                    line = line.replace(original_path, new_import_path)
                    found_and_fixed = True
                    break # Para no primeiro alias correspondente
        updated_lines.append(line)

    if found_and_fixed:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(updated_lines))
        except Exception as e:
            print(f"Erro ao escrever em {file_path}: {e}")

def main():
    """Função principal para executar o script."""
    files = get_files_to_process()
    print(f"Analisando {len(files)} arquivos...")
    for file_path in files:
        fix_imports_in_file(file_path)
    print("\\nCorreção de imports concluída!")

if __name__ == "__main__":
    main()
