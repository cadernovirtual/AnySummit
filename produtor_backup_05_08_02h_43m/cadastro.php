<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Criar Conta - Anysummit</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 35%, #16213E 70%, #0F3460 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: #FFFFFF;
        }

        .signup-container {
            background: rgba(42, 42, 56, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 40px;
            width: 100%;
            max-width: 420px;
            box-shadow: 
                0 20px 40px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            position: relative;
            overflow: hidden;
        }

        .signup-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, #00C2FF, #725EFF, transparent);
        }

        .logo-section {
            text-align: center;
            margin-bottom: 32px;
        }

        .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            border-radius: 16px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
            box-shadow: 0 8px 32px rgba(0, 194, 255, 0.3);
            position: relative;
        }

        .logo::before {
            content: 'A';
            font-size: 28px;
            font-weight: bold;
            color: white;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }

        .logo::after {
            content: '';
            position: absolute;
            inset: -2px;
            background: linear-gradient(45deg, #00C2FF, #725EFF, #00C2FF);
            border-radius: 18px;
            z-index: -1;
            filter: blur(8px);
            opacity: 0.7;
        }

        .brand-name {
            font-size: 28px;
            font-weight: 700;
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 8px;
        }

        .subtitle {
            color: #B8B8C8;
            font-size: 16px;
            font-weight: 400;
        }

        .form-group {
            margin-bottom: 24px;
        }

        .form-label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 500;
            color: #E0E0E8;
        }

        .form-input {
            width: 100%;
            padding: 16px 20px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: #FFFFFF;
            font-size: 16px;
            transition: all 0.3s ease;
            outline: none;
        }

        .form-input::placeholder {
            color: #888899;
        }

        .form-input:focus {
            border-color: #00C2FF;
            box-shadow: 
                0 0 0 3px rgba(0, 194, 255, 0.1),
                0 0 20px rgba(0, 194, 255, 0.2);
            background: rgba(255, 255, 255, 0.08);
        }

        .form-select {
            width: 100%;
            padding: 16px 20px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: #FFFFFF;
            font-size: 16px;
            transition: all 0.3s ease;
            outline: none;
            cursor: pointer;
        }

        .form-select:focus {
            border-color: #00C2FF;
            box-shadow: 
                0 0 0 3px rgba(0, 194, 255, 0.1),
                0 0 20px rgba(0, 194, 255, 0.2);
            background: rgba(255, 255, 255, 0.08);
        }

        .form-select option {
            background: #2A2A38;
            color: #FFFFFF;
        }

        .create-button {
            width: 100%;
            padding: 18px;
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            border: none;
            border-radius: 12px;
            color: white;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 24px;
            position: relative;
            overflow: hidden;
        }

        .create-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }

        .create-button:hover {
            transform: translateY(-2px);
            box-shadow: 
                0 8px 25px rgba(0, 194, 255, 0.4),
                0 0 40px rgba(114, 94, 255, 0.3);
        }

        .create-button:hover::before {
            left: 100%;
        }

        .login-link {
            text-align: center;
            margin-bottom: 32px;
        }

        .login-link a {
            color: #00C2FF;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .login-link a:hover {
            color: #725EFF;
            text-shadow: 0 0 8px rgba(0, 194, 255, 0.5);
        }

        .legal-text {
            font-size: 12px;
            color: #888899;
            text-align: center;
            line-height: 1.5;
        }

        .legal-text a {
            color: #00C2FF;
            text-decoration: none;
        }

        .legal-text a:hover {
            text-decoration: underline;
        }

        .hidden {
            display: none;
        }

        .alert {
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 12px;
            color: white;
            font-weight: 500;
        }

        .alert-error {
            background: rgba(255, 82, 82, 0.2);
            border: 1px solid rgba(255, 82, 82, 0.3);
        }

        .alert-success {
            background: rgba(0, 200, 81, 0.2);
            border: 1px solid rgba(0, 200, 81, 0.3);
        }

        /* Responsive Design */
        @media (max-width: 480px) {
            .signup-container {
                padding: 32px 24px;
                margin: 20px;
                border-radius: 20px;
            }

            .brand-name {
                font-size: 24px;
            }

            .form-input {
                padding: 14px 16px;
            }

            .create-button {
                padding: 16px;
            }
        }

        /* Floating particles animation */
        .particle {
            position: absolute;
            background: radial-gradient(circle, #00C2FF, transparent);
            border-radius: 50%;
            pointer-events: none;
            animation: float 6s ease-in-out infinite;
        }

        .particle:nth-child(1) {
            width: 4px;
            height: 4px;
            top: 20%;
            left: 10%;
            animation-delay: 0s;
        }

        .particle:nth-child(2) {
            width: 6px;
            height: 6px;
            top: 60%;
            right: 15%;
            animation-delay: 2s;
        }

        .particle:nth-child(3) {
            width: 3px;
            height: 3px;
            bottom: 30%;
            left: 20%;
            animation-delay: 4s;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px) scale(1); opacity: 0.7; }
            50% { transform: translateY(-20px) scale(1.1); opacity: 1; }
        }
    </style>
