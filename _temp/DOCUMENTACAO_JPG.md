# DOCUMENTAÇÃO - SISTEMA DE INGRESSO JPG

## 📧 Funcionalidade Implementada

O sistema agora gera automaticamente o ingresso em formato JPG e envia como anexo nos emails, facilitando o uso pelos participantes.

## 🎯 Quando o email é enviado:

### 1. **Após validação automática**
- Usuário acessa `/validar-ingresso.php?h=HASH`
- Se ingresso já está vinculado → Email automático com JPG anexado

### 2. **Após vinculação de participante**
- Usuário preenche dados no modal de vinculação
- Sistema vincula → Email de confirmação com JPG anexado

## 📱 Formato do Email

```
Assunto: Seu ingresso para {Nome do Evento}

Conteúdo:
- Header estilizado
- Informações do evento
- Código do ingresso
- Nome do participante
- Instrução sobre anexo JPG
- Link para visualização online
- Instruções de uso
```

**📎 Anexo: Ingresso_{Codigo}.jpg**

## 🔧 APIs Criadas

### 1. `/evento/api/gerar-ingresso-jpg.php`
- Converte HTML completo para JPG usando wkhtmltoimage
- **Parâmetros:**
  - `h=HASH` - Hash do ingresso
  - `action=path` - Retorna caminho (para uso interno)
  - `action=download` - Download direto (padrão)

### 2. `/evento/api/gerar-ingresso-jpg-php.php`
- Gera JPG usando PHP GD (funciona em qualquer servidor)
- **Parâmetros:** Mesmos da API anterior
- **Vantagem:** Não depende de ferramentas externas

### 3. `/evento/api/email-com-anexo.php`
- Classe `EmailComAnexo` para envio de emails com anexo
- **Método:** `enviarIngressoComJPG($email, $nome, $assunto, $dados_ingresso)`

## 🧪 Como testar:

### 1. Teste básico:
```
https://anysummit.com.br/teste-jpg.php
```

### 2. Teste de geração de JPG:
```
https://anysummit.com.br/evento/api/gerar-ingresso-jpg-php.php?h=HASH
```

### 3. Teste de validação completa:
```
https://anysummit.com.br/validar-ingresso.php?h=HASH_VALIDACAO
```

## 📋 Conteúdo do JPG:

- **Header colorido** com nome do evento
- **Código do ingresso** em destaque
- **Dados do participante** (nome, email, CPF)
- **Informações do evento** (data, local, organizador)
- **QR Code visual** para validação
- **Rodapé** com instruções
- **Layout responsivo** (800x1200px)

## 🔄 Sistema de Fallback:

1. **Primeira tentativa:** wkhtmltoimage (layout completo)
2. **Segunda tentativa:** PHP GD (layout simplificado)
3. **Última tentativa:** Email tradicional HTML

## 🛠️ Requisitos do Servidor:

### Opcional (para melhor qualidade):
- wkhtmltoimage
- ImageMagick

### Obrigatório (sempre funciona):
- PHP com extensão GD (padrão na maioria dos servidores)

## ⚙️ Configurações:

### Tamanho da imagem:
- **Largura:** 800px
- **Altura:** 1200px
- **Qualidade:** 90% (JPEG)

### Limpeza automática:
- Arquivos temporários são removidos após envio
- Logs detalhados para debugging

## 🔗 Integração:

O sistema é totalmente integrado ao fluxo existente:
- Mantém compatibilidade com sistema anterior
- Usa o mesmo sistema de hash
- Preserva todos os logs e auditorias
- Não quebra funcionalidades existentes

## 📱 Experiência do usuário:

1. **Recebe email** com ingresso anexado
2. **Salva JPG** no celular ou imprime
3. **Apresenta na entrada** do evento
4. **QR Code** é escaneado para validação
5. **Acesso liberado** ao evento

## 🎉 Benefícios:

- ✅ **Mais fácil para o usuário** (arquivo direto no celular)
- ✅ **Funciona offline** (não precisa de internet no evento)
- ✅ **Melhor qualidade** de impressão
- ✅ **Backup online** sempre disponível
- ✅ **Compatível** com todos os dispositivos
