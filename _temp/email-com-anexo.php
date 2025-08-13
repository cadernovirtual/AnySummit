<?php
/**
 * Classe para envio de emails com anexos
 */
class EmailComAnexo {
    
    /**
     * Enviar email com anexo JPG do ingresso
     */
    public static function enviarIngressoComJPG($destinatario_email, $destinatario_nome, $assunto, $ingresso_data) {
        try {
            // Gerar hash para o ingresso
            $secret_key = "AnySummit2025@#$%ingresso";
            $timestamp = strtotime($ingresso_data['criado_em']);
            $hash_ingresso = hash('sha256', $secret_key . $ingresso_data['id'] . $timestamp);
            
            // Gerar imagem JPG do ingresso
            error_log("Iniciando geração de JPG para ingresso ID: " . $ingresso_data['id']);
            
            // Tentar primeira API (com ImageMagick)
            $api_jpg_url = "https://" . $_SERVER['HTTP_HOST'] . "/evento/api/gerar-ingresso-jpg.php?h=" . $hash_ingresso . "&action=path";
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $api_jpg_url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 60); // Aumentar timeout para geração
            
            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            error_log("Primeira API - HTTP Code: $http_code, Response: " . substr($response, 0, 200));
            
            $jpg_info = null;
            if ($http_code == 200 && !empty($response)) {
                $decoded = json_decode($response, true);
                if ($decoded && isset($decoded['success']) && $decoded['success']) {
                    $jpg_info = $decoded;
                    error_log("Primeira API funcionou: " . $jpg_info['file_path']);
                }
            }
            
            // Se a primeira API falhar, tentar a versão PHP puro
            if (!$jpg_info || !isset($jpg_info['success']) || !$jpg_info['success']) {
                error_log("Primeira API falhou, tentando versão PHP puro");
                
                $api_jpg_php_url = "https://" . $_SERVER['HTTP_HOST'] . "/evento/api/gerar-ingresso-jpg-php.php?h=" . $hash_ingresso . "&action=path";
                
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $api_jpg_php_url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($ch, CURLOPT_TIMEOUT, 30);
                
                $response = curl_exec($ch);
                $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                
                error_log("Segunda API - HTTP Code: $http_code, Response: " . substr($response, 0, 200));
                
                if ($http_code == 200 && !empty($response)) {
                    $decoded = json_decode($response, true);
                    if ($decoded && isset($decoded['success']) && $decoded['success']) {
                        $jpg_info = $decoded;
                        error_log("Segunda API funcionou: " . $jpg_info['file_path']);
                    }
                }
            }
            
            // Preparar boundary para email multipart
            $boundary = "AnySummit_" . md5(time());
            
            // Headers do email
            $headers = "MIME-Version: 1.0" . "\r\n";
            $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"" . "\r\n";
            $headers .= "From: AnySummit <ingressos@anysummit.com.br>" . "\r\n";
            $headers .= "Reply-To: ingressos@anysummit.com.br" . "\r\n";
            
            // Corpo do email
            $corpo_email = "--$boundary\r\n";
            $corpo_email .= "Content-Type: text/html; charset=UTF-8\r\n";
            $corpo_email .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
            
            // Conteúdo HTML do email
            $link_ingresso = "https://" . $_SERVER['HTTP_HOST'] . "/evento/api/ver-ingresso-individual.php?h=" . $hash_ingresso;
            
            $corpo_email .= "
            <html>
            <head><meta charset='UTF-8'></head>
            <body style='font-family: Arial, sans-serif; background: #f8f9fa; padding: 20px;'>
                <div style='max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);'>
                    <div style='background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%); color: white; padding: 30px; text-align: center;'>
                        <h1 style='margin: 0; font-size: 24px;'>🎟️ Seu Ingresso Está Pronto!</h1>
                    </div>
                    <div style='padding: 30px;'>
                        <h2 style='color: #333; margin-bottom: 20px;'>" . htmlspecialchars($ingresso_data['evento_nome']) . "</h2>
                        <p style='color: #666; font-size: 16px; line-height: 1.6;'>
                            Olá <strong>" . htmlspecialchars($destinatario_nome) . "</strong>,<br><br>
                            Seu ingresso foi validado e está anexado a este email em formato JPG para facilitar o uso no evento.
                        </p>
                        <div style='background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                            <p style='margin: 0; color: #333;'><strong>Código do Ingresso:</strong> " . htmlspecialchars($ingresso_data['codigo_ingresso']) . "</p>
                            <p style='margin: 5px 0 0 0; color: #333;'><strong>Tipo:</strong> " . htmlspecialchars($ingresso_data['titulo_ingresso']) . "</p>
                            <p style='margin: 5px 0 0 0; color: #333;'><strong>Participante:</strong> " . htmlspecialchars($destinatario_nome) . "</p>
                        </div>
                        
                        <div style='background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;'>
                            <p style='margin: 0; color: #155724; font-weight: bold;'>📎 Ingresso em anexo (JPG)</p>
                            <p style='margin: 5px 0 0 0; color: #155724; font-size: 14px;'>
                                Você pode salvar a imagem no seu celular ou imprimir para apresentar na entrada do evento.
                            </p>
                        </div>
                        
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='" . $link_ingresso . "' style='background: linear-gradient(135deg, #725EFF 0%, #00C2FF 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;'>
                                🎫 Ver Ingresso Online
                            </a>
                        </div>
                        
                        <div style='background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;'>
                            <p style='margin: 0; color: #856404; font-weight: bold;'>ℹ️ Como usar seu ingresso:</p>
                            <ul style='margin: 10px 0 0 0; color: #856404; font-size: 14px;'>
                                <li>Salve a imagem anexa no seu celular</li>
                                <li>Ou imprima o ingresso em casa</li>
                                <li>Apresente na entrada do evento</li>
                                <li>O QR Code será escaneado para validação</li>
                            </ul>
                        </div>
                        
                        <p style='color: #999; font-size: 14px; text-align: center; margin-top: 30px;'>
                            Apresente este ingresso (impresso ou digital) na entrada do evento.<br>
                            Em caso de dúvidas, entre em contato com a organização.
                        </p>
                    </div>
                </div>
            </body>
            </html>";
            
            $corpo_email .= "\r\n\r\n--$boundary\r\n";
            
            // Anexar JPG se foi gerado com sucesso
            if ($jpg_info && isset($jpg_info['success']) && $jpg_info['success'] && isset($jpg_info['file_path']) && file_exists($jpg_info['file_path'])) {
                $arquivo_jpg = $jpg_info['file_path'];
                $nome_arquivo = "Ingresso_" . $ingresso_data['codigo_ingresso'] . ".jpg";
                
                error_log("Anexando arquivo: $arquivo_jpg (tamanho: " . filesize($arquivo_jpg) . " bytes)");
                
                $corpo_email .= "Content-Type: image/jpeg; name=\"$nome_arquivo\"\r\n";
                $corpo_email .= "Content-Transfer-Encoding: base64\r\n";
                $corpo_email .= "Content-Disposition: attachment; filename=\"$nome_arquivo\"\r\n\r\n";
                
                $arquivo_conteudo = file_get_contents($arquivo_jpg);
                if ($arquivo_conteudo !== false) {
                    $corpo_email .= chunk_split(base64_encode($arquivo_conteudo));
                    error_log("Anexo adicionado com sucesso ao email");
                } else {
                    error_log("Erro ao ler arquivo JPG para anexo");
                }
                
                // Limpar arquivo temporário
                unlink($arquivo_jpg);
            } else {
                error_log("JPG não foi gerado ou arquivo não existe");
                if ($jpg_info) {
                    error_log("JPG Info: " . json_encode($jpg_info));
                }
            }
            
            $corpo_email .= "\r\n--$boundary--\r\n";
            
            // Enviar email
            $sucesso = mail($destinatario_email, $assunto, $corpo_email, $headers);
            
            if ($sucesso) {
                error_log("Email com JPG enviado para: " . $destinatario_email . " - Ingresso ID: " . $ingresso_data['id']);
                return true;
            } else {
                error_log("Falha ao enviar email com JPG para: " . $destinatario_email);
                return false;
            }
            
        } catch (Exception $e) {
            error_log("Erro ao enviar email com JPG: " . $e->getMessage());
            return false;
        }
    }
}
?>