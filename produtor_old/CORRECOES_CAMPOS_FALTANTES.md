# CORREÇÕES NECESSÁRIAS - SALVAMENTO DE EVENTOS

## 1. CAMPOS DE IMAGEM
### Problema:
- imagem_capa, imagem_fundo, logo_evento não estão sendo salvos

### Solução:
- Verificar se estão sendo coletados em publish-event-fix.js
- Garantir que sejam enviados para API
- Salvar URLs corretas no banco (não base64)

## 2. CAMPOS DE ENDEREÇO
### Problema:
- busca_endereco, cep, rua, numero, latitude, longitude não salvos

### Solução:
- Coletar todos os campos do formulário
- Mapear corretamente para a API

## 3. CAMPOS DO PRODUTOR
### Problema:
- Se "atual", deve buscar dados do contratante
- Se "novo", deve ter campos no wizard

### Solução:
- Buscar dados do contratante quando produtor = "atual"
- Adicionar campos no wizard para produtor novo

## 4. POLÍTICAS E TERMOS
### Problema:
- Campos politicas e termos vazios

### Solução:
- Buscar de parametros.politicas_eventos_default
- Buscar de parametros.termos_eventos_default

## 5. CAMPO dados_aceite
### Problema:
- Precisa ser JSON com dados completos do aceite

### Solução:
- Alterar tipo do campo para JSON
- Coletar: usuário, data/hora, IP, user agent, etc

## 6. CAMPO cor_fundo
### Problema:
- Não está sendo salvo

### Solução:
- Verificar se está sendo coletado
- Salvar no banco

## 7. CAMPO conteudo_combo
### Problema:
- Verificar se está mapeando IDs corretamente

### Solução:
- Garantir mapeamento de IDs temporários para reais

## 8. REDIRECIONAMENTO PÓS-PUBLICAÇÃO
### Problema:
- Deve redirecionar para /produtor/evento-publicado.php?eventoid=X

### Solução:
- Alterar resposta de sucesso no JS

## ORDEM DE EXECUÇÃO:
1. Alterar tipo do campo dados_aceite para JSON
2. Corrigir coleta de dados no JS
3. Buscar dados do contratante se necessário
4. Buscar políticas e termos padrão
5. Montar JSON de aceite
6. Garantir salvamento de todos os campos
7. Implementar redirecionamento