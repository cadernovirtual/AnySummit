<?php
include("check_login.php");
include("conm/conn.php");

// Tentar incluir arquivo de helpers, se não conseguir, criar função local
if (file_exists("../includes/imagem-helpers.php")) {
    include("../includes/imagem-helpers.php");
} else {
    // Função helper local como fallback
    function normalizarCaminhoImagem($imagePath) {
        if (empty($imagePath)) {
            return '';
        }
        
        // Se já é um caminho correto, retorna como está
        if ($imagePath === '/uploads/capas/' . basename($imagePath)) {
            return $imagePath;
        }
        
        // Casos de caminhos antigos ou incorretos
        if (strpos($imagePath, '/produtor/uploads/eventos/') !== false) {
            // Remove /produtor/uploads/eventos/ e adiciona /uploads/capas/
            $nomeArquivo = basename($imagePath);
            return '/uploads/capas/' . $nomeArquivo;
        }
        
        if (strpos($imagePath, '/uploads/eventos/') !== false) {
            // Remove /uploads/eventos/ e adiciona /uploads/capas/
            $nomeArquivo = basename($imagePath);
            return '/uploads/capas/' . $nomeArquivo;
        }
        
        if (strpos($imagePath, 'uploads/capas/') !== false) {
            // Adiciona / inicial se não tiver
            if (substr($imagePath, 0, 1) !== '/') {
                return '/' . $imagePath;
            }
            return $imagePath;
        }
        
        // Se é apenas o nome do arquivo, adiciona o caminho completo
        if (strpos($imagePath, '/') === false) {
            return '/uploads/capas/' . $imagePath;
        }
        
        // Fallback: extrair nome do arquivo e criar caminho correto
        $nomeArquivo = basename($imagePath);
        return '/uploads/capas/' . $nomeArquivo;
    }
}

// Pegar dados do usuário logado
// Removido $contratante_id = $_COOKIE['contratanteid'] ?? 0; pois não existe mais
$usuario_id = $_COOKIE['usuarioid'] ?? 0;

// Buscar dados do usuário para o header
$usuario = null;
if ($usuario_id) {
    $sql_usuario = "SELECT id, nome, email, foto_perfil FROM usuarios WHERE id = ?";
    $stmt_usuario = mysqli_prepare($con, $sql_usuario);
    if ($stmt_usuario) {
        mysqli_stmt_bind_param($stmt_usuario, "i", $usuario_id);
        mysqli_stmt_execute($stmt_usuario);
        $result_usuario = mysqli_stmt_get_result($stmt_usuario);
        $usuario = mysqli_fetch_assoc($result_usuario);
        mysqli_stmt_close($stmt_usuario);
    }
}

// Inicializar array de eventos
$eventos = [];

 

try {
    // Query para buscar eventos do usuário (incluindo rascunhos)
    $sql = "SELECT e.*, 
                   COALESCE(cat.nome, 'Sem categoria') as categoria_nome,
                   MIN(ing.preco) as preco_min,
                   MAX(ing.preco) as preco_max,
                   COUNT(DISTINCT ing.id) as total_ingressos
            FROM eventos e 
            LEFT JOIN categorias_evento cat ON e.categoria_id = cat.id AND cat.ativo = 1
            LEFT JOIN ingressos ing ON e.id = ing.evento_id AND ing.ativo = 1
            WHERE e.usuario_id = ?
            GROUP BY e.id
            ORDER BY e.criado_em DESC";

    $stmt = mysqli_prepare($con, $sql);
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "i", $usuario_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $eventos = mysqli_fetch_all($result, MYSQLI_ASSOC);
        mysqli_stmt_close($stmt);
        
        // Debug: Mostrar quantos eventos foram encontrados
        error_log("Eventos encontrados: " . count($eventos) . " para usuário $usuario_id");
    } else {
        error_log("Erro ao preparar query: " . mysqli_error($con));
    }
} catch (Exception $e) {
    error_log("Erro ao buscar eventos: " . $e->getMessage());
    $eventos = [];
}
?>