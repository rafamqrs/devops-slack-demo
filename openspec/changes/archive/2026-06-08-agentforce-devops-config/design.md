## Context

A demo de pré-vendas DevOps requer um Agentforce Agent configurado como "DevOps Lead Architect" que orquestra todo o pipeline de CI/CD. A infraestrutura já existe:
- Slack middleware (`slack-middleware/`) com endpoints para webhooks do GitHub e notificações
- GitHub Actions workflows para validação e deploy
- Código Salesforce (Apex + LWC) como alvo de análise

O agente precisa de ser configurado no Agent Builder com prompts, role e ações que conectem estas peças.

## Goals / Non-Goals

**Goals:**
- Definir a configuração completa do Agentforce Agent (role, ações, prompts)
- Suportar dois modos operacionais: assistente (humano no loop) e autónomo (sem intervenção)
- Produzir artefactos que possam ser configurados directamente no Agent Builder ou simulados na demo

**Non-Goals:**
- Implementar lógica real de análise de código com IA (os resultados são simulados para a demo)
- Criar conectores custom — usamos as ações standard do Agentforce (Flow-based)
- Modificar a infraestrutura existente (middleware, workflows, código SF)

## Decisions

### 1. Configuração via Agent Builder (não código)
**Decisão:** Os prompts e ações são configurados directamente no Salesforce Agent Builder, não como metadata deployable.
**Alternativa:** Deployment via metadata API (AgentDefinition, AgentAction). Rejeitado porque a demo beneficia de mostrar a configuração visual no Agent Builder.

### 2. Dois Topics separados no mesmo Agent
**Decisão:** Um único agent com dois Topics — "PR Review" (assistente) e "Hotfix Resolution" (autónomo) — para demonstrar a versatilidade do mesmo agente.
**Alternativa:** Dois agents separados. Rejeitado por ser menos impactante na narrativa da demo.

### 3. Ações mapeadas a Flows
**Decisão:** Cada ação do agente (`ReviewGitHubPullRequest`, `SendSlackMessage`, `TriggerGitHubAction`) é implementada como um Flow que chama o middleware via HTTP Callout.
**Alternativa:** Apex Actions. Rejeitado por ser menos visual na demo e requerer mais setup.

## Risks / Trade-offs

- **[Dependência de tokens]** → As ações requerem Named Credentials configurados para GitHub API e Slack middleware. Mitigação: pré-configurar antes da demo.
- **[Simulação vs. Real]** → A análise de código é simulada (respostas hardcoded). Mitigação: aceitável para pré-vendas; deixar claro que produção usaria Einstein Code Analysis.
- **[Latência na demo]** → Flows com HTTP callouts podem ter latência. Mitigação: usar ambiente com baixa latência e ter fallback narrativo.
