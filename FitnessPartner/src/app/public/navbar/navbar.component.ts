import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartItemsComponent } from '../cart/cart-items/cart-items.component';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    RouterModule,
    CartItemsComponent,
    CommonModule,
    RouterLink,
    TranslateModule,
  ],
  templateUrl: './navbar.component.html',
})
export class NavBarComponent implements OnInit, OnDestroy {
  language: string = 'عربي';
  cart: any[] = [];
  cartTotal: number = 0;
  favoritesCount: number = 0;
  private favoritesSub: Subscription = new Subscription();
  private cartSub: Subscription = new Subscription();
  private totalSub: Subscription = new Subscription();
  constructor(
    public authService: AuthService,
    private favoritesService: FavoritesService,
    private myCart: CartService,
    private router: Router,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document
  ) {
    // Set default language
    this.translate.setDefaultLang('en');

    this.myCart.cart$.subscribe((cart) => (this.cart = cart));
    this.cart = this.myCart.getCart();
  }

  ngOnInit(): void {
    // Initialize cart subscription
    this.cartSub = this.myCart.cart$.subscribe((cart) => {
      this.cart = cart;
      // Manually update the favorites count when cart changes
      if (this.authService.isAuthenticated()) {
        this.favoritesCount = this.favoritesService.getFavoritesCount();
      }
      this.cdr.detectChanges();
    });

    // Subscribe to favorites updates
    this.favoritesSub = this.favoritesService.favorites$.subscribe(
      (favorites) => {
        this.favoritesCount = favorites.length;
        console.log('Navbar favorites count updated:', this.favoritesCount);
        // Force change detection to update UI
        this.cdr.detectChanges();
      }
    );

    // If the cart service has a total$ observable, subscribe to it
    if ('total$' in this.myCart) {
      this.totalSub = (this.myCart as any).total$.subscribe((total: number) => {
        this.cartTotal = total;
        this.cdr.detectChanges();
      });
    }
  }

  ngOnDestroy() {
    if (this.favoritesSub) {
      this.favoritesSub.unsubscribe();
    }
    if (this.cartSub) {
      this.cartSub.unsubscribe();
    }
    if (this.totalSub) {
      this.totalSub.unsubscribe();
    }
  }

  confirmLogout() {
    this.authService.logout();
    this.favoritesService.clearUserData();
    if (this.authService.isLoggedInOrNot()) {
      // Show the logout confirmation modal
      const logoutModal = document.getElementById('logoutConfirmationModal');
      if (logoutModal) {
        // Ensure Bootstrap is available globally
        const bootstrapModal = new (window as any).bootstrap.Modal(logoutModal);
        bootstrapModal.show();
      }
    } else {
      // Redirect to the login page if not logged in
      this.router.navigate(['/login']);
    }
  }

  // Method to manually refresh favorites count
  refreshFavoritesCount(): void {
    if (this.authService.isAuthenticated()) {
      this.favoritesCount = this.favoritesService.getFavoritesCount();
      this.cdr.detectChanges();
    }
  }
  // switch language
  toggleLanguage() {
    const newLang = this.translate.currentLang === 'ar' ? 'en' : 'ar';
    this.translate.use(newLang);
    this.document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    this.document.documentElement.lang = newLang;
    this.language = newLang === 'ar' ? 'En' : 'عربي';
  }
}
