# 🧑‍🔧 Repositórios do Banco de Dados

Esta pasta contém os "gerentes de dados" da nossa aplicação. 🗃️

## 🤔 O que é um Repositório?

Se os `schemas` são a **planta baixa** do banco de dados, os **repositórios** são os operadores especializados que sabem exatamente como buscar, guardar e gerenciar os dados nessas estruturas.

Eles atuam como uma camada de tradução, permitindo que o resto da nossa aplicação peça "me dê o usuário com id 5" sem precisar saber escrever SQL ou entender como a tabela `users` está organizada.

## ✨ Principais Responsabilidades

-   🔍 **Encapsular Consultas:** Todo o código SQL (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) vive aqui. O resto da aplicação não "fala" SQL diretamente.
-   🔄 **Mapear Dados:** Transforma os dados que vêm do banco (ex: `user_name`) para um formato que a nossa aplicação entende (ex: `userName`).
-   🤝 **Fornecer uma Interface Limpa:** Oferece métodos simples e claros para a aplicação interagir com o banco, como `findById()`, `findAll()`, `create()`, etc.

## ⭐ Por que isso é importante?

-   🧩 **Separação de Responsabilidades:** Mantém a lógica de negócio (o que a aplicação faz) separada da lógica de acesso a dados (como ela busca as informações).
-   🧪 **Facilita Testes:** Podemos facilmente simular ("mockar") um repositório para testar a aplicação sem precisar de um banco de dados real.
-   🔧 **Manutenção Simplificada:** Se precisarmos otimizar uma consulta ou até mesmo trocar de banco de dados no futuro, as mudanças ficam concentradas apenas nos repositórios.

---

> Em resumo: altere ou crie arquivos aqui quando você precisar **mudar como os dados são buscados ou manipulados**, mas não a estrutura da tabela em si. ✨
