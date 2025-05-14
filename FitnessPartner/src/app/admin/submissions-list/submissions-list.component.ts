import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { ContactService } from '../../services/contact.service';

import { ChangeDetectorRef } from '@angular/core';

@Component({
  imports:[CommonModule, TranslateModule],
  selector: 'app-submissions-list',
  templateUrl: './submissions-list.component.html',
  styleUrls: ['./submissions-list.component.css']
})
export class SubmissionsListComponent implements OnInit {
  submissions: any[] = []; // Declare the submissions property

  constructor(
    private contactService: ContactService,
    private cdr: ChangeDetectorRef
  ) {}
ngOnInit(): void {
  this.contactService.fetchSubmissions(); // initial load
  this.contactService.getContactSubmissions().subscribe(data => {
    this.submissions = data;
  });
}

}