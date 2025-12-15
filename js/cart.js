function toggleMode() {
  const body = document.body;
  body.classList.toggle('dark-mode');
  body.classList.toggle('light-mode');
}
// Gestion du mode sombre
function initDarkMode() {
    // Vérifier le thème au chargement de la page
    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateDarkModeButton(true);
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        updateDarkModeButton(false);
    }

    // Gestionnaire d'événement pour le bouton de basculement
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
}

// Fonction pour basculer entre les modes
function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        updateDarkModeButton(false);
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        updateDarkModeButton(true);
    }
}

// Mettre à jour l'apparence du bouton
function updateDarkModeButton(isDark) {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;
    
    const icon = darkModeToggle.querySelector('i');
    const text = darkModeToggle.querySelector('span');
    
    if (isDark) {
        icon.className = 'fas fa-sun';
        text.textContent = 'Mode Jour';
    } else {
        icon.className = 'fas fa-moon';
        text.textContent = 'Mode Nuit';
    }
}

// Initialiser le mode sombre au chargement du document
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
});

// Fonction pour ajouter un produit au panier
function addToCart(product) {
    // Récupérer le panier depuis le localStorage ou en créer un nouveau
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Vérifier si le produit est déjà dans le panier
    const existingProduct = cart.find(item => item.id === product.id);
    
    if (existingProduct) {
        // Si le produit existe déjà, augmenter la quantité
        existingProduct.quantity += 1;
    } else {
        // Sinon, ajouter le produit avec une quantité de 1
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    // Sauvegarder le panier dans le localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Mettre à jour le compteur du panier
    updateCartCount();
    
    // Afficher une notification
    alert('Produit ajouté au panier !');
}

// Fonction pour mettre à jour le compteur du panier dans le header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Mettre à jour le compteur dans le header
    const cartCounters = document.querySelectorAll('.cart-count');
    cartCounters.forEach(counter => {
        counter.textContent = totalItems;
    });
}

// Fonction pour initialiser les écouteurs d'événements sur les boutons "Ajouter au panier"
function initAddToCartButtons() {
    document.querySelectorAll('.btn-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const product = {
                id: productCard.querySelector('h3').textContent.trim(),
                name: productCard.querySelector('h3').textContent.trim(),
                price: parseFloat(productCard.querySelector('.price').textContent.replace(/[^0-9,]/g, '').replace(',', '.')),
                image: productCard.querySelector('img').src,
                quantity: 1
            };
            
            addToCart(product);
        });
    });
}

// Initialiser le compteur du panier au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    // Si on est sur la page d'accueil, initialiser les boutons "Ajouter au panier"
    if (document.querySelector('.product-grid')) {
        initAddToCartButtons();
    }
    
    // Si on est sur la page du panier, charger les produits
    if (document.querySelector('.cart-items')) {
        loadCartItems();
    }
});

