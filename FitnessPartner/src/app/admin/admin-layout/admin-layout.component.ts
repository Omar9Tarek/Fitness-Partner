import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Subject, debounceTime } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
})
export class AdminLayoutComponent implements OnInit {
  activeSectionTitle: string = 'Dashboard';
  showProfileMenu: boolean = false;
  searchQuery: string = '';
  searchType: string = 'email'; // Default search type
  private searchSubject = new Subject<string>();
  Math = Math;

  constructor(private router: Router, private authService: AuthService) {
    // Set up debounced search to prevent too many search queries
    this.searchSubject
      .pipe(
        debounceTime(300) // Wait for 300ms pause in events
      )
      .subscribe((searchTerm) => {
        this.performSearch(searchTerm);
      });
  }

  ngOnInit() {
    this.authService.isAdmin();
    // Update the active section title whenever the route changes
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          const url = this.router.url;
          if (url.includes('/admin/products')) return 'Products';
          if (url.includes('/admin/users')) return 'Users';
          if (url.includes('/admin/orders')) return 'Orders';
          if (url.includes('/admin/trainers')) return 'Trainers';
          if (url.includes('/admin/nutrition')) return 'Nutrition';
          return 'Dashboard';
        })
      )
      .subscribe((title) => {
        this.activeSectionTitle = title;
      });
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  onSearch(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.searchSubject.next(this.searchQuery);
  }

  // Set the search type (email or id)
  setSearchType(type: string) {
    this.searchType = type;
    if (this.searchQuery) {
      this.performSearch(this.searchQuery);
    }
  }

  // Perform the actual search based on the current section and search type
  performSearch(query: string) {
    if (!query.trim()) return;

    const currentSection = this.activeSectionTitle.toLowerCase();
    const searchParams = {
      type: this.searchType,
      query: query.trim(),
    };

    // Navigate to the current section with search params
    this.router.navigate([`/admin/${currentSection}`], {
      queryParams: searchParams,
    });
  }

  // Clear the search
  clearSearch() {
    this.searchQuery = '';
    this.router.navigate([`/admin/${this.activeSectionTitle.toLowerCase()}`]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
