document.addEventListener('DOMContentLoaded', () => {
    loadOrders(); // Charger les commandes lors du chargement de la page

    document.getElementById('add-product').addEventListener('click', function() {
        const productContainer = document.getElementById('product-container');

        // Créer un nouveau champ pour le produit
        const productDiv = document.createElement('div');
        productDiv.innerHTML = `
            <input type="text" class="product-name" placeholder="Nom du Produit" required>
            <input type="text" class="product-number" placeholder="Numéro du Produit" required>
        `;
        productContainer.appendChild(productDiv);
    });

    // Ajouter la commande avec les produits
    document.getElementById('order-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const customerName = document.getElementById('customer-name').value;
        const invoiceNumber = document.getElementById('invoice-number').value;
        const paymentStatus = document.getElementById('payment-status').value;
        const purchaseDate = document.getElementById('purchase-date').value; // Récupérer la date d'achat
        const orderAmount = document.getElementById('order-amount').value; // Récupérer le montant de la commande

        const products = Array.from(document.querySelectorAll('.product-name')).map((nameInput, index) => {
            const numberInput = document.querySelectorAll('.product-number')[index];
            return {
                name: nameInput.value,
                number: numberInput.value
            };
        });

        // Créer une liste de détails de commande à partir des produits
        const orderDetailsList = createOrderDetailsList(products);

        const newRow = createOrderRow(customerName, invoiceNumber, orderDetailsList, purchaseDate, paymentStatus, orderAmount, false, false);
        document.getElementById('orders-list').querySelector('tbody').appendChild(newRow);
        saveOrder(customerName, invoiceNumber, orderDetailsList, purchaseDate, paymentStatus, orderAmount, false, false);
        document.getElementById('order-form').reset();
        document.getElementById('product-container').innerHTML = `
            <input type="text" class="product-name" placeholder="Nom du Produit" required>
            <input type="text" class="product-number" placeholder="Numéro du Produit" required>
        `; // Réinitialiser les champs de produit
    });
});

// Fonction pour créer une liste non ordonnée des détails de la commande
function createOrderDetailsList(products) {
    const ul = document.createElement('ul');
    products.forEach(product => {
        const li = document.createElement('li');
        li.innerText = `${product.name} (Num: ${product.number})`;
        ul.appendChild(li);
    });
    return ul.outerHTML; // Retourner la liste sous forme de chaîne HTML
}

function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.forEach(order => {
        const newRow = createOrderRow(
            order.customerName,
            order.invoiceNumber,
            order.details,
            order.purchaseDate, // Assurez-vous d'utiliser l'ordre exact
            order.paymentStatus, // Statut de paiement
            order.orderAmount, // Montant de la commande
            order.isOrdered,
            order.isDelivered
        );
        document.getElementById('orders-list').querySelector('tbody').appendChild(newRow);
    });
}