// Fonction pour charger les articles du panier
function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.querySelector('.cart-items');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Votre panier est vide</h3>
                <p>Parcourez nos catégories pour découvrir nos produits</p>
                <a href="../accueil.html" class="checkout-btn">Continuer vos achats</a>
            </div>
        `;
        return;
    }
    
    // Afficher les articles du panier
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="product-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="product-details">
                <h3>${item.name}</h3>
                <p>Référence: ${item.id}</p>
            </div>
            <div class="product-price">${item.price.toLocaleString('fr-FR')} FCFA</div>
            <div class="quantity-selector">
                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-id="${item.id}">
                <button class="quantity-btn plus" data-id="${item.id}">+</button>
            </div>
            <button class="remove-item" data-id="${item.id}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Mettre à jour le total
    updateCartTotal();
    
    // Ajouter les écouteurs d'événements pour les boutons de quantité et de suppression
    initCartItemButtons();
}

// Fonction pour initialiser les boutons de quantité et de suppression dans le panier
function initCartItemButtons() {
    // Boutons plus/moins
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.dataset.id;
            const input = document.querySelector(`.quantity-input[data-id="${id}"]`);
            let quantity = parseInt(input.value);
            
            if (this.classList.contains('plus')) {
                quantity += 1;
            } else if (this.classList.contains('minus') && quantity > 1) {
                quantity -= 1;
            }
            
            input.value = quantity;
            updateCartItemQuantity(id, quantity);
        });
    });
    
    // Champs de saisie de quantité
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const id = this.dataset.id;
            const quantity = parseInt(this.value) || 1;
            updateCartItemQuantity(id, quantity);
        });
    });
    
    // Boutons de suppression
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.dataset.id;
            removeFromCart(id);
        });
    });
}

// Fonction pour mettre à jour la quantité d'un article dans le panier
function updateCartItemQuantity(id, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === id);
    
    if (item) {
        item.quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartTotal();
        updateCartCount();
    }
}

// Fonction pour supprimer un article du panier
function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Recharger les articles du panier
    loadCartItems();
    updateCartCount();
}

// Fonction pour mettre à jour le total du panier
function updateCartTotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let subtotal = 0;
    
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    // Mettre à jour le sous-total
    const subtotalElement = document.querySelector('.summary-value');
    if (subtotalElement) {
        subtotalElement.textContent = `${subtotal.toLocaleString('fr-FR')} FCFA`;
    }
    
    // Mettre à jour le total (vous pouvez ajouter des frais de livraison ici si nécessaire)
    const totalElement = document.querySelector('.summary-total .summary-value');
    if (totalElement) {
        totalElement.textContent = `${subtotal.toLocaleString('fr-FR')} FCFA`;
    }
}
// Gestion du panier
        letcart = JSON.parse(localStorage.getItem('cart')) || [];
        constcartNotification = document.getElementById('cartNotification');
        constnotificationText = document.getElementById('notificationText');

        // Ajout au panier
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productName = this.getAttribute('data-product');
                const productPrice = parseFloat(this.getAttribute('data-price'));
                
                // Vérifier si le produit est déjà dans le panier
                const existingProduct = cart.find(item => item.name === productName);
                
                if (existingProduct) {
                    existingProduct.quantity += 1;
                } else {
                    cart.push({
                        name: productName,
                        price: productPrice,
                        quantity: 1
                    });
                }
                
                // Mettre à jour le stockage local
                localStorage.setItem('cart', JSON.stringify(cart));
                
                // Afficher la notification
                showNotification(`${productName} a été ajouté au panier`);
                
                // Mettre à jour le compteur du panier si existant
                updateCartCounter();
            });
        });

        // Filtrer les produits
        document.getElementById('category-filter').addEventListener('change', filterProducts);
        document.getElementById('price-filter').addEventListener('change', filterProducts);

        function filterProducts() {
            const category = document.getElementById('category-filter').value;
            const priceRange = document.getElementById('price-filter').value;
            const products = document.querySelectorAll('.product-card');

            products.forEach(product => {
                const productCategory = product.getAttribute('data-category');
                const productPrice = parseFloat(product.getAttribute('data-price'));
                let showProduct = true;

                // Filtrer par catégorie
                if (category !== 'all' && productCategory !== category) {
                    showProduct = false;
                }

                // Filtrer par prix
                if (priceRange !== 'all') {
                    const [min, max] = priceRange.split('-').map(Number);
                    if (max) {
                        if (productPrice < min || productPrice > max) showProduct = false;
                    } else {
                        if (productPrice < min) showProduct = false;
                    }
                }

                // Afficher ou masquer le produit
                product.style.display = showProduct ? 'block' : 'none';
            });
        }

        // Afficher une notification
        function showNotification(message) {
            notificationText.textContent = message;
            cartNotification.style.display = 'block';
            
            // Masquer la notification après 3 secondes
            setTimeout(() => {
                cartNotification.style.opacity = '0';
                setTimeout(() => {
                    cartNotification.style.display = 'none';
                    cartNotification.style.opacity = '1';
                }, 500);
            }, 3000);
        }

        // Gestion du panier - Déclaration des variables globales
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartNotification = document.getElementById('cartNotification');
const notificationText = document.getElementById('notificationText');

// Fonction pour sauvegarder le panier dans le localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Fonction pour ajouter un produit au panier
function addToCart(productName, productPrice) {
    const existingProduct = cart.find(item => item.name === productName);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }
    
    saveCart();
    showNotification(`${productName} a été ajouté au panier`);
    updateCartCounter();
}

// Fonction pour afficher une notification
function showNotification(message) {
    if (!notificationText) return;
    
    notificationText.textContent = message;
    cartNotification.style.display = 'block';
    cartNotification.style.opacity = '1';
    
    setTimeout(() => {
        cartNotification.style.opacity = '0';
        setTimeout(() => {
            cartNotification.style.display = 'none';
        }, 500);
    }, 3000);
}

// Fonction pour mettre à jour le compteur du panier
function updateCartCounter() {
    const cartCounter = document.getElementById('cart-counter');
    if (!cartCounter) return;
    
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCounter.textContent = totalItems;
    cartCounter.style.display = totalItems > 0 ? 'flex' : 'none';
}

// Initialisation au chargement du document
document.addEventListener('DOMContentLoaded', () => {
    // Mettre à jour le compteur au chargement
    updateCartCounter();
    
    // Gérer les clics sur les boutons "Ajouter au panier"
    document.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart')) {
            const button = e.target.closest('.add-to-cart');
            const productName = button.getAttribute('data-product');
            const productPrice = parseFloat(button.getAttribute('data-price'));
            addToCart(productName, productPrice);
        }
    });
});

// Exporter les fonctions pour une utilisation externe si nécessaire
window.cartFunctions = {
    addToCart,
    updateCartCounter,
    getCart: () => [...cart],
    clearCart: () => {
        cart = [];
        saveCart();
        updateCartCounter();
    }
};

// Initialisation du filtrage des produits
document.addEventListener('DOMContentLoaded', function() {
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');

    if (categoryFilter && priceFilter) {
        function filterProducts() {
            const selectedCategory = categoryFilter.value;
            const selectedPrice = priceFilter.value;
            const productCards = document.querySelectorAll('.product-card');

            productCards.forEach(card => {
                const category = card.getAttribute('data-category');
                const price = parseInt(card.getAttribute('data-price'));
                
                const categoryMatch = selectedCategory === 'all' || category === selectedCategory;
                let priceMatch = true;

                if (selectedPrice !== 'all') {
                    const [min, max] = selectedPrice.split('-').map(Number);
                    if (max) {
                        priceMatch = price >= min && price <= max;
                    } else {
                        priceMatch = price >= min;
                    }
                }
                
                card.style.display = (categoryMatch && priceMatch) ? 'block' : 'none';
            });
        }

        categoryFilter.addEventListener('change', filterProducts);
        priceFilter.addEventListener('change', filterProducts);
        
        // Filtrer les produits au chargement initial
        filterProducts();
    }
});
