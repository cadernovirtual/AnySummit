import codecs
import re

# Ler o arquivo com encoding errado
with open(r'D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\produtor\js\criaevento.js', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Substituir todos os caracteres corrompidos
replacements = {
    'ðŸ—'ï¸': '🗑️',
    'âœï¸': '✏️',
    'ðŸ"¦': '📦',
    'PreÃ§o': 'Preço',
    'VocÃª': 'Você',
    'preÃ§o': 'preço',
    'vocÃª': 'você',
    'Ã§': 'ç',
    'Ã£': 'ã',
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ã­': 'í',
    'Ã³': 'ó',
    'Ãº': 'ú',
    'Ã‡': 'Ç',
    'Ãƒ': 'Ã',
    'Ã': 'Á',
    'Ã‰': 'É',
    'Ã': 'Í',
    'Ã"': 'Ó',
    'Ãš': 'Ú'
}

for old, new in replacements.items():
    content = content.replace(old, new)

# Salvar com encoding correto
with open(r'D:\Dropbox\DESENVOLVIMENTO\AnySummit\public_html\produtor\js\criaevento_fixed.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Arquivo corrigido salvo como criaevento_fixed.js")
