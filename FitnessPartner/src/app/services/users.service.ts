import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, shareReplay } from 'rxjs/operators';
import { User } from '../shared/utils/user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}`;
  
  // Cache implementation
  private userCache = new Map<string, { data: any, timestamp: number }>();
  private usersCache: { data: User[], timestamp: number } | null = null;
  private ordersCache: { data: any, timestamp: number } | null = null;
  private addressesCache = new Map<string, { data: any, timestamp: number }>();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes cache
  
  // Subjects for reactive data updates
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();
  
  private ordersSubject = new BehaviorSubject<any[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Helper method to get auth headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      console.warn('No authentication token found in localStorage');
    }
    
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`,
    });
  }

  // Clear all cache or specific cache if key provided
  clearCache(cacheType?: 'users' | 'orders' | 'addresses' | 'user'): void {
    if (!cacheType) {
      // Clear all cache
      this.userCache.clear();
      this.usersCache = null;
      this.ordersCache = null;
      this.addressesCache.clear();
      console.log('All cache cleared');
      return;
    }

    switch (cacheType) {
      case 'users':
        this.usersCache = null;
        console.log('Users cache cleared');
        break;
      case 'orders':
        this.ordersCache = null;
        console.log('Orders cache cleared');
        break;
      case 'addresses':
        this.addressesCache.clear();
        console.log('Addresses cache cleared');
        break;
      case 'user':
        this.userCache.clear();
        console.log('Individual user cache cleared');
        break;
    }
  }

  getUsers(searchType?: string, searchQuery?: string, forceRefresh = false): Observable<User[]> {
    // Create a cache key based on search parameters
    const cacheKey = searchType && searchQuery ? `${searchType}:${searchQuery}` : 'all';
    const now = Date.now();
    
    // Check for cached users with search params
    if (!forceRefresh && this.usersCache && (now - this.usersCache.timestamp < this.cacheDuration)) {
      const users = this.usersCache.data;
      
      // If we have search params, filter the cached data
      if (searchType && searchQuery) {
        const filteredUsers = users.filter(user => {
          return user[searchType as keyof User]?.toString().toLowerCase().includes(searchQuery.toLowerCase());
        });
        this.usersSubject.next(filteredUsers);
        return of(filteredUsers);
      }
      
      // Otherwise return all cached users
      this.usersSubject.next(users);
      return of(users);
    }
    
    // No valid cache, fetch from API
    let params = new HttpParams();
    if (searchType && searchQuery) {
      params = params.set(searchType, searchQuery);
    }

    return this.http.get<User[]>(`${this.apiUrl}/users`, { params, headers: this.getAuthHeaders() }).pipe(
      tap(users => {
        // Update cache and subject
        this.usersCache = { data: users, timestamp: now };
        this.usersSubject.next(users);
      }),
      catchError(this.handleError),
      shareReplay(1)
    );
  }

  updateUser(id: string, userData: any): Observable<any> {
    const headers = userData instanceof FormData
      ? new HttpHeaders({
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        })
      : new HttpHeaders({
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        });

    return this.http.put(`${this.apiUrl}/users/${id}`, userData, { headers }).pipe(
      tap(updatedUser => {
        // Update user in cache
        this.userCache.set(id, { data: updatedUser, timestamp: Date.now() });
        
        // Update user in users cache if it exists
        if (this.usersCache) {
          const updatedUsers = this.usersCache.data.map(user => 
            user.id === id ? { ...user, ...updatedUser } : user
          );
          this.usersCache = { data: updatedUsers, timestamp: Date.now() };
          this.usersSubject.next(updatedUsers);
        }
      }),
      catchError(this.handleError)
    );
  }

  getUserPassword(userId: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/users/${userId}/password`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  updatePassword(
    userId: string,
    passwordData: { currentPassword: string; newPassword: string }
  ): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(
      `${this.apiUrl}/users/${userId}/password`,
      passwordData,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/verify-otp`, {
      email,
      otp,
    }).pipe(
      catchError(this.handleError)
    );
  }

  resendOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/resend-otp`, { email }).pipe(
      catchError(this.handleError)
    );
  }

  addOrder(userId: string, order: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/users/${userId}/orders`,
      order,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(() => {
        // Invalidate orders cache since we have a new order
        this.ordersCache = null;
      }),
      catchError(this.handleError)
    );
  }

  // Custom error handler
  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    
    if (error.status === 401) {
      console.error('Authentication error. Token might be invalid or expired.');
    }
    
    return throwError(() => new Error(error.message || 'Server error'));
  }

  getAllUsers(forceRefresh = false): Observable<User[]> {
    // Reuse the getUsers method without search params
    return this.getUsers(undefined, undefined, forceRefresh);
  }

  getUserById(id: string, forceRefresh = false): Observable<any> {
    const now = Date.now();
    const cachedUser = this.userCache.get(id);
    
    // Return cached user if available and not expired
    if (!forceRefresh && cachedUser && (now - cachedUser.timestamp < this.cacheDuration)) {
      return of(cachedUser.data);
    }
    
    console.log('Calling API: GET', `${this.apiUrl}/users/${id}`);
    const headers = this.getAuthHeaders();
    
    return this.http.get(`${this.apiUrl}/users/${id}`, { headers }).pipe(
      tap(user => {
        // Cache the user data
        this.userCache.set(id, { data: user, timestamp: now });
      }),
      catchError(this.handleError),
      shareReplay(1)
    );
  }

  addANewUser(user: User): Observable<any> {
    console.log('Calling API: POST', `${this.apiUrl}/auth/register`);
    return this.http.post(`${this.apiUrl}/auth/register`, user).pipe(
      tap(newUser => {
        // Clear the users cache since we have a new user
        this.usersCache = null;
      }),
      catchError(this.handleError)
    );
  }

  updateUserByAdmin(id: string, userData: any): Observable<any> {
    console.log('Calling API: PUT', `${this.apiUrl}/users/admin/${id}`);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      'Content-Type': 'application/json'
    });
  
    return this.http.put(
      `${this.apiUrl}/users/admin/${id}`, 
      userData,
      { headers }
    ).pipe(
      tap(updatedUser => {
        // Update user in cache
        this.userCache.set(id, { data: updatedUser, timestamp: Date.now() });
        
        // Update user in users cache if it exists
        if (this.usersCache) {
          const updatedUsers = this.usersCache.data.map(user => 
            user.id === id ? { ...user, ...updatedUser } : user
          );
          this.usersCache = { data: updatedUsers, timestamp: Date.now() };
          this.usersSubject.next(updatedUsers);
        }
      }),
      catchError(this.handleError)
    );
  }
  
  updateUserRoleByAdmin(id: string, newRole: string): Observable<any> {
    console.log('Updating user role to:', newRole);
    return this.updateUserByAdmin(id, { role: newRole });
  }

  getOrderStats(forceRefresh = false): Observable<any> {
    const now = Date.now();
    
    // Return cached order stats if available and not expired
    if (!forceRefresh && this.ordersCache && (now - this.ordersCache.timestamp < this.cacheDuration)) {
      return of(this.ordersCache.data);
    }
    
    console.log('Calling API: GET', `${this.apiUrl}/users/admin/order-stats`);
    return this.http.get<any>(`${this.apiUrl}/users/admin/order-stats`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(orderStats => {
        // Cache the order stats
        this.ordersCache = { data: orderStats, timestamp: now };
      }),
      catchError(this.handleError),
      shareReplay(1)
    );
  }

  getAllOrders(forceRefresh = false): Observable<any> {
    const now = Date.now();
    
    // Return cached orders if available and not expired
    if (!forceRefresh && this.ordersCache && (now - this.ordersCache.timestamp < this.cacheDuration)) {
      return of(this.ordersCache.data);
    }
    
    return this.http.get(`${this.apiUrl}/users/admin/orders`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(orders => {
        // Cache the orders and update subject
        this.ordersCache = { data: orders, timestamp: now };
        this.ordersSubject.next(orders as any[]);
      }),
      catchError(this.handleError),
      shareReplay(1)
    );
  }

  cancelOrder(userId: string, orderId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/users/admin/orders/${userId}/${orderId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(() => {
        // Invalidate orders cache
        this.ordersCache = null;
      }),
      catchError(this.handleError)
    );
  }
  
  updateOrder(userId: string, orderId: string, updateData: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/users/admin/orders/${userId}/${orderId}`,
      updateData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(() => {
        // Invalidate orders cache
        this.ordersCache = null;
      }),
      catchError(this.handleError)
    );
  }

  deleteUser(id: string): Observable<any> {
    console.log('Calling API: DELETE', `${this.apiUrl}/users/admin/${id}`);
    return this.http.delete(
      `${this.apiUrl}/users/admin/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(() => {
        // Remove user from cache
        this.userCache.delete(id);
        
        // Update users cache if it exists
        if (this.usersCache) {
          const filteredUsers = this.usersCache.data.filter(user => user.id !== id);
          this.usersCache = { data: filteredUsers, timestamp: Date.now() };
          this.usersSubject.next(filteredUsers);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Save a new address
  saveUserAddress(userId: string, addressData: any): Observable<any> {
    // Ensure all required fields are present and properly formatted
    const payload = {
      street: addressData.street,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode.toString(), // Ensure string format
      country: addressData.country,
      isDefault: !!addressData.isDefault // Ensure boolean
    };
  
    // Log the payload for debugging
    console.log(`Sending address payload to API:`, payload);
    
    return this.http.post(
      `${this.apiUrl}/users/${userId}/addresses`,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(() => {
        // Invalidate addresses cache for this user
        this.addressesCache.delete(userId);
      }),
      catchError(error => {
        console.error('Error saving address:', error);
        // Add additional error context
        const errorMessage = error.error?.message || error.message || 'Unknown error';
        return throwError(() => new Error(`Failed to save address: ${errorMessage}`));
      })
    );
  }
  
  // Get all user addresses with caching
  getUserAddresses(userId: string, forceRefresh = false): Observable<any> {
    const now = Date.now();
    const cachedAddresses = this.addressesCache.get(userId);
    
    // Return cached addresses if available and not expired
    if (!forceRefresh && cachedAddresses && (now - cachedAddresses.timestamp < this.cacheDuration)) {
      return of(cachedAddresses.data);
    }
    
    return this.http.get(
      `${this.apiUrl}/users/${userId}/addresses`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(addresses => {
        // Cache the addresses
        this.addressesCache.set(userId, { data: addresses, timestamp: now });
      }),
      catchError(error => {
        console.error('Error getting addresses:', error);
        return throwError(() => new Error('Failed to retrieve addresses'));
      }),
      shareReplay(1)
    );
  }
  
  // Set an address as default with cache invalidation
  setDefaultAddress(userId: string, addressId: string): Observable<any> {
    if (!addressId) {
      return throwError(() => new Error('Address ID is required to set as default'));
    }
    
    return this.http.put(
      `${this.apiUrl}/users/${userId}/addresses/${addressId}/default`,
      {},  // Empty body since the addressId is in the URL
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(() => {
        // Invalidate addresses cache for this user
        this.addressesCache.delete(userId);
      }),
      catchError(error => {
        console.error('Error setting default address:', error);
        return throwError(() => new Error('Failed to set address as default'));
      })
    );
  }
}