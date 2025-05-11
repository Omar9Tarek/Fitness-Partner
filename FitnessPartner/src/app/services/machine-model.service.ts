import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MachineModelService {
  private apiUrl = `${environment.apiUrl}/gym-machine/identify`; //private apiUrl = 'http://localhost:3000/gym-machine/identify';

  constructor(private http: HttpClient) {}

  identifyMachine(image: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post(this.apiUrl, formData, { responseType: 'text' });
  }
}
