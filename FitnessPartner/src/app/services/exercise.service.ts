import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private baseUrl = `${environment.apiUrl}`; //private baseUrl = 'http://localhost:3000';
  constructor(private http: HttpClient) {}

  getHomeExercises(type?: string): Observable<any[]> {
    const url = type ? `${this.baseUrl}/home?type=${type}` : `${this.baseUrl}/home`;
    console.log('Fetching home exercises from:', url);
    return this.http.get<any[]>(url);
  }

  getGymExercises(type?: string): Observable<any[]> {
    const url = type ? `${this.baseUrl}/gym?type=${type}` : `${this.baseUrl}/gym`;
    console.log('Fetching gym exercises from:', url);
    return this.http.get<any[]>(url);
  }

  getWarmExercises(type?: string): Observable<any[]> {
    const url = type ? `${this.baseUrl}/warm?type=${type}` : `${this.baseUrl}/warm`;
    console.log('Fetching warm-up exercises from:', url);
    return this.http.get<any[]>(url);
  }

  
  getExerciseDetails(type: string, muscle: string, exerciseName: string): Observable<any> {
    console.log('Fetching exercise details for:', type, muscle, exerciseName, 'url:', `${this.baseUrl}/${type}?muscle=${muscle}&exercise=${exerciseName}`);
    return this.http.get<any>(`${this.baseUrl}/${type}?muscle=${muscle}&exercise=${exerciseName}`);
  }
  
  getExercisesByTypeAndMuscle(type: string, muscle: string): Observable<any[]> {
    console.log(`${this.baseUrl}/${type}?muscle=${muscle}`);
    return this.http.get<any[]>(`${this.baseUrl}/${type}?muscle=${muscle}`);
  }
}


// import { HttpClient } from "@angular/common/http";
// import { Injectable } from "@angular/core";
// import { Observable } from "rxjs";

// @Injectable({ providedIn: 'root' })
// export class ExerciseService {
//   private homeExercises = 'http://localhost:3200/home';
//   private gymExercises = 'http://localhost:3200/gym';


//   constructor(private http: HttpClient) {}

//   getHomeExercises(type: string): Observable<any[]> {
//     return this.http.get<any[]>(`${this.homeExercises}?type=${type}`);
//   }

//   getGymExercises(type: string): Observable<any[]> {
//     return this.http.get<any[]>(`${this.gymExercises}?type=${type}`);
//   }
// }

