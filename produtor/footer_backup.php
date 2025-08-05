            </div>
        </main>
    </div>

    <script>
        // Funções globais úteis
        function logout() {
            if (confirm('Tem certeza que deseja sair?')) {
                window.location = '/produtor/logout.php';
            }
        }

        // Adicionar efeitos nos menus se ainda não foram adicionados
        document.addEventListener('DOMContentLoaded', function() {
            const menuItems = document.querySelectorAll('.menu-item:not([onClick*="logout"])');
            
            menuItems.forEach(item => {
                item.addEventListener('mouseenter', function() {
                    if (!this.classList.contains('active')) {
                        this.style.backgroundColor = 'rgba(0, 194, 255, 0.1)';
                        this.style.color = '#00c2ff';
                        this.style.borderLeftColor = '#00c2ff';
                    }
                });
                
                item.addEventListener('mouseleave', function() {
                    if (!this.classList.contains('active')) {
                        this.style.backgroundColor = '';
                        this.style.color = '';
                        this.style.borderLeftColor = '';
                    }
                });
            });
        });
    </script>
</body>
</html>
