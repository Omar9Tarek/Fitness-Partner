import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContactData {
  name: string;
  email: string;
  message: string;
  date?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = `${environment.apiUrl}/contact`;
  private submissions$ = new BehaviorSubject<ContactData[]>([]);

  constructor(private http: HttpClient) {}

  fetchSubmissions() {
    this.http.get<ContactData[]>(this.apiUrl).subscribe(data => {
      this.submissions$.next(data);
    });
  }

  getContactSubmissions() {
    return this.submissions$.asObservable();
  }

  addContactSubmission(submission: ContactData) {
    return this.http.post(this.apiUrl, submission).subscribe(() => {
      this.fetchSubmissions(); // refresh list
    });
  }
}
