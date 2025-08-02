<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro de Produtor - AnySummit</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 35%, #16213E 70%, #0F3460 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: #FFFFFF;
        }

        .wizard-container {
            background: rgba(42, 42, 56, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 40px;
            width: 100%;
            max-width: 600px;
            box-shadow: 
                0 20px 40px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            position: relative;
            overflow: hidden;
        }

        .wizard-container::before {
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

        .logo-section img {
            width: 100%;
            max-width: 200px;
            margin-bottom: 16px;
        }

        .subtitle {
            color: #B8B8C8;
            font-size: 16px;
            font-weight: 400;
            margin-bottom: 8px;
        }

        /* Progress Bar */
        .progress-container {
            margin-bottom: 40px;
        }

        .progress-bar {
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #00C2FF, #725EFF);
            border-radius: 2px;
            transition: width 0.3s ease;
            box-shadow: 0 0 10px rgba(0, 194, 255, 0.5);
        }

        .progress-steps {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
        }

        .progress-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
            position: relative;
        }

        .progress-step:not(:last-child)::after {
            content: '';
            position: absolute;
            top: 15px;
            left: 50%;
            width: 100%;
            height: 1px;
            background: rgba(255, 255, 255, 0.1);
        }

        .step-number {
            width: 30px;
            height: 30px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
            z-index: 1;
            transition: all 0.3s ease;
        }

        .step-number.active {
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            box-shadow: 0 0 20px rgba(0, 194, 255, 0.5);
        }

        .step-number.completed {
            background: #00C2FF;
        }

        .step-label {
            font-size: 12px;
            color: #888899;
            text-align: center;
        }

        .step-label.active {
            color: #E0E0E8;
        }

        /* Form Sections */
        .form-section {
            display: none;
        }

        .form-section.active {
            display: block;
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

        .form-label .required {
            color: #FF6B6B;
        }

        .form-input, .form-select {
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

        .form-input:focus, .form-select:focus {
            border-color: #00C2FF;
            box-shadow: 
                0 0 0 3px rgba(0, 194, 255, 0.1),
                0 0 20px rgba(0, 194, 255, 0.2);
            background: rgba(255, 255, 255, 0.08);
        }

        .form-input.error {
            border-color: #FF6B6B;
            box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
        }

        .form-select option {
            background: #2A2A38;
            color: #FFFFFF;
        }

        .form-helper {
            font-size: 12px;
            color: #888899;
            margin-top: 8px;
        }

        .form-error {
            font-size: 12px;
            color: #FF6B6B;
            margin-top: 8px;
            display: none;
        }

        /* Buttons */
        .button-group {
            display: flex;
            gap: 16px;
            margin-top: 32px;
        }

        .button {
            flex: 1;
            padding: 16px 24px;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .button-primary {
            background: linear-gradient(135deg, #00C2FF, #725EFF);
            color: white;
        }

        .button-primary::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }

        .button-primary:hover {
            transform: translateY(-2px);
            box-shadow: 
                0 8px 25px rgba(0, 194, 255, 0.4),
                0 0 40px rgba(114, 94, 255, 0.3);
        }

        .button-primary:hover::before {
            left: 100%;
        }

        .button-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: #E0E0E8;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .button-secondary:hover {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.3);
        }

        .button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        /* Email Verification */
        .email-verification {
            display: none;
            text-align: center;
        }

        .email-icon {
            font-size: 64px;
            color: #00C2FF;
            margin-bottom: 24px;
        }

        .verification-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 16px;
        }

        .verification-text {
            color: #B8B8C8;
            margin-bottom: 32px;
        }

        .verification-email {
            color: #00C2FF;
            font-weight: 500;
        }

        .code-inputs {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-bottom: 32px;
        }

        .code-input {
            width: 60px;
            height: 60px;
            text-align: center;
            font-size: 24px;
            font-weight: 600;
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: #FFFFFF;
            transition: all 0.3s ease;
        }

        .code-input:focus {
            border-color: #00C2FF;
            box-shadow: 0 0 0 3px rgba(0, 194, 255, 0.1);
            background: rgba(255, 255, 255, 0.08);
        }

        .resend-link {
            color: #00C2FF;
            text-decoration: none;
            font-size: 14px;
            transition: all 0.3s ease;
        }

        .resend-link:hover {
            color: #725EFF;
            text-decoration: underline;
        }

        .resend-link:disabled {
            color: #888899;
            cursor: not-allowed;
            text-decoration: none;
        }

        /* Success State */
        .success-container {
            display: none;
            text-align: center;
        }

        .success-icon {
            font-size: 80px;
            color: #00C851;
            margin-bottom: 24px;
        }

        .success-title {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 16px;
        }

        .success-text {
            color: #B8B8C8;
            font-size: 18px;
            margin-bottom: 32px;
        }

        /* Loading */
        .loading {
            display: none;
            text-align: center;
            padding: 40px;
        }

        .spinner {
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            border-top: 3px solid #00C2FF;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Alert Messages */
        .alert {
            padding: 16px 20px;
            margin-bottom: 20px;
            border-radius: 12px;
            font-size: 14px;
            display: none;
        }

        .alert.show {
            display: block;
        }

        .alert-error {
            background: rgba(255, 82, 82, 0.1);
            border: 1px solid rgba(255, 82, 82, 0.3);
            color: #FF5252;
        }

        .alert-success {
            background: rgba(0, 200, 81, 0.1);
            border: 1px solid rgba(0, 200, 81, 0.3);
            color: #00C851;
        }

        .alert-info {
            background: rgba(0, 194, 255, 0.1);
            border: 1px solid rgba(0, 194, 255, 0.3);
            color: #00C2FF;
        }

        /* Login Link */
        .login-link {
            text-align: center;
            margin-top: 24px;
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

        /* Responsive */
        @media (max-width: 480px) {
            .wizard-container {
                padding: 24px;
            }

            .code-inputs {
                gap: 8px;
            }

            .code-input {
                width: 50px;
                height: 50px;
                font-size: 20px;
            }

            .button-group {
                flex-direction: column;
            }

            .progress-step .step-label {
                display: none;
            }
        }
    </style>
</head>
<body>    <div class="wizard-container">
        <!-- Logo Section -->
        <div class="logo-section">
            <img src="img/logover.png" alt="AnySummit">
            <p class="subtitle">Crie sua conta de produtor</p>
        </div>

        <!-- Alert Messages -->
        <div id="alertContainer" class="alert"></div>

        <!-- Progress Bar -->
        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill" style="width: 25%;"></div>
            </div>
            <div class="progress-steps">
                <div class="progress-step">
                    <div class="step-number active" id="step1">1</div>
                    <span class="step-label active">Email</span>
                </div>
                <div class="progress-step">
                    <div class="step-number" id="step2">2</div>
                    <span class="step-label">Dados</span>
                </div>
                <div class="progress-step">
                    <div class="step-number" id="step3">3</div>
                    <span class="step-label">Empresa</span>
                </div>
                <div class="progress-step">
                    <div class="step-number" id="step4">4</div>
                    <span class="step-label">Confirmar</span>
                </div>
            </div>
        </div>

        <!-- Form Container -->
        <form id="wizardForm" novalidate>
            <!-- Step 1: Email -->
            <div class="form-section active" id="section1">
                <h2 style="margin-bottom: 24px;">Vamos começar com seu email</h2>
                <div class="form-group">
                    <label class="form-label" for="email">
                        Email <span class="required">*</span>
                    </label>
                    <input type="email" id="email" name="email" class="form-input" 
                           placeholder="seu@email.com" required>
                    <div class="form-helper">Este será seu email de acesso ao sistema</div>
                    <div class="form-error" id="emailError"></div>
                </div>
                
                <div class="button-group">
                    <button type="button" class="button button-primary" onclick="nextStep()">
                        Continuar <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>

            <!-- Step 2: Personal Data -->
            <div class="form-section" id="section2">
                <h2 style="margin-bottom: 24px;">Seus dados pessoais</h2>
                
                <div class="form-group">
                    <label class="form-label" for="nome">
                        Nome completo <span class="required">*</span>
                    </label>
                    <input type="text" id="nome" name="nome" class="form-input" 
                           placeholder="Digite seu nome completo" required>
                    <div class="form-error" id="nomeError"></div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="celular">
                        Celular/WhatsApp <span class="required">*</span>
                    </label>
                    <input type="tel" id="celular" name="celular" class="form-input" 
                           placeholder="(11) 99999-9999" maxlength="15" required>
                    <div class="form-error" id="celularError"></div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="senha">
                        Senha <span class="required">*</span>
                    </label>
                    <input type="password" id="senha" name="senha" class="form-input" 
                           placeholder="Mínimo 8 caracteres" required minlength="8">
                    <div class="form-helper">Use letras, números e caracteres especiais</div>
                    <div class="form-error" id="senhaError"></div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="confirmaSenha">
                        Confirmar senha <span class="required">*</span>
                    </label>
                    <input type="password" id="confirmaSenha" name="confirmaSenha" class="form-input" 
                           placeholder="Digite a senha novamente" required>
                    <div class="form-error" id="confirmaSenhaError"></div>
                </div>

                <div class="button-group">
                    <button type="button" class="button button-secondary" onclick="previousStep()">
                        <i class="fas fa-arrow-left"></i> Voltar
                    </button>
                    <button type="button" class="button button-primary" onclick="nextStep()">
                        Continuar <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>

            <!-- Step 3: Company Data -->
            <div class="form-section" id="section3">
                <h2 style="margin-bottom: 24px;">Dados da empresa/produção</h2>
                
                <div class="form-group">
                    <label class="form-label" for="tipoPessoa">
                        Tipo de pessoa <span class="required">*</span>
                    </label>
                    <select id="tipoPessoa" name="tipoPessoa" class="form-select" required onchange="togglePessoaFields()">
                        <option value="">Selecione...</option>
                        <option value="fisica">Pessoa Física</option>
                        <option value="juridica">Pessoa Jurídica</option>
                    </select>
                    <div class="form-error" id="tipoPessoaError"></div>
                </div>

                <!-- Pessoa Física Fields -->
                <div id="pessoaFisicaFields" style="display: none;">
                    <div class="form-group">
                        <label class="form-label" for="cpf">
                            CPF <span class="required">*</span>
                        </label>
                        <input type="text" id="cpf" name="cpf" class="form-input" 
                               placeholder="000.000.000-00" maxlength="14">
                        <div class="form-error" id="cpfError"></div>
                    </div>
                </div>

                <!-- Pessoa Jurídica Fields -->
                <div id="pessoaJuridicaFields" style="display: none;">
                    <div class="form-group">
                        <label class="form-label" for="nomeFantasia">
                            Nome Fantasia <span class="required">*</span>
                        </label>
                        <input type="text" id="nomeFantasia" name="nomeFantasia" class="form-input" 
                               placeholder="Nome fantasia da empresa">
                        <div class="form-error" id="nomeFantasiaError"></div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="razaoSocial">
                            Razão Social <span class="required">*</span>
                        </label>
                        <input type="text" id="razaoSocial" name="razaoSocial" class="form-input" 
                               placeholder="Razão social da empresa">
                        <div class="form-error" id="razaoSocialError"></div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="cnpj">
                            CNPJ <span class="required">*</span>
                        </label>
                        <input type="text" id="cnpj" name="cnpj" class="form-input" 
                               placeholder="00.000.000/0000-00" maxlength="18">
                        <div class="form-error" id="cnpjError"></div>
                    </div>
                </div>

                <div class="button-group">
                    <button type="button" class="button button-secondary" onclick="previousStep()">
                        <i class="fas fa-arrow-left"></i> Voltar
                    </button>
                    <button type="button" class="button button-primary" onclick="nextStep()">
                        Continuar <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>

            <!-- Step 4: Email Verification -->
            <div class="form-section" id="section4">
                <div class="email-verification">
                    <i class="fas fa-envelope-circle-check email-icon"></i>
                    <h2 class="verification-title">Verifique seu email</h2>
                    <p class="verification-text">
                        Enviamos um código de verificação para<br>
                        <span class="verification-email" id="verificationEmail"></span>
                    </p>
                    
                    <div class="code-inputs">
                        <input type="text" class="code-input" maxlength="1" id="code1" autocomplete="off">
                        <input type="text" class="code-input" maxlength="1" id="code2" autocomplete="off">
                        <input type="text" class="code-input" maxlength="1" id="code3" autocomplete="off">
                        <input type="text" class="code-input" maxlength="1" id="code4" autocomplete="off">
                        <input type="text" class="code-input" maxlength="1" id="code5" autocomplete="off">
                        <input type="text" class="code-input" maxlength="1" id="code6" autocomplete="off">
                    </div>

                    <p style="margin-bottom: 16px;">
                        <a href="#" class="resend-link" id="resendLink" onclick="resendCode()">
                            Reenviar código
                        </a>
                    </p>

                    <div class="button-group">
                        <button type="button" class="button button-secondary" onclick="previousStep()">
                            <i class="fas fa-arrow-left"></i> Voltar
                        </button>
                        <button type="button" class="button button-primary" onclick="verifyCode()">
                            Verificar código
                        </button>
                    </div>
                </div>
            </div>
        </form>

        <!-- Loading State -->
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>Processando...</p>
        </div>

        <!-- Success State -->
        <div class="success-container" id="successContainer">
            <i class="fas fa-check-circle success-icon"></i>
            <h2 class="success-title">Cadastro realizado com sucesso!</h2>
            <p class="success-text">
                Preparando seu ambiente...<br>
                Você será redirecionado em <span id="countdown">3</span> segundos
            </p>
        </div>

        <!-- Login Link -->
        <div class="login-link" id="loginLink">
            <a href="index.php">Já tenho uma conta</a>
        </div>
    </div>

    <script>
        let currentStep = 1;
        const totalSteps = 4;
        let formData = {};
        let verificationCode = '';
        let resendTimer = null;

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            setupCodeInputs();
            setupMasks();
        });

        // Navigation
        function nextStep() {
            if (validateStep(currentStep)) {
                if (currentStep === 1) {
                    checkEmailAndProceed();
                } else if (currentStep === 3) {
                    // Salvar dados antes de enviar código
                    saveFormData();
                    sendVerificationCode();
                } else {
                    moveToStep(currentStep + 1);
                }
            }
        }

        function previousStep() {
            if (currentStep > 1) {
                moveToStep(currentStep - 1);
            }
        }

        function moveToStep(step) {
            // Hide current section
            document.getElementById(`section${currentStep}`).classList.remove('active');
            document.getElementById(`step${currentStep}`).classList.remove('active');
            
            // Show new section
            currentStep = step;
            document.getElementById(`section${currentStep}`).classList.add('active');
            document.getElementById(`step${currentStep}`).classList.add('active');
            
            // Mark completed steps
            for (let i = 1; i < currentStep; i++) {
                document.getElementById(`step${i}`).classList.add('completed');
            }
            
            // Update progress bar
            const progress = (currentStep / totalSteps) * 100;
            document.getElementById('progressFill').style.width = progress + '%';
            
            // Update step labels
            document.querySelectorAll('.step-label').forEach((label, index) => {
                if (index < currentStep) {
                    label.classList.add('active');
                } else {
                    label.classList.remove('active');
                }
            });

            // Special handling for verification step
            if (currentStep === 4) {
                document.getElementById('loginLink').style.display = 'none';
                document.querySelector('.email-verification').style.display = 'block';
                document.getElementById('verificationEmail').textContent = formData.email;
                document.getElementById('code1').focus();
            }
        }

        // Validation
        function validateStep(step) {
            let isValid = true;
            clearErrors();

            switch(step) {
                case 1:
                    isValid = validateEmail();
                    break;
                case 2:
                    isValid = validatePersonalData();
                    break;
                case 3:
                    isValid = validateCompanyData();
                    break;
            }

            return isValid;
        }

        function validateEmail() {
            const email = document.getElementById('email').value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!email) {
                showError('email', 'Por favor, informe seu email');
                return false;
            }
            
            if (!emailRegex.test(email)) {
                showError('email', 'Por favor, informe um email válido');
                return false;
            }
            
            formData.email = email;
            return true;
        }

        function validatePersonalData() {
            let isValid = true;
            
            const nome = document.getElementById('nome').value.trim();
            if (!nome || nome.length < 3) {
                showError('nome', 'Nome deve ter pelo menos 3 caracteres');
                isValid = false;
            } else {
                formData.nome = nome;
            }
            
            const celular = document.getElementById('celular').value.trim();
            const celularClean = celular.replace(/\D/g, '');
            if (!celular || celularClean.length < 10) {
                showError('celular', 'Por favor, informe um celular válido');
                isValid = false;
            } else {
                formData.celular = celular;
            }
            
            const senha = document.getElementById('senha').value;
            if (!senha || senha.length < 8) {
                showError('senha', 'Senha deve ter pelo menos 8 caracteres');
                isValid = false;
            }
            
            const confirmaSenha = document.getElementById('confirmaSenha').value;
            if (senha !== confirmaSenha) {
                showError('confirmaSenha', 'As senhas não coincidem');
                isValid = false;
            } else {
                formData.senha = senha;
            }
            
            return isValid;
        }

        function validateCompanyData() {
            let isValid = true;
            const tipoPessoa = document.getElementById('tipoPessoa').value;
            
            if (!tipoPessoa) {
                showError('tipoPessoa', 'Por favor, selecione o tipo de pessoa');
                return false;
            }
            
            formData.tipoPessoa = tipoPessoa;
            
            if (tipoPessoa === 'fisica') {
                const cpf = document.getElementById('cpf').value.trim();
                if (!cpf || !validateCPF(cpf)) {
                    showError('cpf', 'Por favor, informe um CPF válido');
                    isValid = false;
                } else {
                    formData.cpf = cpf;
                }
            } else {
                const nomeFantasia = document.getElementById('nomeFantasia').value.trim();
                if (!nomeFantasia) {
                    showError('nomeFantasia', 'Por favor, informe o nome fantasia');
                    isValid = false;
                } else {
                    formData.nomeFantasia = nomeFantasia;
                }
                
                const razaoSocial = document.getElementById('razaoSocial').value.trim();
                if (!razaoSocial) {
                    showError('razaoSocial', 'Por favor, informe a razão social');
                    isValid = false;
                } else {
                    formData.razaoSocial = razaoSocial;
                }
                
                const cnpj = document.getElementById('cnpj').value.trim();
                if (!cnpj || !validateCNPJ(cnpj)) {
                    showError('cnpj', 'Por favor, informe um CNPJ válido');
                    isValid = false;
                } else {
                    formData.cnpj = cnpj;
                }
            }
            
            return isValid;
        }

        // Save form data
        function saveFormData() {
            // Salvar todos os dados do formulário no objeto formData
            formData.nome = document.getElementById('nome').value.trim();
            formData.celular = document.getElementById('celular').value.trim();
            formData.senha = document.getElementById('senha').value;
            formData.tipoPessoa = document.getElementById('tipoPessoa').value;
            
            if (formData.tipoPessoa === 'fisica') {
                formData.cpf = document.getElementById('cpf').value.trim();
            } else {
                formData.nomeFantasia = document.getElementById('nomeFantasia').value.trim();
                formData.razaoSocial = document.getElementById('razaoSocial').value.trim();
                formData.cnpj = document.getElementById('cnpj').value.trim();
            }
        }

        // API Calls
        async function checkEmailAndProceed() {
            showLoading(true);
            
            try {
                const response = await fetch('api/verificar-email.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: formData.email })
                });
                
                const data = await response.json();
                
                if (data.existe) {
                    showAlert('Este email já está cadastrado. Redirecionando para login...', 'info');
                    setTimeout(() => {
                        window.location.href = 'index.php';
                    }, 2000);
                } else {
                    moveToStep(2);
                }
            } catch (error) {
                showAlert('Erro ao verificar email. Tente novamente.', 'error');
            } finally {
                showLoading(false);
            }
        }

        async function sendVerificationCode() {
            showLoading(true);
            
            try {
                // Teste rápido da API
                const testResponse = await fetch('api/teste-simples.php');
                const testData = await testResponse.json();
                console.log('Teste API:', testData);
                
                // Usar versão final que salva no banco
                const response = await fetch('api/enviar-codigo-email-final.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        email: formData.email,
                        nome: formData.nome
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const responseText = await response.text();
                console.log('Response:', responseText);
                
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (e) {
                    console.error('Resposta não é JSON:', responseText);
                    throw new Error('Servidor retornou resposta inválida');
                }
                
                if (data.success) {
                    // Mostrar código no console para debug
                    if (data.debug && data.debug.codigo) {
                        console.log('CÓDIGO DE VERIFICAÇÃO:', data.debug.codigo);
                        console.log('Dados debug:', data.debug);
                        // alert removido para produção
                    }
                    moveToStep(4);
                    startResendTimer();
                } else {
                    showAlert(data.message || 'Erro ao enviar código.', 'error');
                }
            } catch (error) {
                console.error('Erro completo:', error);
                showAlert('Erro ao enviar código: ' + error.message, 'error');
            } finally {
                showLoading(false);
            }
        }

        async function verifyCode() {
            const code = Array.from({length: 6}, (_, i) => 
                document.getElementById(`code${i + 1}`).value
            ).join('');
            
            if (code.length !== 6) {
                showAlert('Por favor, preencha todos os dígitos do código', 'error');
                return;
            }
            
            showLoading(true);
            
            try {
                // Usar versão final que busca no banco
                const response = await fetch('api/verificar-codigo-final.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        email: formData.email,
                        codigo: code
                    })
                });
                
                const data = await response.json();
                console.log('Resposta verificação:', data);
                
                if (data.success) {
                    await processarCadastro();
                } else {
                    showAlert(data.message || 'Código inválido.', 'error');
                    if (data.debug) {
                        console.error('Debug info:', data.debug);
                    }
                    clearCodeInputs();
                }
            } catch (error) {
                console.error('Erro ao verificar código:', error);
                showAlert('Erro ao verificar código.', 'error');
            } finally {
                showLoading(false);
            }
        }

        async function processarCadastro() {
            try {
                // Usar versão final corrigida (senha_hash)
                const response = await fetch('api/processar-cadastro-final.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                console.log('Resposta cadastro:', data);
                
                if (data.success) {
                    showSuccess();
                } else {
                    showAlert(data.message || 'Erro ao criar conta. Tente novamente.', 'error');
                }
            } catch (error) {
                console.error('Erro ao processar cadastro:', error);
                showAlert('Erro ao criar conta. Tente novamente.', 'error');
            }
        }

        async function resendCode() {
            const link = document.getElementById('resendLink');
            if (link.hasAttribute('disabled')) return;
            
            link.setAttribute('disabled', 'true');
            link.textContent = 'Enviando...';
            
            try {
                // Reenviar usando versão final
                const response = await fetch('api/enviar-codigo-email-final.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        email: formData.email,
                        nome: formData.nome
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showAlert('Código reenviado com sucesso!', 'success');
                    if (data.debug && data.debug.codigo) {
                        console.log('NOVO CÓDIGO:', data.debug.codigo);
                        // alert removido para produção
                    }
                } else {
                    showAlert(data.message || 'Erro ao reenviar código.', 'error');
                }
            } catch (error) {
                console.error('Erro ao reenviar:', error);
                showAlert('Erro ao reenviar código.', 'error');
            } finally {
                startResendTimer();
            }
        }

        // Helper Functions
        function showError(fieldId, message) {
            const field = document.getElementById(fieldId);
            const error = document.getElementById(fieldId + 'Error');
            
            field.classList.add('error');
            error.textContent = message;
            error.style.display = 'block';
        }

        function clearErrors() {
            document.querySelectorAll('.form-input, .form-select').forEach(field => {
                field.classList.remove('error');
            });
            
            document.querySelectorAll('.form-error').forEach(error => {
                error.style.display = 'none';
            });
        }

        function showAlert(message, type) {
            const alertContainer = document.getElementById('alertContainer');
            alertContainer.className = `alert alert-${type} show`;
            alertContainer.textContent = message;
            
            setTimeout(() => {
                alertContainer.classList.remove('show');
            }, 5000);
        }

        function showLoading(show) {
            const loading = document.getElementById('loading');
            const form = document.getElementById('wizardForm');
            
            if (show) {
                loading.style.display = 'block';
                form.style.display = 'none';
            } else {
                loading.style.display = 'none';
                form.style.display = 'block';
            }
        }

        function showSuccess() {
            document.getElementById('wizardForm').style.display = 'none';
            document.getElementById('successContainer').style.display = 'block';
            document.querySelector('.progress-container').style.display = 'none';
            
            let countdown = 3;
            const countdownEl = document.getElementById('countdown');
            
            const interval = setInterval(() => {
                countdown--;
                countdownEl.textContent = countdown;
                
                if (countdown <= 0) {
                    clearInterval(interval);
                    // Redirecionar direto para meuseventos.php
                    // O usuário já está logado via sessão/cookies definidos no processar-cadastro-final.php
                    window.location.href = 'meuseventos.php';
                }
            }, 1000);
        }

        function togglePessoaFields() {
            const tipoPessoa = document.getElementById('tipoPessoa').value;
            const fisicaFields = document.getElementById('pessoaFisicaFields');
            const juridicaFields = document.getElementById('pessoaJuridicaFields');
            
            if (tipoPessoa === 'fisica') {
                fisicaFields.style.display = 'block';
                juridicaFields.style.display = 'none';
                document.getElementById('cpf').required = true;
                document.getElementById('nomeFantasia').required = false;
                document.getElementById('razaoSocial').required = false;
                document.getElementById('cnpj').required = false;
            } else if (tipoPessoa === 'juridica') {
                fisicaFields.style.display = 'none';
                juridicaFields.style.display = 'block';
                document.getElementById('cpf').required = false;
                document.getElementById('nomeFantasia').required = true;
                document.getElementById('razaoSocial').required = true;
                document.getElementById('cnpj').required = true;
            } else {
                fisicaFields.style.display = 'none';
                juridicaFields.style.display = 'none';
            }
        }

        // Code Input Management
        function setupCodeInputs() {
            const codeInputs = document.querySelectorAll('.code-input');
            
            codeInputs.forEach((input, index) => {
                input.addEventListener('input', function(e) {
                    if (e.target.value.length === 1) {
                        if (index < codeInputs.length - 1) {
                            codeInputs[index + 1].focus();
                        }
                    }
                });
                
                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Backspace' && !e.target.value) {
                        if (index > 0) {
                            codeInputs[index - 1].focus();
                        }
                    }
                });
                
                input.addEventListener('paste', function(e) {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text').slice(0, 6);
                    
                    pastedData.split('').forEach((char, i) => {
                        if (i < codeInputs.length) {
                            codeInputs[i].value = char;
                        }
                    });
                    
                    if (pastedData.length === 6) {
                        verifyCode();
                    }
                });
            });
        }

        function clearCodeInputs() {
            document.querySelectorAll('.code-input').forEach(input => {
                input.value = '';
            });
            document.getElementById('code1').focus();
        }

        function startResendTimer() {
            const link = document.getElementById('resendLink');
            let seconds = 60;
            
            if (resendTimer) clearInterval(resendTimer);
            
            resendTimer = setInterval(() => {
                seconds--;
                if (seconds > 0) {
                    link.textContent = `Reenviar código em ${seconds}s`;
                    link.setAttribute('disabled', 'true');
                } else {
                    link.textContent = 'Reenviar código';
                    link.removeAttribute('disabled');
                    clearInterval(resendTimer);
                }
            }, 1000);
        }

        // Masks
        function setupMasks() {
            // Phone mask
            document.getElementById('celular').addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                    value = value.replace(/(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{5})(\d)/, '$1-$2');
                }
                e.target.value = value;
            });
            
            // CPF mask
            document.getElementById('cpf').addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                e.target.value = value;
            });
            
            // CNPJ mask
            document.getElementById('cnpj').addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{2})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1/$2');
                value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
                e.target.value = value;
            });
        }

        // CPF Validation
        function validateCPF(cpf) {
            cpf = cpf.replace(/\D/g, '');
            
            if (cpf.length !== 11) return false;
            if (/^(\d)\1{10}$/.test(cpf)) return false;
            
            let sum = 0;
            for (let i = 0; i < 9; i++) {
                sum += parseInt(cpf.charAt(i)) * (10 - i);
            }
            let rest = (sum * 10) % 11;
            if (rest === 10 || rest === 11) rest = 0;
            if (rest !== parseInt(cpf.charAt(9))) return false;
            
            sum = 0;
            for (let i = 0; i < 10; i++) {
                sum += parseInt(cpf.charAt(i)) * (11 - i);
            }
            rest = (sum * 10) % 11;
            if (rest === 10 || rest === 11) rest = 0;
            if (rest !== parseInt(cpf.charAt(10))) return false;
            
            return true;
        }

        // CNPJ Validation
        function validateCNPJ(cnpj) {
            cnpj = cnpj.replace(/\D/g, '');
            
            if (cnpj.length !== 14) return false;
            if (/^(\d)\1{13}$/.test(cnpj)) return false;
            
            let length = cnpj.length - 2;
            let numbers = cnpj.substring(0, length);
            let digits = cnpj.substring(length);
            let sum = 0;
            let pos = length - 7;
            
            for (let i = length; i >= 1; i--) {
                sum += numbers.charAt(length - i) * pos--;
                if (pos < 2) pos = 9;
            }
            
            let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
            if (result !== parseInt(digits.charAt(0))) return false;
            
            length = length + 1;
            numbers = cnpj.substring(0, length);
            sum = 0;
            pos = length - 7;
            
            for (let i = length; i >= 1; i--) {
                sum += numbers.charAt(length - i) * pos--;
                if (pos < 2) pos = 9;
            }
            
            result = sum % 11 < 2 ? 0 : 11 - sum % 11;
            if (result !== parseInt(digits.charAt(1))) return false;
            
            return true;
        }
    </script>
</body>
</html>