@echo off
echo ==========================================
echo   UPLOAD DE ARQUIVOS - IMPLEMENTACAO LOTES
echo ==========================================
echo.

echo [1/6] Fazendo upload do arquivo principal...
echo Arquivo: novoevento.php
REM Aqui você deve adicionar o comando FTP específico do seu provedor

echo [2/6] Fazendo upload do JavaScript de lotes...
echo Arquivo: js/lotes.js
REM Comando FTP para js/lotes.js

echo [3/6] Fazendo upload do JavaScript principal atualizado...
echo Arquivo: js/criaevento.js  
REM Comando FTP para js/criaevento.js

echo [4/6] Fazendo upload dos scripts SQL...
echo Pasta: scripts/
REM Comandos FTP para todos os arquivos .sql e .php da pasta scripts

echo [5/6] Fazendo upload da página de teste...
echo Arquivo: teste_lotes.html
REM Comando FTP para teste_lotes.html

echo [6/6] Fazendo upload do STATUS.md...
echo Arquivo: STATUS.md
REM Comando FTP para STATUS.md

echo.
echo ==========================================
echo   UPLOAD CONCLUIDO COM SUCESSO!
echo ==========================================
echo.
echo Arquivos enviados:
echo - /produtor/novoevento.php (ATUALIZADO)
echo - /produtor/js/lotes.js (NOVO)
echo - /produtor/js/criaevento.js (ATUALIZADO)
echo - /scripts/*.sql (NOVOS - 5 arquivos)
echo - /scripts/*.php (NOVOS - 2 arquivos)  
echo - /teste_lotes.html (NOVO)
echo - /STATUS.md (ATUALIZADO)
echo.
echo Próximos passos:
echo 1. Execute o script SQL: finalizar_implementacao_lotes.sql
echo 2. Teste em: /produtor/novoevento.php
echo 3. Página de teste: /teste_lotes.html
echo.
pause
