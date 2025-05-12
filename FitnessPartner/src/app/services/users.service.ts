import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User } from '../shared/utils/user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}`;//private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Helper method to get auth headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    console.log('Current auth token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.warn('No authentication token found in localStorage');
    }
    
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`,
    });
  }
  getUsers(searchType?: string, searchQuery?: string): Observable<User[]> {
    let params = new HttpParams();
    
    if (searchType && searchQuery) {
      params = params.set(searchType, searchQuery);
    }

    return this.http.get<User[]>(this.apiUrl, { params });
  }

  updateUser(id: string, userData: any): Observable<any> {
    const headers =
      userData instanceof FormData
        ? new HttpHeaders({
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          })
        : new HttpHeaders({
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          });

    return this.http.put(`${this.apiUrl}/users/${id}`, userData, { headers });
  }

  getUserPassword(userId: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/users/${userId}/password`);
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
    );
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/verify-otp`, {
      email,
      otp,
    });
  }

  resendOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/resend-otp`, { email });
  }

  addOrder(userId: string, order: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/users/${userId}/orders`,
      order,
      { headers: this.getAuthHeaders() }
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

  getAllUsers(): Observable<any> {
    console.log('Calling API: GET', `${this.apiUrl}/users`);
    const headers = this.getAuthHeaders();
    
    return this.http.get(`${this.apiUrl}/users`, { headers }).pipe(
      tap(data => console.log('API Response:', data)),
      catchError(this.handleError)
    );
  }

  getUserById(id: string): Observable<any> {
    console.log('Calling API: GET', `${this.apiUrl}/users/${id}`);
    const headers = this.getAuthHeaders();
    
    return this.http.get(`${this.apiUrl}/users/${id}`, { headers }).pipe(
      tap(data => console.log('API Response:', data)),
      catchError(this.handleError)
    );
  }

  addANewUser(user: User): Observable<any> {
    console.log('Calling API: POST', `${this.apiUrl}/auth/register`);
    return this.http.post(`${this.apiUrl}/auth/register`, user).pipe(
      tap(data => console.log('API Response:', data)),
      catchError(this.handleError)
    );
  }

  // updateUser(id: string, userData: any): Observable<any> {
  //   console.log('Calling API: PUT', `${this.apiUrl}/users/${id}`);
  //   const headers =
  //     userData instanceof FormData
  //       ? new HttpHeaders({
  //           Authorization: `Bearer ${localStorage.getItem('access_token')}`,
  //         })
  //       : new HttpHeaders({
  //           Authorization: `Bearer ${localStorage.getItem('access_token')}`,
  //           'Content-Type': 'application/json',
  //         });

  //   return this.http.put(`${this.apiUrl}/users/${id}`, userData, { headers }).pipe(
  //     tap(data => console.log('API Response:', data)),
  //     catchError(this.handleError)
  //   );
  // }

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
      tap(data => console.log('API Response:', data)),
      catchError(this.handleError)
    );
  }
  
  updateUserRoleByAdmin(id: string, newRole: string): Observable<any> {
    console.log('Updating user role to:', newRole);
    return this.updateUserByAdmin(id, { role: newRole });
  }

  getOrderStats(): Observable<any> {
    console.log('Calling API: GET', `${this.apiUrl}/users/admin/order-stats`);
    return this.http.get<any>(`${this.apiUrl}/users/admin/order-stats`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(data => console.log('API Response:', data)),
      catchError(this.handleError)
    );
  }
  getAllOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/admin/orders`, {
      headers: this.getAuthHeaders()
    });
  }
  cancelOrder(userId: string, orderId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/users/admin/orders/${userId}/${orderId}`,
      { headers: this.getAuthHeaders() }
    );
  }
  
  updateOrder(userId: string, orderId: string, updateData: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/users/admin/orders/${userId}/${orderId}`,
      updateData,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteUser(id: string): Observable<any> {
    console.log('Calling API: DELETE', `${this.apiUrl}/users/admin/${id}`);
    return this.http.delete(
      `${this.apiUrl}/users/admin/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(data => console.log('API Response:', data)),
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
      tap(response => console.log('Address save response:', response)),
      catchError(error => {
        console.error('Error saving address:', error);
        // Add additional error context
        const errorMessage = error.error?.message || error.message || 'Unknown error';
        return throwError(() => new Error(`Failed to save address: ${errorMessage}`));
      })
    );
  }
  
  // Get all user addresses with better error handling
  getUserAddresses(userId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/users/${userId}/addresses`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(addresses => console.log('Retrieved addresses:', addresses)),
      catchError(error => {
        console.error('Error getting addresses:', error);
        return throwError(() => new Error('Failed to retrieve addresses'));
      })
    );
  }
  
  // Set an address as default with better error handling
  setDefaultAddress(userId: string, addressId: string): Observable<any> {
    if (!addressId) {
      return throwError(() => new Error('Address ID is required to set as default'));
    }
    
    return this.http.put(
      `${this.apiUrl}/users/${userId}/addresses/${addressId}/default`,
      {},  // Empty body since the addressId is in the URL
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(response => console.log('Default address set:', response)),
      catchError(error => {
        console.error('Error setting default address:', error);
        return throwError(() => new Error('Failed to set address as default'));
      })
    );
  }
}