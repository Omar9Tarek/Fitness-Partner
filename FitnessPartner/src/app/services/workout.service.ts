import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workout } from '../models/workout.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private baseUrl = `${environment.apiUrl}/workouts`; //private baseUrl = 'http://localhost:3000/workouts'; // Adjust if different

  constructor(private http: HttpClient) {}

  getAllWorkouts(): Observable<Workout[]> {
    return this.http.get<Workout[]>(this.baseUrl);
  }

  getWorkoutById(id: string): Observable<Workout> {
    return this.http.get<Workout>(`${this.baseUrl}/${id}`);
  }

  getWorkoutsByPlanType(planType: string): Observable<Workout[]> {
    return this.http.get<Workout[]>(`${this.baseUrl}/plan/${planType}`);
  }

  getWorkoutsByDay(day: string): Observable<Workout[]> {
    return this.http.get<Workout[]>(`${this.baseUrl}/day/${day}`);
  }

  getFilteredWorkouts(planType?: string, day?: string): Observable<Workout[]> {
    let url = `${this.baseUrl}/filter`;
    const params: string[] = [];
    
    if (planType) params.push(`planType=${planType}`);
    if (day) params.push(`day=${day}`);
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    return this.http.get<Workout[]>(url);
  }

  addWorkout(workout: Workout): Observable<Workout> {
    return this.http.post<Workout>(this.baseUrl, workout);
  }

  updateWorkout(id: string, workout: Workout): Observable<Workout> {
    return this.http.put<Workout>(`${this.baseUrl}/${id}`, workout);
  }

  deleteWorkout(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}