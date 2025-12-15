// Données de démonstration
const sampleProducts = [
    {
        id: 1,
        reference: 'PC001',
        name: 'PC Portable HP 15s-eq2003nf',
        category: 'pc-portable',
        purchasePrice: 599.99,
        sellingPrice: 799.99,
        currentStock: 15,
        alertThreshold: 5,
        description: 'PC Portable HP 15.6" Full HD - AMD Ryzen 5 - 8 Go RAM - 512 Go SSD - Windows 11'
    },
    {
        id: 2,
        reference: 'PC002',
        name: 'PC Bureau Dell Inspiron 3910',
        category: 'pc-bureau',
        purchasePrice: 499.99,
        sellingPrice: 699.99,
        currentStock: 8,
        alertThreshold: 3,
        description: 'PC Bureau Dell - Intel Core i5 - 8 Go RAM - 256 Go SSD + 1 To HDD - Windows 11'
    },
    {
        id: 3,
        reference: 'GAM001',
        name: 'PC Gamer ASUS ROG Strix G15',
        category: 'pc-gamer',
        purchasePrice: 1299.99,
        sellingPrice: 1599.99,
        currentStock: 4,
        alertThreshold: 2,
        description: 'PC Gamer ASUS 15.6" FHD 144Hz - AMD Ryzen 7 - 16 Go RAM - RTX 3060 - 1 To SSD'
    },
    {
        id: 4,
        reference: 'ACC001',
        name: 'Souris Gaming Logitech G502',
        category: 'accessoires',
        purchasePrice: 49.99,
        sellingPrice: 79.99,
        currentStock: 2,
        alertThreshold: 5,
        description: 'Souris Gaming Logitech G502 HERO - Capteur HERO 25K - 25 600 PPP - RGB'
    },
    {
        id: 5,
        reference: 'COMP001',
        name: 'SSD Samsung 1 To 870 EVO',
        category: 'composants',
        purchasePrice: 89.99,
        sellingPrice: 129.99,
        currentStock: 0,
        alertThreshold: 3,
        description: 'SSD Interne 2.5" SATA III - 560 Mo/s lecture - 530 Mo/s écriture'
    },
    {
        id: 6,
        reference: 'PER001',
        name: 'Clavier Mécanique Corsair K70',
        category: 'peripheriques',
        purchasePrice: 119.99,
        sellingPrice: 169.99,
        currentStock: 12,
        alertThreshold: 4,
        description: 'Clavier Mécanique Gaming RGB - Switch Cherry MX Red - Rétroéclairé'
    },
    {
        id: 7,
        reference: 'PC003',
        name: 'PC Portable Lenovo IdeaPad 5',
        category: 'pc-portable',
        purchasePrice: 749.99,
        sellingPrice: 949.99,
        currentStock: 1,
        alertThreshold: 3,
        description: 'PC Portable 14" 2.2K - Intel Core i7 - 16 Go RAM - 512 Go SSD - Windows 11'
    },
    {
        id: 8,
        reference: 'ACC002',
        name: 'Casque Gaming HyperX Cloud II',
        category: 'accessoires',
        purchasePrice: 79.99,
        sellingPrice: 119.99,
        currentStock: 7,
        alertThreshold: 4,
        description: 'Casque Gaming avec son Surround 7.1 - Micro détachable - Noir/Rouge'
    }
];

// Éléments du DOM
const stockTableBody = document.getElementById('stockTableBody');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const tabButtons = document.querySelectorAll('.tab-btn');
const exportBtn = document.getElementById('exportBtn');
const refreshBtn = document.getElementById('refreshBtn');
const modal = document.getElementById('productModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const productForm = document.getElementById('productForm');
const modalTitle = document.getElementById('modalTitle');
const addProductBtn = document.getElementById('addProductBtn');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageNumbers = document.getElementById('pageNumbers');

// Variables d'état
let products = [];
let filteredProducts = [];
let currentFilter = 'all';
let currentPage = 1;
const itemsPerPage = 10;
let isEditMode = false;
let currentProductId = null;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Charger les produits depuis le stockage local ou utiliser les données de démonstration
    loadProducts();
    
    // Initialiser les écouteurs d'événements
    initEventListeners();
    
    // Afficher les produits
    filterProducts();
    
    // Mettre à jour le compteur du panier
    updateCartCount();
    
    // Initialiser le menu mobile
    initMobileMenu();
});

