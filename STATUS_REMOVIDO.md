# Status da Sessão Atual

## Tarefa em Andamento
Corrigir checkbox dos termos na etapa 8 do wizard de criação de eventos

## Problemas Identificados
1. Checkbox vem marcado e readonly quando não deveria
2. Botão "Publicar Evento" não é habilitado quando checkbox está marcado
3. Campo eventos.termos_aceitos não recebe 1 quando checkbox é marcado
4. Após evento publicado, checkbox deveria desaparecer e botão virar "Acessar Página do Evento"

## Arquivos a Modificar
- novoevento.php (linha 1415: checkbox HTML)
- js/criaevento.js (linha 582: validação checkbox)
- js/wizard-database.js (linha 871: função publicarEvento)

## Próximos Passos
1. Verificar status do evento no PHP e carregar no JavaScript
2. Corrigir lógica do checkbox baseada no status
3. Implementar salvamento de termos_aceitos
4. Alterar botão após publicação