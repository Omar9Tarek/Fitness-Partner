import Swal from 'sweetalert2';
import { Component, OnInit } from '@angular/core';
import { ProductServicesService } from '../../services/product-services.service';
import { IProducts } from '../../models/i-products';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css'],
  animations: [
    trigger('expandCollapse', [
      state(
        'collapsed',
        style({
          height: '0px',
          opacity: 0,
          overflow: 'hidden',
          padding: '0 0',
          margin: '0 0',
        })
      ),
      state(
        'expanded',
        style({
          height: '*',
          opacity: 1,
          overflow: 'visible',
        })
      ),
      transition('collapsed <=> expanded', [animate('300ms ease-in-out')]),
    ]),
  ],
})
export class AdminProductsComponent implements OnInit {
  products: IProducts[] = [];
  newProduct: IProducts = {
    id: 0,
    name: '',
    image: '',
    description: '',
    expiration_date: '',
    price: 0,
    brand: '',
    available_flavors: [],
    available_size: '',
    product_images: {},
    category: '',
    quantity: 0,
    inStock: true,
    flavor_quantity: {},
    isNew: false,
    isHot: false,
    discount: 0
  };
  // Flavor edit modal state
  showFlavorModal = false;
  currentFlavor = '';
  currentProductId = 0;
  currentQuantity = 0;
  showAddProductForm: boolean = false;
  // Product edit modal state
  showProductModal = false;
  editingProduct: IProducts | null = null;
  newFlavorName = '';
  newFlavorQuantity: number | null = null;
  newFlavorImage = '';

