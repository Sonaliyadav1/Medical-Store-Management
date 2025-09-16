// Medical Store Management System - JavaScript
// This file handles all the functionality for the medical store

// Global variables to store data
let medicines = [];
let billItems = [];
let currentEditId = null;
let salesHistory = [];

// Initialize the application when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadDataFromStorage();
    displayMedicines();
    updateHeaderStats();
    generateReports();
    showAvailableMedicinesForBilling();
});

// Load data from localStorage
function loadDataFromStorage() {
    const storedMedicines = localStorage.getItem('medicines');
    const storedSales = localStorage.getItem('salesHistory');
    
    if (storedMedicines) {
        medicines = JSON.parse(storedMedicines);
    }
    
    if (storedSales) {
        salesHistory = JSON.parse(storedSales);
    }
}

// Save data to localStorage
function saveDataToStorage() {
    localStorage.setItem('medicines', JSON.stringify(medicines));
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
}

// Tab switching functionality
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Refresh content based on selected tab
    if (tabName === 'inventory') {
        displayMedicines();
    } else if (tabName === 'billing') {
        showAvailableMedicinesForBilling();
    } else if (tabName === 'reports') {
        generateReports();
    }
}

// Medicine Modal Functions
function openAddMedicineModal() {
    document.getElementById('medicineModal').style.display = 'block';
    document.getElementById('modalTitle').textContent = 'Add New Medicine';
    document.getElementById('submitBtn').textContent = 'Add Medicine';
    clearMedicineForm();
    currentEditId = null;
}

function openEditMedicineModal(id) {
    const medicine = medicines.find(med => med.id === id);
    if (!medicine) return;
    
    document.getElementById('medicineModal').style.display = 'block';
    document.getElementById('modalTitle').textContent = 'Edit Medicine';
    document.getElementById('submitBtn').textContent = 'Update Medicine';
    
    // Fill form with existing data
    document.getElementById('medicineName').value = medicine.name;
    document.getElementById('medicineCategory').value = medicine.category;
    document.getElementById('medicinePrice').value = medicine.price;
    document.getElementById('medicineStock').value = medicine.stock;
    document.getElementById('medicineExpiry').value = medicine.expiry;
    
    currentEditId = id;
}

function closeMedicineModal() {
    document.getElementById('medicineModal').style.display = 'none';
    clearMedicineForm();
    currentEditId = null;
}

function clearMedicineForm() {
    document.getElementById('medicineForm').reset();
}

// Handle medicine form submission
document.getElementById('medicineForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('medicineName').value.trim();
    const category = document.getElementById('medicineCategory').value;
    const price = parseFloat(document.getElementById('medicinePrice').value);
    const stock = parseInt(document.getElementById('medicineStock').value);
    const expiry = document.getElementById('medicineExpiry').value;
    
    // Basic validation
    if (!name || !category || !price || stock < 0 || !expiry) {
        alert('Please fill all required fields correctly!');
        return;
    }
    
    // Check if expiry date is not in the past
    const today = new Date();
    const expiryDate = new Date(expiry);
    if (expiryDate < today) {
        alert('Expiry date cannot be in the past!');
        return;
    }
    
    const medicineData = {
        id: currentEditId || Date.now().toString(),
        name: name,
        category: category,
        price: price,
        stock: stock,
        expiry: expiry,
        dateAdded: currentEditId ? medicines.find(m => m.id === currentEditId).dateAdded : new Date().toISOString()
    };
    
    if (currentEditId) {
        // Update existing medicine
        const index = medicines.findIndex(med => med.id === currentEditId);
        medicines[index] = medicineData;
        alert('Medicine updated successfully!');
    } else {
        // Add new medicine
        medicines.push(medicineData);
        alert('Medicine added successfully!');
    }
    
    saveDataToStorage();
    displayMedicines();
    updateHeaderStats();
    closeMedicineModal();
    showAvailableMedicinesForBilling();
});

// Delete medicine function
function deleteMedicine(id) {
    if (confirm('Are you sure you want to delete this medicine?')) {
        medicines = medicines.filter(med => med.id !== id);
        saveDataToStorage();
        displayMedicines();
        updateHeaderStats();
        showAvailableMedicinesForBilling();
        alert('Medicine deleted successfully!');
    }
}

// Get medicine status based on stock and expiry
function getMedicineStatus(medicine) {
    const today = new Date();
    const expiryDate = new Date(medicine.expiry);
    
    if (expiryDate < today) {
        return { status: 'Expired', class: 'status-expired', icon: '❌' };
    } else if (medicine.stock < 10) {
        return { status: 'Low Stock', class: 'status-low-stock', icon: '⚠️' };
    } else {
        return { status: 'In Stock', class: 'status-in-stock', icon: '✅' };
    }
}

