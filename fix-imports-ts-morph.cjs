const { Project } = require("ts-morph");

async function main() {
    const project = new Project();
    project.addSourceFilesAtPaths("**/*.{ts,tsx}");

    const sourceFiles = project.getSourceFiles();

    const illegalImports = [
        '../tipos/user.types',
        './mocks/marketplaceService',
        './mocks/paypalService',
        './mocks/postService',
        './mocks/reelsService',
        './mocks/screenService',
        './mocks/stripeService',
    ];

    for (const sourceFile of sourceFiles) {
        const importDeclarations = sourceFile.getImportDeclarations();
        for (const importDeclaration of importDeclarations) {
            const moduleSpecifier = importDeclaration.getModuleSpecifierValue();
            if (illegalImports.includes(moduleSpecifier)) {
                console.log(`Found illegal import in ${sourceFile.getFilePath()}: ${moduleSpecifier}`);
                importDeclaration.setModuleSpecifier(`'${moduleSpecifier}'`);
            }
        }
    }

    await project.save();
    console.log('Done.');
}

main();