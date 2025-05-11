import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { UsersService } from './users.service';
import { environment } from '../../environments/environment';


export interface UserMeasurement {
  userId: string;
  age: number;
  weight: number;
  height: number;
  waist: number;
  neck: number;
  gender: string;
  goal: string;
  dietPlan: string;
  date: Date;
  id:any;
}

@Injectable({
  providedIn: 'root',
})
export class MeasurementsService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient,
    private usersService: UsersService
  ) {}

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
  // Save new measurements and diet plan
saveMeasurements(userId: string, measurementData: any, dietPlan: string): Observable<any> {
  const payload = {
    ...measurementData,
    dietPlan,
    date: new Date()
  };

  return this.http.post(
    `${this.apiUrl}/users/${userId}/measurements`,
    payload,
    { headers: this.getAuthHeaders() }
  ).pipe(
    tap(response => console.log('Measurements saved:', response)),
    catchError(error => {
      const errorMessage = error.error?.message || 'Failed to save measurements';
      console.error('Error saving measurements:', errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
}
  // Get all measurements for a user
  getUserMeasurements(userId: string): Observable<UserMeasurement[]> {
    return this.http.get<UserMeasurement[]>(
      `${this.apiUrl}/users/${userId}/measurements`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(measurements => console.log('Retrieved measurements:', measurements)),
      catchError(error => {
        console.error('Error getting measurements:', error);
        return throwError(() => new Error('Failed to retrieve measurements'));
      })
    );
  }

  // Get the latest measurement for a user
  getLatestMeasurement(userId: string): Observable<UserMeasurement> {
    return this.http.get<UserMeasurement>(
      `${this.apiUrl}/users/${userId}/measurements/latest`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(measurement => console.log('Retrieved latest measurement:', measurement)),
      catchError(error => {
        console.error('Error getting latest measurement:', error);
        return throwError(() => new Error('Failed to retrieve latest measurement'));
      })
    );
  }

  // Delete a measurement
  deleteMeasurement(userId: string, measurementId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/users/${userId}/measurements/${measurementId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(response => console.log('Measurement deleted:', response)),
      catchError(error => {
        console.error('Error deleting measurement:', error);
        return throwError(() => new Error('Failed to delete measurement'));
      })
    );
  }
}