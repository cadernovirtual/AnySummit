@echo off
echo Movendo arquivos JavaScript antigos para pasta old...

REM Lista de arquivos que NÃO devem ser movidos
REM - wizard-final-completo.js
REM - core-functions.js
REM - wizard-compatibility.js
REM - custom-dialogs.js
REM - alert-overrides.js
REM - qrcode.min.js

REM Movendo arquivos antigos
move "combo-final-fix.js.deleted" "old\" 2>nul
move "combo-final-fixes.js" "old\" 2>nul
move "combo-fix-deleted.js" "old\" 2>nul
move "combo-fixes-v3.js" "old\" 2>nul
move "combo-format-fix.js.old" "old\" 2>nul
move "combo-functions.js" "old\" 2>nul
move "combo-override.js" "old\" 2>nul
move "combo-tax-fix.js" "old\" 2>nul
move "combo-trash-icon-fix.js" "old\" 2>nul
move "combo-visual-fixes.js" "old\" 2>nul
move "complete-fixes.js" "old\" 2>nul
move "consolidated-fix-v2.js" "old\" 2>nul
move "consolidated-fix.js" "old\" 2>nul
move "correcoes-definitivas.js" "old\" 2>nul
move "correção-definitiva-combo.js.deleted" "old\" 2>nul
move "criaevento.js" "old\" 2>nul
move "criaevento_backup_problematico.js" "old\" 2>nul
move "criar-modais-edicao.js" "old\" 2>nul
move "debug-completo-modais.js" "old\" 2>nul
move "debug-edicao.js" "old\" 2>nul
move "debug-load.js" "old\" 2>nul
move "debug-lote-completo.js" "old\" 2>nul
move "debug-step4.js" "old\" 2>nul
move "debug-validacoes.js" "old\" 2>nul
move "edit-combo-fixes.js" "old\" 2>nul
move "edit-combo-functions.js" "old\" 2>nul
move "edit-load-dates-fix.js" "old\" 2>nul
move "edit-modal-fixes.js" "old\" 2>nul
move "editarevento-v2.js" "old\" 2>nul
move "editarevento.js" "old\" 2>nul
move "emergencia-limpar-lote.js" "old\" 2>nul
move "final-corrections.js" "old\" 2>nul
move "final-fixes.js" "old\" 2>nul
move "fix-current-step.js" "old\" 2>nul
move "fix-edicao-final.js" "old\" 2>nul
move "forced-fixes.js" "old\" 2>nul
move "ingressos-gratuitos-create.js" "old\" 2>nul
move "ingressos-gratuitos.js" "old\" 2>nul
move "ingressos-pagos-edit.js" "old\" 2>nul
move "ingressos-pagos.js" "old\" 2>nul
move "lote-dates-fix.js" "old\" 2>nul
move "lote-edit-free-fix.js" "old\" 2>nul
move "lote-id-normalizer.js" "old\" 2>nul
move "lote-ingresso-debug.js" "old\" 2>nul
move "lote-modal-fix-final.js" "old\" 2>nul
move "lote-protection.js" "old\" 2>nul
move "lote-ticket-functions.js" "old\" 2>nul
move "lotes-combo-fixes.js.deleted" "old\" 2>nul
move "lotes-fix.js" "old\" 2>nul
move "lotes-ingressos-persistence.js" "old\" 2>nul
move "lotes.js" "old\" 2>nul
move "maps-fix.js" "old\" 2>nul
move "modal-correto.js" "old\" 2>nul
move "modal-debug.js" "old\" 2>nul
move "modal-fixes.js" "old\" 2>nul
move "modal-simples.js" "old\" 2>nul
move "persistencia-taxa-fix.js" "old\" 2>nul
move "preview-fix.js" "old\" 2>nul
move "preview-update-fix.js" "old\" 2>nul
move "publish-event-fix.js" "old\" 2>nul
move "restore-fix.js" "old\" 2>nul
move "step5-validation.js" "old\" 2>nul
move "super-combo-fix.js.deleted" "old\" 2>nul
move "taxa-servico-completa.js" "old\" 2>nul
move "temporary-tickets.js" "old\" 2>nul
move "terms-privacy-handler.js" "old\" 2>nul
move "test-fixes.js" "old\" 2>nul
move "ticket-functions-fix.js" "old\" 2>nul
move "trash-icon-fix.js" "old\" 2>nul
move "trash-icon-patch-deleted.js" "old\" 2>nul
move "upload-images-fix.js" "old\" 2>nul
move "upload-images.js" "old\" 2>nul
move "urgent-ticket-fix.js" "old\" 2>nul
move "validation-fix.js" "old\" 2>nul
move "wizard-debug.js" "old\" 2>nul
move "wizard-essential-fixes.js" "old\" 2>nul
move "wizard-final-parte1.js" "old\" 2>nul
move "wizard-final-parte2.js" "old\" 2>nul
move "wizard-fix-definitivo.js" "old\" 2>nul
move "wizard-fix.js" "old\" 2>nul
move "wizard-quick-fixes.js" "old\" 2>nul
move "_deletar_fix-all-encoding.js" "old\" 2>nul
move "_old_fix-combo-encoding.js" "old\" 2>nul
move "_old_fix-encoding.js" "old\" 2>nul

echo.
echo Arquivos movidos com sucesso!
echo.
echo Arquivos mantidos na pasta js/:
dir /b *.js
pause
