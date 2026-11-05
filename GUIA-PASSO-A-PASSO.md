# MD Bot | Guia passo a passo completo

Este guia explica **tudo** sobre o site: o que ele tem, o que você precisa configurar manualmente, como colocar no ar
no **Netlify** (passo a passo) e como mudar de hospedagem sem alterar código.

---

## 1. O que vem no pacote

| Recurso | Como funciona |
|---|---|
| Site completo | Pasta `public/` (páginas, estilos, scripts, imagens do mascote) |
| Tela de carregamento + vídeo de abertura | Após o carregamento, o vídeo `public/video/intro.mp4` toca em tela cheia, sozinho, com botão **Pular vídeo** |
| Conversa com o mascote | Pergunta o nome e leva a pessoa para a seção que ela quer |
| Popup de notícias | Aparece depois da conversa, centralizado. Notícias são criadas no painel |
| Lista de acesso (Quero acesso) | Formulário com proteção anti-robô. Os cadastros ficam salvos no servidor |
| Painel administrativo | `seusite.com/lista` (login único). Inscritos, notícias, configurações do site e segurança |
| API | `/api/...` (feita para funcionar igual no Netlify e em servidores Node) |

Estrutura:

```
md-bot-site/
  public/                 <- o site (o que o visitante vê)
    index.html            textos e seções
    lista.html            painel administrativo
    css/ style.css extras.css lista.css
    js/  config.js        <- configuração rápida
         app.js           comportamento do site (FAQ, passos, chat...)
         extras.js        vídeo, notícias, anti-robô, configurações do painel
         lista.js         painel
    img/                  imagens do mascote (substitua mantendo o nome)
    video/intro.mp4       vídeo de abertura
  lib/                    cérebro da API (core.js, storage.js) - não precisa mexer
  netlify/functions/api.mjs   ligação da API com o Netlify - não precisa mexer
  netlify.toml            configuração do Netlify (pronta)
  server.js               servidor Node (para outras hospedagens)
  tools/                  geradores de senha e de 2FA
  .env.example            modelo de variáveis (para hospedagem Node)
```

---

## 2. Checklist: o que VOCÊ precisa configurar manualmente

1. [ ] Criar conta no **GitHub** e no **Netlify** (gratuitas).
2. [ ] Enviar o projeto para um repositório **privado** do GitHub (seção 3).
3. [ ] Cadastrar **3 variáveis** no Netlify: `ADMIN_USER`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` (valores prontos no arquivo `VARIAVEIS-PRIVADAS.txt`).
4. [ ] (Recomendado) Trocar a senha do painel por uma mais forte e ativar a verificação em duas etapas (seção 6).
5. [ ] (Opcional) Ligar seu domínio (ex.: `mdbot.com`).
6. [ ] Entrar em `/lista`, criar sua primeira notícia e revisar as configurações.
7. [ ] Quando o bot for lançado: colocar o link de convite do bot em **Configurações** no painel (os botões "Adicionar ao servidor" se ativam sozinhos).

O link da comunidade (`https://discord.gg/uVqPhs3xzq`) já está configurado. Para trocar, use o painel (Configurações) ou `public/js/config.js`.

---

## 3. Colocar no ar no Netlify (passo a passo)

> Importante: arrastar a pasta no "Netlify Drop" publica só o site e **não** publica a API (login, notícias e inscritos
> não funcionariam). Use o método com GitHub abaixo (é o recomendado) ou o Netlify CLI (3.B).

### 3.A Pelo GitHub (recomendado)

**Passo 1. Criar o repositório**
1. Entre em github.com > **New repository**. Nome: `md-bot-site`. Marque **Private**. Crie.
2. Descompacte o `md-bot-site.zip` no seu computador.
3. No repositório, clique em **uploading an existing file** (ou **Add file > Upload files**).
4. Arraste **o conteúdo da pasta `md-bot-site`** (as pastas `public`, `lib`, `netlify`, `tools`, e os arquivos `netlify.toml`, `package.json`, `server.js` etc.). O arquivo `VARIAVEIS-PRIVADAS.txt` fica fora da pasta: **não envie**.
5. Clique em **Commit changes**.

**Passo 2. Conectar no Netlify**
1. Entre em app.netlify.com > **Add new site > Import an existing project > GitHub** e autorize.
2. Escolha o repositório `md-bot-site`.
3. Deixe **Build command** vazio. **Publish directory** deve aparecer como `public` e **Functions directory** como `netlify/functions` (vêm do `netlify.toml`).
4. **Antes de clicar em Deploy**, abra **Add environment variables** (ou faça no passo 3 e depois use **Trigger deploy**).

**Passo 3. Variáveis de ambiente** (Site configuration > Environment variables > Add a variable)

| Chave | Valor |
|---|---|
| `ADMIN_USER` | `maisterdevcompany@gmail.com` |
| `ADMIN_PASSWORD_HASH` | copie do arquivo `VARIAVEIS-PRIVADAS.txt` (começa com `scrypt$`) |
| `SESSION_SECRET` | copie do arquivo `VARIAVEIS-PRIVADAS.txt` |

