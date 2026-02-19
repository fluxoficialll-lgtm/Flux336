import { Project } from "ts-morph";
import fg from "fast-glob";
import path from "path";
import fs from "fs";

// ================= CONFIG =================

const ROOT = path.resolve(".");

const REPLACEMENTS: Record<string, string> = {
  "tipos": "types",
  "services": "ServiçosDoFrontend",
  "components": "componentes",
  "features": "Funcionalidades",
  "constants": "constants",
  "Funcionalidades": "features"
};

// extensões aceitas
const EXTENSIONS = [".ts", ".tsx"];

// ==========================================

// index de arquivos
const fileIndex = new Map<string, string>();

function normalize(p: string) {
  return p.replace(/\\/g, "/");
}

// cria mapa de arquivos
function buildFileIndex() {
  const files = fg.sync(["**/*.{ts,tsx}"], { dot: true, ignore: ["node_modules/**"] });

  files.forEach(file => {
    const full = path.resolve(file);
    const key = normalize(full).replace(normalize(ROOT) + "/", "");

    // remove extensão
    const withoutExt = key.replace(/\.(ts|tsx)$/, "");

    fileIndex.set(withoutExt, full);

    // index.ts → pasta
    if (withoutExt.endsWith("/index")) {
      const dir = withoutExt.replace(/\/index$/, "");
      fileIndex.set(dir, full);
    }
  });
}

// resolve caminho correto
function resolveImport(currentFile: string, importPath: string): string | null {
    // 1. Tenta resolver o caminho absoluto diretamente
    let absolutePath = resolvePath(currentFile, importPath);
    if (absolutePath && fileIndex.has(absolutePath)) {
        return makeRelative(currentFile, fileIndex.get(absolutePath)!);
    }

    // 2. Se não encontrou, aplica as substituições e tenta novamente
    const replacedImportPath = applyReplacements(importPath);
    if (replacedImportPath !== importPath) {
        absolutePath = resolvePath(currentFile, replacedImportPath);
        if (absolutePath && fileIndex.has(absolutePath)) {
            return makeRelative(currentFile, fileIndex.get(absolutePath)!);
        }
    }

    return null; // Não foi possível resolver
}

function resolvePath(currentFile: string, importPath: string): string | null {
    if (importPath.startsWith('@/')) {
        const nonAliased = importPath.substring(2);
        return nonAliased; // a chave do fileIndex não tem @/
    } 

    if (importPath.startsWith('.')) {
        const dir = path.dirname(currentFile);
        const absolute = path.resolve(dir, importPath);
        const relativeToRoot = normalize(absolute).replace(normalize(ROOT) + "/", "");

        // Tenta com e sem extensão, e com /index
        const attempts = [
            relativeToRoot,
            relativeToRoot + '.ts',
            relativeToRoot + '.tsx',
            relativeToRoot + '/index'
        ];

        for (const attempt of attempts) {
            if (fileIndex.has(attempt)) {
                 return attempt; // Retorna a chave do fileIndex
            }
        }
    }
    
    return null;
}

// cria caminho relativo limpo
function makeRelative(from: string, to: string) {
  let rel = path.relative(path.dirname(from), to);
  rel = normalize(rel);
  rel = rel.replace(/\.(ts|tsx)$/, "");
  if (!rel.startsWith(".")) rel = "./" + rel;

  // Remove /index se o caminho terminar com ele
  if (rel.endsWith('/index')) {
    rel = rel.substring(0, rel.length - 6);
  }

  return rel;
}

// aplica renomeações simples
function applyReplacements(importPath: string): string {
  let result = importPath;

  for (const oldPath in REPLACEMENTS) {
    const newPath = REPLACEMENTS[oldPath];
    result = result.replace(new RegExp(oldPath, "g"), newPath);
  }

  return result;
}

// ==========================================

function run() {
  buildFileIndex();

  const project = new Project({
    tsConfigFilePath: "tsconfig.json"
  });

  const files = project.getSourceFiles("**/*.{ts,tsx}");

  let fixedCount = 0;
  let errorCount = 0;

  files.forEach(file => {
    const filePath = file.getFilePath();

    file.getImportDeclarations().forEach(imp => {
      const original = imp.getModuleSpecifierValue();

      if (original.endsWith(".css")) {
        return;
      }

      const resolved = resolveImport(filePath, original);

      if (resolved && resolved !== original) {
        imp.setModuleSpecifier(resolved);
        fixedCount++;
        console.log(`FIX: ${original} → ${resolved} in ${filePath}`);
      } else if (!resolved) {
          const replaced = applyReplacements(original);
          const finalResolved = resolveImport(filePath, replaced);
          if(finalResolved && finalResolved !== original) {
            imp.setModuleSpecifier(finalResolved);
            fixedCount++;
            console.log(`FIX (fallback): ${original} → ${finalResolved} in ${filePath}`);
          } else {
            console.warn("ERRO:", original, "em", filePath);
            errorCount++;
          }
      }
    });
  });

  project.saveSync();

  console.log("\nRESULTADO:");
  console.log("Corrigidos:", fixedCount);
  console.log("Erros restantes:", errorCount);
}

run()