// Display medicines in table
function displayMedicines() {
    const tableBody = document.getElementById('medicineTableBody');
    
    if (medicines.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <h3>No medicines found</h3>
                    <p>Click "Add New Medicine" to get started</p>
                </td>
            </tr>
        `;
        return;
    }
    
    let filteredMedicines = getFilteredMedicines();
    
    if (filteredMedicines.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <h3>No medicines match your search</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = filteredMedicines.map(medicine => {
        const statusInfo = getMedicineStatus(medicine);
        return `
            <tr class="fade-in">
                <td><strong>${medicine.name}</strong></td>
                <td>${medicine.category}</td>
                <td>₹${medicine.price.toFixed(2)}</td>
                <td>${medicine.stock}</td>
                <td>${formatDate(medicine.expiry)}</td>
                <td>
                    <span class="status-badge ${statusInfo.class}">
                        ${statusInfo.icon} ${statusInfo.status}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-warning btn-sm" onclick="openEditMedicineModal('${medicine.id}')">
                            Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteMedicine('${medicine.id}')">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Get filtered medicines based on search and filters
function getFilteredMedicines() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    return medicines.filter(medicine => {
        const matchesSearch = medicine.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || medicine.category === categoryFilter;
        const statusInfo = getMedicineStatus(medicine);
        const matchesStatus = !statusFilter || statusInfo.status === statusFilter;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
}

// Search medicines function
function searchMedicines() {
    displayMedicines();
}

// Filter medicines function
function filterMedicines() {
    displayMedicines();
}

// Update header statistics
function updateHeaderStats() {
    const totalMedicines = medicines.length;
    let lowStockCount = 0;
    let expiredCount = 0;
    
    medicines.forEach(medicine => {
        const statusInfo = getMedicineStatus(medicine);
        if (statusInfo.status === 'Low Stock') lowStockCount++;
        if (statusInfo.status === 'Expired') expiredCount++;
    });
    
    document.getElementById('totalMedicines').textContent = totalMedicines;
    document.getElementById('lowStockCount').textContent = lowStockCount;
    document.getElementById('expiredCount').textContent = expiredCount;
}

// Billing System Functions

// Show available medicines for billing
function showAvailableMedicinesForBilling() {
    const container = document.getElementById('availableMedicines');
    const searchTerm = document.getElementById('billingSearch') ? document.getElementById('billingSearch').value.toLowerCase() : '';
    
    // Filter medicines that are in stock and not expired
    const availableMedicines = medicines.filter(medicine => {
        const statusInfo = getMedicineStatus(medicine);
        const matchesSearch = medicine.name.toLowerCase().includes(searchTerm);
        return statusInfo.status !== 'Expired' && medicine.stock > 0 && matchesSearch;
    });
    
    if (availableMedicines.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No medicines available</h3>
                <p>Add medicines to inventory first</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = availableMedicines.map(medicine => {
        const statusInfo = getMedicineStatus(medicine);
        return `
            <div class="medicine-item">
                <div class="medicine-info">
                    <h4>${medicine.name}</h4>
                    <p>${medicine.category} • ₹${medicine.price.toFixed(2)} • Stock: ${medicine.stock}</p>
                    <span class="status-badge ${statusInfo.class}">${statusInfo.icon} ${statusInfo.status}</span>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="addToBill('${medicine.id}')">+</button>
                </div>
            </div>
        `;
    }).join('');
}

// Search medicines for billing
function searchForBilling() {
    showAvailableMedicinesForBilling();
}

// Add medicine to bill
function addToBill(medicineId) {
    const medicine = medicines.find(med => med.id === medicineId);
    if (!medicine || medicine.stock <= 0) {
        alert('Medicine not available!');
        return;
    }
    
    const existingItem = billItems.find(item => item.medicineId === medicineId);
    
    if (existingItem) {
        if (existingItem.quantity < medicine.stock) {
            existingItem.quantity++;
            existingItem.total = existingItem.quantity * medicine.price;
        } else {
            alert('Cannot add more than available stock!');
            return;
        }
    } else {
        billItems.push({
            medicineId: medicineId,
            name: medicine.name,
            price: medicine.price,
            quantity: 1,
            total: medicine.price
        });
    }
    
    updateBillDisplay();
}

// Remove item from bill
function removeFromBill(medicineId) {
    billItems = billItems.filter(item => item.medicineId !== medicineId);
    updateBillDisplay();
}

// Update quantity in bill
function updateBillQuantity(medicineId, newQuantity) {
    const medicine = medicines.find(med => med.id === medicineId);
    const billItem = billItems.find(item => item.medicineId === medicineId);
    
    if (!medicine || !billItem) return;
    
    if (newQuantity <= 0) {
        removeFromBill(medicineId);
        return;
    }
    
    if (newQuantity > medicine.stock) {
        alert('Cannot exceed available stock!');
        return;
    }
    
    billItem.quantity = newQuantity;
    billItem.total = newQuantity * medicine.price;
    updateBillDisplay();
}

// Update bill display
function updateBillDisplay() {
    const billItemsContainer = document.getElementById('billItems');
    const totalAmountElement = document.getElementById('totalAmount');
    const generateBillBtn = document.getElementById('generateBillBtn');
    
    if (billItems.length === 0) {
        billItemsContainer.innerHTML = `
            <div class="empty-state">
                <h3>No items in bill</h3>
                <p>Add medicines from the left panel</p>
            </div>
        `;
        totalAmountElement.textContent = '0.00';
        generateBillBtn.disabled = true;
        return;
    }
    
    billItemsContainer.innerHTML = billItems.map(item => `
        <div class="bill-item">
            <div class="item-details">
                <h5>${item.name}</h5>
                <p>₹${item.price.toFixed(2)} × ${item.quantity}</p>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateBillQuantity('${item.medicineId}', ${item.quantity - 1})">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" 
                       onchange="updateBillQuantity('${item.medicineId}', parseInt(this.value))" min="1">
                <button class="quantity-btn" onclick="updateBillQuantity('${item.medicineId}', ${item.quantity + 1})">+</button>
            </div>
            <div class="item-total">₹${item.total.toFixed(2)}</div>
            <button class="remove-item" onclick="removeFromBill('${item.medicineId}')" title="Remove item">×</button>
        </div>
    `).join('');
    
    const totalAmount = billItems.reduce((sum, item) => sum + item.total, 0);
    totalAmountElement.textContent = totalAmount.toFixed(2);
    generateBillBtn.disabled = false;
}

// Generate bill and update inventory
function generateBill() {
    if (billItems.length === 0) {
        alert('No items in bill!');
        return;
    }
    
    const customerName = document.getElementById('customerName').value.trim() || 'Walk-in Customer';
    const totalAmount = billItems.reduce((sum, item) => sum + item.total, 0);
    
    // Create bill record
    const bill = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        customerName: customerName,
        items: [...billItems],
        totalAmount: totalAmount
    };
    
    // Update medicine stock
    billItems.forEach(item => {
        const medicine = medicines.find(med => med.id === item.medicineId);
        if (medicine) {
            medicine.stock -= item.quantity;
        }
    });
    
    // Save bill to sales history
    salesHistory.push(bill);
    
    // Save data and update displays
    saveDataToStorage();
    displayMedicines();
    updateHeaderStats();
    showAvailableMedicinesForBilling();
    
    // Show receipt
    showReceipt(bill);
    
    // Clear current bill
    billItems = [];
    document.getElementById('customerName').value = '';
    updateBillDisplay();
}

// Show receipt modal
function showReceipt(bill) {
    const modal = document.getElementById('receiptModal');
    const content = document.getElementById('receiptContent');
    
    content.innerHTML = `
        <div class="receipt-header">
            <h3>Pioneer Medical Store</h3>
            <p>Medical Store Receipt</p>
            <p>Bada Bazar, Kannauj: 209725</P>
            <p>Contact: +91 99191 96590</p>
            <p>Date: ${formatDateTime(bill.date)}</p>
            <p>Bill ID: ${bill.id}</p>
            <p>Customer: ${bill.customerName}</p>
        </div>
        
        <div class="receipt-items">
            <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 10px;">
                <span>Item</span>
                <span>Qty × Price</span>
                <span>Total</span>
            </div>
            ${bill.items.map(item => `
                <div class="receipt-item">
                    <span>${item.name}</span>
                    <span>${item.quantity} × ₹${item.price.toFixed(2)}</span>
                    <span>₹${item.total.toFixed(2)}</span>
                </div>
            `).join('')}
        </div>
        
        <div class="receipt-total">
            Total Amount: ₹${bill.totalAmount.toFixed(2)}
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 0.9rem;">
            <p>Thank you for your business!</p>
            <p>Have a healthy day!</p>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Close receipt modal
function closeReceiptModal() {
    document.getElementById('receiptModal').style.display = 'none';
}

//Printreceipt
function saveReceipt() {
  const receiptContent = document.getElementById("receiptContent").innerText;

  // Create a Blob with the receipt text
  const blob = new Blob([receiptContent], { type: "text/plain" });

  // Create a temporary download link
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);

  // File name with current date & time
  const now = new Date();
  const fileName = `receipt_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.txt`;

  link.download = fileName;
  link.click();

  // Cleanup
  URL.revokeObjectURL(link.href);
}


// Reports Functions
function generateReports() {
    generateStockSummary();
    generateExpiryAlerts();
    generateRecentSales();
}

function generateStockSummary() {
    const container = document.getElementById('stockSummary');
    
    const categories = {};
    let totalValue = 0;
    
    medicines.forEach(medicine => {
        if (!categories[medicine.category]) {
            categories[medicine.category] = { count: 0, value: 0 };
        }
        categories[medicine.category].count++;
        categories[medicine.category].value += medicine.price * medicine.stock;
        totalValue += medicine.price * medicine.stock;
    });
    
    let html = `
        <div class="report-item">
            <span><strong>Total Inventory Value</strong></span>
            <span><strong>₹${totalValue.toFixed(2)}</strong></span>
        </div>
    `;
    
    Object.entries(categories).forEach(([category, data]) => {
        html += `
            <div class="report-item">
                <span>${category}</span>
                <span>${data.count} items (₹${data.value.toFixed(2)})</span>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function generateExpiryAlerts() {
    const container = document.getElementById('expiryAlerts');
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    const expiredMedicines = [];
    const expiringMedicines = [];
    
    medicines.forEach(medicine => {
        const expiryDate = new Date(medicine.expiry);
        if (expiryDate < today) {
            expiredMedicines.push(medicine);
        } else if (expiryDate <= thirtyDaysFromNow) {
            expiringMedicines.push(medicine);
        }
    });
    
    let html = '';
    
    if (expiredMedicines.length > 0) {
        html += `<h4 style="color: #dc3545; margin-bottom: 10px;">❌ Expired Medicines</h4>`;
        expiredMedicines.forEach(medicine => {
            html += `
                <div class="report-item">
                    <span>${medicine.name}</span>
                    <span style="color: #dc3545;">Expired ${formatDate(medicine.expiry)}</span>
                </div>
            `;
        });
    }
    
    if (expiringMedicines.length > 0) {
        html += `<h4 style="color: #ffc107; margin: 15px 0 10px 0;">⚠️ Expiring Soon</h4>`;
        expiringMedicines.forEach(medicine => {
            html += `
                <div class="report-item">
                    <span>${medicine.name}</span>
                    <span style="color: #ffc107;">Expires ${formatDate(medicine.expiry)}</span>
                </div>
            `;
        });
    }
    
    if (html === '') {
        html = `
            <div class="empty-state">
                <h3>✅ All Good!</h3>
                <p>No expiry alerts at this time</p>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function generateRecentSales() {
    const container = document.getElementById('recentSales');
    
    if (salesHistory.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No sales yet</h3>
                <p>Sales will appear here after billing</p>
            </div>
        `;
        return;
    }
    
    const recentSales = salesHistory.slice(-10).reverse();
    
    container.innerHTML = recentSales.map(sale => `
        <div class="report-item">
            <div>
                <strong>${sale.customerName}</strong><br>
                <small>${formatDateTime(sale.date)}</small>
            </div>
            <div>
                <strong>₹${sale.totalAmount.toFixed(2)}</strong><br>
                <small>${sale.items.length} items</small>
            </div>
        </div>
    `).join('');
}

// Utility Functions

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
}

// Format date and time for display
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN');
}

// Close modals when clicking outside
window.onclick = function(event) {
    const medicineModal = document.getElementById('medicineModal');
    const receiptModal = document.getElementById('receiptModal');
    
    if (event.target === medicineModal) {
        closeMedicineModal();
    }
    
    if (event.target === receiptModal) {
        closeReceiptModal();
    }
}

// Add some sample data for demonstration (only if no data exists)
function addSampleData() {
    if (medicines.length === 0) {
        const sampleMedicines = [
            {
                id: '1',
                name: 'Paracetamol 500mg',
                category: 'Tablets',
                price: 25.50,
                stock: 150,
                expiry: '2025-12-31',
                dateAdded: new Date().toISOString()
            },
            {
                id: '2',
                name: 'Amoxicillin 250mg',
                category: 'Capsules',
                price: 85.00,
                stock: 8,
                expiry: '2025-06-15',
                dateAdded: new Date().toISOString()
            },
            {
                id: '3',
                name: 'Cough Syrup',
                category: 'Syrups',
                price: 45.00,
                stock: 25,
                expiry: '2024-03-20',
                dateAdded: new Date().toISOString()
            }
        ];
        
        medicines = sampleMedicines;
        saveDataToStorage();
        displayMedicines();
        updateHeaderStats();
        showAvailableMedicinesForBilling();
    }
}

// Uncomment the line below to add sample data for testing
// addSampleData();