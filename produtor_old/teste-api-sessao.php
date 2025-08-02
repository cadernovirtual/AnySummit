<?php
/**
 * Teste direto da API de criação de eventos
 * Este arquivo simula uma sessão para testes
 */

// Simular sessão de usuário para teste
session_start();
$_SESSION['usuario_id'] = 1; // ID de teste
$_SESSION['contratante_id'] = 1; // ID de teste

// Incluir a API
require_once 'criaeventoapi.php';
?>