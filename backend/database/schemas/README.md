# Arquivos de Schema do Banco de Dados

Este diretório contém os arquivos de schema que definem a estrutura e as regras do nosso banco de dados. Eles são a "planta baixa" para todas as informações gerenciadas pela aplicação.

Os arquivos de schema possibilitam:

1.  **Definição de Tabelas:** Cada arquivo (ou exportação dentro dele) representa uma tabela no banco de dados, especificando suas colunas.

2.  **Tipagem de Dados:** Garantem que cada coluna armazene o tipo correto de dado (ex: `string`, `integer`, `boolean`, `timestamp`), prevenindo inconsistências.

3.  **Restrições e Validações:** Impõem regras essenciais como:
    *   Campos obrigatórios (`NOT NULL`).
    *   Valores padrão (`default value`).
    *   Valores únicos (`UNIQUE`), como para e-mails ou nomes de usuário.
    *   Limites de tamanho para textos.

4.  **Relacionamentos:** Estabelecem as conexões entre as tabelas. Por exemplo, definem que um `comentário` pertence a um `usuário` e a um `post` através de chaves estrangeiras (`foreign keys`).

5.  **Índices (Indexes):** Permitem a criação de índices em colunas frequentemente consultadas, o que acelera drasticamente a velocidade de busca e a performance geral da aplicação.

6.  **Fonte da Verdade para Migrações:** Servem como a referência principal para as *migrations* do banco de dados, permitindo que a estrutura do banco evolua de forma controlada e versionada.

Em suma, estes arquivos são a **verdade única** sobre a arquitetura dos dados, garantindo consistência, integridade e performance em toda a aplicação.
