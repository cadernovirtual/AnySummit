# Sistema de Coleta de Dados do Wizard - v2.4

## 📋 Descrição
Este sistema intercepta os botões de avanço do wizard de criação de eventos para coletar todos os dados preenchidos em um formato JSON estruturado, sem impactar o funcionamento original do wizard.

## 🆕 Correções Implementadas (v2.4)
### Limpeza Completa de Dados:
- ✅ **Sistema de limpeza total**: Novo arquivo complete-cleanup.js
- ✅ **Garantia de remoção**: TODOS os dados são apagados ao começar novo
- ✅ **Limpeza em múltiplas camadas**: Cookies, localStorage, variáveis, DOM
- ✅ **Dialog de recuperação**: Ao escolher "Começar Novo", tudo é limpo
- ✅ **Função global**: `limparTodosOsDadosDoWizard()` ou `limparTudo()`
### Persistência de Ingressos:
- ✅ **Nome do ingresso**: Agora captura corretamente o campo `title`/`nome`
- ✅ **Tipo em português**: Converte "paid" → "pago", "free" → "gratuito"
- ✅ **Campos numéricos**: Valor, taxa e quantidade agora são persistidos
- ✅ **Campos min/max**: Adicionados qtd_minima_por_pessoa e qtd_maxima_por_pessoa
- ✅ **Campo removido**: Removido campo "por_pessoa" (substituído pelos min/max)
- ✅ **Combos**: Agora são persistidos com conteudo_combo correto
- ✅ **Correção automática**: ticket-persistence-fix.js corrige dados ao salvar
### Persistência:
- ✅ **Step 6 (Ingressos)**: Agora captura nome, lote_id e conteudo_combo corretamente
- ✅ **Combos**: Campo conteudo_combo com estrutura {ingresso_id: quantidade}
- ✅ **Map support**: Suporte para temporaryTickets como Map ou array

### Recuperação:
- ✅ **Step 1**: Restaura todas as imagens e cor de fundo com preview
- ✅ **Step 3**: Restaura descrição do evento
- ✅ **Step 5**: Restaura todos os lotes (por data e percentual)
- ✅ **Step 6**: Restaura ingressos com estrutura completa

## 🆕 Correções Anteriores (v2.1)
- ✅ **Step 4 (Localização)**: Agora captura todos os campos de endereço (cep, rua, numero, complemento, bairro, cidade, estado)
- ✅ **Step 6 (Ingressos)**: Sistema robusto que captura de window.temporaryTickets.tickets
- ✅ **Step 7 (Produtor)**: Movido para o step correto (era step 4, agora é step 7)
- ✅ **Dialogs duplicados**: Removido dialog "test" e unificado sistema de recuperação
- ✅ **Sistema unificado de recuperação**: Apenas um dialog aparece ao recarregar

## 🆕 Correções Anteriores (v2.0)
- ✅ **Step 1**: Captura cor_fundo e URLs das imagens corretamente
- ✅ **Step 5**: Sistema robusto de captura de lotes com fallback para cookies
- ✅ **Imagens**: Interceptor melhorado que detecta automaticamente o tipo de imagem
- ✅ **Debug Helper**: Sistema de monitoramento e debug

## 🚀 Como Usar

### 1. Visualizar Dados Coletados
Abra em uma nova aba:
```
/produtor_correto/visualizar-dados-wizard.html
```

Esta página mostra em tempo real os dados sendo coletados enquanto você preenche o wizard.

### 2. Preencher o Wizard
Em outra aba, acesse:
```
/produtor_correto/novoevento.php
```

Preencha normalmente o wizard. A cada vez que clicar em "Avançar", os dados serão coletados automaticamente.

### 3. Comandos do Console

No console do navegador (F12), você pode usar:

