// Vérifier le thème sauvegardé dans le localStorage
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);

// Fonction pour basculer le thème
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Mettre à jour le thème
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Mettre à jour l'icône du bouton
    updateThemeIcon(newTheme);
}

// Mettre à jour l'icône du bouton en fonction du thème
function updateThemeIcon(theme) {
    const buttons = document.querySelectorAll('.dark-mode-toggle');
    buttons.forEach(button => {
        const icon = button.querySelector('i');
        const text = button.querySelector('span');
        
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            if (text) text.textContent = 'Mode Clair';
        } else {
            icon.className = 'fas fa-moon';
            if (text) text.textContent = 'Mode Sombre';
        }
    });
}

// Initialiser l'icône au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    updateThemeIcon(document.documentElement.getAttribute('data-theme'));
    
    // Ajouter l'événement de clic à tous les boutons de basculement
    document.querySelectorAll('.dark-mode-toggle').forEach(button => {
        button.addEventListener('click', toggleTheme);
    });
});
