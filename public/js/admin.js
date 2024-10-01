document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();
    fetchProducts();
    fetchOrders();

    document.getElementById('addProductForm').addEventListener('submit', addProduct);
});

async function fetchDashboardData() {
    try {
        const response = await fetch('/admin/dashboard');
        const data = await response.json();
        
        document.getElementById('totalProducts').textContent = data.totalProducts;
        document.getElementById('monthlyOrders').textContent = data.monthlyOrders;
        document.getElementById('monthlyRevenue').textContent = `$${data.monthlyRevenue.toFixed(2)}`;
        document.getElementById('totalUsers').textContent = data.totalUsers;

        // Update change percentages (assuming you have this data)
        document.getElementById('productChange').textContent = `${data.productChange}% from last month`;
        document.getElementById('orderChange').textContent = `${data.orderChange}% from last month`;
        document.getElementById('revenueChange').textContent = `${data.revenueChange}% from last month`;
        document.getElementById('userChange').textContent = `${data.userChange}% from last month`;

        renderSalesChart(data.monthlySales);
        renderRecentOrders(data.recentOrders);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
}

function renderSalesChart(monthlySales) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlySales.map(sale => sale.month),
            datasets: [{
                label: 'Monthly Sales',
                data: monthlySales.map(sale => sale.total),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderRecentOrders(recentOrders) {
    const recentOrdersList = document.getElementById('recentOrders');
    recentOrdersList.innerHTML = recentOrders.map(order => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            Order #${order.id} - ${order.user}
            <span class="badge bg-primary rounded-pill">$${order.total.toFixed(2)}</span>
        </li>
    `).join('');
}

async function fetchProducts() {
    try {
        const response = await fetch('/products');
        const products = await response.json();
        const productList = document.getElementById('productList');
        productList.innerHTML = products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editProduct(${product.id})">Edit</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${product.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

async function fetchOrders() {
    try {
        const response = await fetch('/admin/orders');
        const orders = await response.json();
        const orderList = document.getElementById('orderList');
        orderList.innerHTML = orders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.user}</td>
                <td>$${order.total_amount.toFixed(2)}</td>
                <td>${order.status}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewOrder(${order.id})">View</button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="updateOrderStatus(${order.id})">Update Status</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

async function addProduct(event) {
    event.preventDefault();
    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        image: document.getElementById('productImage').value
    };

    try {
        const response = await fetch('/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });

        if (response.ok) {
            alert('Product added successfully');
            document.getElementById('addProductForm').reset();
            fetchProducts();
            bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
        } else {
            alert('Failed to add product');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Error adding product');
    }
}

function editProduct(id) {
    // Implement edit product functionality
    console.log('Edit product:', id);
}

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const response = await fetch(`/products/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Product deleted successfully');
                fetchProducts();
            } else {
                alert('Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product');
        }
    }
}

function viewOrder(id) {
    // Implement view order functionality
    console.log('View order:', id);
}

function updateOrderStatus(id) {
    // Implement update order status functionality
    console.log('Update order status:', id);
}

// Initialize Bootstrap components
const addProductModal = new bootstrap.Modal(document.getElementById('addProductModal'));
document.getElementById('addProductBtn').addEventListener('click', () => {
    addProductModal.show();
});