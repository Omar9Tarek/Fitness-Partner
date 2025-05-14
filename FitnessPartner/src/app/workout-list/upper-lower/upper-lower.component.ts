import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule,TranslateService } from '@ngx-translate/core';

@Component({
  imports: [CommonModule,TranslateModule],
  selector: 'app-upper-lower-split',
  templateUrl: './upper-lower.component.html',
  styleUrls: ['./upper-lower.component.css'],
})
export class UpperLowerSplitComponent {
  expandedSection: string = 'overview';
  expandedWorkouts: string[] = [];
  filteredWorkouts = UPPER_LOWER_WORKOUTS;

  constructor(private router: Router, private translate: TranslateService) {
    this.translate.setDefaultLang('en');
  }

  toggleSection(section: string): void {
    this.expandedSection = this.expandedSection === section ? '' : section;
  }

  toggleWorkout(day: string): void {
    const index = this.expandedWorkouts.indexOf(day);
    if (index > -1) {
      this.expandedWorkouts.splice(index, 1);
    } else {
      this.expandedWorkouts.push(day);
    }
  }

  isWorkoutExpanded(day: string): boolean {
    return this.expandedWorkouts.includes(day);
  }

  navigateToExercises(mg: string, muscle: string): void {
    console.log(muscle, 'clicked');
    if (mg && muscle) {
      console.log(`/exercises/gym/${mg}/${muscle}`);
      this.router.navigate([`/exercises/gym/${mg}/${muscle}`]);
    }
  }
}

const UPPER_LOWER_WORKOUTS = [
  {
    day: 'upper-a',
    muscleGroup: 'Chest, Back, Shoulders, Arms',
    exercises: [
      {
        mg: 'chest',
        name: 'Bench Press',
        sets: 4,
        reps: '8-10',
        notes: 'Barbell or dumbbell',
      },
      { mg: 'back', name: 'Pull-Ups', sets: 4, reps: '6-8' },
      {
        mg: 'shoulders',
        name: 'Dumbbell Shoulder Press',
        sets: 3,
        reps: '8-10',
      },
      { mg: 'back', name: 'Barbell Row', sets: 3, reps: '8-10' },
      { mg: 'chest', name: 'Dumbbell Flyes', sets: 3, reps: '12-15' },
    ],
  },
  {
    day: 'lower-a',
    muscleGroup: 'Legs, Core',
    exercises: [
      { mg: 'legs', name: 'Squats', sets: 4, reps: '8-10' },
      { mg: 'legs', name: 'Leg Extension', sets: 3, reps: '8-10' },
      { mg: 'legs', name: 'Leg Press', sets: 3, reps: '10-12' },
      { mg: 'legs', name: 'Hamestring Curls', sets: 3, reps: '12-15' },
      { mg: 'abs', name: 'Russian Twists', sets: 3, reps: '60s' },
    ],
  },
  {
    day: 'upper-b',
    muscleGroup: 'Back, Chest, Arms',
    exercises: [
      { mg: 'chest', name: 'Incline Bench Press', sets: 4, reps: '8-10' },
      { mg: 'back', name: 'Lat Pulldown', sets: 4, reps: '8-10' },
      {
        mg: 'shoulders',
        name: 'Dumbbell Shoulder Press',
        sets: 3,
        reps: '10-12',
      },
      { mg: 'back', name: 'Seated Row', sets: 3, reps: '10-12' },
      { mg: 'shoulders', name: 'Lateral Raises', sets: 3, reps: '15-20' },
    ],
  },
  {
    day: 'lower-b',
    muscleGroup: 'Legs, Glutes',
    exercises: [
      { mg: 'legs', name: 'Squats', sets: 4, reps: '6-8' },
      { mg: 'legs', name: 'Lunges with Dumbbells', sets: 3, reps: '10-12' },
      { mg: 'legs', name: 'Leg Extension', sets: 3, reps: '8-10' },
      { mg: 'legs', name: 'Hip Thrusts', sets: 3, reps: '12-15' },
      { mg: 'legs', name: 'Calf Raises', sets: 4, reps: '15-20' },
    ],
  },
];
