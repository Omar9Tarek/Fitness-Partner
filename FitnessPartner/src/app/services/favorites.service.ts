import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { tap, catchError, finalize } from 'rxjs/operators';
import { IProducts } from '../models/i-products';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
 private apiUrl = `${environment.apiUrl}/favorites`; //private apiUrl = 'http://localhost:3000/favorites';
  private favoritesSubject = new BehaviorSubject<any[]>([]);
  favorites$ = this.favoritesSubject.asObservable();
  private isLoadingFavorites = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Initialize on service construction if authenticated
    setTimeout(() => this.initialize(), 0);

    // Listen for login/logout events
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        // Reload favorites when user logs in
        this.initialize();
      } else {
        // Clear favorites when user logs out
        this.clearUserData();
      }
    });
  }

  /** Get headers with Authorization token */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // Get the token from AuthService
    return token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
  }

  /** Fetch the user's favorites from the backend */
  initialize(): void {
    // Prevent multiple simultaneous load calls
    if (this.isLoadingFavorites) {
      console.log('Favorites loading already in progress...');
      return;
    }

    console.log('Loading favorites. Is user authenticated?', this.authService.isAuthenticated());
    if (!this.authService.isAuthenticated()) {
      console.log('User not authenticated, favorites is empty');
      this.clearUserData();
      return;
    }

    this.isLoadingFavorites = true;
    const token = this.authService.getToken();
    console.log('Getting favorites from server with token:', token ? token.substring(0, 10) + '...' : 'No token available');

    this.http.get<any[]>(this.apiUrl, { 
      headers: this.getHeaders() 
    }).pipe(
      finalize(() => this.isLoadingFavorites = false),
      catchError((error: HttpErrorResponse) => {
        console.error('Failed to load favorites:', error);
        
        // Check if unauthorized (401)
        if (error.status === 401) {
          console.log('Authentication failed when loading favorites');
          // Don't logout here, just clear local data
          this.clearUserData();
        }
        
        return of([]);
      })
    ).subscribe(favorites => {
      if (Array.isArray(favorites)) {
        console.log('Favorites loaded successfully:', favorites);
        this.favoritesSubject.next(favorites);
      } else {
        console.error('Server returned invalid favorites format:', favorites);
        this.clearUserData();
      }
    });
  }

  /** Clear in-memory favorites (e.g. on logout) */
  clearUserData(): void {
    console.log('Clearing favorites data');
    this.favoritesSubject.next([]);
  }

  /** Remove all favorites via backend */
  clearFavorites(): Observable<any[]> {
    if (!this.authService.isAuthenticated()) {
      console.log('User not authenticated, cannot clear favorites');
      this.clearUserData();
      return of([]);
    }

    return this.http
      .delete<any[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        tap({
          next: (emptyList) => {
            console.log('All favorites cleared on server');
            this.favoritesSubject.next(emptyList);
            return emptyList;
          },
          error: (err) => console.error('Failed to clear favorites:', err)
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error clearing favorites:', error);
          if (error.status === 401) {
            // Don't logout here, just handle the error
            console.log('Authentication failed when clearing favorites');
          }
          return of([]);
        })
      );
  }

  addToFavorites(product: any): Observable<any[]> {
    if (!this.authService.isAuthenticated()) {
      console.log('User not authenticated, cannot add to favorites');
      return of(this.favoritesSubject.value);
    }

    return this.http.post<any[]>(`${this.apiUrl}/${product.id}`, null, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((updatedFavorites: any[]) => {
        console.log('Added to favorites, new list:', updatedFavorites);
        this.favoritesSubject.next(updatedFavorites);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error adding to favorites:', error);
        if (error.status === 401) {
          // Don't logout here, just handle the error
          console.log('Authentication failed when adding to favorites');
        }
        return of(this.favoritesSubject.value);
      })
    );
  }
  
  removeFromFavorites(productId: number | string): Observable<any[]> {
    if (!this.authService.isAuthenticated()) {
      console.log('User not authenticated, cannot remove from favorites');
      return of(this.favoritesSubject.value);
    }

    return this.http.delete<any[]>(`${this.apiUrl}/${productId}`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((updatedFavorites: any[]) => {
        console.log('Removed from favorites, new list:', updatedFavorites);
        this.favoritesSubject.next(updatedFavorites);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error removing from favorites:', error);
        if (error.status === 401) {
          // Don't logout here, just handle the error
          console.log('Authentication failed when removing from favorites');
        }
        return of(this.favoritesSubject.value);
      })
    );
  }
  
  toggleFavorite(product: any): Observable<any[]> {
    console.log(product.id, "in service");
  
    const isFav = this.isFavorite(product.id);
    console.log(isFav, "this is isFav");
  
    return isFav
      ? this.removeFromFavorites(product.id)
      : this.addToFavorites(product);
  }
  
  /** Check if a product is in favorites */
  isFavorite(productId: number | string): boolean {
    // Debug the favorites structure to see what we're working with
    console.log('Current favorites structure:', this.favoritesSubject.value);
    
    // Check if the favorites array contains the product ID
    // This handles both possibilities: array of IDs or array of objects with ID property
    return this.favoritesSubject.value.some((item) => {
      // Handle case where item is the ID itself
      if (typeof item === 'number' || typeof item === 'string') {
        return item === productId;
      }
      // Handle case where item is an object with ID
      else if (item && typeof item === 'object') {
        return item.id === productId || item.productId === productId;
      }
      return false;
    });
  }

  /** Get the current count of favorites */
  getFavoritesCount(): number {
    return this.favoritesSubject.value.length;
  }
}