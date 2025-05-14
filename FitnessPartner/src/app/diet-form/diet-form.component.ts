import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DietAiService } from '../services/diet-ai.service';
import { MeasurementsService } from '../services/measurements.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-diet-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './diet-form.component.html',
  styleUrls: ['./diet-form.component.css'],
})
export class DietFormComponent implements OnInit {
  formData = {
    age: null,
    weight: null,
    height: null,
    waist: null,
    neck: null,
    gender: '',
    goal: '',
  };

  result: string = '';
  loading = false;
  error = '';
  userId: string;
  savingMeasurements = false;
  measurementsSaved = false;
  errorMessage: string | null = null;
  monthlyRequestExhausted = false;
  lastRequestDate: Date | null = null;
  daysUntilNextRequest = 0;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dietService: DietAiService,
    private measurementsService: MeasurementsService,
    private authService: AuthService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('en');
    this.userId = this.authService.getCurrentUserId() || '';
  }

  async ngOnInit() {
    this.route.fragment.subscribe((fragment) => {
      if (fragment) {
        const el = document.getElementById(fragment);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });

    // Add the required translation keys if they don't exist
    this.ensureTranslationsExist();

    // Check if user is logged in
    if (this.userId) {
      // Check if the user has already made a request this month
      await this.checkMonthlyRequestLimit();
    }
  }

  private ensureTranslationsExist() {
    // Add missing translation keys if they don't already exist
    const translationKeys = {
      'trainers.dietForm.nextAvailableIn': 'Available in',
      'trainers.dietForm.days': 'days'
    };

    Object.entries(translationKeys).forEach(([key, defaultValue]) => {
      // Check if translation exists, if not, add it
      this.translate.get(key).subscribe(value => {
        if (value === key) {
          // Translation doesn't exist, set the default
          const currentLang = this.translate.currentLang || this.translate.defaultLang;
          const translations: { [key: string]: string } = {};
          translations[key] = defaultValue;
          this.translate.setTranslation(currentLang, translations, true);
        }
      });
    });
  }

  async checkMonthlyRequestLimit() {
    try {
      this.loading = true;
      console.log('Checking monthly request limit for user:', this.userId);
      
      const measurements = await firstValueFrom(this.measurementsService.getUserMeasurements(this.userId));
      console.log('Retrieved measurements:', measurements);
      
      if (measurements && measurements.length > 0) {
        // Sort measurements by date (newest first)
        const sortedMeasurements = measurements.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        const latestMeasurement = sortedMeasurements[0];
        this.lastRequestDate = new Date(latestMeasurement.date);
        console.log('Latest request date:', this.lastRequestDate);
        
        // Check if the latest measurement is from the current month
        const now = new Date();
        const sameMonth = this.lastRequestDate.getMonth() === now.getMonth() 
                       && this.lastRequestDate.getFullYear() === now.getFullYear();
        
        console.log('Same month check:', {
          lastRequestMonth: this.lastRequestDate.getMonth(),
          currentMonth: now.getMonth(),
          lastRequestYear: this.lastRequestDate.getFullYear(),
          currentYear: now.getFullYear(),
          sameMonth: sameMonth
        });
        
        if (sameMonth) {
          this.monthlyRequestExhausted = true;
          
          // Calculate days until next month
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          const timeUntilNextMonth = nextMonth.getTime() - now.getTime();
          this.daysUntilNextRequest = Math.ceil(timeUntilNextMonth / (1000 * 60 * 60 * 24));
          
          console.log('Monthly limit reached. Days until next request:', this.daysUntilNextRequest);
        } else {
          this.monthlyRequestExhausted = false;
          console.log('Monthly limit not reached - different month');
        }
      } else {
        console.log('No measurements found, user can make a request');
        this.monthlyRequestExhausted = false;
      }
      
      console.log('Final state:', {
        monthlyRequestExhausted: this.monthlyRequestExhausted,
        lastRequestDate: this.lastRequestDate,
        daysUntilNextRequest: this.daysUntilNextRequest
      });
    } catch (err) {
      console.error('Error checking monthly request limit:', err);
      // In case of error, default to allowing the request
      this.monthlyRequestExhausted = false;
    } finally {
      this.loading = false;
    }
  }

  async submit() {
    if (!this.userId) {
      this.error = 'Please log in to generate a diet plan.';
      return;
    }

    // Double-check monthly limit to prevent any possibility of circumvention
    if (this.monthlyRequestExhausted) {
      this.error = `You've already requested a diet plan this month. Please try again in ${this.daysUntilNextRequest} days.`;
      return;
    }

    this.loading = true;
    this.result = '';
    this.error = '';
    this.measurementsSaved = false;

    this.dietService.generateDietPlan(this.formData).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
        
        // Save measurements and diet plan if user is logged in
        if (this.userId) {
          this.saveMeasurements(res);
          this.monthlyRequestExhausted = true; // Update status after successful submission
        }
      },
      error: (err) => {
        this.error = 'Failed to generate diet plan. Try again later.';
        this.loading = false;
      },
    });
  }

  saveMeasurements(dietPlan: string) {
    this.savingMeasurements = true;
    this.errorMessage = null; // Clear previous errors

    this.measurementsService.saveMeasurements(this.userId, this.formData, dietPlan).subscribe({
      next: () => {
        this.savingMeasurements = false;
        this.measurementsSaved = true;
        // Update the request limit status after successfully saving
        this.checkMonthlyRequestLimit();
      },
      error: (err) => {
        this.savingMeasurements = false;
        this.measurementsSaved = false;
        this.errorMessage = err.message || 'An unexpected error occurred.';
        console.error('Error saving measurements:', err);
      }
    });
  }

  viewMeasurements() {
    this.router.navigate(['/profile/measurements']);
  }

  getLastRequestDateFormatted(): string {
    if (!this.lastRequestDate) return '';
    return this.lastRequestDate.toLocaleDateString();
  }
  
  public navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}