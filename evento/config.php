<?php
/**
 * Arquivo de configuração para página de eventos
 * D:\sites\anysummit\evento\config.php
 */

// Configurações gerais
define('SITE_NAME', 'AnySummit');
define('DEFAULT_TIMEZONE', 'America/Sao_Paulo');

// Configurações de imagens
define('DEFAULT_EVENT_IMAGE', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
define('DEFAULT_MAP_IMAGE', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80');

// Configurações de URL
function buildEventUrl($slug) {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $basePath = dirname($_SERVER['PHP_SELF']);
    return $protocol . '://' . $host . $basePath . '/' . $slug;
}

// Função para formatar moeda brasileira
function formatCurrency($value) {
    return 'R$ ' . number_format($value, 2, ',', '.');
}

// Função para formatar data brasileira
function formatDate($date, $format = 'd/m/Y H:i') {
    if (empty($date)) return '';
    
    $dt = new DateTime($date);
    $dt->setTimezone(new DateTimeZone(DEFAULT_TIMEZONE));
    
    return $dt->format($format);
}

// Função para calcular disponibilidade de ingressos
function getTicketAvailability($ticket) {
    $sold = intval($ticket['quantidade_vendida']);
    $reserved = intval($ticket['quantidade_reservada']);
    $total = intval($ticket['quantidade_total']);
    
    return max(0, $total - $sold - $reserved);
}

// Função para verificar se o evento está ativo
function isEventActive($event) {
    $now = new DateTime();
    $eventStart = new DateTime($event['data_inicio']);
    $eventEnd = new DateTime($event['data_fim']);
    
    return (
        $event['status'] === 'ativo' &&
        $event['visibilidade'] === 'publico' &&
        $now < $eventEnd
    );
}

// Função para obter status do evento
function getEventStatus($event) {
    $now = new DateTime();
    $eventStart = new DateTime($event['data_inicio']);
    $eventEnd = new DateTime($event['data_fim']);
    
    if ($now < $eventStart) {
        return 'upcoming'; // Próximo
    } elseif ($now >= $eventStart && $now <= $eventEnd) {
        return 'ongoing'; // Acontecendo agora
    } else {
        return 'finished'; // Finalizado
    }
}

// Função para validar código promocional (implementar conforme necessário)
function validatePromoCode($code, $eventId) {
    // Implementar lógica de validação de código promocional
    // Por enquanto retorna falso
    return false;
}

// Função para gerar iniciais do nome
function getInitials($name) {
    $words = explode(' ', trim($name));
    $initials = '';
    
    foreach ($words as $word) {
        if (!empty($word)) {
            $initials .= strtoupper(substr($word, 0, 1));
            if (strlen($initials) >= 2) break;
        }
    }
    
    return $initials ?: 'EV';
}

// Função para sanitizar output HTML
function e($string) {
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
}

// Função para formatar endereço completo
function formatAddress($event) {
    if ($event['tipo_local'] === 'online') {
        return 'Evento Online';
    }
    
    $parts = array_filter([
        $event['nome_local'],
        $event['rua'] . ($event['numero'] ? ', ' . $event['numero'] : ''),
        $event['bairro'],
        $event['cidade'] . ($event['estado'] ? ' - ' . $event['estado'] : '')
    ]);
    
    return implode(', ', $parts) ?: 'Local a ser divulgado';
}

// Função para gerar meta tags
function generateMetaTags($event) {
    $title = e($event['nome']);
    $description = e(substr(strip_tags($event['descricao']), 0, 160));
    $image = !empty($event['imagem_capa']) ? e($event['imagem_capa']) : DEFAULT_EVENT_IMAGE;
    $url = buildEventUrl($event['slug']);
    
    return [
        'title' => $title,
        'description' => $description,
        'image' => $image,
        'url' => $url
    ];
}
?>
