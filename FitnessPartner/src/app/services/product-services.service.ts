import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap, shareReplay } from 'rxjs/operators';
import { IProducts } from '../models/i-products';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductServicesService {
  private productsUrl = `${environment.apiUrl}/products`;
  
  // Cache for products
  private productsCache = new Map<string, { data: IProducts[], timestamp: number }>();
  private productDetailsCache = new Map<string, { data: IProducts, timestamp: number }>();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  // Products subject to notify subscribers when products change
  private productsSubject = new BehaviorSubject<IProducts[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Generate authorization headers for admin endpoints
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Get all products with optional caching
   * @param category Optional category filter
   * @param forceRefresh Force a refresh of the cache
   */
  getAllProducts(category?: string, forceRefresh = false): Observable<IProducts[]> {
    const cacheKey = category ? `category:${category}` : 'all';
    const cachedData = this.productsCache.get(cacheKey);
    const now = Date.now();
    
    // Return cached data if available and not expired
    if (!forceRefresh && cachedData && (now - cachedData.timestamp < this.cacheDuration)) {
      this.productsSubject.next(cachedData.data);
      return of(cachedData.data);
    }
    
    // Otherwise, fetch from API
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }
    
    return this.http.get<IProducts[]>(this.productsUrl, { params }).pipe(
      tap(products => {
        // Update cache
        this.productsCache.set(cacheKey, { data: products, timestamp: now });
        this.productsSubject.next(products);
      }),
      catchError(this.handleError),
      shareReplay(1)
    );
  }

  /**
   * Get a product by ID with caching
   * @param id Product ID
   * @param forceRefresh Force a refresh of the cache
   */
  getProductById(id: string | number, forceRefresh = false): Observable<IProducts> {
    const cacheKey = `product:${id}`;
    const cachedData = this.productDetailsCache.get(cacheKey);
    const now = Date.now();
    
    // Return cached data if available and not expired
    if (!forceRefresh && cachedData && (now - cachedData.timestamp < this.cacheDuration)) {
      return of(cachedData.data);
    }
    
    return this.http.get<IProducts>(`${this.productsUrl}/${id}`).pipe(
      map(product => {
        // Ensure product_images is properly parsed as an object
        if (!product.product_images) {
          product.product_images = {};
        }
        // Ensure flavor_quantity is properly parsed as an object
        if (!product.flavor_quantity) {
          product.flavor_quantity = {};
        }
        // Ensure available_flavors is properly parsed as an array
        if (!product.available_flavors) {
          product.available_flavors = [];
        }
        return product;
      }),
      tap(product => {
        // Update cache
        this.productDetailsCache.set(cacheKey, { data: product, timestamp: now });
      }),
      catchError(this.handleError),
      shareReplay(1)
    );
  }

  /**
   * Clear all product caches
   */
  clearCache(): void {
    this.productsCache.clear();
    this.productDetailsCache.clear();
  }

  /**
   * Get products by category (uses caching)
   */
  getProductsByCategory(category: string, forceRefresh = false): Observable<IProducts[]> {
    return this.getAllProducts(category, forceRefresh);
  }

  /**
   * Update product flavor quantity
   */
  async updateFlavorQuantity(id: string, flavor: string, quantity: number): Promise<any> {
    try {
      // First validate that the product exists
      const product = await firstValueFrom(this.getProductById(id, true)); // Force refresh for latest data
      
      // TypeScript safety: ensure available_flavors is an array
      if (!product.available_flavors || !Array.isArray(product.available_flavors)) {
        console.error(`Product ${id} has no available flavors`);
        return Promise.reject(new Error(`Product has no available flavors`));
      }
      
      // Find the exact flavor name from available_flavors (to handle case sensitivity)
      const exactFlavorName = product.available_flavors.find(
        f => typeof f === 'string' && f.toLowerCase() === flavor.toLowerCase()
      );
      
      if (!exactFlavorName) {
        console.error(`Flavor '${flavor}' does not exist in available flavors for product ${id}`);
        return Promise.reject(new Error(`Flavor '${flavor}' does not exist for this product`));
      }
      
      // Check if the flavor exists in the flavor_quantity object
      if (!product.flavor_quantity || product.flavor_quantity[exactFlavorName] === undefined) {
        console.error(`Flavor '${exactFlavorName}' exists but has no quantity set for product ${id}`);
        return Promise.reject(new Error(`Flavor '${exactFlavorName}' has no quantity set for this product`));
      }
      
      // Check if there's enough quantity
      if (product.flavor_quantity[exactFlavorName] < quantity) {
        console.error(`Not enough inventory for flavor '${exactFlavorName}'. Available: ${product.flavor_quantity[exactFlavorName]}, Requested: ${quantity}`);
        return Promise.reject(new Error(`Not enough inventory for flavor '${exactFlavorName}'`));
      }
      
      // If validation passes, proceed with the request using the exact flavor name
      const response = this.http.patch<any>(`${this.productsUrl}/${id}/flavors`, {
        flavor: exactFlavorName, // Use the exact flavor name from available_flavors
        quantity: quantity,
      }).pipe(
        tap(() => {
          // Invalidate cache for this product
          const cacheKey = `product:${id}`;
          this.productDetailsCache.delete(cacheKey);
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error updating flavor quantity:', error);
          return throwError(() => new Error(error.error?.message || 'Failed to update flavor quantity'));
        })
      );
      
      return firstValueFrom(response);
    } catch (error) {
      console.error('Error in updateFlavorQuantity:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Admin methods with cache invalidation
   */
  createProduct(product: IProducts): Observable<IProducts> {
    // Ensure product has proper structure before sending to server
    const preparedProduct = {
      ...product,
      available_flavors: product.available_flavors || [],
      product_images: product.product_images || {},
      flavor_quantity: product.flavor_quantity || {}
    };
    
    return this.http.post<IProducts>(`${this.productsUrl}/admin`, preparedProduct, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      tap(() => this.clearCache()), // Clear cache on product creation
      catchError(this.handleError)
    );
  }
  
  updateProduct(id: string | number, product: IProducts): Observable<IProducts> {
    return this.http.put<IProducts>(`${this.productsUrl}/admin/${id}`, product, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      tap(() => {
        // Invalidate specific caches
        const productKey = `product:${id}`;
        this.productDetailsCache.delete(productKey);
        this.clearCache(); // Also clear product list cache
      }),
      catchError(this.handleError)
    );
  }
  
  deleteProduct(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.productsUrl}/${id}/admin`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      tap(() => this.clearCache()), // Clear cache on product deletion
      catchError(this.handleError)
    );
  }
  
  updateFlavorQuantityAdmin(productId: string, flavor: string, newQuantity: number): Promise<any> {
    const body = { flavor, quantity: newQuantity };
    const url = `${this.productsUrl}/${productId}/admin/flavors`;

    const response$ = this.http.patch<any>(url, body, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      tap(() => {
        // Invalidate product cache
        const cacheKey = `product:${productId}`;
        this.productDetailsCache.delete(cacheKey);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Admin update error:', error);
        return throwError(() => new Error(error.error?.message || 'User not authorized'));
      })
    );
  
    return firstValueFrom(response$);
  }
  
  // Method to delete a specific flavor from a product
  deleteFlavorFromProduct(productId: string, flavor: string): Promise<any> {
    const url = `${this.productsUrl}/${productId}/admin/flavor/${encodeURIComponent(flavor)}`;
    
    const response$ = this.http.delete<any>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        // Invalidate product cache
        const cacheKey = `product:${productId}`;
        this.productDetailsCache.delete(cacheKey);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Failed to delete flavor:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to delete flavor'));
      })
    );
    
    return firstValueFrom(response$);
  }

  // Fixed method to properly add a flavor to a product
  addFlavorToProduct(productId: string, flavorName: string, quantity: number, imageUrl: string): Observable<any> {
    // Create a direct request body with all required parameters
    const body = {
      flavorName: flavorName,
      quantity: quantity,
      imageUrl: imageUrl
    };
    
    const url = `${this.productsUrl}/${productId}/admin/flavor`;
    
    // Return the Observable directly - let the component handle converting to Promise
    return this.http.post<any>(url, body, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        // Invalidate product cache
        const cacheKey = `product:${productId}`;
        this.productDetailsCache.delete(cacheKey);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Failed to add flavor:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to add flavor'));
      })
    );
  }

  // Error handling method
  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}, Message: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}