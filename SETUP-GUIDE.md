# Guia Completo de Setup — DevOps Slack + Agentforce Demo

## Parte 1: Criar a Slack App

### 1.1 Criar a aplicação

1. Acede a https://api.slack.com/apps
2. Clica **"Create New App"**
3. Seleciona **"From scratch"**
4. Nome: `Agentforce DevOps`
5. Workspace: seleciona o teu workspace de demo
6. Clica **"Create App"**

### 1.2 Configurar permissões (Bot Token Scopes)

1. No menu lateral, vai a **"OAuth & Permissions"**
2. Scroll até **"Scopes" → "Bot Token Scopes"**
3. Adiciona os seguintes scopes (clica "Add an OAuth Scope" para cada):
   - `chat:write` — para enviar mensagens
   - `chat:write.public` — para enviar mensagens em canais sem ser convidado
   - `channels:read` — para ler informações dos canais
   - `reactions:write` — para adicionar reações
4. Scroll até ao topo e clica **"Install to Workspace"**
5. Autoriza a app
6. **Copia o "Bot User OAuth Token"** (começa com `xoxb-`) — vais precisar

### 1.3 Obter o Signing Secret

1. No menu lateral, vai a **"Basic Information"**
2. Em **"App Credentials"**, copia o **"Signing Secret"**

### 1.4 Ativar Socket Mode (para desenvolvimento local)

1. No menu lateral, vai a **"Socket Mode"**
2. Ativa **"Enable Socket Mode"**
3. Vai pedir para criar um App-Level Token:
   - Nome: `socket-token`
   - Scope: `connections:write`
   - Clica **"Generate"**
4. **Copia o token** (começa com `xapp-`) — vais precisar

### 1.5 Ativar Interactivity (para os botões funcionarem)

1. No menu lateral, vai a **"Interactivity & Shortcuts"**
2. Ativa **"Interactivity"**
3. Se estiveres a usar Socket Mode, não precisas de URL — fica automático
4. Se NÃO usares Socket Mode (produção), coloca: `https://<teu-dominio>/slack/events`

### 1.6 Criar os canais no Slack

1. No teu workspace Slack, cria dois canais:
   - `#devops-approvals` — onde aparecem os PRs para aprovação
   - `#devops-logs` — onde aparecem as notificações autónomas
2. Em cada canal, convida o bot:
   - Escreve `/invite @Agentforce DevOps` em cada canal
   - Ou vai às configurações do canal → Integrations → Add apps

---

## Parte 2: Configurar o GitHub

### 2.1 Criar Personal Access Token

1. Acede a https://github.com/settings/tokens
2. Clica **"Generate new token (classic)"**
3. Nome: `agentforce-devops-demo`
4. Expiration: 30 dias (ou sem expiração para demo)
5. Seleciona os scopes:
   - `repo` (acesso total ao repositório)
   - `workflow` (para disparar GitHub Actions)
6. Clica **"Generate token"**
7. **Copia o token** (começa com `ghp_`) — vais precisar

### 2.2 Criar repositório (se ainda não existir)

1. Cria um repo no GitHub (ex: `devops-slack-demo`)
2. Faz push do código local:
```bash
cd /Users/rafael.marques/Documents/sfdc-org-workspace/devops-slack
git init
git add -A
git commit -m "Initial commit: DevOps Slack + Agentforce demo"
git remote add origin https://github.com/<TEU-USER>/devops-slack-demo.git
git push -u origin main
```

### 2.3 Configurar GitHub Secrets (para os workflows)

1. No repo GitHub, vai a **Settings → Secrets and variables → Actions**
2. Clica **"New repository secret"** para cada um:

| Nome | Valor | Descrição |
|------|-------|-----------|
| `SF_JWT_KEY` | conteúdo do ficheiro server.key | Chave privada JWT para auth Salesforce |
| `SF_CLIENT_ID` | Consumer Key da Connected App | ID da Connected App no Salesforce |
| `SF_USERNAME` | `trailsignup.1cc50a77aecc94@salesforce.com` | Username da org |
| `SF_INSTANCE_URL` | `https://trailsignup-a178e697a22fdd.my.salesforce.com` | Instance URL da org |
| `SLACK_MIDDLEWARE_URL` | `https://<teu-dominio>` ou URL do ngrok | URL pública do middleware |

### 2.4 Configurar Webhook no repositório