  constructor(
    private productService: ProductServicesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  toggleAddProductForm() {
    this.showAddProductForm = !this.showAddProductForm; 
  }

  addNewProduct() {
    Swal.fire({
      title: 'Add New Product',
      html: `
        <form id="productForm" style="font-size: 0.875rem;">
          <!-- Basic Info Section -->
          <div class="basic-info" style="margin-bottom: 1rem;">
            <label for="name" style="font-size: 0.875rem; margin-bottom: 0.25rem; display: block;">Product Name:</label>
            <input type="text" id="name" class="swal2-input" required style="margin-bottom: 0.5rem;" />
            
            <label for="description" style="font-size: 0.875rem; margin-bottom: 0.25rem; display: block;">Description:</label>
            <textarea id="description" class="swal2-textarea" style="margin-bottom: 0.5rem;"></textarea>
            
            <label for="price" style="font-size: 0.875rem; margin-bottom: 0.25rem; display: block;">Price:</label>
            <input type="number" id="price" class="swal2-input" min="0" step="0.01" required style="margin-bottom: 0.5rem;" />
            
            <label for="brand" style="font-size: 0.875rem; margin-bottom: 0.25rem; display: block;">Brand:</label>
            <input type="text" id="brand" class="swal2-input" style="margin-bottom: 0.5rem;" />
            
            <label for="image" style="font-size: 0.875rem; margin-bottom: 0.25rem; display: block;">Main Image URL:</label>
            <input type="text" id="image" class="swal2-input" required style="margin-bottom: 0.5rem;" />
            
            <label for="category" style="font-size: 0.875rem; margin-bottom: 0.25rem; display: block;">Category:</label>
            <input type="text" id="category" class="swal2-input" required style="margin-bottom: 0.5rem;" />
            
            <label for="available_size" style="font-size: 0.875rem; margin-bottom: 0.25rem; display: block;">Available Size:</label>
            <input type="text" id="available_size" class="swal2-input" required style="margin-bottom: 0.5rem;" />
            
            <label for="expiration_date" style="font-size: 0.875rem; margin-bottom: 0.25rem; display: block;">Expiration Date:</label>
            <input type="date" id="expiration_date" class="swal2-input" style="margin-bottom: 0.5rem;" />
            
            <label for="quantity" style="font-size: 0.875rem; margin-bottom: 0.25rem; display: block;">Quantity:</label>
            <input type="number" id="quantity" class="swal2-input" min="0" required style="margin-bottom: 0.5rem;" />
            
            <label for="discount" style="font-size: 0.875rem; margin-bottom: 0.25rem; display: block;">Discount (%):</label>
            <input type="number" id="discount" class="swal2-input" min="0" max="100" style="margin-bottom: 0.5rem;" />
            
            <div style="margin: 0.5rem 0;">
              <input type="checkbox" id="inStock" checked style="margin-right: 0.5rem;" />
              <label for="inStock" style="font-size: 0.875rem;">In Stock</label>
            </div>
            
            <div style="margin: 0.5rem 0;">
              <input type="checkbox" id="isNew" style="margin-right: 0.5rem;" />
              <label for="isNew" style="font-size: 0.875rem;">New Product</label>
            </div>
            
            <div style="margin: 0.5rem 0;">
              <input type="checkbox" id="isHot" style="margin-right: 0.5rem;" />
              <label for="isHot" style="font-size: 0.875rem;">Hot Product</label>
            </div>
          </div>
  
          <!-- New Flavor Section -->
          <div style="margin-top: 1rem;">
            <h4 style="font-size: 1rem; margin: 1rem 0;">Add Flavors</h4>
            <div id="flavorInputs">
              <div class="flavor-input-group" style="margin-bottom: 0.5rem;">
                <input type="text" class="flavor-input swal2-input" placeholder="Flavor Name" style="margin-bottom: 0.25rem;"/>
                <input type="number" class="quantity-input swal2-input" placeholder="Quantity" min="0" style="margin-bottom: 0.25rem;"/>
                <input type="text" class="image-input swal2-input" placeholder="Image URL" />
              </div>
            </div>
            <button type="button" id="addFlavorBtn onclick="addFlavorInput()" 
                    style="margin-top: 0.5rem; font-size: 0.875rem; padding: 0.25rem 0.5rem;">
              + Add Another Flavor
            </button>
          </div>
        </form>
        <script>
          function addFlavorInput() {
            const container = document.getElementById('flavorInputs');
            const div = document.createElement('div');
            div.className = 'flavor-input-group';
            div.style.marginBottom = '0.5rem';
            div.innerHTML = \`
              <input type="text" class="flavor-input swal2-input" placeholder="Flavor Name" style="margin-bottom: 0.25rem;"/>
              <input type="number" class="quantity-input swal2-input" placeholder="Quantity" min="0" style="margin-bottom: 0.25rem;"/>
              <input type="text" class="image-input swal2-input" placeholder="Image URL" />
            \`;
            container.appendChild(div);
          }
        </script>
      `,
      customClass: {
        confirmButton: 'swal2-btn-sm',
        cancelButton: 'swal2-btn-sm',
        popup: 'swal2-popup-sm',
      },
      didOpen: () => {
        // Add flavor input dynamically
        const addButton = document.getElementById('addFlavorBtn');
        const container = document.getElementById('flavorInputs');
  
        addButton?.addEventListener('click', () => {
          const div = document.createElement('div');
          div.className = 'flavor-input-group';
          div.style.marginBottom = '0.5rem';
          div.innerHTML = `
            <input type="text" class="flavor-input swal2-input" placeholder="Flavor Name" style="margin-bottom: 0.25rem;"/>
            <input type="number" class="quantity-input swal2-input" placeholder="Quantity" min="0" style="margin-bottom: 0.25rem;"/>
            <input type="text" class="image-input swal2-input" placeholder="Image URL" />
          `;
          container?.appendChild(div);
        });
      },
      preConfirm: () => {
        // Collect existing fields
        const name = (document.getElementById('name') as HTMLInputElement).value;
        const description = (document.getElementById('description') as HTMLTextAreaElement).value;
        const price = parseFloat((document.getElementById('price') as HTMLInputElement).value);
        const brand = (document.getElementById('brand') as HTMLInputElement).value;
        const image = (document.getElementById('image') as HTMLInputElement).value;
        const category = (document.getElementById('category') as HTMLInputElement).value;
        const availableSize = (document.getElementById('available_size') as HTMLInputElement).value;
        const expirationDate = (document.getElementById('expiration_date') as HTMLInputElement).value;
        const quantity = parseInt((document.getElementById('quantity') as HTMLInputElement).value);
        const discount = parseInt((document.getElementById('discount') as HTMLInputElement).value || '0');
        const inStock = (document.getElementById('inStock') as HTMLInputElement).checked;
        const isNew = (document.getElementById('isNew') as HTMLInputElement).checked;
        const isHot = (document.getElementById('isHot') as HTMLInputElement).checked;
  
        // Collect flavor data
        const flavorGroups = document.querySelectorAll('.flavor-input-group');
        const flavors: string[] = [];
        const flavorQuantities: { [key: string]: number } = {};
        const productImages: { [key: string]: string } = {};
  
        flavorGroups.forEach(group => {
          const flavorName = (group.querySelector('.flavor-input') as HTMLInputElement).value;
          const quantity = parseInt((group.querySelector('.quantity-input') as HTMLInputElement).value);
          const imageUrl = (group.querySelector('.image-input') as HTMLInputElement).value;
  
          if (flavorName && !isNaN(quantity) && imageUrl) {
            flavors.push(flavorName);
            flavorQuantities[flavorName] = quantity;
            productImages[flavorName] = imageUrl;
          }
        });
  
        if (!name || !description || !price || !image || !category || !availableSize || !quantity) {
          Swal.showValidationMessage('All required fields must be filled');
          return;
        }
  
        // Create new product with flavors
        this.newProduct = {
          id: 0, // Will be assigned by the server
          name,
          description,
          price,
          brand,
          image,
          category,
          available_size: availableSize,
          expiration_date: expirationDate,
          quantity,
          inStock,
          isNew,
          isHot,
          discount,
          available_flavors: flavors,
          product_images: productImages,
          flavor_quantity: flavorQuantities
        };
  
        return this.productService.createProduct(this.newProduct).toPromise();
      },
      showCancelButton: true,
      confirmButtonText: 'Add Product',
      cancelButtonText: 'Cancel',
      focusCancel: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Product Added',
          text: `Product ${this.newProduct.name} has been successfully added!`,
          timer: 2000,
          showConfirmButton: false,
        });
        this.loadProducts();
      }
    })
    .catch((error) => {
      console.error('Error adding product:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Add Product',
        text: 'There was an issue adding the product. Please try again.',
      });
    });
  }

  navigateToProduct(id: number) {
    this.router.navigate(['/products', id]);
  }
  
  // getFlavors(product: IProducts): string[] {
  //   const fq = product.flavor_quantity || {};
  //   return Object.keys(fq).filter((flavor) => fq[flavor] > 0);
  // }

  getFlavors(product: IProducts): string[] {
  return Object.keys(product.flavor_quantity || {});
}

  editFlavor(productId: number, flavor: string) {
    const product = this.products.find((p) => p.id === productId);
    if (product) {
      this.currentProductId = productId;
      this.currentFlavor = flavor;
      this.currentQuantity = product.flavor_quantity[flavor];
      this.showFlavorModal = true;
    }
  }

  async deleteFlavor(productId: string, flavorName: string) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this flavor forever. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await this.productService.deleteFlavorFromProduct(productId, flavorName);

      // Remove flavor from local product object
      const product = this.products.find((p) => p.id.toString() === productId);
      if (product) {
        delete product.flavor_quantity[flavorName];
        delete product.product_images[flavorName];
        product.available_flavors = product.available_flavors.filter(
          (f) => f !== flavorName
        );
      }

      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `Flavor "${flavorName}" has been removed.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error deleting flavor:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete the flavor. Please try again later.',
      });
    }
  }

  async saveFlavorQuantity() {
    try {
      await this.productService.updateFlavorQuantityAdmin(
        this.currentProductId.toString(),
        this.currentFlavor,
        this.currentQuantity
      );
      
      // Update local data
      const product = this.products.find(p => p.id === this.currentProductId);
      if (product) {
        product.flavor_quantity[this.currentFlavor] = this.currentQuantity;
      }
      
      this.showFlavorModal = false;
      
      Swal.fire({
        icon: 'success',
        title: 'Quantity Updated',
        text: `The quantity for ${this.currentFlavor} has been updated.`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating flavor quantity:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update the flavor quantity. Please try again.'
      });
    }
  }

  closeFlavorModal() {
    this.showFlavorModal = false;
  }

  openEditProductModal(product: IProducts) {
    this.editingProduct = { ...product };
    this.showProductModal = true;
    this.newFlavorName = '';
    this.newFlavorQuantity = null;
    this.newFlavorImage = '';
  }

  closeProductModal() {
    this.showProductModal = false;
    this.editingProduct = null;
  }

  async addFlavorToProduct() {
    if (
      this.editingProduct &&
      this.newFlavorName &&
      this.newFlavorQuantity !== null &&
      this.newFlavorImage
    ) {
      const productId = this.editingProduct.id.toString();
      const { newFlavorName, newFlavorQuantity, newFlavorImage } = this;
  
      // Check if flavor already exists
      if (this.editingProduct.available_flavors?.includes(newFlavorName)) {
        Swal.fire({
          icon: 'error',
          title: 'Duplicate Flavor',
          text: `Flavor "${newFlavorName}" already exists.`,
        });
        return;
      }
  
      try {
        await firstValueFrom(
          this.productService.addFlavorToProduct(
            productId,
            newFlavorName,
            newFlavorQuantity,
            newFlavorImage
          )
        );
  
        // Update local product data
        if (this.editingProduct) {
          this.editingProduct.available_flavors = this.editingProduct.available_flavors || [];
          this.editingProduct.flavor_quantity = this.editingProduct.flavor_quantity || {};
          this.editingProduct.product_images = this.editingProduct.product_images || {};
  
          // Add only if not exists
          if (!this.editingProduct.available_flavors.includes(newFlavorName)) {
            this.editingProduct.available_flavors.push(newFlavorName);
          }
          this.editingProduct.flavor_quantity[newFlavorName] = newFlavorQuantity;
          this.editingProduct.product_images[newFlavorName] = newFlavorImage;
  
          // Update main products array
          const index = this.products.findIndex(p => p.id === this.editingProduct!.id);
          if (index !== -1) {
            this.products[index].available_flavors = this.products[index].available_flavors || [];
            if (!this.products[index].available_flavors.includes(newFlavorName)) {
              this.products[index].available_flavors.push(newFlavorName);
            }
            this.products[index].flavor_quantity[newFlavorName] = newFlavorQuantity;
            this.products[index].product_images[newFlavorName] = newFlavorImage;
          }
        }

        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Flavor Added',
          text: `"${newFlavorName}" flavor has been added to the product.`,
          timer: 2000,
          showConfirmButton: false,
        });

        // Reset input fields
        this.newFlavorName = '';
        this.newFlavorQuantity = null;
        this.newFlavorImage = '';
      } catch (error) {
        console.error('Error adding flavor:', error);

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to add the flavor. Please try again.',
        });
      }
    } else {
      // Show validation error if fields are missing
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Information',
        text: 'Please provide flavor name, quantity, and image URL.',
      });
    }
  }

  async saveProductChanges() {
    if (!this.editingProduct) return;

    try {
      await firstValueFrom(this.productService.updateProduct(
        this.editingProduct.id.toString(),
        this.editingProduct
      ));

      // Update local data to reflect changes
      const index = this.products.findIndex(p => p.id === this.editingProduct!.id);
      if (index !== -1) {
        this.products[index] = { ...this.editingProduct };
      }

      Swal.fire({
        icon: 'success',
        title: 'Changes Saved',
        text: 'Product changes have been saved successfully.',
        timer: 2000,
        showConfirmButton: false,
      });

      this.closeProductModal();
    } catch (error) {
      console.error('Error saving product changes:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save product changes. Please try again.',
      });
    }
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe(
      (products) => {
        this.products = products;
      },
      (error) => {
        console.error('Error loading products:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load products. Please try again.',
        });
      }
    );
  }
  
  async deleteProduct(productId: string) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this product forever. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await firstValueFrom(this.productService.deleteProduct(productId));
    
      this.products = this.products.filter(
        (product) => product.id.toString() !== productId
      );
    
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'The product has been successfully deleted.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete the product. Please try again later.',
      });
    }
  }
}