// Charger les produits depuis le stockage local ou utiliser les données de démonstration
function loadProducts() {
    const savedProducts = localStorage.getItem('inventory_products');
    products = savedProducts ? JSON.parse(savedProducts) : [...sampleProducts];
    
    // Si c'est la première fois, enregistrer les données de démonstration
    if (!savedProducts) {
        saveProducts();
    }
}

// Sauvegarder les produits dans le stockage local
function saveProducts() {
    localStorage.setItem('inventory_products', JSON.stringify(products));
}

// Initialiser les écouteurs d'événements
function initEventListeners() {
    // Recherche
    searchInput.addEventListener('input', filterProducts);
    
    // Filtre par catégorie
    categoryFilter.addEventListener('change', filterProducts);
    
    // Onglets
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.tab;
            filterProducts();
        });
    });
    
    // Boutons d'export et de rafraîchissement
    exportBtn.addEventListener('click', exportToCSV);
    refreshBtn.addEventListener('click', refreshData);
    
    // Gestion de la modale
    closeModal.addEventListener('click', closeProductModal);
    cancelBtn.addEventListener('click', closeProductModal);
    
    // Soumission du formulaire
    productForm.addEventListener('submit', handleFormSubmit);
    
    // Pagination
    prevPageBtn.addEventListener('click', () => changePage(-1));
    nextPageBtn.addEventListener('click', () => changePage(1));
    
    // Fermer la modale en cliquant en dehors
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeProductModal();
        }
    });
}

// Filtrer les produits en fonction des critères de recherche et de filtre
function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    
    // Filtrer par recherche
    filteredProducts = products.filter(product => {
        const matchesSearch = 
            product.reference.toLowerCase().includes(searchTerm) ||
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm);
            
        // Filtrer par catégorie
        const matchesCategory = category === 'all' || product.category === category;
        
        // Filtrer par statut de stock
        let matchesStatus = true;
        if (currentFilter === 'in-stock') {
            matchesStatus = product.currentStock > product.alertThreshold;
        } else if (currentFilter === 'low-stock') {
            matchesStatus = product.currentStock > 0 && product.currentStock <= product.alertThreshold;
        } else if (currentFilter === 'out-of-stock') {
            matchesStatus = product.currentStock === 0;
        }
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    // Réinitialiser à la première page lors d'un nouveau filtrage
    currentPage = 1;
    
    // Afficher les produits filtrés
    displayProducts();
    
    // Mettre à jour la pagination
    updatePagination();
}

// Afficher les produits dans le tableau
function displayProducts() {
    // Calculer les produits à afficher pour la page actuelle
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productsToDisplay = filteredProducts.slice(startIndex, endIndex);
    
    // Vider le tableau
    stockTableBody.innerHTML = '';
    
    if (productsToDisplay.length === 0) {
        // Afficher un message si aucun produit n'est trouvé
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="9" class="text-center py-4">
                <i class="fas fa-box-open fa-2x mb-2" style="color: var(--dark-gray);"></i>
                <p>Aucun produit trouvé</p>
            </td>
        `;
        stockTableBody.appendChild(row);
        return;
    }
    
    // Ajouter chaque produit au tableau
    productsToDisplay.forEach(product => {
        const row = document.createElement('tr');
        
        // Déterminer le statut du stock
        let statusClass = '';
        let statusText = '';
        
        if (product.currentStock === 0) {
            statusClass = 'status-out-of-stock';
            statusText = 'Rupture';
        } else if (product.currentStock <= product.alertThreshold) {
            statusClass = 'status-low-stock';
            statusText = 'Stock faible';
        } else {
            statusClass = 'status-in-stock';
            statusText = 'En stock';
        }
        
        // Créer la ligne du tableau
        row.innerHTML = `
            <td>${product.reference}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="me-2">
                        <i class="fas ${getCategoryIcon(product.category)}" style="color: var(--primary-color);"></i>
                    </div>
                    <div>
                        <div class="fw-medium">${product.name}</div>
                        <small class="text-muted">${product.description.substring(0, 50)}...</small>
                    </div>
                </div>
            </td>
            <td>${formatCategory(product.category)}</td>
            <td>${product.purchasePrice.toFixed(2)} FCFA</td>
            <td>${product.sellingPrice.toFixed(2)} FCFA</td>
            <td>${product.currentStock}</td>
            <td>${product.alertThreshold}</td>
            <td><span class="stock-status ${statusClass}">${statusText}</span></td>
            <td>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary edit-product" data-id="${product.id}" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-product" data-id="${product.id}" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        stockTableBody.appendChild(row);
    });
    
    // Ajouter les écouteurs d'événements pour les boutons d'édition et de suppression
    document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', () => editProduct(parseInt(btn.dataset.id)));
    });
    
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', () => deleteProduct(parseInt(btn.dataset.id)));
    });
}