1. No repo GitHub, vai a **Settings → Webhooks**
2. Clica **"Add webhook"**
3. Preenche:
   - **Payload URL:** `https://<teu-dominio>/webhook/github/pr`
     - Para dev local com ngrok: `https://<id>.ngrok-free.app/webhook/github/pr`
   - **Content type:** `application/json`
   - **Secret:** (deixa vazio para demo, ou configura um secret)
   - **Which events?** → Seleciona "Let me select individual events":
     - Marca apenas: **Pull requests**
   - Ativa **"Active"**
4. Clica **"Add webhook"**

---

## Parte 3: Configurar o Middleware Local

### 3.1 Preencher o .env

```bash
cd /Users/rafael.marques/Documents/sfdc-org-workspace/devops-slack/slack-middleware
```

Edita o ficheiro `.env` com os valores reais:

```env
SLACK_BOT_TOKEN=xoxb-XXXXXXXXX-XXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXX
SLACK_SIGNING_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SLACK_APP_TOKEN=xapp-1-XXXXXXXXXXX-XXXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GITHUB_TOKEN=ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PORT=3000
```

### 3.2 Arrancar o servidor

```bash
# Modo desenvolvimento (com hot-reload)
npm run dev

# Ou modo produção
npm start
```

Deves ver: `⚡ Agentforce DevOps Middleware running on port 3000`

### 3.3 Verificar health

```bash
curl http://localhost:3000/health
```

Resposta esperada:
```json
{"status":"ok","agent":"Agentforce DevOps"}
```

### 3.4 Expor publicamente com ngrok

Para que o GitHub consiga enviar webhooks ao teu localhost:

```bash
# Instalar ngrok (se não tiveres)
brew install ngrok

# Autenticar (só primeira vez — cria conta grátis em ngrok.com)
ngrok config add-authtoken <teu-token-ngrok>

# Expor a porta 3000
ngrok http 3000
```

O ngrok dá-te um URL tipo: `https://abc123.ngrok-free.app`

**Usa este URL:**
- No webhook do GitHub: `https://abc123.ngrok-free.app/webhook/github/pr`
- No GitHub Secret `SLACK_MIDDLEWARE_URL`: `https://abc123.ngrok-free.app`

---

## Parte 4: Testar a Integração

### 4.1 Teste manual (sem GitHub)

