# PowerShell FTP Upload Script
# AnySummit - Implementação de Lotes
# Execute este script para fazer upload de todos os arquivos

# Configurações FTP (ALTERE CONFORME SEU SERVIDOR)
$ftpServer = "ftp://SEU-SERVIDOR-FTP.com"
$ftpUser = "SEU-USUARIO"
$ftpPass = "SUA-SENHA"
$basePath = "/public_html"

# Função para upload de arquivo
function Upload-File {
    param($localFile, $remotePath)
    
    try {
        Write-Host "Enviando: $localFile -> $remotePath" -ForegroundColor Yellow
        
        $request = [System.Net.FtpWebRequest]::Create("$ftpServer$basePath$remotePath")
        $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $request.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
        $request.UseBinary = $true
        
        $fileContent = [System.IO.File]::ReadAllBytes($localFile)
        $request.ContentLength = $fileContent.Length
        
        $stream = $request.GetRequestStream()
        $stream.Write($fileContent, 0, $fileContent.Length)
        $stream.Close()
        
        $response = $request.GetResponse()
        Write-Host "✅ Sucesso: $remotePath" -ForegroundColor Green
        $response.Close()
    }
    catch {
        Write-Host "❌ Erro: $localFile - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Função para criar diretório
function Create-Directory {
    param($remotePath)
    
    try {
        Write-Host "Criando diretório: $remotePath" -ForegroundColor Cyan
        
        $request = [System.Net.FtpWebRequest]::Create("$ftpServer$basePath$remotePath")
        $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $request.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPass)
        
        $response = $request.GetResponse()
        $response.Close()
        Write-Host "✅ Diretório criado: $remotePath" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️ Diretório já existe ou erro: $remotePath" -ForegroundColor Yellow
    }
}

# Caminho base local
$localBase = "D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html"

Write-Host "=======================================" -ForegroundColor Magenta
Write-Host "   UPLOAD ANYSUMMIT - IMPLEMENTAÇÃO LOTES" -ForegroundColor Magenta  
Write-Host "=======================================" -ForegroundColor Magenta
Write-Host ""

# Lista de arquivos para upload
$arquivos = @(
    @{Local="$localBase\produtor\novoevento.php"; Remoto="/produtor/novoevento.php"; Tipo="CRÍTICO"},
    @{Local="$localBase\produtor\js\lotes.js"; Remoto="/produtor/js/lotes.js"; Tipo="NOVO"},
    @{Local="$localBase\produtor\js\criaevento.js"; Remoto="/produtor/js/criaevento.js"; Tipo="ATUALIZADO"},
    @{Local="$localBase\scripts\finalizar_implementacao_lotes.sql"; Remoto="/scripts/finalizar_implementacao_lotes.sql"; Tipo="CRÍTICO"},
    @{Local="$localBase\scripts\remover_percentual_aumento_valor.sql"; Remoto="/scripts/remover_percentual_aumento_valor.sql"; Tipo="NOVO"},
    @{Local="$localBase\scripts\sincronizar_lotes_ingressos.php"; Remoto="/scripts/sincronizar_lotes_ingressos.php"; Tipo="NOVO"},
    @{Local="$localBase\scripts\teste_sincronizacao.php"; Remoto="/scripts/teste_sincronizacao.php"; Tipo="NOVO"},
    @{Local="$localBase\scripts\trigger_lotes_sync.sql"; Remoto="/scripts/trigger_lotes_sync.sql"; Tipo="NOVO"},
    @{Local="$localBase\teste_lotes.html"; Remoto="/teste_lotes.html"; Tipo="NOVO"},
    @{Local="$localBase\STATUS.md"; Remoto="/STATUS.md"; Tipo="ATUALIZADO"}
)

# Criar diretório scripts se não existir
Create-Directory "/scripts"

# Upload dos arquivos
foreach ($arquivo in $arquivos) {
    if (Test-Path $arquivo.Local) {
        Write-Host ""
        Write-Host "[$($arquivo.Tipo)] $($arquivo.Local)" -ForegroundColor Blue
        Upload-File $arquivo.Local $arquivo.Remoto
    } else {
        Write-Host "❌ Arquivo não encontrado: $($arquivo.Local)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Magenta
Write-Host "   UPLOAD CONCLUÍDO!" -ForegroundColor Magenta
Write-Host "=======================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Execute no MySQL: ALTER TABLE lotes DROP COLUMN percentual_aumento_valor;" -ForegroundColor White
Write-Host "2. Teste em: /produtor/novoevento.php" -ForegroundColor White
Write-Host "3. Validação: /teste_lotes.html" -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
