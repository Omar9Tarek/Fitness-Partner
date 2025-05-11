import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare const google: any;

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  // private clientId = environment.googleClientId;

  constructor() {
    this.loadGoogleScript();
  }

  private loadGoogleScript() {
    return new Promise((resolve) => {
      if (typeof google !== 'undefined') {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        resolve(true);
      };
      document.head.appendChild(script);
    });
  }

  initializeGoogleButton(
    elementId: string,
    callback: (response: any) => void
  ): void {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.initialize({
        client_id:
          '330891194437-nbb4psouuuhnsiqfgrqhrdqhqdumu8fp.apps.googleusercontent.com',
        callback,
      });
      google.accounts.id.renderButton(document.getElementById(elementId), {
        theme: 'outline',
        size: 'large',
      });
    } else {
      console.error('Google API not loaded.');
    }
  }
}
