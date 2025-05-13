import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { FormGroup, FormBuilder, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
  
interface OrderProduct {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  flavor: string;
}

interface OrderAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Order {
  id: string;
  userId: string;         
  userEmail: string;
  transactionId: string;
  products: OrderProduct[];
  total: number;
  date: Date;
  address: OrderAddress;
  status: string;
}

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  isLoading = true;
  selectedOrder: Order | null = null;
  editForm: FormGroup;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  statusOptions = ['confirmed', 'shipped', 'delivered'];
  filteredOrders: Order[] = [];
  searchTerm = '';
  sortBy = 'date';
  sortDirection = 'desc';
  
  private subscriptions = new Subscription();

  get productsArray(): FormArray {
    return this.editForm.get('products') as FormArray;
  }

  constructor(
    private usersService: UsersService,
    private fb: FormBuilder
  ) {
    this.editForm = this.createOrderForm();
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Revenue calculation methods
  calculateTotalRevenue(): number {
    if (!this.orders || this.orders.length === 0) return 0;
    
    return this.orders
      .filter(order => order.status !== 'cancelled') // Exclude cancelled orders
      .reduce((total, order) => total + order.total, 0);
  }

  calculateTotalOrdersValue(): number {
    if (!this.orders || this.orders.length === 0) return 0;
    
    return this.orders.reduce((total, order) => total + order.total, 0);
  }

  getCancelledOrdersValue(): number {
    if (!this.orders || this.orders.length === 0) return 0;
    
    return this.orders
      .filter(order => order.status === 'cancelled')
      .reduce((total, order) => total + order.total, 0);
  }

  createOrderForm(): FormGroup {
    return this.fb.group({
      products: this.fb.array([]),
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zipCode: ['', Validators.required],
        country: ['', Validators.required]
      }),
      status: ['', Validators.required]
    });
  }

 loadOrders(): void {
  this.isLoading = true;
  this.errorMessage = '';
  
  this.subscriptions.add(
    this.usersService.getAllOrders().subscribe({
      next: (data: any) => {
        // Ensure data is an array before sorting
        if (Array.isArray(data)) {
          // Sort orders by date (newest first)
          this.orders = data.sort((a: Order, b: Order) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        } else if (data && typeof data === 'object') {
          // If data is an object (like from Firebase), convert to array
          this.orders = (Object.values(data) as Order[]).sort((a: Order, b: Order) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        } else {
          // Fallback if data is neither array nor object
          this.orders = [];
          this.errorMessage = 'Invalid data format received from server';
          console.error('Invalid data format:', data);
        }
        
        this.filteredOrders = [...this.orders];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.errorMessage = 'Failed to load orders. Please try again.';
        this.isLoading = false;
      }
    })
  );
}
  initializeForm(order: Order): void {
    this.productsArray.clear();
    
    order.products.forEach((product: OrderProduct) => {
      this.productsArray.push(this.fb.group({
        productId: [product.productId, Validators.required],
        name: [product.name, Validators.required],
        price: [product.price, [Validators.required, Validators.min(0)]],
        quantity: [product.quantity, [Validators.required, Validators.min(1)]],
        flavor: [product.flavor]
      }));
    });

    this.editForm.patchValue({
      address: order.address,
      status: order.status
    });
  }

  onCancelOrder(order: Order): void {
    if (confirm(`Are you sure you want to cancel order ${order.id}? This will notify the customer.`)) {
      this.isLoading = true;
      this.subscriptions.add(
        this.usersService.cancelOrder(order.userId, order.id)
          .subscribe({
            next: () => {
              this.successMessage = `Order ${order.id} has been cancelled`;
              this.loadOrders();
            },
            error: (err) => {
              console.error('Error cancelling order:', err);
              this.errorMessage = 'Failed to cancel order. Please try again.';
              this.isLoading = false;
            }
          })
      );
    }
  }

  onEditOrder(order: Order): void {
    this.selectedOrder = { ...order };
    this.initializeForm(order);
    this.successMessage = '';
    this.errorMessage = '';
  }

  onAddProduct(): void {
    this.productsArray.push(this.fb.group({
      productId: ['', Validators.required],
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      flavor: ['']
    }));
  }

  onRemoveProduct(index: number): void {
    if (this.productsArray.length > 1) {
      this.productsArray.removeAt(index);
    } else {
      this.errorMessage = 'Order must have at least one product';
    }
  }

  calculateTotal(): number {
    if (!this.productsArray || this.productsArray.length === 0) return 0;
    
    return this.productsArray.controls.reduce((sum, control) => {
      const productGroup = control as FormGroup;
      const price = parseFloat(productGroup.get('price')?.value) || 0;
      const quantity = parseInt(productGroup.get('quantity')?.value) || 0;
      return sum + (price * quantity);
    }, 0);
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.errorMessage = 'Please correct all errors before submitting';
      return;
    }
    
    if (this.editForm.valid && this.selectedOrder) {
      this.isSaving = true;
      this.errorMessage = '';
      
      const updateData = {
        ...this.editForm.value,
        products: this.editForm.value.products
      };

      this.subscriptions.add(
        this.usersService.updateOrder(
          this.selectedOrder.userId,
          this.selectedOrder.id,
          updateData
        ).subscribe({
          next: () => {
            this.successMessage = `Order ${this.selectedOrder?.id} has been updated successfully`;
            this.loadOrders();
            this.selectedOrder = null;
            this.isSaving = false;
          },
          error: (err) => {
            console.error('Error updating order:', err);
            this.errorMessage = 'Failed to update order. Please try again.';
            this.isSaving = false;
          }
        })
      );
    }
  }

  onCancelEdit(): void {
    this.selectedOrder = null;
    this.successMessage = '';
    this.errorMessage = '';
  }

  searchOrders(): void {
    if (!this.searchTerm.trim()) {
      this.filteredOrders = [...this.orders];
      return;
    }
    
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredOrders = this.orders.filter(order => 
      order.id.toLowerCase().includes(term) ||
      order.userEmail.toLowerCase().includes(term) ||
      order.status.toLowerCase().includes(term) ||
      order.transactionId.toLowerCase().includes(term)
    );
  }

  sortOrders(field: string): void {
    if (this.sortBy === field) {
      // Toggle direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'asc';
    }
    
    this.filteredOrders.sort((a: any, b: any) => {
      let valA: any = a[field];
      let valB: any = b[field];
      
      // Handle dates
      if (field === 'date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      
      // Handle sorting direction
      const direction = this.sortDirection === 'asc' ? 1 : -1;
      
      if (valA < valB) return -1 * direction;
      if (valA > valB) return 1 * direction;
      return 0;
    });
  }
  
  getFormattedDate(dateString: string | Date): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}