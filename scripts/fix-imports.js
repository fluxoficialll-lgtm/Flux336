"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts_morph_1 = require("ts-morph");
var fast_glob_1 = require("fast-glob");
var path_1 = require("path");
var fs_1 = require("fs");
// ================= CONFIG =================
var ROOT = path_1.default.resolve("src");
var REPLACEMENTS = {
    "Componentizar": "ComponentsB"
};
// extensões aceitas
var EXTENSIONS = [".ts", ".tsx"];
// ==========================================
// index de arquivos
var fileIndex = new Map();
function normalize(p) {
    return p.replace(/\\/g, "/");
}
// cria mapa de arquivos
function buildFileIndex() {
    var files = fast_glob_1.default.sync(["src/**/*.{ts,tsx}"]);
    files.forEach(function (file) {
        var full = path_1.default.resolve(file);
        var key = normalize(full).replace(normalize(ROOT) + "/", "");
        // remove extensão
        var withoutExt = key.replace(/\.(ts|tsx)$/, "");
        fileIndex.set(withoutExt, full);
        // index.ts → pasta
        if (withoutExt.endsWith("/index")) {
            var dir = withoutExt.replace(/\/index$/, "");
            fileIndex.set(dir, full);
        }
    });
}
// resolve caminho correto
function resolveImport(currentFile, importPath) {
    if (!importPath.startsWith("."))
        return null;
    var dir = path_1.default.dirname(currentFile);
    var absolute = path_1.default.resolve(dir, importPath);
    var relativeToRoot = normalize(absolute).replace(normalize(ROOT) + "/", "");
    // tenta direto
    if (fileIndex.has(relativeToRoot)) {
        return makeRelative(currentFile, fileIndex.get(relativeToRoot));
    }
    // tenta com extensões
    for (var _i = 0, EXTENSIONS_1 = EXTENSIONS; _i < EXTENSIONS_1.length; _i++) {
        var ext = EXTENSIONS_1[_i];
        if (fileIndex.has(relativeToRoot + ext)) {
            return makeRelative(currentFile, fileIndex.get(relativeToRoot + ext));
        }
    }
    return null;
}
// cria caminho relativo limpo
function makeRelative(from, to) {
    var rel = path_1.default.relative(path_1.default.dirname(from), to);
    rel = normalize(rel);
    rel = rel.replace(/\.(ts|tsx)$/, "");
    if (!rel.startsWith("."))
        rel = "./" + rel;
    return rel;
}
// aplica renomeações simples
function applyReplacements(importPath) {
    var result = importPath;
    for (var oldPath in REPLACEMENTS) {
        var newPath = REPLACEMENTS[oldPath];
        result = result.replace(new RegExp(oldPath, "g"), newPath);
    }
    return result;
}
// ==========================================
function run() {
    buildFileIndex();
    var project = new ts_morph_1.Project({
        tsConfigFilePath: "tsconfig.json"
    });
    var files = project.getSourceFiles("src/**/*.{ts,tsx}");
    var fixedCount = 0;
    var errorCount = 0;
    files.forEach(function (file) {
        var filePath = file.getFilePath();
        file.getImportDeclarations().forEach(function (imp) {
            var original = imp.getModuleSpecifierValue();
            var updated = original;
            // 1. substituição direta
            updated = applyReplacements(updated);
            // 2. resolver relativo
            var resolved = resolveImport(filePath, updated);
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
                var testPath = path_1.default.resolve(path_1.default.dirname(filePath), updated);
                var exists = fs_1.default.existsSync(testPath + ".ts") ||
                    fs_1.default.existsSync(testPath + ".tsx") ||
                    fs_1.default.existsSync(path_1.default.join(testPath, "index.ts")) ||
                    fs_1.default.existsSync(path_1.default.join(testPath, "index.tsx"));
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