Marque **Contains secret values** nas duas últimas. Escopo: **All scopes** (precisa incluir *Functions*).

**Passo 4. Publicar**
1. Clique em **Deploy**. Em ~1 minuto o site fica em `https://nome-aleatorio.netlify.app`.
2. Em **Site configuration > Change site name** escolha um nome melhor.
3. Teste: abra o site, depois `https://SEU-SITE.netlify.app/lista` e entre com seu e-mail e senha.
4. Teste o formulário "Quero acesso" com um e-mail seu e confira se aparece em `/lista > Inscritos`.

Os dados (inscritos, notícias, configurações) ficam no **Netlify Blobs**, que já vem ativado automaticamente para as funções. Nada para instalar.

**Passo 5. Domínio próprio (opcional)**
1. **Domain management > Add a domain** e digite `mdbot.com`.
2. Siga as instruções de DNS que o Netlify mostrar (ou use os servidores de nome do Netlify).
3. Aguarde e clique em **Verify DNS / Provision certificate**: o HTTPS é gratuito e automático.
4. Ative **Force HTTPS**.
5. O painel passa a ser `https://mdbot.com/lista`.

### 3.B Pelo Netlify CLI (alternativa)
```bash
npm install -g netlify-cli
cd md-bot-site
netlify login
netlify init        # ou: netlify link
netlify env:set ADMIN_USER "maisterdevcompany@gmail.com"
netlify env:set ADMIN_PASSWORD_HASH "scrypt$..."
netlify env:set SESSION_SECRET "..."
netlify deploy --prod
```

### 3.C Atualizar o site depois
Edite os arquivos (no GitHub pelo botão de lápis, ou no computador e faça commit). O Netlify republica sozinho em segundos.
Notícias, links, banner, vídeo e manutenção você muda **pelo painel**, sem republicar.

---

## 4. Usando o painel (`/lista`)

Entre com **maisterdevcompany@gmail.com** e sua senha. Abas:

- **Inscritos:** lista de quem pediu acesso (nome, e-mail, servidor, Discord, data). Busca, remover, **Baixar CSV** e **Copiar e-mails** (para contato).
- **Notícias:** crie, edite, rascunho/publicada, fixar, tipo (novidade, aviso, lançamento, evento), mascote da notícia e botão com link `https://`. Publicou, aparece no popup para quem ainda não viu. O botão **Novidades** no menu do site reabre as notícias.
- **Configurações:** link do Discord; link de convite do bot (ativa "Adicionar ao servidor"); faixa de aviso do topo; vídeo de abertura (ligar/desligar, mostrar só na primeira visita); popup de notícias (ligar/desligar); **modo manutenção** (mostra uma tela "Voltamos já" no site; o painel continua acessível).
- **Segurança:** trocar a senha, sair de todos os dispositivos, baixar backup completo (JSON) e ver o registro de tentativas de login e ações.

As mudanças aparecem no site em até ~30 segundos.

### Trocar o vídeo de abertura
- **No Netlify:** substitua o arquivo `public/video/intro.mp4` (mesmo nome) e publique de novo. Para outro nome, coloque em `public/video/` e informe `/video/nome.mp4` em Configurações.
- **Em servidor Node (VPS etc.):** o painel tem botão **Enviar novo vídeo** (MP4 H.264 ou WebM).
- Seu vídeo original `.MOV` estava em HEVC (não toca em Chrome/Firefox). Foi convertido para **MP4 H.264, 720p, 30 fps** (6 MB). Ele tem **76 segundos**: considere um corte mais curto. Quem quiser pode clicar em **Pular vídeo**.
- Para converter outro vídeo: `ffmpeg -i entrada.mov -vf "scale=-2:720,fps=30" -c:v libx264 -crf 27 -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart intro.mp4`
- Navegadores só liberam som automático depois de um toque: se bloquearem, o vídeo toca mudo com o botão **Ativar som**.

---

## 5. Editar o site pelo código

| O que mudar | Onde |
|---|---|
| Link do Discord padrão | `public/js/config.js` (o painel tem prioridade) |
| Títulos, textos, botões | `public/index.html` |
| Cores e visual | `public/css/style.css` (roxo `#8a1cff`, verde `#16ff3c`) |
| Perguntas do FAQ | `public/js/app.js` > lista `FQ` |
| Três passos | `public/js/app.js` > lista `SP` |
| Comandos da documentação | `public/js/app.js` > lista `DC` |
| Imagens do mascote | `public/img/` (mesmos nomes) |
| Título/descrição no Google | `<head>` do `public/index.html` |

Não há etapa de build: salvou, publicou, mudou.

---

## 6. Segurança (camadas já incluídas)

