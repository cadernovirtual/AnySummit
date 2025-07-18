# AnySummit - Plataforma de Gestão de Eventos

AnySummit é uma plataforma completa para gestão de eventos desenvolvida em PHP/MySQL, oferecendo módulos integrados para diferentes tipos de usuários.

## 🚀 Funcionalidades

### Para Produtores
- Criação e gestão completa de eventos
- Controle de ingressos e vendas
- Gestão de participantes
- Relatórios e analytics
- Gestão de staff e patrocinadores

### Para Participantes
- Compra de ingressos online
- Check-in via QR Code
- Área do participante
- Histórico de eventos

### Para Staff
- Controle de acesso
- Validação de ingressos
- Gestão operacional

### Para Patrocinadores
- Área exclusiva
- Relatórios de exposição
- Gestão de benefícios

## 🛠 Tecnologias

- **Backend**: PHP 7+
- **Frontend**: HTML5, CSS3, JavaScript
- **Banco de Dados**: MySQL
- **QR Code**: html5-qrcode library
- **Email**: SMTP Integration

## 📁 Estrutura do Projeto

```
public_html/
├── api/                    # APIs gerais
├── evento/                 # Módulo de eventos públicos
├── produtor/              # Painel do produtor
├── participante/          # Área do participante
├── patrocinador/          # Área do patrocinador
├── staff/                 # Área do staff
├── css/js/                # Assets globais
└── uploads/               # Uploads de arquivos
```

## 🔧 Instalação

1. Clone o repositório
2. Configure o banco de dados MySQL
3. Configure os arquivos de conexão em cada módulo (`*/conm/conn.php`)
4. Configure as permissões da pasta `uploads/`
5. Configure o SMTP para envio de emails

## 📋 Configuração

- **Charset**: UTF8MB4
- **Timezone**: America/Sao_Paulo
- **Prefixo de tabelas**: `tb_`

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença proprietária.

## 📞 Contato

- Email: gustavo@cadernovirtual.com.br
- Site: [AnySummit](https://anysummit.com.br)
