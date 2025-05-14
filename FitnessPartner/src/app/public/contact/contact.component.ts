import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [TranslateModule, FormsModule, CommonModule],
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  contactData = {
    name: '',
    email: '',
    message: '',
  };
  emailSent = false;
  
  constructor(
    private http: HttpClient,
    private contactService: ContactService
  ) {}

 onSubmit() {
  if (!this.contactData.name || !this.contactData.email || !this.contactData.message) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'Please fill out all fields' });
    return;
  }

  this.contactService.addContactSubmission({ ...this.contactData });
  Swal.fire({ icon: 'success', title: 'Success!', text: 'Message sent successfully', timer: 3000 });
  this.contactData = { name: '', email: '', message: '' };
}

}