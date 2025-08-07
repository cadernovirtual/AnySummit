<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Erro - Any Summit</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .error-card {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 3rem;
            text-align: center;
            max-width: 500px;
            width: 100%;
        }
        
        .error-icon {
            font-size: 4rem;
            color: #dc3545;
            margin-bottom: 1.5rem;
        }
        
        .btn-custom {
            padding: 0.75rem 2rem;
            border-radius: 10px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .btn-custom:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>
    <div class="error-card">
        <div class="error-icon">
            <i class="fas fa-exclamation-triangle"></i>
        </div>
        
        <h2 class="text-danger mb-3">Ops! Algo deu errado</h2>
        
        <p class="text-muted mb-4">
            <?php echo isset($erro) ? htmlspecialchars($erro) : 'Ocorreu um erro inesperado. Tente novamente mais tarde.'; ?>
        </p>
        
        <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center">
            <a href="/" class="btn btn-primary btn-custom">
                <i class="fas fa-home me-2"></i>
                Ir para o Início
            </a>
            <a href="mailto:suporte@anysummit.com" class="btn btn-outline-secondary btn-custom">
                <i class="fas fa-envelope me-2"></i>
                Entrar em Contato
            </a>
        </div>
        
        <div class="mt-4">
            <small class="text-muted">
                Se o problema persistir, entre em contato com nosso suporte.
            </small>
        </div>
    </div>
</body>
</html>
