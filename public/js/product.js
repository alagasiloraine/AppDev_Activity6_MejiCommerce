$(document).on('click', '.btn-edit-product', function () {
  const prodId = $(this).data('prod-id');
  const prodName = $(this).data('prodname');
  const description = $(this).data('description');
  const price = $(this).data('price');
  const catId = $(this).data('cat-id');
  const image = $(this).data('image');

  $('#edit_prod_id').val(prodId);
  $('#edit_prodname').val(prodName);
  $('#edit_description').val(description);
  $('#edit_price').val(price);
  $('#edit_category').val(catId);
  $('#edit_image').val('');
  $('#editProductModal').modal('show');
});

$('#editProduct').on('submit', function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  $.ajax({
    url: '/admin/products/edit', 
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false,
    success: function (response) {
      location.reload();
    },
    error: function (error) {
      alert('Error editing product: ' + error.responseText);
    }
  });
});

$('#addProductForm').on('submit', function (e) {
  e.preventDefault();

  const formData = new FormData(this);

  $.ajax({
    url: '/admin/products',
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false,
    success: function (response) {

      const newProduct = response.product;
      const newRow = `
        <tr>
          <td>${newProduct.prodname}</td>
          <td>${newProduct.description}</td>
          <td>
            <img src="/uploads/images/${newProduct.image}" alt="${newProduct.prodname}" class="product-image rounded" />
          </td>
          <td>$${newProduct.price}</td>
          <td>${newProduct.cat_id}</td>
          <td>
            <a href="#" class="btn btn-warning action-btn btn-edit-product" data-prod-id="${newProduct.prod_id}" data-prodname="${newProduct.prodname}" data-description="${newProduct.description}" data-price="${newProduct.price}" data-cat-id="${newProduct.cat_id}" data-image="${newProduct.image}">
              <i class="fas fa-edit"></i>
            </a>
            <a href="/admin/products/${newProduct.prod_id}" class="btn btn-info action-btn">
              <i class="fas fa-eye"></i>
            </a>
            <a href="#" class="btn btn-danger action-btn" onclick="deleteProduct('${newProduct.prod_id}'); return false;">
              <i class="fas fa-trash-alt"></i>
            </a>              
          </td>
        </tr>
      `;

      $('.table tbody').append(newRow);

      $('#addProductForm')[0].reset();
      $('#addProductModal').modal('hide');
    },
    error: function (error) {
      alert('Error adding product: ' + error.responseJSON.error);
    }
  });
});

function deleteProduct(prod_id) {
console.log('Deleting product with ID:', prod_id);
if (confirm("Are you sure you want to delete this product?")) {
    fetch(`/admin/products/${prod_id}`, {
        method: "DELETE",
    })
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        if (data.success) {
            alert(data.message);
            location.reload();
        } else {
            alert(`Failed to delete product: ${data.error}`);
        }
    })
    .catch((error) => {
        console.error("Error deleting product:", error);
        alert("An error occurred while trying to delete the product.");
    });
  }
}

$(document).on('click', '.btn-view-product', function () {
  const prodName = $(this).data('prodname');
  const description = $(this).data('description');
  const price = $(this).data('price');
  const category = $(this).data('cat-id');
  const image = $(this).data('image');

  $('#view_prodname').text(prodName);
  $('#view_description').text(description);
  $('#view_price').text(price);
  $('#view_category').text(category);
  $('#view_image').attr('src', '/uploads/images/' + image);

  $('#viewProductModal').modal('show');
});


document.querySelectorAll('.edit-product-btn').forEach(button => {
  button.addEventListener('click', function () {
    const prodId = this.dataset.prodId;

    // Fetch product details from the server using AJAX
    fetch(`/product/${prodId}/edit`)
      .then(response => response.json())
      .then(data => {
        // Populate the modal fields
        document.getElementById('edit_prod_id').value = data.prod_id;
        document.getElementById('edit_prodname').value = data.prodname;
        document.getElementById('edit_description').value = data.description;
        document.getElementById('edit_price').value = data.price;

        // Set the selected category
        const categorySelect = document.getElementById('edit_category');
        categorySelect.value = data.cat_id;

        // Set the current image
        const imagePreview = document.getElementById('current_image_preview');
        if (data.image) {
          imagePreview.src = `/uploads/images/${data.image}`;
        } else {
          imagePreview.src = '';
          imagePreview.alt = 'No image available';
        }

        // Show the modal
        const editProductModal = new bootstrap.Modal(document.getElementById('editProductModal'));
        editProductModal.show();
      })
      .catch(error => {
        console.error('Error fetching product details:', error);
      });
  });
});
