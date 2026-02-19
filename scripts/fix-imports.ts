import { Project } from "ts-morph";
import fg from "fast-glob";
import path from "path";
import fs from "fs";

// ================= CONFIG =================

const ROOT = path.resolve("src");

const REPLACEMENTS: Record<string, string> = {
  "Componentizar": "ComponentsB"
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
  const files = fg.sync(["src/**/*.{ts,tsx}"]);

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
  if (!importPath.startsWith(".")) return null;

  const dir = path.dirname(currentFile);
  const absolute = path.resolve(dir, importPath);
  const relativeToRoot = normalize(absolute).replace(normalize(ROOT) + "/", "");

  // tenta direto
  if (fileIndex.has(relativeToRoot)) {
    return makeRelative(currentFile, fileIndex.get(relativeToRoot)!);
  }

  // tenta com extensões
  for (const ext of EXTENSIONS) {
    if (fileIndex.has(relativeToRoot + ext)) {
      return makeRelative(currentFile, fileIndex.get(relativeToRoot + ext)!);
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

  const files = project.getSourceFiles("src/**/*.{ts,tsx}");

  let fixedCount = 0;
  let errorCount = 0;

  files.forEach(file => {
    const filePath = file.getFilePath();

    file.getImportDeclarations().forEach(imp => {
      const original = imp.getModuleSpecifierValue();

      let updated = original;

      // 1. substituição direta
      updated = applyReplacements(updated);

      // 2. resolver relativo
      const resolved = resolveImport(filePath, updated);
      if (resolved) {
        updated = resolved;
      }

      // 3. aplicar mudança
      if (updated !== original) {
        imp.setModuleSpecifier(updated);
        fixedCount++;
        console.log("FIX:", original, "→", updated);
      }

      // 4. valida existência
      if (updated.startsWith(".")) {
        const testPath = path.resolve(path.dirname(filePath), updated);

        const exists =
          fs.existsSync(testPath + ".ts") ||
          fs.existsSync(testPath + ".tsx") ||
          fs.existsSync(path.join(testPath, "index.ts")) ||
          fs.existsSync(path.join(testPath, "index.tsx"));

        if (!exists) {
          console.warn("ERRO:", updated, "em", filePath);
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

run();