**Login e painel**
1. Login único (e-mail + senha). A senha nunca é guardada: só um hash **scrypt** com sal.
2. Comparação em tempo constante e mensagem de erro genérica (não revela se o e-mail existe).
3. **Bloqueio:** 5 erros por IP e 20 por conta em 15 minutos, com atraso crescente nas falhas.
4. Sessão em cookie `HttpOnly`, `Secure`, `SameSite=Strict` (prefixo `__Host-`), atrelada ao navegador, com expiração (8 h).
5. **Proteção CSRF** (token em toda ação) e checagem de origem.
6. **2FA opcional (TOTP)**: Google Authenticator/Authy.
7. "Sair de todos os dispositivos" invalida todas as sessões. Registro de tentativas e ações.
8. O painel não tem link no site e é bloqueado para buscadores (`noindex`).

**Site e API**
9. Cabeçalhos: CSP rígido (só scripts do próprio site), HSTS, anti-clickjacking, nosniff, COOP/CORP e Permissions-Policy.
10. Formulário público com **prova de trabalho anti-robô**, campo-armadilha, limite por IP, validação e deduplicação.
11. Todo texto do painel é exibido sem HTML (sem XSS). Links aceitam só `https://`. CSV protegido contra injeção de fórmulas.
12. Limites de tamanho, bloqueio de caminhos fora de `public/`, sem dependências além do Netlify Blobs (menos risco de supply chain).
13. Backup diário automático em servidor Node e backup manual em JSON pelo painel.

**O que depende de você (importante)**
- A senha atual tem **10 caracteres** e foi digitada numa conversa. **Troque** em `/lista > Segurança` por uma de 14+ caracteres, única, e **ative o 2FA**.
- **Ativar 2FA:** no seu computador, na pasta do projeto, rode `npm run totp`. Cadastre a chave no app autenticador e coloque `ADMIN_TOTP_SECRET` nas variáveis do Netlify. O painel passa a pedir o código de 6 dígitos.
- Nenhum site fica 100% imune. Contra ataques de grande volume (DDoS), o Netlify já tem CDN/proteção básica; para mais, ponha o domínio atrás do **Cloudflare** (plano gratuito).
- Mantenha a conta do GitHub e do Netlify com **2FA**. Repositório privado. Nunca envie `.env`.
- **LGPD:** você guarda dados pessoais. Tenha uma política de privacidade e responda pedidos de remoção (o painel permite remover).

### Esqueci a senha
No Netlify (ou no `.env`) cadastre `RESET_ADMIN_PASSWORD` = `1` e publique de novo. Com isso o painel volta a aceitar a senha das variáveis (`ADMIN_PASSWORD_HASH`).
Entre, troque a senha em **Segurança**, **apague a variável `RESET_ADMIN_PASSWORD`** e publique outra vez.
Para gerar um hash novo: `npm run hash -- "nova senha forte"`.

---

## 7. Mudar de hospedagem sem mexer no código

O mesmo código roda em vários lugares. Só mudam as variáveis:

| Hospedagem | Como |
|---|---|
| **Netlify** | Como na seção 3. Armazenamento automático (Blobs). |
| **VPS / Render / Railway / Fly.io / Hostinger Node / Docker** | `npm start`. Use `.env` (modelo em `.env.example`). Disco persistente em `DATA_DIR`. `TRUST_PROXY=1`. |
| **Hospedagem sem disco** (Vercel, Cloudflare etc.) | Crie um Redis gratuito no **Upstash** e use `STORAGE=upstash` com `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`. (Vercel exige um pequeno arquivo `api/` que chame `lib/core.js`, igual ao `netlify/functions/api.mjs`.) |
| **Hospedagem só estática** (GitHub Pages, hospedagem comum) | Funciona só a pasta `public/` (site e vídeo). Sem `/lista`, notícias do painel e cadastros. |

Para **levar os dados** ao mudar: painel > Segurança > **Baixar backup**.

Servidor Node (resumo):
```bash
cp .env.example .env        # preencha ADMIN_PASSWORD_HASH e SESSION_SECRET
npm start                   # http://localhost:3000  e  /lista
```
Docker: `docker build -t mdbot . && docker run -d -p 3000:3000 --env-file .env -v mdbot-data:/app/data mdbot`

---

## 8. Problemas comuns

- **/lista dá erro 404 no Netlify:** confirme que `netlify.toml` foi enviado ao GitHub.
- **Login diz "Painel não configurado":** faltam `ADMIN_USER`/`ADMIN_PASSWORD_HASH` no Netlify. Após cadastrar variáveis, faça **Trigger deploy**.
- **"Credenciais incorretas":** tente a senha com e sem o ponto final (`mdbotmsdv.` / `mdbotmsdv`). O valor pronto aceita as duas; depois troque pelo painel.
- **Bloqueado por tentativas:** espere 15 minutos.
- **Vídeo não aparece:** confira `public/video/intro.mp4` e se está ligado em Configurações. Ele só aparece 1x por visitante (para testar, apague os dados do site no navegador ou use janela anônima).
- **Notícia não aparece:** precisa estar **Publicada** e a pessoa ainda não ter visto. Janela anônima mostra de novo.
- **Cadastros não chegam:** teste em `/lista`; veja os logs em Netlify > Functions > api.
- **Alterei no painel e não mudou:** aguarde ~30 s (cache) e recarregue.
