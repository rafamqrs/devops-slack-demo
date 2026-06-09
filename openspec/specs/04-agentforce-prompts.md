# Fase 4: Preparação do Discurso e Configuração (Agentforce)

**Objetivo:** Fornecer os prompts e configurações para o Agent Builder (ou simulados na demo) para dar vida aos dois comportamentos da IA.

*(Nota para o Claude Code: Em vez de gerar este ficheiro como documentação estática, **utiliza o comando `opsx:propose`** da CLI do OpenSpec para sugerir formalmente a criação desta configuração no repositório. O objetivo é submeter os prompts e metadados do Agentforce como uma proposta arquitetural rastreável, aguardando aprovação ou revisão no ciclo de vida do OpenSpec antes de finalizar a demo).*

**Configuração do Agentforce (Submeter via opsx:propose):**
* **Role:** DevOps Lead Architect
* **Ação Associada:** `ReviewGitHubPullRequest`, `SendSlackMessage`, `TriggerGitHubAction`

**Comportamento 1 (Assistente):**
"Quando um PR for aberto na branch de desenvolvimento, resuma as mudanças do Apex e LWC. Identifique os riscos. Envie uma mensagem para o canal #devops no Slack com os botões de aprovação estruturados. Aguarde o usuário clicar."

**Comportamento 2 (Autónomo):**
"Quando um PR contiver a tag [HOTFIX], você tem autonomia total. Analise o código. Se a classe de teste passar com >90% e nenhuma regra do PMD for violada, mescle o PR automaticamente, inicie o deploy e notifique o canal #devops informando a resolução do incidente."
