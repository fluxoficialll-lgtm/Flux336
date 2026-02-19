
import { Project, ts } from "ts-morph";
import fg from "fast-glob";
import path from "path";
import fs from "fs";

function normalizePath(p: string) {
  return p.replace(/\\/g, "/");
}

function cleanFileSyntax(filePath: string): boolean {
  let fileContent = fs.readFileSync(filePath, "utf8");
  const originalContent = fileContent;

  // Corrige o erro específico: from '../types"' -> from '../types'
  fileContent = fileContent.replace(/(from\s+[\'\"][^\'\"]*)(\")([\'\"];)/g, "$1$3");

  // Adiciona extensões .js para importações relativas que podem estar faltando
  // Ex: import { Component } from "./Component" -> import { Component } from "./Component.js"
  // Garante que não afeta importações de pacotes ou com extensões existentes
  fileContent = fileContent.replace(/(import(?:[\"\'\\s]*(?:[\\w*{}\\n\\r\\t, ]+)from\\s*)?)([\"\'])([^.\"\'\\s][^\"\'\\n\\r\\t]*?)([\"\'])/g, (match, pre, quote, modulePath) => {
    if (modulePath.startsWith('.') && !modulePath.match(/\\.(js|ts|tsx|json|css|scss|less|png|jpg|jpeg|gif|svg)$/)) {
      const absolutePath = path.resolve(path.dirname(filePath), modulePath);
      if (fs.existsSync(absolutePath + '.ts')) {
        return `${pre}${quote}${modulePath}.ts${quote}`;
      }
      if (fs.existsSync(absolutePath + '.tsx')) {
        return `${pre}${quote}${modulePath}.tsx${quote}`;
      }
      if (fs.existsSync(absolutePath + '.js')) {
        return `${pre}${quote}${modulePath}.js${quote}`;
      }
    }
    return match;
  });

  if (originalContent !== fileContent) {
    console.log(`SYNTAX FIX: Corrigida sintaxe de import em ${filePath}`);
    fs.writeFileSync(filePath, fileContent, "utf8");
    return true;
  }
  return false;
}

function rewriteToAliases() {
  const tsconfigPath = path.resolve("tsconfig.json");
  let tsconfigText;
  try {
      tsconfigText = fs.readFileSync(tsconfigPath, "utf-8");
  } catch (e) {
      console.error(`ERRO FATAL: Não foi possível ler o arquivo tsconfig.json em ${tsconfigPath}`);
      return;
  }

  // Remove comentários do JSON antes de analisar
  const tsconfigWithoutComments = tsconfigText.replace(/\/\*[\\s\\S]*?\*\/|\/\/.*$/gm, '');
  let tsconfig;
  try {
      tsconfig = JSON.parse(tsconfigWithoutComments);
  } catch (e) {
      console.error("ERRO FATAL: Falha ao analisar o arquivo tsconfig.json. Verifique se ele é um JSON válido.", e);
      return;
  }

  const baseUrl = path.resolve(tsconfig.compilerOptions.baseUrl || "."); // Fallback for baseUrl
  const paths = tsconfig.compilerOptions.paths || {};
  
  const aliases = Object.entries(paths).map(([alias, aliasPaths]) => ({
    prefix: alias.replace("/*", ""),
    path: normalizePath(path.resolve(baseUrl, (aliasPaths as string[])[0].replace("/*", ""))),
  })).sort((a, b) => b.path.length - a.path.length);

  const project = new Project({ tsConfigFilePath: tsconfigPath });

  let rewrittenCount = 0;

  project.getSourceFiles().forEach(sourceFile => {
    const fileDir = path.dirname(sourceFile.getFilePath());

    sourceFile.getImportDeclarations().forEach(importDeclaration => {
      const moduleSpecifier = importDeclaration.getModuleSpecifierValue();

      if (moduleSpecifier.startsWith(".")) { // É um import relativo
        const absolutePathToImport = normalizePath(path.resolve(fileDir, moduleSpecifier));

        for (const alias of aliases) {
          if (absolutePathToImport.startsWith(alias.path)) {
            let newSpecifier = normalizePath(path.join(alias.prefix, absolutePathToImport.substring(alias.path.length)));
            
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
  const filePaths = fg.sync(["**/*.ts", "**/*.tsx"], { ignore: ["node_modules/**", "dist/**"] });
  let totalFilesFixed = 0;
  filePaths.forEach(filePath => {
      if(cleanFileSyntax(filePath)){
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
