import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse } from '../interfaces/auth-response.interface';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(
    !!localStorage.getItem('access_token')
  );
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  private apiUrl = `${environment.apiUrl}/auth`; // || 'http://localhost:3000/auth';

  // Event emitter for cart synchronization
  private cartSyncRequired = new BehaviorSubject<boolean>(false);
  cartSyncRequired$ = this.cartSyncRequired.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Check token validity on service initialization
    this.checkTokenValidity();
  }

  private checkTokenValidity() {
    const token = this.getToken();
    if (token) {
      // You can add token validation logic here if needed
      this.isLoggedInSubject.next(true);
    } else {
      this.isLoggedInSubject.next(false);
    }
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        // Only store credentials if login was successful (not requiring verification)
        if (response.access_token && !response.requiresVerification) {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('userId', response.user.id);
          this.isLoggedInSubject.next(true);
          // Signal cart service to sync cart
          this.cartSyncRequired.next(true);
        }
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  setCurrentUserId(userId: string): void {
    localStorage.setItem('userId', userId);
    this.isLoggedInSubject.next(true);
    // Signal cart service to sync cart
    this.cartSyncRequired.next(true);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      tap((response: any) => {
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('userId', response.user.id);
          this.isLoggedInSubject.next(true);
          // Signal cart service to sync cart
          this.cartSyncRequired.next(true);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userId');
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  getCurrentUserId(): string | null {
    return localStorage.getItem('userId');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  isLoggedInOrNot(): boolean {
    const token = localStorage.getItem('access_token'); // Check if token exists
    return !!token; // Return true if token exists, false otherwise
  }

  // Method to check if user is authenticated, can be used in route guards
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Update your Angular auth.service.ts
  forgotPassword(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/forgot-password`, {
      email,
    });
  }

  googleAuth(credential: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/google`, { credential });
  }

  resetPassword(data: {
    token: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded: any = jwtDecode(token);
    return decoded.role; // Ensure your JWT contains 'role'
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }
}
