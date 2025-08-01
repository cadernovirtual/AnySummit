# Mapeamento PHP-JS do Sistema AnySummit

## Arquivos PHP Reais do Sistema

### 1. Arquivos PHP de Produção (Não movidos)

| Arquivo PHP | Funções JS Usadas | Scripts Carregados | Observações |
|-------------|-------------------|-------------------|-------------|
| **novoevento.php** | validateStep, nextStep, prevStep, goToStep, updateStepDisplay, openModal, populateComboTicketSelect, updateComboItemsList, removeComboItem, initMap (Google Maps) | custom-dialogs.js, alert-overrides.js, temporary-tickets.js, lotes.js, lote-protection.js, ingressos-pagos.js, criaevento.js, combo-functions.js, combo-override.js, ingressos-pagos-edit.js, ingressos-gratuitos.js, ingressos-gratuitos-create.js, address-improvements.js, modal-correto.js, fix-current-step.js | Wizard completo de criação de eventos com 6 etapas |
| **meuseventos.php** | toggleMobileMenu, closeMobileMenu, toggleUserDropdown, logout, descartarWizard | Nenhum script JS externo | Dashboard principal com listagem de eventos |
| **vendas.php** | verDetalhes, verIngressos, verItens, confirmarPagamento, closeModal | Nenhum script JS externo | Página de vendas e pedidos do evento |
| **evento-publicado.php** | copyLink | Nenhum script JS externo | Página de sucesso após publicar evento |
| **cadastro.php** | toggleDocType, phoneMask, cpfMask, cnpjMask | Nenhum script JS externo | Formulário de cadastro com máscaras |
| **bem-vindo.php** | Apenas animações (scroll parallax, intersection observer) | Nenhum script JS externo | Página de boas-vindas com animações |
| **index.php** | - | - | Página inicial do produtor |
| **check_login.php** | - | - | Verificação de autenticação |
| **logout.php** | - | - | Logout do sistema |
| **menu.php** | - | - | Menu lateral do sistema |
| **upload_imagem_evento.php** | - | - | Upload de imagens via AJAX |
| **criaeventoapi.php** | - | - | API para salvar eventos |
| **verify.php** | - | - | Verificação de status |
| **auto-login.php** | - | - | Login automático |
| **novo-cadastro.php** | - | - | Novo formulário de cadastro |
| **criar-evento-simples.php** | - | - | Versão simplificada de criação |

### 2. Arquivos PHP de Teste (Movidos para php_testes/)

- teste-basico.php
- teste-evento.php
- teste-funcoes.html
- teste-min.php
- teste-sessao-ajax.php
- teste-sessao.php
- teste-wizard-fixes.html
- test-api.php
- test-min-api.php
- debug-api.php
- debug-pdo.php
- verificar-tabela.php
- verificar_login.php
- verificar_tabelas.php
- vendas-debug.php
- excluir-usuarios-teste.php

## Análise de Dependências JavaScript

### Funções Exclusivas do Wizard (novoevento.php)
Podem ser consolidadas em `wizard-final.js`:
- validateStep
- nextStep
- prevStep
- goToStep
- updateStepDisplay
- Todas as funções de lotes.js
- Todas as funções de temporary-tickets.js
- Todas as funções de ingressos-*.js
- Todas as funções de combo-*.js

### Funções Compartilhadas (Múltiplos lugares)
Devem ir para `core.js`:
- openModal / closeModal (usadas em novoevento.php e vendas.php)
- Funções de máscara (phoneMask, cpfMask, cnpjMask)
- toggleMobileMenu / toggleUserDropdown (menu lateral)
- Funções AJAX genéricas

### Funções Específicas por Módulo
- **vendas.php**: verDetalhes, verIngressos, verItens, confirmarPagamento
- **meuseventos.php**: descartarWizard
- **evento-publicado.php**: copyLink

## Recomendações de Organização

### 1. Criar estrutura modular:
```
js/
├── core/
│   ├── core.js (funções compartilhadas)
│   ├── masks.js (máscaras de input)
│   └── modals.js (sistema de modais)
├── wizard/
│   ├── wizard-final.js (todas as funções do wizard)
│   └── wizard-init.js (inicialização)
├── modules/
│   ├── vendas.js
│   ├── meuseventos.js
│   └── evento-publicado.js
└── vendor/
    └── (bibliotecas externas)
```

### 2. Scripts a serem consolidados no wizard-final.js:
- criaevento.js
- temporary-tickets.js
- lotes.js
- lote-protection.js
- ingressos-pagos.js
- ingressos-pagos-edit.js
- ingressos-gratuitos.js
- ingressos-gratuitos-create.js
- combo-functions.js
- combo-override.js
- address-improvements.js
- modal-correto.js
- fix-current-step.js

### 3. Ordem de prioridade para refatoração:
1. **Alta**: Consolidar todos os JS do wizard em wizard-final.js
2. **Média**: Extrair funções compartilhadas para core.js
3. **Baixa**: Modularizar funções específicas de cada página

## Observações Importantes

1. O sistema usa jQuery em algumas partes mas não está explicitamente carregado em todos os arquivos
2. Google Maps API é carregada apenas em novoevento.php
3. Muitas funções inline poderiam ser extraídas para arquivos JS externos
4. Sistema de modais é implementado de forma diferente em cada página
5. Máscaras de input são duplicadas entre cadastro.php e possivelmente outros lugares