// Obtenir l'icône de catégorie
function getCategoryIcon(category) {
    const icons = {
        'pc-portable': 'fa-laptop',
        'pc-bureau': 'fa-desktop',
        'pc-gamer': 'fa-gamepad',
        'accessoires': 'fa-headphones',
        'composants': 'fa-microchip',
        'peripheriques': 'fa-keyboard'
    };
    return icons[category] || 'fa-box';
}

// Formater le nom de la catégorie pour l'affichage
function formatCategory(category) {
    const names = {
        'pc-portable': 'PC Portable',
        'pc-bureau': 'PC Bureau',
        'pc-gamer': 'PC Gamer',
        'accessoires': 'Accessoires',
        'composants': 'Composants',
        'peripheriques': 'Périphériques'
    };
    return names[category] || category;
}

// Mettre à jour la pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
    // Désactiver les boutons précédent/suivant si nécessaire
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Mettre à jour les numéros de page
    pageNumbers.innerHTML = '';
    
    // Afficher jusqu'à 5 numéros de page
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Ajuster si nous sommes près de la fin
    if (endPage - startPage < 4 && startPage > 1) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // Bouton première page
    if (startPage > 1) {
        const firstPageBtn = document.createElement('button');
        firstPageBtn.className = 'page-number';
        firstPageBtn.textContent = '1';
        firstPageBtn.addEventListener('click', () => goToPage(1));
        pageNumbers.appendChild(firstPageBtn);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-ellipsis';
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
    }
    
    // Numéros de page
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => goToPage(i));
        pageNumbers.appendChild(pageBtn);
    }
    
    // Bouton dernière page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-ellipsis';
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
        
        const lastPageBtn = document.createElement('button');
        lastPageBtn.className = 'page-number';
        lastPageBtn.textContent = totalPages;
        lastPageBtn.addEventListener('click', () => goToPage(totalPages));
        pageNumbers.appendChild(lastPageBtn);
    }
}

