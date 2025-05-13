import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { tap, catchError, finalize, map, shareReplay } from 'rxjs/operators';
import { IProducts } from '../models/i-products';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private apiUrl = `${environment.apiUrl}/favorites`;
  private favoritesSubject = new BehaviorSubject<any[]>([]);
  favorites$ = this.favoritesSubject.asObservable();
  private isLoadingFavorites = false;
  
  // Cache settings
  private cacheKey = 'user_favorites_cache';
  private cacheDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
  private lastFetchTime = 0;
  private pendingRequest: Observable<any[]> | null = null;

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
        this.clearCache();
      }
    });
  }

  /** Get headers with Authorization token */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
  }

  /** Save favorites to local storage cache */
  private saveToCache(favorites: any[]): void {
    if (!this.authService.isAuthenticated()) return;
    
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;
    
    const cacheData = {
      userId,
      favorites,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
      console.log('Favorites saved to cache');
    } catch (e) {
      console.warn('Failed to cache favorites:', e);
    }
  }

  /** Load favorites from local storage cache */
  private loadFromCache(): any[] | null {
    if (!this.authService.isAuthenticated()) return null;
    
    const userId = this.authService.getCurrentUserId();
    if (!userId) return null;
    
    try {
      const cacheJson = localStorage.getItem(this.cacheKey);
      if (!cacheJson) return null;
      
      const cache = JSON.parse(cacheJson);
      
      // Validate cache belongs to current user
      if (cache.userId !== userId) {
        console.log('Cache belongs to different user, clearing');
        this.clearCache();
        return null;
      }
      
      // Check if cache is still valid
      if (Date.now() - cache.timestamp > this.cacheDuration) {
        console.log('Cache expired, will refetch');
        return null;
      }
      
      console.log('Using cached favorites data');
      return cache.favorites;
    } catch (e) {
      console.warn('Failed to load favorites from cache:', e);
      return null;
    }
  }

  /** Clear the cache */
  private clearCache(): void {
    try {
      localStorage.removeItem(this.cacheKey);
      console.log('Favorites cache cleared');
    } catch (e) {
      console.warn('Failed to clear favorites cache:', e);
    }
  }

  /** Initialize favorites from cache or fetch from server */
  initialize(): void {
    // Check if already loading
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

    // First try to load from cache
    const cachedFavorites = this.loadFromCache();
    if (cachedFavorites) {
      this.favoritesSubject.next(cachedFavorites);
      
      // If cache is getting old, refresh in background
      if (Date.now() - this.lastFetchTime > this.cacheDuration / 2) {
        console.log('Cache getting stale, refreshing in background');
        this.fetchFavoritesFromServer(false);
      }
      return;
    }

    // If no valid cache, fetch from server
    this.fetchFavoritesFromServer(true);
  }

  /** Fetch favorites data from server */
  private fetchFavoritesFromServer(updateSubject: boolean = true): void {
    // If there's already a pending request, reuse it
    if (this.pendingRequest) {
      console.log('Reusing pending favorites request');
      this.pendingRequest.subscribe();
      return;
    }

    this.isLoadingFavorites = true;
    const token = this.authService.getToken();
    console.log('Getting favorites from server with token:', token ? token.substring(0, 10) + '...' : 'No token available');

    this.pendingRequest = this.http.get<any[]>(this.apiUrl, { 
      headers: this.getHeaders() 
    }).pipe(
      // Use shareReplay to share the response with multiple subscribers
      shareReplay(1),
      finalize(() => {
        this.isLoadingFavorites = false;
        this.pendingRequest = null;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Failed to load favorites:', error);
        
        if (error.status === 401) {
          console.log('Authentication failed when loading favorites');
          this.clearUserData();
          this.clearCache();
        }
        
        return of([]);
      })
    );

    this.pendingRequest.subscribe(favorites => {
      if (Array.isArray(favorites)) {
        console.log('Favorites loaded successfully from server:', favorites);
        this.lastFetchTime = Date.now();
        this.saveToCache(favorites);
        
        if (updateSubject) {
          this.favoritesSubject.next(favorites);
        }
      } else {
        console.error('Server returned invalid favorites format:', favorites);
        this.clearUserData();
        this.clearCache();
      }
    });
  }

  /** Force refresh favorites from server */
  refreshFavorites(): Observable<any[]> {
    this.clearCache();
    this.fetchFavoritesFromServer(true);
    return this.favorites$;
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
            this.saveToCache(emptyList);
            return emptyList;
          },
          error: (err) => console.error('Failed to clear favorites:', err)
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error clearing favorites:', error);
          if (error.status === 401) {
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

    // Optimistically update UI immediately
    const currentFavorites = [...this.favoritesSubject.value];
    if (!this.isFavorite(product.id)) {
      const optimisticFavorites = [...currentFavorites, product];
      this.favoritesSubject.next(optimisticFavorites);
    }

    return this.http.post<any[]>(`${this.apiUrl}/${product.id}`, null, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((updatedFavorites: any[]) => {
        console.log('Added to favorites, new list:', updatedFavorites);
        this.favoritesSubject.next(updatedFavorites);
        this.saveToCache(updatedFavorites);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error adding to favorites:', error);
        // Revert optimistic update on error
        this.favoritesSubject.next(currentFavorites);
        
        if (error.status === 401) {
          console.log('Authentication failed when adding to favorites');
        }
        return of(currentFavorites);
      })
    );
  }
  
  removeFromFavorites(productId: number | string): Observable<any[]> {
    if (!this.authService.isAuthenticated()) {
      console.log('User not authenticated, cannot remove from favorites');
      return of(this.favoritesSubject.value);
    }

    // Optimistically update UI immediately
    const currentFavorites = [...this.favoritesSubject.value];
    const optimisticFavorites = currentFavorites.filter(item => {
      if (typeof item === 'number' || typeof item === 'string') {
        return item !== productId;
      } else if (item && typeof item === 'object') {
        return item.id !== productId && item.productId !== productId;
      }
      return true;
    });
    this.favoritesSubject.next(optimisticFavorites);

    return this.http.delete<any[]>(`${this.apiUrl}/${productId}`, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((updatedFavorites: any[]) => {
        console.log('Removed from favorites, new list:', updatedFavorites);
        this.favoritesSubject.next(updatedFavorites);
        this.saveToCache(updatedFavorites);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error removing from favorites:', error);
        // Revert optimistic update on error
        this.favoritesSubject.next(currentFavorites);
        
        if (error.status === 401) {
          console.log('Authentication failed when removing from favorites');
        }
        return of(currentFavorites);
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