import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrainersDataService {
  private apiUrl = `${environment.apiUrl}/trainers`//private apiUrl = `http://localhost:3000/trainers`;
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) { }
  
  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    // Return actual HttpHeaders object with the Authorization header
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
  
  getAllTrainers(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
  
  getTrainerById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
  
  addTrainer(trainerData: FormData): Observable<any> {
    // Get the headers without Content-Type since FormData sets its own
    const headers = this.getAuthHeaders();
    
    console.log('Sending trainer data:', Object.fromEntries(trainerData));
    
    return this.http.post(this.apiUrl, trainerData, {
      headers: headers
    }).pipe(
      catchError(error => {
        console.error('Error adding trainer:', error);
        if (error.status === 401) {
          alert('Session expired. Please login again.');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
  
  updateTrainer(id: string, trainerData: any): Observable<any> {
    // For updating, we'll send JSON data instead of FormData
    const headers = this.getAuthHeaders();
    
    console.log('Updating trainer data:', trainerData);
    
    return this.http.put(`${this.apiUrl}/${id}`, trainerData, {
      headers: headers
    }).pipe(
      catchError(error => {
        console.error('Error updating trainer:', error);
        if (error.status === 401) {
          alert('Session expired. Please login again.');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
  
  // Separate method for updating with image
  updateTrainerWithImage(id: string, trainerData: FormData): Observable<any> {
    const headers = this.getAuthHeaders();
    
    console.log('Updating trainer with image:', Object.fromEntries(trainerData));
    
    return this.http.put(`${this.apiUrl}/${id}`, trainerData, {
      headers: headers
    }).pipe(
      catchError(error => {
        console.error('Error updating trainer with image:', error);
        if (error.status === 401) {
          alert('Session expired. Please login again.');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
  
  deleteTrainer(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: headers
    }).pipe(
      catchError(error => {
        console.error('Error deleting trainer:', error);
        if (error.status === 401) {
          alert('Session expired. Please login again.');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}