# 📁 Schemas do Banco de Dados

Esta pasta contém os "planos de construção" do nosso banco de dados. 🏗️

## 🤔 O que é um Schema?

Pense em cada arquivo `.js` nesta pasta como a **planta baixa** de uma tabela no nosso banco de dados (PostgreSQL).

É aqui que definimos, através de código que gera strings de SQL, a estrutura exata de cada tabela:

-   **Colunas e Tipos:** Quais colunas a tabela terá (`id`, `name`, `created_at`, etc.) e quais os tipos de dados de cada uma (`TEXT`, `INTEGER`, `TIMESTAMP`).
-   **Chaves e Restrições:** Qual é a chave primária, se há valores únicos, etc.
-   **Relações:** Como as tabelas se conectam umas com as outras (apesar de que as chaves estrangeiras podem ser definidas aqui).

## ✨ Por que isso é importante?

Manter os schemas como arquivos de código nos permite:

-   ✅ **Versionar a Estrutura:** Podemos rastrear mudanças na estrutura do banco de dados usando o Git, assim como fazemos com o código da aplicação.
-   🔄 **Consistência:** Garante que o ambiente de desenvolvimento e o de produção tenham sempre a mesma estrutura de banco de dados.
-   🛠️ **Setup Fácil:** Facilita a criação do banco de dados do zero em uma nova máquina, executando os schemas na ordem correta.

---

> Em resumo: altere ou crie arquivos aqui quando você precisar **mudar a estrutura** de uma tabela, como adicionar uma nova coluna ou criar uma tabela inteiramente nova. ✨