// Aller à une page spécifique
function goToPage(page) {
    currentPage = page;
    displayProducts();
    updatePagination();
    
    // Faire défiler vers le haut du tableau
    const tableContainer = document.querySelector('.stock-table-container');
    if (tableContainer) {
        tableContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// Changer de page (précédent/suivant)
function changePage(direction) {
    const newPage = currentPage + direction;
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayProducts();
        updatePagination();
    }
}

// Exporter les données au format CSV
function exportToCSV() {
    if (filteredProducts.length === 0) {
        showAlert('Aucune donnée à exporter', 'warning');
        return;
    }
    
    // Créer les en-têtes CSV
    const headers = [
        'Référence',
        'Nom du produit',
        'Catégorie',
        'Prix d\'achat (FCFA)',
        'Prix de vente (FCFA)',
        'Stock actuel',
        'Seuil d\'alerte',
        'Statut'
    ];
    
    // Créer les lignes de données
    const rows = filteredProducts.map(product => {
        let status = '';
        if (product.currentStock === 0) {
            status = 'Rupture';
        } else if (product.currentStock <= product.alertThreshold) {
            status = 'Stock faible';
        } else {
            status = 'En stock';
        }
        
        return [
            `"${product.reference}"`,
            `"${product.name}"`,
            `"${formatCategory(product.category)}"`,
            product.purchasePrice.toFixed(2),
            product.sellingPrice.toFixed(2),
            product.currentStock,
            product.alertThreshold,
            `"${status}"`
        ];
    });
    
    // Combiner les en-têtes et les données
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Créer un objet Blob avec le contenu CSV
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Créer un lien de téléchargement
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventaire_${new Date().toISOString().split('T')[0]}.csv`;
    
    // Déclencher le téléchargement
    document.body.appendChild(link);
    link.click();
    
    // Nettoyer
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showAlert('Export réussi !', 'success');
}

// Rafraîchir les données
function refreshData() {
    // Afficher un indicateur de chargement
    refreshBtn.innerHTML = '<span class="loading"></span>';
    
    // Simuler un chargement (dans une vraie application, ce serait un appel API)
    setTimeout(() => {
        // Recharger les produits depuis le stockage local
        loadProducts();
        
        // Réappliquer les filtres
        filterProducts();
        
        // Restaurer le bouton
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Actualiser';
        
        showAlert('Données actualisées avec succès', 'success');
    }, 1000);
}

// Afficher une notification
function showAlert(message, type = 'info') {
    // Créer l'élément d'alerte
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <div class="alert-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="close-alert">&times;</button>
    `;
    
    // Ajouter l'alerte à la page
    document.body.appendChild(alert);
    
    // Fermer l'alerte lors du clic sur le bouton de fermeture
    const closeBtn = alert.querySelector('.close-alert');
    closeBtn.addEventListener('click', () => {
        alert.classList.add('fade-out');
        setTimeout(() => alert.remove(), 300);
    });
    
    // Fermer automatiquement après 5 secondes
    setTimeout(() => {
        if (document.body.contains(alert)) {
            alert.classList.add('fade-out');
            setTimeout(() => alert.remove(), 300);
        }
    }, 5000);
}

// Ouvrir la modale d'ajout de produit
function openAddProductModal() {
    isEditMode = false;
    currentProductId = null;
    modalTitle.textContent = 'Ajouter un produit';
    productForm.reset();
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// Ouvrir la modale d'édition de produit
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    isEditMode = true;
    currentProductId = id;
    modalTitle.textContent = 'Modifier le produit';
    
    // Remplir le formulaire avec les données du produit
    document.getElementById('productName').value = product.name;
    document.getElementById('productReference').value = product.reference;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('purchasePrice').value = product.purchasePrice;
    document.getElementById('sellingPrice').value = product.sellingPrice;
    document.getElementById('currentStock').value = product.currentStock;
    document.getElementById('alertThreshold').value = product.alertThreshold;
    document.getElementById('productDescription').value = product.description || '';
    
    // Afficher la modale
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// Fermer la modale
function closeProductModal() {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Gérer la soumission du formulaire
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Récupérer les valeurs du formulaire
    const productData = {
        name: document.getElementById('productName').value.trim(),
        reference: document.getElementById('productReference').value.trim(),
        category: document.getElementById('productCategory').value,
        purchasePrice: parseFloat(document.getElementById('purchasePrice').value) || 0,
        sellingPrice: parseFloat(document.getElementById('sellingPrice').value) || 0,
        currentStock: parseInt(document.getElementById('currentStock').value) || 0,
        alertThreshold: parseInt(document.getElementById('alertThreshold').value) || 1,
        description: document.getElementById('productDescription').value.trim()
    };
    
    // Validation des champs obligatoires
    if (!productData.name || !productData.reference || !productData.category) {
        showAlert('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }
    
    if (productData.purchasePrice <= 0 || productData.sellingPrice <= 0) {
        showAlert('Les prix doivent être supérieurs à 0', 'error');
        return;
    }
    
    if (productData.currentStock < 0) {
        showAlert('Le stock ne peut pas être négatif', 'error');
        return;
    }
    
    if (productData.alertThreshold < 1) {
        showAlert('Le seuil d\'alerte doit être d\'au moins 1', 'error');
        return;
    }
    
    // Vérifier si la référence existe déjà (sauf en mode édition)
    if (!isEditMode && products.some(p => p.reference === productData.reference)) {
        showAlert('Cette référence existe déjà', 'error');
        return;
    }
    
    // Mettre à jour ou ajouter le produit
    if (isEditMode) {
        // Mode édition
        const index = products.findIndex(p => p.id === currentProductId);
        if (index !== -1) {
            // Conserver l'ID existant
            productData.id = currentProductId;
            products[index] = productData;
            showAlert('Produit mis à jour avec succès', 'success');
        }
    } else {
        // Mode ajout
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        productData.id = newId;
        products.push(productData);
        showAlert('Produit ajouté avec succès', 'success');
    }
    
    // Sauvegarder les modifications
    saveProducts();
    
    // Fermer la modale et mettre à jour l'affichage
    closeProductModal();
    filterProducts();
}

// Supprimer un produit
function deleteProduct(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
        return;
    }
    
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products.splice(index, 1);
        saveProducts();
        filterProducts();
        showAlert('Produit supprimé avec succès', 'success');
    }
}

// Mettre à jour le compteur du panier
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    
    const cartCounters = document.querySelectorAll('.cart-count');
    cartCounters.forEach(counter => {
        counter.textContent = totalItems > 0 ? totalItems : '';
    });
}

// Initialiser le menu mobile
function initMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
}