Simula um PR normal (deve aparecer mensagem com botões em #devops-approvals):
```bash
curl -X POST http://localhost:3000/webhook/github/pr \
  -H "Content-Type: application/json" \
  -d '{
    "action": "opened",
    "pull_request": {
      "number": 42,
      "title": "feat: Add ChurnRiskIndicator LWC component",
      "user": {"login": "rafael-marques"},
      "html_url": "https://github.com/test/repo/pull/42",
      "additions": 156,
      "deletions": 12,
      "changed_files": 5,
      "labels": []
    },
    "repository": {"full_name": "test-org/devops-slack"}
  }'
```

Simula um HOTFIX (deve aparecer notificação sem botões em #devops-logs):
```bash
curl -X POST http://localhost:3000/webhook/github/pr \
  -H "Content-Type: application/json" \
  -d '{
    "action": "opened",
    "pull_request": {
      "number": 43,
      "title": "[HOTFIX] Fix critical null pointer",
      "user": {"login": "rafael-marques"},
      "html_url": "https://github.com/test/repo/pull/43",
      "additions": 8,
      "deletions": 2,
      "changed_files": 1,
      "labels": [{"name": "hotfix"}]
    },
    "repository": {"full_name": "test-org/devops-slack"}
  }'
```

Testa a notificação autónoma directamente:
```bash
curl -X POST http://localhost:3000/notify/autonomous
```

### 4.2 Teste real com GitHub

1. Cria uma branch:
```bash
git checkout -b feat/demo-test
```

2. Faz uma alteração qualquer (ex: adiciona um comentário num ficheiro)

3. Push e abre PR:
```bash
git add -A
git commit -m "test: Demo validation"
git push -u origin feat/demo-test
```

4. Abre o PR no GitHub (browser) — ou via CLI:
```bash
gh pr create --title "feat: Demo validation" --body "Testing webhook integration"
```

5. **Verifica no Slack:** deve aparecer a mensagem no `#devops-approvals`

6. **Clica "Aprovar Deploy"** — o PR deve ser merged automaticamente

7. **Verifica GitHub Actions:** o workflow `2-deploy-production.yml` deve arrancar

### 4.3 Teste do cenário hotfix

```bash
git checkout main
git pull
git checkout -b hotfix/critical-fix
# faz alteração
git add -A
git commit -m "fix: Critical null pointer"
git push -u origin hotfix/critical-fix
gh pr create --title "[HOTFIX] Fix critical null pointer" --body "Urgent fix"
```

Deve aparecer notificação em `#devops-logs` (sem botões).

---

## Parte 5: Configurar Salesforce (Connected App para CI/CD)

### 5.1 Criar Connected App para JWT Auth

1. Abre a org: `sf org open --target-org devops-demo`
2. Vai a **Setup → App Manager → New Connected App**
3. Preenche:
   - **Connected App Name:** `GitHub Actions CI`
   - **API Name:** `GitHub_Actions_CI`
   - **Contact Email:** o teu email
4. Marca **"Enable OAuth Settings"**:
   - **Callback URL:** `http://localhost:1717/OauthRedirect`
   - **OAuth Scopes:** adiciona:
     - `Manage user data via APIs (api)`
     - `Perform requests at any time (refresh_token, offline_access)`
   - Marca **"Use digital signatures"**
5. Para a assinatura digital, gera um certificado:
```bash
# Gerar chave privada e certificado
openssl req -x509 -sha256 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout server.key \
  -out server.crt \
  -subj "/CN=GitHub Actions CI"
```
6. Faz upload do `server.crt` na Connected App
7. Clica **"Save"**

### 5.2 Autorizar o utilizador

1. Vai a **Setup → App Manager** → encontra "GitHub Actions CI" → **Manage**
2. Em "Permitted Users", seleciona **"Admin approved users are pre-authorized"**
3. Em "Profiles", adiciona o profile **"System Administrator"**
4. Guarda

### 5.3 Testar autenticação JWT localmente

```bash
sf org login jwt \
  --client-id <CONSUMER_KEY_DA_CONNECTED_APP> \
  --jwt-key-file server.key \
  --username trailsignup.1cc50a77aecc94@salesforce.com \
  --instance-url https://trailsignup-a178e697a22fdd.my.salesforce.com \
  --alias devops-demo-jwt
```

Se funcionar, copia o conteúdo de `server.key` para o GitHub Secret `SF_JWT_KEY`.

### 5.4 Configurar Remote Site Settings

1. Na org, vai a **Setup → Remote Site Settings**
2. Clica **"New Remote Site"**:
   - Nome: `GitHub_API`
   - URL: `https://api.github.com`
   - Ativa
3. Repete para o middleware:
   - Nome: `Slack_Middleware`
   - URL: `https://<url-do-middleware>` (ngrok ou domínio real)
   - Ativa

### 5.5 Configurar Named Credentials (endpoint real)

1. Vai a **Setup → Named Credentials**
2. Edita **"GitHub API"**:
   - URL: `https://api.github.com`
   - (Para adicionar auth: configura um custom header `Authorization: token ghp_...`)
3. Edita **"Slack Middleware"**:
   - URL: o URL público do teu middleware

---

## Parte 6: Configurar o Agentforce Agent (Agent Builder)

### 6.1 Ativar Einstein/Agentforce

1. Na org, vai a **Setup → Einstein Setup**
2. Ativa **"Turn on Einstein"**
3. Vai a **Setup → Agents** (ou procura "Agent Builder")

### 6.2 Criar o Agent

1. Clica **"New Agent"**
2. Preenche:
   - **Name:** `Agentforce DevOps`
   - **Role:** DevOps Lead Architect
   - **Company:** (nome da empresa do cliente)
3. Guarda

### 6.3 Criar Topic "PR Review" (Assistente)

1. No Agent, clica **"Add Topic"**
2. Preenche:
   - **Name:** `PR Review`
   - **Description:** `Revisão assistida de Pull Requests com aprovação humana`
   - **Scope:** `Pull Requests abertos em branches de desenvolvimento que NÃO contenham [HOTFIX]`
3. Em **Instructions**, cola:
```
Quando um Pull Request for aberto na branch de desenvolvimento, executa os seguintes passos:

1. Usa a ação ReviewGitHubPullRequest para obter o diff e metadata do PR.
2. Analisa as mudanças focando em:
   - Código Apex: verifica boas práticas, governor limits, SOQL em loops, e test coverage.
   - Componentes LWC: verifica reactive properties, lifecycle hooks, e acessibilidade.
   - Identifica potenciais riscos de segurança ou performance.
3. Gera um resumo conciso com:
   - Descrição das mudanças
   - Pontos positivos identificados
   - Riscos ou preocupações (se houver)
   - Percentagem de cobertura de testes
   - Recomendação (aprovar ou revisar manualmente)
4. Usa a ação SendSlackMessage para enviar a análise no canal #devops-approvals com botões de aprovação.
5. AGUARDA a decisão do utilizador. NÃO prosseguir autonomamente.
6. Se o utilizador aprovar: usa TriggerGitHubAction para fazer merge e iniciar deploy.
7. Se o utilizador rejeitar: confirma a rejeição e sugere melhorias.
```
4. Guarda

### 6.4 Criar Topic "Hotfix Resolution" (Autónomo)

1. Clica **"Add Topic"**
2. Preenche:
   - **Name:** `Hotfix Resolution`
   - **Description:** `Resolução autónoma de hotfixes críticos`
   - **Scope:** `Pull Requests que contenham [HOTFIX] no título ou label hotfix`
3. Em **Instructions**, cola:
```
Quando um PR contiver a tag [HOTFIX], tens AUTONOMIA TOTAL. Executa o seguinte pipeline sem aguardar aprovação:

1. Usa ReviewGitHubPullRequest para obter o diff e metadata do PR.
2. Analisa o código com foco em:
   - Cobertura de testes: DEVE ser superior a 90%
   - Violações PMD: DEVEM ser zero
   - Vulnerabilidades de segurança: DEVEM ser zero
3. DECISÃO AUTOMÁTICA:
   - SE cobertura > 90% E zero violações PMD:
     a. Usa TriggerGitHubAction para fazer merge do PR (squash)
     b. O merge dispara automaticamente o deploy via GitHub Actions
     c. Usa SendSlackMessage para notificar #devops-logs com:
        - Confirmação do fix deployado
        - Resumo da análise
        - Tempo economizado (~45 minutos)
   - SE cobertura < 90% OU violações PMD > 0:
     a. NÃO fazer merge
     b. Usa SendSlackMessage para escalar para #devops-approvals
     c. Explica a razão da falha

GUARDRAILS:
- Nunca merge se testes falharem
- Nunca merge se cobertura < 90%
- Nunca merge se houver violações PMD
- Se houver dúvida, ESCALAR para humano
```
4. Guarda

### 6.5 Associar Actions ao Agent

1. No Agent, vai a **"Actions"**
2. Adiciona as 3 actions (os Flows que deployámos):
   - `ReviewGitHubPullRequest`
   - `SendSlackMessage`
   - `TriggerGitHubAction`
3. Cada Flow é automaticamente exposto como Agent Action porque usa `@InvocableMethod`

### 6.6 Testar no Agent Builder

1. No canto direito, usa o painel **"Test"**
2. Escreve: "Um PR #42 foi aberto no repositório devops-slack com 5 ficheiros alterados. Analisa e notifica a equipa."
3. O agente deve invocar as ações na sequência correcta

---

## Parte 7: Diagrama de Fluxo Completo

```
CENÁRIO 1 — ASSISTENTE:
========================
Developer abre PR → GitHub Webhook → Middleware (port 3000)
  → Middleware detecta: NÃO é HOTFIX
  → Envia Block Kit para #devops-approvals (com botões)
  → Humano clica "Aprovar Deploy"
  → Middleware chama GitHub API: merge PR
  → Push to main dispara GitHub Actions
  → GitHub Actions deploya no Salesforce
  → GitHub Actions notifica Middleware (/notify/autonomous)
  → Middleware envia confirmação para #devops-logs

CENÁRIO 2 — AUTÓNOMO:
======================
Developer abre PR com [HOTFIX] → GitHub Webhook → Middleware
  → Middleware detecta: É HOTFIX
  → Envia notificação para #devops-logs (SEM botões)
  → (Em paralelo, Agentforce analisa via Flows/Apex)
  → Agentforce decide: merge automático
  → Push to main dispara GitHub Actions
  → Deploy automático no Salesforce
  → Notificação final: "Time economizou 45 minutos"
```

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Mensagem não aparece no Slack | Verifica se o bot foi convidado ao canal. Testa com `curl` primeiro. |
| Webhook do GitHub não chega | Verifica se ngrok está a correr. No GitHub → Settings → Webhooks, vê "Recent Deliveries". |
| Botão "Aprovar" dá erro | Verifica se o `GITHUB_TOKEN` no `.env` tem scope `repo`. |
| Flow falha no Salesforce | Verifica Remote Site Settings e Named Credentials. |
| Deploy do GitHub Actions falha | Verifica se os Secrets estão correctos. Testa o JWT auth localmente primeiro. |
| `EPERM` ao correr npm/sf | Corre: `sudo chown -R $(whoami) ~/.npm ~/.sf` |
| Socket Mode não conecta | Verifica se o `SLACK_APP_TOKEN` (xapp-) está no `.env`. |
