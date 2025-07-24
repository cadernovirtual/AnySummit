# LISTA DE ARQUIVOS PARA UPLOAD FTP
# Implementação: Nova Etapa de Lotes
# Data: 18/07/2025

## ARQUIVOS MODIFICADOS (substituir no servidor):

### 1. Arquivo Principal - CRÍTICO
ORIGEM: D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\produtor\novoevento.php
DESTINO: /produtor/novoevento.php
STATUS: MODIFICADO - Nova etapa de lotes adicionada
BACKUP: novoevento_backup_original.php (criado localmente)

### 2. JavaScript Principal - ATUALIZADO  
ORIGEM: D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\produtor\js\criaevento.js
DESTINO: /produtor/js/criaevento.js
STATUS: MODIFICADO - totalSteps=8 + validação step 5

### 3. Documentação de Status
ORIGEM: D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\STATUS.md
DESTINO: /STATUS.md
STATUS: ATUALIZADO - Documentação completa da implementação

## ARQUIVOS NOVOS (criar no servidor):

### 4. JavaScript de Lotes - NOVO
ORIGEM: D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\produtor\js\lotes.js
DESTINO: /produtor/js/lotes.js
STATUS: NOVO - Sistema completo de gestão de lotes

### 5. Página de Teste - NOVO
ORIGEM: D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\teste_lotes.html
DESTINO: /teste_lotes.html
STATUS: NOVO - Interface de teste e validação

### 6. Scripts SQL/PHP - NOVOS (pasta /scripts/)
ORIGEM: D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\scripts\
DESTINO: /scripts/

Arquivos a enviar:
- finalizar_implementacao_lotes.sql (CRÍTICO - remover coluna)
- remover_percentual_aumento_valor.sql
- sincronizar_lotes_ingressos.php 
- teste_sincronizacao.php
- trigger_lotes_sync.sql

### 7. Arquivo de Upload - OPCIONAL
ORIGEM: D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\upload_ftp.bat
DESTINO: /upload_ftp.bat (opcional)
STATUS: SCRIPT DE APOIO

## COMANDOS FTP DE EXEMPLO:

### Conectar ao FTP:
```
ftp
open [seu-servidor-ftp]
[usuario]
[senha]
```

### Upload dos arquivos:
```
# Arquivo principal
put "D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\produtor\novoevento.php" "/public_html/produtor/novoevento.php"

# JavaScript de lotes (NOVO)
put "D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\produtor\js\lotes.js" "/public_html/produtor/js/lotes.js"

# JavaScript principal (ATUALIZADO)
put "D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\produtor\js\criaevento.js" "/public_html/produtor/js/criaevento.js"

# Criar pasta scripts se não existir
mkdir "/public_html/scripts"

# Scripts SQL
put "D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\scripts\finalizar_implementacao_lotes.sql" "/public_html/scripts/finalizar_implementacao_lotes.sql"
put "D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\scripts\remover_percentual_aumento_valor.sql" "/public_html/scripts/remover_percentual_aumento_valor.sql"
put "D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\scripts\sincronizar_lotes_ingressos.php" "/public_html/scripts/sincronizar_lotes_ingressos.php"
put "D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\scripts\teste_sincronizacao.php" "/public_html/scripts/teste_sincronizacao.php"
put "D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\scripts\trigger_lotes_sync.sql" "/public_html/scripts/trigger_lotes_sync.sql"

# Página de teste
put "D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\teste_lotes.html" "/public_html/teste_lotes.html"

# Documentação
put "D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\STATUS.md" "/public_html/STATUS.md"

# Sair
quit
```

## PRIORIDADE DE UPLOAD:

### CRÍTICOS (fazer primeiro):
1. ✅ novoevento.php
2. ✅ js/lotes.js  
3. ✅ js/criaevento.js
4. ✅ finalizar_implementacao_lotes.sql

### IMPORTANTES:
5. ✅ Scripts da pasta /scripts/
6. ✅ teste_lotes.html

### OPCIONAIS:
7. ✅ STATUS.md
8. ✅ upload_ftp.bat

## APÓS O UPLOAD:

### 1. Execute no MySQL:
```sql
ALTER TABLE lotes DROP COLUMN percentual_aumento_valor;
```

### 2. Teste o sistema:
- Acesse: https://seudominio.com/produtor/novoevento.php
- Teste: https://seudominio.com/teste_lotes.html

### 3. Verificar logs:
- Console do navegador para JavaScript
- Logs do servidor para PHP/SQL

## BACKUP DE SEGURANÇA:
- novoevento_backup_original.php (mantido localmente)
- Se houver problemas, restaurar do backup

## CONTATO PARA SUPORTE:
- Todos os arquivos estão prontos para upload
- Implementação testada localmente
- Documentação completa no STATUS.md
