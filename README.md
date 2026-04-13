# UX Research · Self-Checkout

Ferramenta de pesquisa presencial para coleta e análise de dados de usabilidade em terminais self-checkout.

---

## 🚀 Como publicar no GitHub Pages

### 1. Criar o repositório

1. Acesse [github.com](https://github.com) e faça login
2. Clique em **New repository** (botão verde, canto superior direito)
3. Preencha:
   - **Repository name:** `ux-selfcheckout` (ou o nome que preferir)
   - **Visibility:** Private *(recomendado — dados de pesquisa)*
   - Marque **Add a README file**
4. Clique em **Create repository**

---

### 2. Fazer upload dos arquivos

1. Dentro do repositório criado, clique em **Add file → Upload files**
2. Arraste os três arquivos:
   - `index.html` ← este é o app principal
   - `404.html`
   - `README.md`
3. Clique em **Commit changes**

> ⚠️ O arquivo do app **deve se chamar `index.html`** para funcionar no GitHub Pages.

---

### 3. Ativar o GitHub Pages

1. No repositório, vá em **Settings** (aba no topo)
2. No menu lateral esquerdo, clique em **Pages**
3. Em **Source**, selecione **Deploy from a branch**
4. Em **Branch**, selecione **main** e pasta **/ (root)**
5. Clique em **Save**
6. Aguarde ~1 minuto e a URL aparecerá no topo da página:
   ```
   https://seu-usuario.github.io/ux-selfcheckout/
   ```

---

### 4. Configurar o Google Sheets (backend)

Faça isso **uma única vez**. Todos os dispositivos usarão a mesma URL.

#### 4a. Criar a planilha

1. Acesse [sheets.google.com](https://sheets.google.com)
2. Crie uma planilha em branco
3. Renomeie para **UX Self-Checkout**

#### 4b. Publicar o script

1. Na planilha, clique em **Extensões → Apps Script**
2. Apague o código padrão e cole o conteúdo do arquivo `Code.gs`
3. Salve com **Ctrl+S** e dê um nome ao projeto (ex: `UX Research API`)
4. Clique em **Implantar → Nova implantação**
5. Configure:
   - Tipo: **App da Web**
   - Executar como: **Eu mesmo**
   - Quem pode acessar: **Qualquer pessoa**
6. Clique em **Implantar**
7. **Copie a URL** gerada (começa com `https://script.google.com/macros/s/...`)

#### 4c. Conectar no app

1. Abra a URL do GitHub Pages em qualquer dispositivo
2. Vá na aba **Dashboard**
3. Clique em **⚙ Reconfigurar** na barra de sincronização
4. Cole a URL do Apps Script
5. Clique em **Salvar e testar conexão**

> Faça isso **em cada dispositivo, apenas uma vez**. A URL fica salva no navegador.

---

## 📱 Distribuição para a equipe

Compartilhe apenas a URL do GitHub Pages:

```
https://seu-usuario.github.io/ux-selfcheckout/
```

Cada pesquisador:
1. Abre a URL no celular/tablet
2. Configura a URL do Sheets uma vez
3. Começa a coletar

**Dica:** No celular, adicione à tela inicial:
- **iPhone:** Safari → compartilhar → *Adicionar à Tela de Início*
- **Android:** Chrome → menu (⋮) → *Adicionar à tela inicial*

A ferramenta vira um ícone como um app nativo.

---

## 🔄 Como atualizar o app

1. No repositório do GitHub, clique no arquivo `index.html`
2. Clique no ícone de lápis ✏️ (Edit)
3. Substitua o conteúdo pelo novo arquivo
4. Clique em **Commit changes**
5. Em ~1 minuto, todos os dispositivos já têm a versão nova

---

## 🔒 Segurança

- O repositório **Private** garante que só você e quem você convidar veem o código
- Os dados ficam na sua planilha do Google, não em servidores de terceiros
- A URL do Sheets fica salva localmente em cada dispositivo (não vai para o GitHub)

---

## 📁 Estrutura dos arquivos

```
ux-selfcheckout/
├── index.html   ← app completo (formulário + dashboard)
├── 404.html     ← redirecionamento de rotas
├── Code.gs      ← script do Google Apps Script (referência)
└── README.md    ← este guia
```

> `Code.gs` não precisa estar no repositório para funcionar —
> ele roda dentro do Google Apps Script. Está aqui só como backup.
