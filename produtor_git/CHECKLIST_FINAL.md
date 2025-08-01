# CHECKLIST FINAL - Implementação do Wizard Consolidado

## Testes Essenciais

### 1. Wizard em novoevento.php
- [ ] **Navegação entre steps funciona corretamente**
  - [ ] Botão "Avançar" valida campos antes de prosseguir
  - [ ] Botão "Voltar" retorna ao step anterior
  - [ ] Progress bar atualiza corretamente
  - [ ] Animações de transição funcionam

- [ ] **Step 1 - Informações Básicas**
  - [ ] Campo nome do evento é validado
  - [ ] Upload de logo funciona
  - [ ] Upload de capa funciona
  - [ ] Upload de imagem de fundo funciona
  - [ ] Seletor de cor funciona
  - [ ] Botões de remover imagem funcionam
  - [ ] Preview das imagens aparece corretamente

- [ ] **Step 2 - Data e Horário**
  - [ ] Campos de data/hora são validados
  - [ ] Classificação etária é obrigatória
  - [ ] Categoria é obrigatória
  - [ ] Data fim não pode ser anterior à data início

- [ ] **Step 3 - Descrição**
  - [ ] Editor de texto funciona
  - [ ] Validação de descrição mínima (10 caracteres)

- [ ] **Step 4 - Localização**
  - [ ] Toggle presencial/online funciona
  - [ ] Campos de endereço aparecem quando presencial
  - [ ] Campo de link aparece quando online
  - [ ] Google Maps funciona para busca de endereço

- [ ] **Step 5 - Lotes**
  - [ ] Modal de lote por data abre corretamente
  - [ ] Modal de lote por percentual abre corretamente
  - [ ] Lotes são adicionados à lista
  - [ ] Lotes podem ser editados
  - [ ] Lotes podem ser excluídos (com proteção)
  - [ ] Renomeação automática funciona
  - [ ] Validação impede prosseguir sem lotes

- [ ] **Step 6 - Ingressos**
  - [ ] Modal de ingresso pago abre corretamente
  - [ ] Modal de ingresso gratuito abre corretamente
  - [ ] Cálculo de taxa funciona corretamente
  - [ ] Ingressos são adicionados à lista
  - [ ] Ingressos podem ser editados
  - [ ] Ingressos podem ser excluídos (com proteção)
  - [ ] Combos podem ser criados
  - [ ] Validação impede prosseguir sem ingressos

- [ ] **Step 7 - Produtor**
  - [ ] Opções de produtor funcionam
  - [ ] Campos condicionais aparecem conforme seleção

- [ ] **Step 8 - Publicar**
  - [ ] Preview do evento é exibido
  - [ ] Checkbox de termos funciona
  - [ ] Botão publicar envia dados corretamente

### 2. Salvamento e Recuperação
- [ ] **Dados são salvos automaticamente**
  - [ ] A cada mudança de step
  - [ ] Ao preencher campos
  - [ ] Ao fazer uploads

- [ ] **Recuperação de wizard abandonado**
  - [ ] Dialog aparece ao retornar
  - [ ] Dados são restaurados corretamente
  - [ ] Imagens são recuperadas
  - [ ] Lotes são recuperados
  - [ ] Ingressos são recuperados

### 3. Modais em vendas.php
- [ ] **Modais continuam funcionando**
  - [ ] closeModal() funciona sem passar ID
  - [ ] closeModal(modalId) funciona passando ID
  - [ ] Modais abrem e fecham corretamente
  - [ ] Não há erros no console

### 4. Máscaras em cadastro.php
- [ ] **Máscaras de input funcionam**
  - [ ] phoneMask formata telefone corretamente
  - [ ] cpfMask formata CPF corretamente
  - [ ] cnpjMask formata CNPJ corretamente
  - [ ] Máscaras são aplicadas automaticamente via data-mask

### 5. Console do navegador
- [ ] **Sem erros críticos**
  - [ ] Nenhum erro de "undefined"
  - [ ] Nenhum erro de "cannot read property"
  - [ ] Nenhum erro de sintaxe
  - [ ] Logs de debug aparecem corretamente

### 6. Performance
- [ ] **Carregamento rápido**
  - [ ] Página carrega em menos de 3 segundos
  - [ ] Transições entre steps são fluidas
  - [ ] Não há travamentos ao interagir

## Como Testar

1. **Teste Completo do Wizard**
   - Acesse `/produtor/novoevento.php`
   - Preencha todos os campos step por step
   - Teste validações deixando campos em branco
   - Crie lotes e ingressos
   - Publique um evento de teste

2. **Teste de Recuperação**
   - Preencha parcialmente o wizard
   - Feche o navegador sem publicar
   - Reabra `/produtor/novoevento.php`
   - Verifique se o dialog de recuperação aparece
   - Confirme que todos os dados foram restaurados

3. **Teste de Modais em Vendas**
   - Acesse `/produtor/vendas.php`
   - Abra modais de detalhes
   - Teste fechar com botão X
   - Teste fechar clicando fora

4. **Teste de Máscaras**
   - Acesse `/produtor/cadastro.php`
   - Digite números em campos de telefone
   - Digite números em campos de CPF/CNPJ
   - Verifique se formatação é aplicada

## Observações

- Os arquivos JS antigos foram mantidos em `js/old/` como backup
- Apenas 3 arquivos JS principais são carregados agora
- custom-dialogs.js e alert-overrides.js foram mantidos temporariamente
- O sistema está preparado para remoção gradual de dependências legadas

## Status: ✅ PRONTO PARA TESTES
