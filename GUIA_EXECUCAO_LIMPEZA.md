# 🚀 GUIA DE EXECUÇÃO - SCRIPT DE LIMPEZA CONSOLE.LOG

## 📋 COMO USAR

### **1. PREPARAÇÃO**
```bash
# Navegue até o diretório do projeto
cd "D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html"

# Certifique-se que o Node.js está instalado
node --version
```

### **2. EXECUÇÃO SEGURA (RECOMENDADO)**
```bash
# PRIMEIRO: Execute em modo simulação (não modifica nada)
node clean-console-logs.js

# Verifique o relatório gerado
# Se estiver tudo OK, execute de verdade:
```

### **3. CONFIGURAÇÕES DISPONÍVEIS**
Edite o arquivo `clean-console-logs.js` na seção CONFIG:

```javascript
const CONFIG = {
    baseDir: 'D:/Dropbox/DESENVOLVIMENTO/AnySummit/public_html/produtor/',
    backupDir: 'D:/Dropbox/DESENVOLVIMENTO/AnySummit/public_html/BACKUP_CONSOLE_LOGS/',
    dryRun: true,     // ⚠️  MUDE PARA false PARA EXECUTAR DE VERDADE
    createBackup: true, // Sempre manter true para segurança
    verbose: true     // Mostrar detalhes durante execução
};
```

## 🎯 O QUE O SCRIPT FAZ

### **✅ REMOVE AUTOMATICAMENTE:**
- **TODOS** os console.log de arquivos de teste (`teste-*.js`)
- **TODOS** os console.log de arquivos de debug (`debug-*.js`)  
- **TODOS** os console.log de arquivos de diagnóstico (`diagnostico*.js`)
- **TODOS** os console.log de diretórios antigos (`_old/`, `_temp/`, `_removidos/`)
- **APENAS LOGS DE DEBUG** de arquivos de correção

### **🔒 PROTEGE AUTOMATICAMENTE:**
- `qrcode.min.js` (biblioteca externa)
- Logs de `console.error()` e `console.warn()`
- Arquivos não especificados na lista

### **📊 ESTIMATIVAS:**
- **~250 arquivos** processados
- **~2.800 console.log** removidos  
- **Tempo de execução:** ~2-3 minutos
- **Backup automático:** Sim

## ⚠️ SEGURANÇA

### **BACKUP AUTOMÁTICO:**
- Script cria backup completo antes de modificar
- Backup salvo em: `BACKUP_CONSOLE_LOGS/`
- **SEMPRE** execute primeiro em modo simulação

### **MODO SIMULAÇÃO:**
```javascript
dryRun: true  // Apenas simula, não modifica nada
```

### **MODO EXECUÇÃO:**
```javascript  
dryRun: false // Modifica arquivos de verdade
```

## 📋 RELATÓRIOS GERADOS

O script gera:
1. **Console output** - Status em tempo real
2. **Arquivo JSON** - Relatório detalhado com estatísticas
3. **Backup completo** - Cópia de segurança dos arquivos originais

## 🔧 PERSONALIZAÇÃO

### **Adicionar mais arquivos:**
```javascript
testFiles: [
    'seu-arquivo-teste.js', // Adicione aqui
    // ... outros arquivos
]
```

### **Modificar padrões de remoção:**
```javascript
REMOVE_PATTERNS: [
    /console\.log\(['"`].*?SEU_PADRAO.*?\);?/g, // Adicione aqui
    // ... outros padrões
]
```

## 🚨 IMPORTANTE

1. **SEMPRE** execute primeiro em modo simulação
2. **SEMPRE** mantenha backup habilitado  
3. **VERIFIQUE** o relatório antes da execução real
4. **TESTE** o sistema após a limpeza

## 🎯 PRÓXIMOS PASSOS APÓS EXECUÇÃO

1. Verificar se o sistema funciona normalmente
2. Revisar manualmente arquivos principais (`criaevento.js`, `lotes.js`)
3. Remover arquivos de backup após confirmação
4. Considerar implementar linting para evitar logs de debug no futuro

---

**🔥 O script está pronto para uso! Execute quando tiver tempo disponível.**
