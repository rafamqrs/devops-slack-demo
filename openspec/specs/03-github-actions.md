# Fase 3: CI/CD com GitHub Actions

**Objetivo:** O motor real de deploy que será engatilhado pelo Slack ou pelo Agentforce.

**Instruções de Geração:**
1. Crie o diretório `.github/workflows`.
2. Crie dois ficheiros YAML:
   - `1-pr-validation.yml`: Roda em todo `pull_request` para a `main`. Instala o Salesforce CLI (`@salesforce/cli`), autentica usando JWT (`sf org login jwt`) com chaves nos *GitHub Secrets*, e roda um deploy de validação (`--test-level RunLocalTests --dry-run`).
   - `2-deploy-production.yml`: Roda no `push` para a `main`. Faz o deploy real e notifica o webhook do nosso Slack App (Fase 1) em caso de sucesso.
3. Use a imagem `node:20` nos containers do GitHub Actions.
