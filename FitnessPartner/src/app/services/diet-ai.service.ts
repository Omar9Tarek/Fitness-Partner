import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DietAiService {
 private apiUrl = `${environment.apiUrl}/diet-plan`;// private apiUrl = 'http://localhost:3000/diet-plan';

  constructor(private http: HttpClient) {}

  generateDietPlan(data: any): Observable<string> {
    console.log(data, ' data sent in req');
    return this.http.post(this.apiUrl, data, { responseType: 'text' });
  }
}