// Ajouter des classes pour la compatibilité avec Bootstrap
function addCompatibilityClasses() {
    // Ajouter des classes utilitaires
    const style = document.createElement('style');
    style.textContent = `
        .d-flex { display: flex !important; }
        .align-items-center { align-items: center !important; }
        .justify-content-between { justify-content: space-between !important; }
        .me-2 { margin-right: 0.5rem !important; }
        .mb-2 { margin-bottom: 0.5rem !important; }
        .mb-3 { margin-bottom: 1rem !important; }
        .mb-4 { margin-bottom: 1.5rem !important; }
        .mt-2 { margin-top: 0.5rem !important; }
        .mt-3 { margin-top: 1rem !important; }
        .mt-4 { margin-top: 1.5rem !important; }
        .ms-auto { margin-left: auto !important; }
        .text-center { text-align: center !important; }
        .text-muted { color: #6c757d !important; }
        .fw-medium { font-weight: 500 !important; }
        .gap-1 { gap: 0.25rem !important; }
        .gap-2 { gap: 0.5rem !important; }
        .gap-3 { gap: 1rem !important; }
        .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.875rem; }
        .btn-outline-primary { 
            color: var(--primary-color); 
            border: 1px solid var(--primary-color); 
            background: transparent;
        }
        .btn-outline-primary:hover { 
            background-color: var(--primary-color); 
            color: white; 
        }
        .btn-outline-danger { 
            color: var(--danger-color); 
            border: 1px solid var(--danger-color); 
            background: transparent;
        }
        .btn-outline-danger:hover { 
            background-color: var(--danger-color); 
            color: white; 
        }
        .alert {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 400px;
            z-index: 1100;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(120%);
            transition: transform 0.3s ease-in-out;
        }
        .alert.show {
            transform: translateX(0);
        }
        .alert-success {
            background-color: #d1fae5;
            color: #065f46;
            border-left: 4px solid #10b981;
        }
        .alert-error {
            background-color: #fee2e2;
            color: #b91c1c;
            border-left: 4px solid #ef4444;
        }
        .alert-warning {
            background-color: #fef3c7;
            color: #92400e;
            border-left: 4px solid #f59e0b;
        }
        .alert-info {
            background-color: #dbeafe;
            color: #1e40af;
            border-left: 4px solid #3b82f6;
        }
        .alert .close-alert {
            background: none;
            border: none;
            font-size: 1.25rem;
            cursor: pointer;
            padding: 0;
            margin-left: 15px;
            opacity: 0.7;
            transition: opacity 0.2s;
        }
        .alert .close-alert:hover {
            opacity: 1;
        }
        .fade-out {
            opacity: 0;
            transition: opacity 0.3s;
        }
    `;
    document.head.appendChild(style);
}

// Ajouter les classes de compatibilité au chargement
document.addEventListener('DOMContentLoaded', addCompatibilityClasses);
