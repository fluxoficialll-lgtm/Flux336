"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts_morph_1 = require("ts-morph");
const fast_glob_1 = __importDefault(require("fast-glob"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function normalizePath(p) {
    return p.replace(/\\/g, "/");
}
function cleanFileSyntax(filePath) {
    let fileContent = fs_1.default.readFileSync(filePath, "utf8");
    const originalContent = fileContent;
    // Corrige o erro específico: from '../types"' -> from '../types'
    fileContent = fileContent.replace(/(from\s+[\'\"][^\'\"]*)(\")([\'\"];)/g, "$1$3");
    // Adiciona extensões .js para importações relativas que podem estar faltando
    // Ex: import { Component } from "./Component" -> import { Component } from "./Component.js"
    // Garante que não afeta importações de pacotes ou com extensões existentes
    fileContent = fileContent.replace(/(import(?:[\"\'\\s]*(?:[\\w*{}\\n\\r\\t, ]+)from\\s*)?)([\"\'])([^.\"\'\\s][^\"\'\\n\\r\\t]*?)([\"\'])/g, (match, pre, quote, modulePath) => {
        if (modulePath.startsWith('.') && !modulePath.match(/\\.(js|ts|tsx|json|css|scss|less|png|jpg|jpeg|gif|svg)$/)) {
            const absolutePath = path_1.default.resolve(path_1.default.dirname(filePath), modulePath);
            if (fs_1.default.existsSync(absolutePath + '.ts')) {
                return `${pre}${quote}${modulePath}.ts${quote}`;
            }
            if (fs_1.default.existsSync(absolutePath + '.tsx')) {
                return `${pre}${quote}${modulePath}.tsx${quote}`;
            }
            if (fs_1.default.existsSync(absolutePath + '.js')) {
                return `${pre}${quote}${modulePath}.js${quote}`;
            }
        }
        return match;
    });
    if (originalContent !== fileContent) {
        console.log(`SYNTAX FIX: Corrigida sintaxe de import em ${filePath}`);
        fs_1.default.writeFileSync(filePath, fileContent, "utf8");
        return true;
    }
    return false;
}
function rewriteToAliases() {
    const tsconfigPath = path_1.default.resolve("tsconfig.json");
    let tsconfigText;
    try {
        tsconfigText = fs_1.default.readFileSync(tsconfigPath, "utf-8");
    }
    catch (e) {
        console.error(`ERRO FATAL: Não foi possível ler o arquivo tsconfig.json em ${tsconfigPath}`);
        return;
    }
    // Remove comentários do JSON antes de analisar
    const tsconfigWithoutComments = tsconfigText.replace(/\/\*[\\s\\S]*?\*\/|\/\/.*$/gm, '');
    let tsconfig;
    try {
        tsconfig = JSON.parse(tsconfigWithoutComments);
    }
    catch (e) {
        console.error("ERRO FATAL: Falha ao analisar o arquivo tsconfig.json. Verifique se ele é um JSON válido.", e);
        return;
    }
    const baseUrl = path_1.default.resolve(tsconfig.compilerOptions.baseUrl || "."); // Fallback for baseUrl
    const paths = tsconfig.compilerOptions.paths || {};
    const aliases = Object.entries(paths).map(([alias, aliasPaths]) => ({
        prefix: alias.replace("/*", ""),
        path: normalizePath(path_1.default.resolve(baseUrl, aliasPaths[0].replace("/*", ""))),
    })).sort((a, b) => b.path.length - a.path.length);
    const project = new ts_morph_1.Project({ tsConfigFilePath: tsconfigPath });
    let rewrittenCount = 0;
    project.getSourceFiles().forEach(sourceFile => {
        const fileDir = path_1.default.dirname(sourceFile.getFilePath());
        sourceFile.getImportDeclarations().forEach(importDeclaration => {
            const moduleSpecifier = importDeclaration.getModuleSpecifierValue();
            if (moduleSpecifier.startsWith(".")) { // É um import relativo
                const absolutePathToImport = normalizePath(path_1.default.resolve(fileDir, moduleSpecifier));
                for (const alias of aliases) {
                    if (absolutePathToImport.startsWith(alias.path)) {
                        let newSpecifier = normalizePath(path_1.default.join(alias.prefix, absolutePathToImport.substring(alias.path.length)));
                        // Remove extensões se presentes para alinhar com o uso de aliases
                        newSpecifier = newSpecifier.replace(/\\.(ts|tsx|js)$/, '');
                        if (newSpecifier !== moduleSpecifier) {
                            console.log(`ALIAS FIX: Em ${sourceFile.getFilePath()}: '${moduleSpecifier}' -> '${newSpecifier}'`);
                            importDeclaration.setModuleSpecifier(newSpecifier);
                            rewrittenCount++;
                            break;
                        }
                    }
                }
            }
        });
    });
    if (rewrittenCount > 0) {
        console.log(`Reescrevendo ${rewrittenCount} imports para atalhos...`);
        project.saveSync();
    }
    console.log(`\nConversão para atalhos concluída. ${rewrittenCount} imports reescritos.`);
}
function run() {
    console.log("--- INICIANDO ETAPA 1: CORREÇÃO DE ERROS DE SINTAXE ---");
    const filePaths = fast_glob_1.default.sync(["**/*.ts", "**/*.tsx"], { ignore: ["node_modules/**", "dist/**"] });
    let totalFilesFixed = 0;
    filePaths.forEach(filePath => {
        if (cleanFileSyntax(filePath)) {
            totalFilesFixed++;
        }
    });
    console.log(`--- ETAPA 1 CONCLUÍDA: ${totalFilesFixed} arquivos com sintaxe corrigida ---`);
    console.log("\n--- INICIANDO ETAPA 2: REESCREVENDO IMPORTS PARA ATALHOS ---");
    rewriteToAliases();
    console.log("--- ETAPA 2 CONCLUÍDA: REESCRITA PARA ATALHOS ---");
    console.log("\nTodas as correções foram aplicadas. Execute 'npx tsc --noEmit' para verificar o resultado final.");
}
run();