```javascript
// Ver dados coletados
verDadosColetados()

// Limpar dados coletados
limparDadosColetados()

// Debug completo (novo!)
debugWizardCollector()

// Forçar coleta completa de todos os dados (novo!)
forcarColetaCompleta()

// Coletar lotes manualmente (novo!)
coletarLotesManual()

// Ver dados em formato JSON
JSON.stringify(window.WizardDataCollector, null, 2)
```

## 📊 Estrutura dos Dados Coletados

```json
{
  "step_atual": 8,
  "dados": {
    "nome": "Nome do Evento",
    "classificacao": "16",
    "categoria": "negocios",
    "cor_fundo": "#1a237e",
    "logo_url": "/uploads/eventos/logo_xxx.png",
    "capa_url": "/uploads/eventos/capa_xxx.jpg",
    "fundo_url": "/uploads/eventos/fundo_xxx.jpg",
    "data_inicio": "2025-03-15T09:00",
    "data_fim": "2025-03-15T18:00",
    "nome_local": "Centro de Convenções",
    "cep": "74093-250",
    "rua": "Avenida 136",
    "numero": "797",
    "complemento": "SALA 904B",
    "bairro": "Setor Marista",
    "cidade": "Goiânia",
    "estado": "GO",
    "descricao": "<p>Descrição HTML do evento</p>",
    "tipo_produtor": "atual",
    "nome_produtor": "",
    "email_produtor": "",
    "lotes": [
      {
        "id": "lote_data_1",
        "nome": "Primeiro Lote",
        "tipo": "data",
        "data_inicio": "2025-01-01T00:00",
        "data_fim": "2025-01-31T23:59"
      }
    ],
    "ingressos": [
      {
        "id": "ing_1",
        "tipo": "pago",
        "nome": "Ingresso Individual",
        "descricao": "Acesso completo",
        "valor": "150.00",
        "taxa": "15.00",
        "quantidade": "100",
        "por_pessoa": "1",
        "lote_id": "lote_data_1"
      }
    ],
    "termos_aceitos": true
  }
}
```

## 🔧 Arquivos do Sistema

- `/js/wizard-interceptor/wizard-data-collector.js` - Script principal de coleta
- `/js/wizard-interceptor/image-url-collector.js` - Captura URLs de imagens upload
- `/js/wizard-interceptor/debug-helper.js` - Sistema de debug e monitoramento
- `/js/wizard-interceptor/unified-recovery.js` - Sistema unificado de recuperação
- `/js/wizard-interceptor/restore-improvements.js` - Melhorias na restauração (NOVO!)
- `/visualizar-dados-wizard.html` - Interface para visualizar dados

## ⚠️ Observações

1. O sistema NÃO interfere no funcionamento original do wizard
2. Os dados são salvos em localStorage para persistência
3. As URLs de imagens são capturadas automaticamente durante o upload
4. O sistema funciona interceptando a função `nextStep()` original
5. Apenas um dialog de recuperação aparece ao recarregar a página

## 🐛 Solução de Problemas

Se os dados não estiverem sendo coletados:

1. Verifique o console (F12) por erros
2. Execute `debugWizardCollector()` para ver estado completo do sistema
3. Execute `forcarColetaCompleta()` para forçar coleta manual
4. Use `limparDadosColetados()` para resetar e tentar novamente
5. Certifique-se de que os scripts foram carregados (verifique a aba Network)

### Problemas Específicos:

**Lotes não aparecem:**
- Execute `window.lotesData` no console para verificar se existem
- Use `coletarLotesManual()` para forçar coleta
- Verifique o cookie com `getCookie('lotesData')`

**Imagens não são capturadas:**
- Verifique `window.uploadedImages` no console
- As imagens só são capturadas após upload bem-sucedido
- URLs blob:// são ignoradas (apenas URLs finais são salvas)

## 📝 Notas de Implementação

- O sistema aguarda 1 segundo após o carregamento da página para garantir que todas as funções originais foram definidas
- As imagens são capturadas interceptando tanto `fetch` quanto `XMLHttpRequest`
- Os dados de lotes e ingressos dependem das variáveis globais `window.lotesData` e `window.ingressosData`
