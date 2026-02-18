<<<<<<< HEAD

<div align="center">
<img width="1200" height="475" alt="Flux Platform" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Flux Platform (Scalable Architecture)

Aplicação Full-Stack pronta para escala Enterprise (100k+ usuários), utilizando React (Frontend) e Node.js Cluster (Backend).

---

## 🌍 Guia de Deploy (Colocar no Ar)

Sua aplicação está pronta em código, mas precisa de **Infraestrutura** para rodar publicamente.

### 1. Configuração de Variáveis (.env)
O sistema **não funcionará** sem as chaves de segurança.
1. Crie um arquivo chamado `.env` na raiz do projeto (no seu servidor).
2. Copie o conteúdo do arquivo `.env.example` e preencha com seus dados reais.
   - **Banco de Dados**: Use serviços como Supabase, NeonDB ou instale o Postgres no seu VPS.
   - **Storage**: Crie um Bucket no AWS S3 ou Cloudflare R2 para salvar as fotos.
   - **Email**: Use um serviço SMTP (SendGrid, Resend, Amazon SES) para os emails de cadastro.

### 2. Onde Hospedar?
A arquitetura é monolítica (Frontend servido pelo Backend), o que facilita o deploy em um único serviço.

**Opção A: Render.com (Mais Fácil)**
1. Crie um novo **Web Service**.
2. Conecte seu repositório GitHub.
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `npm start`
5. Em "Environment Variables", adicione todas as chaves do seu `.env`.

**Opção B: VPS / DigitalOcean / AWS EC2 (Mais Barato para Escala)**
1. Instale Node.js 20+, Docker e PM2.
2. Clone o repositório.
3. Crie o arquivo `.env` com suas chaves reais.
4. Instale e compile:
   ```bash
   npm install
   npm run build
   ```
5. Inicie com PM2 (Cluster Mode):
   ```bash
   pm2 start server.js --name "flux-platform" -i max
   ```

---

## 📱 Guia: Transformar em APK (Android)

Para gerar o aplicativo Android instalável, siga os passos abaixo. Você precisará ter o **Android Studio** instalado no seu computador.

### 1. Preparação
Instale as dependências do projeto e do Capacitor:
```bash
npm install
```

### 2. Inicialização do Ambiente Mobile
Execute este comando apenas na primeira vez para criar a pasta `android`:
```bash
npm run mobile:android
```

### ⚠️ 3. Sincronizar Código para Produção (IMPORTANTE)
O APK precisa saber onde seu site está hospedado para fazer login e buscar dados.
Substitua `https://seu-site-oficial.com` pelo endereço real do seu backend (passo 2 acima) antes de rodar:

```bash
# Linux/Mac
VITE_API_BASE_URL=https://seu-site-oficial.com npm run build && npx cap sync

# Windows (PowerShell)
$env:VITE_API_BASE_URL="https://seu-site-oficial.com"; npm run build; npx cap sync
```

### 4. Gerar o APK
Abra o Android Studio através do comando:
```bash
npm run mobile:open
```
1. No Android Studio, aguarde o Gradle sincronizar.
2. Vá em **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
3. O arquivo `.apk` será gerado na pasta de saída (geralmente `android/app/build/outputs/apk/debug/`).

---

## ⚡ Guia Rápido: Como Rodar Localmente (Dev)

### 1. Instalação
Abra o terminal na pasta do projeto e instale as dependências:
```bash
npm install
```

### 2. Escolha o Modo de Uso

#### A) Modo Produção Local (Recomendado para testes reais)
Isso compila o React e inicia o servidor Node.js real. É exatamente assim que rodará no servidor.
```bash
npm run test:public
```
*Acesse: http://localhost:3000*

#### B) Infraestrutura Completa (Docker)
Se você quiser ligar os bancos de dados reais (Postgres, ScyllaDB, Redis) para testar a capacidade de escala:
```bash
npm run db:up
```
*O sistema detectará automaticamente que os bancos estão online.*

---

## 🔧 Estrutura de Pastas

- `/src`: Código fonte do React (Frontend).
- `/server.js`: Servidor Node.js (API Gateway + Arquivos Estáticos).
- `/backend`: Lógica de conexão com bancos de dados.
- `/services`: Lógica de negócios compartilhada.
=======
# Flux336
>>>>>>> c092a90ca8354c113271bc38274281c2cd35fd5c
