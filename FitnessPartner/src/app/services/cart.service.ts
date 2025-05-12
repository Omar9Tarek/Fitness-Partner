import { EnvironmentInjector, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart` // private apiUrl = 'http://localhost:3000/cart';
  private cartItems: any[] = [];
  private cartSubject = new BehaviorSubject<any[]>([]);
  private totalSubject = new BehaviorSubject<number>(0);
  
  cart$ = this.cartSubject.asObservable();
  total$ = this.totalSubject.asObservable();
  
  private isLoadingCart = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    // Only load cart after full initialization
    setTimeout(() => this.loadCart(), 0);

    // Listen for login/logout events
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        // Reload cart when user logs in
        this.loadCart();
      } else {
        // Clear cart when user logs out
        this.resetCart();
      }
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Reset cart to empty state
  private resetCart(): void {
    this.cartItems = [];
    this.cartSubject.next([]);
    this.totalSubject.next(0);
  }

  loadCart(): void {
    // Prevent multiple simultaneous load calls
    if (this.isLoadingCart) {
      console.log('Cart loading already in progress...');
      return;
    }

    console.log('Loading cart. Is user logged in?', this.authService.isLoggedIn());
    if (!this.authService.isLoggedIn()) {
      console.log('User not logged in, cart is empty');
      this.resetCart();
      return;
    }

    this.isLoadingCart = true;
    const token = this.authService.getToken();
    console.log('Getting cart from server with token:', token ? token.substring(0, 10) + '...' : 'No token available');
    
    this.http.get<any[]>(`${this.apiUrl}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      finalize(() => this.isLoadingCart = false),
      catchError((error: HttpErrorResponse) => {
        console.error('Error loading cart:', error);
        
        // Check if unauthorized (401)
        if (error.status === 401) {
          console.log('Authentication failed, redirecting to login');
          this.authService.logout(); // Log out user if token is invalid
        }
        
        // Return empty array on error
        this.resetCart();
        return of([]);
      })
    ).subscribe(cart => {
      if (Array.isArray(cart)) {
        this.cartItems = cart;
        this.cartSubject.next([...this.cartItems]);
        this.updateTotalFromCartItems();
        console.log('Cart loaded from server:', this.cartItems);
      } else {
        console.error('Server returned invalid cart format:', cart);
        this.resetCart();
      }
    });
  }

  // Update total whenever cart changes
  private updateTotalFromCartItems(): void {
    const newTotal = Number(
      this.cartItems.reduce((total, item) => total + (item.total || 0), 0).toFixed(2)
    );
    this.totalSubject.next(newTotal);
    console.log('Updated cart total:', newTotal);
  }

  getCart(): any[] {
    return [...this.cartItems]; // Return a copy to prevent direct modification
  }

  clearCart(): void {
    if (!this.authService.isLoggedIn()) {
      return;
    }

    this.http.delete(`${this.apiUrl}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error clearing cart:', error);
        if (error.status === 401) {
          this.authService.logout();
        }
        return of(null);
      })
    ).subscribe(() => {
      this.resetCart();
      console.log('Cart cleared successfully');
    });
  }

  addToCart(item: any): Observable<any[]> {
    if (!this.authService.isLoggedIn()) {
      console.log('User not logged in, redirecting to login');
      this.router.navigate(['/login']);
      return throwError(() => new Error('Not authenticated'));
    }

    return this.http.post<any[]>(
      `${this.apiUrl}/add`,
      item,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(updatedCart => {
        // Update local cart and total
        this.cartItems = updatedCart;
        this.cartSubject.next([...this.cartItems]);
        this.updateTotalFromCartItems();
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error adding to cart:', error);
        if (error.status === 401) {
          // session expired or invalid token
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  removeOneFromCart(product: any): void {
    if (!this.authService.isLoggedIn()) {
      console.log('User not logged in, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    const productData = {
      productId: product.productId || product._id || product.id,
      selectedFlavor: product.selectedFlavor || ''
    };

    console.log('Removing one from cart:', productData);

    this.http.post<any[]>(`${this.apiUrl}/remove-one`, productData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error removing from cart:', error);
        
        if (error.status === 401) {
          console.log('Authentication failed, redirecting to login');
          this.authService.logout();
        }
        
        return of(null);
      })
    ).subscribe(updatedCart => {
      if (updatedCart && Array.isArray(updatedCart)) {
        this.cartItems = updatedCart;
        this.cartSubject.next([...this.cartItems]);
        this.updateTotalFromCartItems();
        console.log('Removed one item from cart on server');
      }
    });
  }

  deleteFromCart(productId: string, selectedFlavor: string = ''): void {
    if (!this.authService.isLoggedIn()) {
      console.log('User not logged in, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    console.log(`Deleting item: ProductID=${productId}, Flavor=${selectedFlavor}`);
    
    // Use HTTP options to send the body with DELETE
    const options = {
      headers: this.getAuthHeaders(),
      body: { productId, selectedFlavor }
    };
    
    this.http.delete<any[]>(`${this.apiUrl}/${productId}`, options).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error deleting from cart:', error);
        
        if (error.status === 401) {
          console.log('Authentication failed, redirecting to login');
          this.authService.logout();
        }
        
        return of(null);
      })
    ).subscribe(updatedCart => {
      if (updatedCart && Array.isArray(updatedCart)) {
        this.cartItems = updatedCart;
        this.cartSubject.next([...this.cartItems]);
        this.updateTotalFromCartItems();
        console.log('Item deleted from cart on server');
      }
    });
  }

  getTotal(): number {
    return Number(
      this.cartItems.reduce((total, item) => total + (item.total || 0), 0).toFixed(2)
    );
  }
}