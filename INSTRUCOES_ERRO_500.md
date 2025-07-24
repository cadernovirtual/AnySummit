# Instruções para Resolver o Erro 500

## 1. Teste o PHP Básico
Acesse: `https://anysummit.com.br/produtor/teste-min.php`
- Se aparecer texto, PHP está funcionando
- Se tela branca, problema no servidor

## 2. Teste a API Simples
No arquivo `/produtor/js/criaevento.js`, na linha 1669, altere temporariamente:

```javascript
// DE:
baseUrl: 'https://anysummit.com.br/produtor/criaeventoapi.php',

// PARA:
baseUrl: 'https://anysummit.com.br/produtor/criar-evento-simples.php',
```

## 3. Se Funcionar com API Simples
O problema é que o servidor não tem PDO instalado/habilitado. Soluções:
- Solicitar habilitação do PDO no servidor
- Reescrever toda a API para usar mysqli (como no resto do sistema)

## 4. Se Ainda Der Erro 500
Verifique:
- Logs de erro do Apache/Nginx no servidor
- Permissões das pastas
- Limites de memória do PHP
- Versão do PHP (precisa ser 7+)

## O Problema Real
O criaeventoapi.php usa PDO (nova forma de conexão), mas o servidor pode não ter esta extensão habilitada. O resto do sistema usa mysqli (forma antiga).

## Solução Temporária
Use a API simples (criar-evento-simples.php) que usa mysqli como o resto do sistema.

## Solução Definitiva
1. Habilitar PDO no servidor, OU
2. Reescrever criaeventoapi.php para usar mysqli em vez de PDO
