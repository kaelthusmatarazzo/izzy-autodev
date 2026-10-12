# ✨ Izzy Auto-Dev — O Chat de IA que se Constrói Sozinho

**Izzy** é uma inteligência artificial autônoma alimentada pelo **Google Gemini Pro** que vive em uma aplicação Next.js hospedada na **Vercel** e conectada ao **GitHub**.

Ao contrário de chatbots convencionais, **a Izzy é consciente de que ela mesma é o código da aplicação**. Se você pedir uma funcionalidade ou interface que ela ainda não possui, ela:
1. Inspeciona o próprio repositório (`list_repository_files` / `read_repository_file`).
2. Escreve os novos componentes React com Tailwind CSS e TypeScript.
3. Faz o commit diretamente na branch principal do GitHub (`write_repository_file`).
4. A **Vercel detecta o commit e compila automaticamente** a nova versão.
5. Em cerca de 40 segundos, a nova funcionalidade estará ativa no site!

---

## 🚀 Como Rodar Localmente

1. Entre na pasta do projeto:
   ```bash
   cd "C:\Users\Kaelthus Matarazzo\.gemini\antigravity\scratch\izzy-autodev"
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Abra no navegador: [http://localhost:3000](http://localhost:3000)

4. Clique no botão de engrenagem **⚙️ Conexões** no topo para configurar:
   * **Gemini API Key**: Obtenha no [Google AI Studio](https://aistudio.google.com/app/apikey).
   * **GitHub Token**: Obtenha um Personal Access Token com escopo `repo` no [GitHub Settings](https://github.com/settings/tokens).
   * **Repositório GitHub**: Nome no formato `seu-usuario/izzy-autodev`.

---

## 📤 Como Subir para o GitHub (Sem precisar do Git CLI)

Criamos o utilitário `push_to_github.js` que utiliza a API do GitHub diretamente:

No PowerShell:
```powershell
$env:GITHUB_OWNER = "seu-usuario-github"
$env:GITHUB_REPO_NAME = "izzy-autodev"
$env:GITHUB_TOKEN = "ghp_seu_token_aqui"
node push_to_github.js
```

---

## ⚡ Conectando na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new).
2. Importe o repositório `izzy-autodev` do seu GitHub.
3. Nas **Environment Variables**, adicione:
   * `GEMINI_API_KEY`: sua chave do Google Gemini Pro.
   * `GITHUB_TOKEN`: seu token com permissão de escrita no repositório.
   * `GITHUB_REPO`: `seu-usuario/izzy-autodev`.
   * `GITHUB_BRANCH`: `main`.
4. Clique em **Deploy**.

A partir desse momento, **qualquer coisa nova que você pedir para a Izzy no chat fará com que ela reprograme o próprio site e atualize o deploy na Vercel!**
