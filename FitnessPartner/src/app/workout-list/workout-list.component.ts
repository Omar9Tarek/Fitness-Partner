import { Component, OnInit, Inject } from '@angular/core';
import { WorkoutService } from '../services/workout.service';
import { Workout } from '../models/workout.model';
import { CommonModule } from '@angular/common';
import { UpperLowerSplitComponent } from './upper-lower/upper-lower.component';
import { PushPullLegsComponent } from './push-pull-legs/push-pull-legs.component';
import { BroSplitComponent } from './bro-split/bro-split.component';
import { HomeWorkoutComponent } from './home-workout/home-workout.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
// import { PplComponent } from "./ppl/ppl.component";

@Component({
  imports: [
    TranslateModule,
    CommonModule,
    UpperLowerSplitComponent,
    PushPullLegsComponent,
    BroSplitComponent,
    HomeWorkoutComponent,
  ],
  selector: 'app-workouts',
  templateUrl: './workout-list.component.html',
  standalone: true,
})
export class WorkoutsComponent implements OnInit {
  workouts: Workout[] = [];
  filteredWorkouts: Workout[] = [];
  selectedPlanType: string = 'push-pull-legs';
  selectedDay: string = '';

  constructor(
    @Inject(WorkoutService) private workoutService: WorkoutService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.loadWorkouts();
  }

  loadWorkouts(): void {
    this.workoutService.getAllWorkouts().subscribe({
      next: (data) => {
        this.workouts = data;
        this.filteredWorkouts = data; // Default show all
        console.log('All workouts loaded:', this.workouts);
      },
      error: (err) => console.error('Failed to fetch workouts', err),
    });
  }

  filterByPlanType(planType: string): void {
    this.selectedPlanType = planType;
    this.selectedDay = ''; // Reset day filter when changing plan type

    // Filter workouts based on planType
    this.filteredWorkouts = this.workouts.filter(
      (workout) =>
        (workout.planType ?? '').toLowerCase() === planType.toLowerCase()
    );

    console.log(`Filtered workouts for ${planType}:`, this.filteredWorkouts);
  }

  filterWorkouts(day: string): void {
    this.selectedDay = day;

    // Filter by both planType and day
    this.filteredWorkouts = this.workouts.filter(
      (workout) =>
        (workout.planType ?? '').toLowerCase() ===
          this.selectedPlanType.toLowerCase() &&
        (workout.day ?? '').toLowerCase() === day.toLowerCase()
    );

    console.log(
      `Filtered workouts for ${this.selectedPlanType} - ${day}:`,
      this.filteredWorkouts
    );
  }

  resetDayFilter(): void {
    this.selectedDay = '';

    // Only filter by planType if one is selected
    if (this.selectedPlanType) {
      this.filteredWorkouts = this.workouts.filter(
        (workout) =>
          (workout.planType ?? '').toLowerCase() ===
          this.selectedPlanType.toLowerCase()
      );
    } else {
      this.filteredWorkouts = [...this.workouts];
    }
  }

  deleteWorkout(id: string): void {
    if (confirm('Are you sure you want to delete this workout?')) {
      this.workoutService.deleteWorkout(id).subscribe({
        next: () => {
          this.workouts = this.workouts.filter((w) => w._id !== id);
          this.filteredWorkouts = this.filteredWorkouts.filter(
            (w) => w._id !== id
          );
        },
        error: (err) => console.error('Failed to delete workout', err),
      });
    }
  }
}