</head>
<body>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>

    <div class="signup-container">
        <div class="logo-section">
                 <img src="img/logover.png" style="width:100%; max-width:200px;">
            <p class="subtitle">Crie sua conta e comece sua jornada</p>
        </div>

        <?php
        session_start();
        $message = '';
        $messageType = '';

        // Função para definir cookies sem expiração
        function setCookieForever($name, $value) {
            // Define cookie com tempo de expiração muito longe no futuro (10 anos)
            $expire = time() + (10 * 365 * 24 * 60 * 60); // 10 anos
            setcookie($name, $value, $expire, "/", "", false, true); // HttpOnly para segurança
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // Incluir arquivo de conexão
            require_once 'conm/conn.php';

            try {
                // Converter conexão mysqli para PDO para manter compatibilidade
                $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $senha);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

                // Validação dos dados
                $nome = trim($_POST['fullName']);
                $email = trim($_POST['email']);
                $celular = trim($_POST['phone']);
                $senha_form = $_POST['password'];
                $tipo_pessoa = $_POST['tipo_pessoa'];

                // Debug - verificar se chegou até aqui
                error_log("Dados recebidos: Nome=$nome, Email=$email, Tipo=$tipo_pessoa");

                // Verificar se o email já existe
                $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
                $stmt->execute([$email]);
                if ($stmt->rowCount() > 0) {
                    throw new Exception("Este e-mail já está cadastrado!");
                }

                // Iniciar transação
                $pdo->beginTransaction();

                // Dados do contratante
                $contratante_data = [
                    'email_contato' => $email,
                    'telefone' => $celular,
                    'ativo' => 1,
                    'criado_em' => date('Y-m-d H:i:s'),
                    'atualizado_em' => date('Y-m-d H:i:s')
                ];

                if ($tipo_pessoa === 'fisica') {
                    $contratante_data['nome_fantasia'] = $nome;
                    $contratante_data['cpf'] = preg_replace('/[^0-9]/', '', $_POST['cpf']);
                } else {
                    $contratante_data['nome_fantasia'] = $_POST['nome_fantasia'];
                    $contratante_data['razao_social'] = $_POST['razao_social'];
                    $contratante_data['cnpj'] = preg_replace('/[^0-9]/', '', $_POST['cnpj']);
                }

                // Inserir contratante
                $sql = "INSERT INTO contratantes (nome_fantasia, razao_social, cnpj, cpf, email_contato, telefone, ativo, criado_em, atualizado_em) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $contratante_data['nome_fantasia'],
                    $contratante_data['razao_social'] ?? null,
                    $contratante_data['cnpj'] ?? null,
                    $contratante_data['cpf'] ?? null,
                    $contratante_data['email_contato'],
                    $contratante_data['telefone'],
                    $contratante_data['ativo'],
                    $contratante_data['criado_em'],
                    $contratante_data['atualizado_em']
                ]);

                $contratante_id = $pdo->lastInsertId();
                error_log("Contratante inserido com ID: $contratante_id");

                // Inserir usuário
                $senha_hash = password_hash($senha_form, PASSWORD_DEFAULT);
                $sql = "INSERT INTO usuarios (contratante_id, nome, email, celular, senha_hash, perfil, nome_exibicao, ativo, email_verificado, criado_em, atualizado_em) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $contratante_id,
                    $nome,
                    $email,
                    $celular,
                    $senha_hash,
                    'produtor',
                    $nome,
                    1,
                    0,
                    date('Y-m-d H:i:s'),
                    date('Y-m-d H:i:s')
                ]);

                $usuario_id = $pdo->lastInsertId();
                error_log("Usuário inserido com ID: $usuario_id");

                // Confirmar transação
                $pdo->commit();

                // Definir sessões
                $_SESSION['usuario_logado'] = true;
                $_SESSION['usuarioid'] = $usuario_id;
                $_SESSION['usuario_nome'] = $nome;
                $_SESSION['usuario_email'] = $email;
                $_SESSION['contratanteid'] = $contratante_id;
                
                // Definir cookies sem expiração
                setCookieForever('usuario_logado', '1');
                setCookieForever('usuarioid', $usuario_id);
                setCookieForever('usuario_nome', $nome);
                setCookieForever('usuario_email', $email);
                setCookieForever('contratanteid', $contratante_id);

                error_log("Redirecionando para bem-vindo.php");
                
                // Verificar se headers já foram enviados
                if (!headers_sent()) {
                    // Redirecionar para página de boas-vindas
                    header("Location: bem-vindo.php");
                    exit();
                } else {
                    // Se headers já foram enviados, usar JavaScript
                    echo "<script>window.location.href = 'bem-vindo.php';</script>";
                    echo "<meta http-equiv='refresh' content='0;url=bem-vindo.php'>";
                    exit();
                }

            } catch (Exception $e) {
                if (isset($pdo)) {
                    $pdo->rollBack();
                }
                error_log("Erro no cadastro: " . $e->getMessage());
                $message = "Erro ao criar conta: " . $e->getMessage();
                $messageType = 'error';
            }
        }
        ?>

        <?php if ($message): ?>
            <div class="alert alert-<?php echo $messageType; ?>">
                <?php echo htmlspecialchars($message); ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="">
            <div class="form-group">
                <label class="form-label" for="tipo_pessoa">Tipo de pessoa</label>
                <select id="tipo_pessoa" name="tipo_pessoa" class="form-select" required onChange="togglePessoaFields()">
                    <option value="">Selecione...</option>
                    <option value="fisica">Pessoa Física</option>
                    <option value="juridica">Pessoa Jurídica</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label" for="fullName">Nome completo</label>
                <input type="text" id="fullName" name="fullName" class="form-input" placeholder="Digite seu nome completo" required>
            </div>

            <!-- Campos para Pessoa Física -->
            <div id="pessoa-fisica-fields" class="hidden">
                <div class="form-group">
                    <label class="form-label" for="cpf">CPF</label>
                    <input type="text" id="cpf" name="cpf" class="form-input" placeholder="000.000.000-00" maxlength="14">
                </div>
            </div>

            <!-- Campos para Pessoa Jurídica -->
            <div id="pessoa-juridica-fields" class="hidden">
                <div class="form-group">
                    <label class="form-label" for="nome_fantasia">Nome Fantasia</label>
                    <input type="text" id="nome_fantasia" name="nome_fantasia" class="form-input" placeholder="Nome fantasia da empresa">
                </div>

                <div class="form-group">
                    <label class="form-label" for="razao_social">Razão Social</label>
                    <input type="text" id="razao_social" name="razao_social" class="form-input" placeholder="Razão social da empresa">
                </div>

                <div class="form-group">
                    <label class="form-label" for="cnpj">CNPJ</label>
                    <input type="text" id="cnpj" name="cnpj" class="form-input" placeholder="00.000.000/0000-00" maxlength="18">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" for="email">E-mail</label>
                <input type="email" id="email" name="email" class="form-input" placeholder="Digite seu e-mail" required>
            </div>

            <div class="form-group">
                <label class="form-label" for="phone">Celular</label>
                <input type="tel" id="phone" name="phone" class="form-input" placeholder="(11) 99999-9999" maxlength="15" required>
            </div>

            <div class="form-group">
                <label class="form-label" for="password">Senha</label>
                <input type="password" id="password" name="password" class="form-input" placeholder="Crie uma senha segura" required>
            </div>

            <button type="submit" class="create-button">
                Criar conta
            </button>
        </form>

        <div class="login-link">
            <a href="#login">Já tenho uma conta</a>
        </div>

        <div class="legal-text">
            Ao criar sua conta, você concorda com os 
            <a href="#terms">Termos de uso</a> e a 
            <a href="#privacy">Política de privacidade</a>.
        </div>
    </div>

    <script>
        // Função para alternar campos pessoa física/jurídica
        function togglePessoaFields() {
            const tipoPessoa = document.getElementById('tipo_pessoa').value;
            const camposFisica = document.getElementById('pessoa-fisica-fields');
            const camposJuridica = document.getElementById('pessoa-juridica-fields');

            if (tipoPessoa === 'fisica') {
                camposFisica.classList.remove('hidden');
                camposJuridica.classList.add('hidden');
                document.getElementById('cpf').required = true;
                document.getElementById('nome_fantasia').required = false;
                document.getElementById('razao_social').required = false;
                document.getElementById('cnpj').required = false;
            } else if (tipoPessoa === 'juridica') {
                camposFisica.classList.add('hidden');
                camposJuridica.classList.remove('hidden');
                document.getElementById('cpf').required = false;
                document.getElementById('nome_fantasia').required = true;
                document.getElementById('razao_social').required = true;
                document.getElementById('cnpj').required = true;
            } else {
                camposFisica.classList.add('hidden');
                camposJuridica.classList.add('hidden');
            }
        }

        // Phone mask function
        function phoneMask(input) {
            let value = input.value.replace(/\D/g, ''); // Remove non-digits
            
            if (value.length <= 11) {
                // Format: (XX) XXXXX-XXXX
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
            }
            
            input.value = value;
        }

        // CPF mask function
        function cpfMask(input) {
            let value = input.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            input.value = value;
        }

        // CNPJ mask function
        function cnpjMask(input) {
            let value = input.value.replace(/\D/g, '');
            value = value.replace(/(\d{2})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1/$2');
            value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
            input.value = value;
        }

        // Apply masks
        const phoneInput = document.getElementById('phone');
        phoneInput.addEventListener('input', function() {
            phoneMask(this);
        });

        const cpfInput = document.getElementById('cpf');
        cpfInput.addEventListener('input', function() {
            cpfMask(this);
        });

        const cnpjInput = document.getElementById('cnpj');
        cnpjInput.addEventListener('input', function() {
            cnpjMask(this);
        });

        // Add form interaction effects
        const inputs = document.querySelectorAll('.form-input, .form-select');
        
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.style.transform = 'translateY(-2px)';
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.style.transform = 'translateY(0)';
            });
        });

        // Add smooth scroll and page interactions
        document.addEventListener('mousemove', function(e) {
            const particles = document.querySelectorAll('.particle');
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            particles.forEach((particle, index) => {
                const speed = (index + 1) * 0.5;
                const x = mouseX * speed;
                const y = mouseY * speed;
                
                particle.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
    </script>
</body>
</html>