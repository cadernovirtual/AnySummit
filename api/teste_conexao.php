<?php
// Arquivo de teste para a API de conexão
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Teste API Conexão</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .form-group { margin: 10px 0; }
        label { display: block; margin-bottom: 5px; }
        input { padding: 8px; width: 300px; }
        button { padding: 10px 20px; background: #007cba; color: white; border: none; cursor: pointer; }
        .result { margin-top: 20px; padding: 15px; border: 1px solid #ddd; background: #f9f9f9; }
        pre { background: #f5f5f5; padding: 10px; overflow: auto; }
    </style>
</head>
<body>
    <h1>Teste API Conexão Participante</h1>
    
    <form id="testForm">
        <div class="form-group">
            <label>User ID (quem está fazendo a leitura):</label>
            <input type="number" id="userid" value="1" required>
        </div>
        
        <div class="form-group">
            <label>CPF do Participante:</label>
            <input type="text" id="cpf" value="09134624627" required>
        </div>
        
        <div class="form-group">
            <label>Evento ID:</label>
            <input type="number" id="eventoid" value="19" required>
        </div>
        
        <button type="submit">Testar API</button>
    </form>
    
    <div id="result" class="result" style="display: none;">
        <h3>Resultado:</h3>
        <pre id="resultText"></pre>
    </div>

    <script>
        document.getElementById('testForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const userid = document.getElementById('userid').value;
            const cpf = document.getElementById('cpf').value;
            const eventoid = document.getElementById('eventoid').value;
            
            try {
                const response = await fetch(`conexao_participante.php?userid=${userid}&cpf=${cpf}&eventoid=${eventoid}`);
                const data = await response.text();
                
                document.getElementById('result').style.display = 'block';
                document.getElementById('resultText').textContent = data;
                
                // Tentar formatar como JSON se possível
                try {
                    const jsonData = JSON.parse(data);
                    document.getElementById('resultText').textContent = JSON.stringify(jsonData, null, 2);
                } catch(e) {
                    // Manter como texto se não for JSON válido
                }
                
            } catch (error) {
                document.getElementById('result').style.display = 'block';
                document.getElementById('resultText').textContent = 'Erro: ' + error.message;
            }
        });
    </script>
</body>
</html>
