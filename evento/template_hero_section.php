<!-- Section Hero do Evento - Template para /evento/{slug} -->
<!-- Este código deve ser inserido no arquivo de template da página do evento -->

<?php
// Assumindo que $evento contém os dados do evento carregados do banco
// Variáveis esperadas:
// $evento['nome_evento']
// $evento['imagem_fundo'] 
// $evento['logo_evento']
// $evento['imagem_capa']
// $evento['cor_fundo']
// $evento['data_inicio']
// $evento['data_fim']
// $evento['nome_local'] ou $evento['link_transmissao']
// $evento['tipo_local'] (presencial/online)
// $evento['endereco_completo']
?>

<section class="hero-section" id="evento" style="
    <?php if (!empty($evento['imagem_fundo'])): ?>
        background-image: url('/uploads/capas/<?php echo htmlspecialchars($evento['imagem_fundo']); ?>');
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
    <?php else: ?>
        background-color: <?php echo htmlspecialchars($evento['cor_fundo'] ?: '#f8f9fa'); ?>;
    <?php endif; ?>
    position: relative;
    padding: 80px 0;
    <?php if (!empty($evento['imagem_fundo'])): ?>
        /* Overlay sutil para melhorar legibilidade quando tem imagem */
        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255,255,255,0.9);
            z-index: 1;
        }
    <?php endif; ?>
">
    <div class="container" style="position: relative; z-index: 2;">
        <div class="row align-items-center">
            <div class="col-lg-8">
                <div class="pe-lg-5">
                    <!-- Badges de data e local -->
                    <div class="mb-3">
                        <span class="badge bg-primary rounded-pill px-3 py-2">
                            <i class="fas fa-calendar me-1"></i>
                            <?php 
                            $dataInicio = new DateTime($evento['data_inicio']);
                            $dataFim = new DateTime($evento['data_fim']);
                            
                            echo $dataInicio->format('d M Y • H:i');
                            if ($evento['data_fim'] && $evento['data_fim'] != $evento['data_inicio']) {
                                echo ' > ' . $dataFim->format('d M Y • H:i');
                            }
                            ?>
                        </span>
                        <span class="badge bg-success rounded-pill px-3 py-2 ms-2">
                            <i class="fas fa-map-marker-alt me-1"></i>
                            <?php 
                            if ($evento['tipo_local'] == 'presencial') {
                                echo htmlspecialchars($evento['nome_local']);
                            } else {
                                echo 'Evento Online';
                            }
                            ?>
                        </span>
                    </div>
                    
                    <!-- Logo ou título do evento -->
                    <h1 class="display-4 fw-bold mb-4">
                        <?php if (!empty($evento['logo_evento'])): ?>
                            <img src="/uploads/capas/<?php echo htmlspecialchars($evento['logo_evento']); ?>" 
                                 alt="<?php echo htmlspecialchars($evento['nome_evento']); ?>" 
                                 class="img-fluid event-logo" 
                                 style="max-height: 120px; max-width: 100%; object-fit: contain;">
                        <?php else: ?>
                            <?php echo htmlspecialchars($evento['nome_evento']); ?>
                        <?php endif; ?>
                    </h1>
                    
                    <!-- Informações do local -->
                    <div class="mb-4">
                        <p class="text-muted">
                            <strong>Evento <?php echo $evento['tipo_local'] == 'presencial' ? 'presencial' : 'online'; ?></strong> 
                            <?php if ($evento['tipo_local'] == 'presencial' && !empty($evento['endereco_completo'])): ?>
                                em <?php echo htmlspecialchars($evento['endereco_completo']); ?>
                            <?php elseif ($evento['tipo_local'] == 'online' && !empty($evento['link_transmissao'])): ?>
                                - Link será enviado aos inscritos
                            <?php endif; ?>
                        </p>
                    </div>
                    
                    <!-- Botões de compartilhamento -->
                    <div class="share-section">
                        <h6 class="mb-3">Compartilhe este evento:</h6>
                        <div class="share-buttons">
                            <button class="share-btn facebook" onclick="shareEvent('facebook')">
                                <i class="fab fa-facebook-f"></i>
                            </button>
                            <button class="share-btn twitter" onclick="shareEvent('twitter')">
                                <i class="fab fa-twitter"></i>
                            </button>
                            <button class="share-btn linkedin" onclick="shareEvent('linkedin')">
                                <i class="fab fa-linkedin-in"></i>
                            </button>
                            <button class="share-btn whatsapp" onclick="shareEvent('whatsapp')">
                                <i class="fab fa-whatsapp"></i>
                            </button>
                            <button class="btn btn-outline-primary btn-sm ms-2" onclick="copyLink()">
                                <i class="fas fa-link me-1"></i>
                                Copiar Link
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Coluna da imagem capa -->
            <div class="col-lg-4">
                <?php if (!empty($evento['imagem_capa'])): ?>
                    <img src="/uploads/capas/<?php echo htmlspecialchars($evento['imagem_capa']); ?>" 
                         alt="<?php echo htmlspecialchars($evento['nome_evento']); ?>" 
                         class="img-fluid event-image w-100"
                         style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <?php endif; ?>
            </div>
        </div>
    </div>
</section>

<!-- CSS adicional -->
<style>
.hero-section {
    min-height: 400px;
}

.share-buttons {
    display: flex;
    gap: 10px;
    align-items: center;
}

.share-btn {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: transform 0.2s;
}

.share-btn:hover {
    transform: scale(1.1);
}

.share-btn.facebook { background: #1877f2; }
.share-btn.twitter { background: #1da1f2; }
.share-btn.linkedin { background: #0077b5; }
.share-btn.whatsapp { background: #25d366; }

@media (max-width: 991px) {
    .hero-section {
        text-align: center;
    }
    
    .share-section {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    .event-image {
        margin-top: 30px;
        max-width: 300px;
    }
}
</style>