function createOrderRow(customerName, invoiceNumber, orderDetails, purchaseDate, paymentStatus, orderAmount, isOrdered = false, isDelivered = false) {
    const newRow = document.createElement('tr');

    // Ajouter des classes basées sur les états
    if (isOrdered) newRow.classList.add('tr-commande');
    if (isDelivered) newRow.classList.add('tr-livree');

    const paymentStatusClass = paymentStatus === 'Payé' ? 'paye' : 'non-paye';

    newRow.innerHTML = `
        <td contenteditable="true" onblur="updateOrder(this, 'customerName', '${invoiceNumber}')">${customerName}</td>
        <td contenteditable="true" onblur="updateOrder(this, 'invoiceNumber', '${invoiceNumber}')">${invoiceNumber}</td>
        <td>${orderDetails}</td>
        <td contenteditable="true" onblur="updateOrder(this, 'purchaseDate', '${invoiceNumber}')">${formatDate(purchaseDate)}</td>
        <td contenteditable="true" onblur="updateOrder(this, 'orderAmount', '${invoiceNumber}')">${orderAmount} €</td>
        <td contenteditable="true" onblur="updateOrder(this, 'paymentStatus', '${invoiceNumber}')">${paymentStatus}</td>
        <td>
            <button class="commander" onclick="markAsOrdered(this)"><i class="fa-solid fa-truck-fast"></i></button>
            <button class="livree" onclick="markAsDelivered(this)"><i class="fa-solid fa-check"></i></button>
            <button onclick="generateInvoice(this)" title="Créer Facture"><i class="fa-regular fa-file"></i></button>
            <button class="remove-row" onclick="removeRow(this)" title="Supprimer"><i class="fas fa-times"></i></button>
        </td>
    `;

    return newRow;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois sont indexés à partir de 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`; // Format JJ/MM/AAAA
}

// Fonction pour sauvegarder la commande dans le localStorage
function saveOrder(customerName, invoiceNumber, orderDetailsArray, purchaseDate, paymentStatus, orderAmount, isOrdered, isDelivered) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push({
        customerName,
        invoiceNumber,
        details: orderDetailsArray,
        paymentStatus,
        orderAmount,
        purchaseDate: purchaseDate, // Assurez-vous que c'est au format YYYY-MM-DD
        isOrdered,
        isDelivered
    });
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Fonction pour mettre à jour une commande dans le localStorage
function updateOrder(cell, field, invoiceNumber) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const index = orders.findIndex(order => order.invoiceNumber === invoiceNumber);
    if (index >= 0) {
        const value = cell.innerText.trim();
        if (field === 'orderAmount') {
            orders[index][field] = value.replace(' €', ''); // Enlever le symbole €
        } else {
            orders[index][field] = value;
        }
        localStorage.setItem('orders', JSON.stringify(orders));
    }
}

// Fonction pour marquer une commande comme commandée
function markAsOrdered(button) {
    const row = button.closest('tr');
    const isOrdered = row.classList.toggle('tr-commande');
    saveOrderToLocalStorage(row);
}

// Fonction pour marquer une commande comme livrée
function markAsDelivered(button) {
    const row = button.closest('tr');
    const isDelivered = row.classList.toggle('tr-livree');
    saveOrderToLocalStorage(row);
}

function saveOrderToLocalStorage(row) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const index = Array.from(document.getElementById('orders-list').querySelector('tbody').children).indexOf(row);
    
    if (index >= 0) {
        const order = orders[index];
        order.isOrdered = row.classList.contains('tr-commande');
        order.isDelivered = row.classList.contains('tr-livree');
        localStorage.setItem('orders', JSON.stringify(orders));
    }
}

// Fonction pour supprimer complètement une ligne
function removeRow(button) {
    const row = button.closest('tr');
    row.remove();
    updateLocalStorage();
}

// Fonction pour mettre à jour le localStorage
function updateLocalStorage() {
    const rows = document.querySelectorAll('#orders-list tbody tr');
    const orders = Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        return {
            customerName: cells[0].innerText,
            invoiceNumber: cells[1].innerText,
            details: cells[2].innerText,
            purchaseDate: cells[3].innerText,
            orderAmount: cells[4].innerText.replace(' €', ''), // Si vous voulez stocker sans le symbole €
            paymentStatus: cells[5].innerText,
            isOrdered: row.classList.contains('tr-commande'),
            isDelivered: row.classList.contains('tr-livree')
        };
    });
    localStorage.setItem('orders', JSON.stringify(orders));
}

function generateInvoice(button) {
    const row = button.closest('tr');
    const cells = row.querySelectorAll('td');

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const customerName = cells[0].innerText;
    const invoiceNumber = cells[1].innerText;
    const orderDetails = cells[2].querySelectorAll('li'); // Sélectionner chaque produit
    const purchaseDate = cells[3].innerText;
    const orderAmount = cells[4].innerText;
    const paymentStatus = cells[5].innerText;

    // Titre de la facture
    doc.setFontSize(22);
    const title = "Facture de la Commande";
    const pageWidth = doc.internal.pageSize.getWidth(); // Obtenir la largeur de la page
    const textWidth = doc.getTextWidth(title); // Obtenir la largeur du texte
    const xOffset = (pageWidth - textWidth) / 2; // Calculer la position pour centrer le texte

    doc.setTextColor(44, 62, 80); // Couleur du texte sombre
    doc.text(title, xOffset, 20); // Centrer le texte

    // Souligner le titre en ajoutant une ligne
    doc.setDrawColor(44, 62, 80); // Couleur de la ligne de soulignement
    doc.line(10, 22, 200, 22); // Ajouter une ligne juste en dessous du titre (coordonnées X1, Y1, X2, Y2)
    doc.setFontSize(12);

    // Informations client et facture
    doc.setTextColor(0, 0, 0); // Texte noir
    doc.text(`Nom du Client: ${customerName}`, 10, 50);
    doc.text(`Numéro de Facture: ${invoiceNumber}`, 10, 60);
    doc.text(`Date d'Achat: ${purchaseDate}`, 10, 70);
    doc.text(`Montant de la Commande: ${orderAmount}`, 10, 80);
    doc.text(`Statut de Paiement: ${paymentStatus}`, 10, 90);

    // Tableau des produits
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text("Détails de la Commande:", 10, 100);

    // Couleurs et bordures pour le tableau
    doc.setDrawColor(0); // Couleur des bordures (noir)
    doc.setFillColor(232, 236, 239); // Couleur de fond pour l'en-tête du tableau
    doc.rect(10, 105, 180, 10, 'F'); // Fond de l'en-tête

    // Titres des colonnes du tableau
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Nom du Produit", 15, 112);
    doc.text("Numéro du Produit", 120, 112);

    // Remplir le tableau avec les détails des produits
    let yOffset = 122; // Position initiale pour les lignes du tableau
    orderDetails.forEach((product) => {
        const productDetails = product.innerText.split(' (Num: ');
        const productName = productDetails[0];
        const productNumber = productDetails[1].replace(')', '');

        // Si la position dépasse la page, ajouter une nouvelle page
        if (yOffset > 270) {
            doc.addPage();
            yOffset = 20; // Repositionner le décalage sur la nouvelle page
        }

        // Remplir chaque ligne du tableau
        doc.text(productName, 15, yOffset); // Nom du produit
        doc.text(productNumber, 120, yOffset); // Numéro du produit
        yOffset += 10; // Décalage pour la ligne suivante
    });

    // Ajouter une ligne finale
    doc.setDrawColor(44, 62, 80);
    doc.line(10, yOffset + 5, 200, yOffset + 5);

    // Message final de remerciement
    doc.setTextColor(44, 62, 80);
    doc.text("Merci pour votre commande!", 10, yOffset + 15);

    // Sauvegarder la facture
    doc.save(`facture_${customerName}.pdf`);
}
