import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  imports: [CommonModule, TranslateModule],
  selector: 'app-home-workout',
  templateUrl: './home-workout.component.html',
  styleUrls: ['./home-workout.component.css'],
})
export class HomeWorkoutComponent implements OnInit {
  expandedSection: string | null = '';
  expandedWorkouts: string[] = [];
  filteredWorkouts = HOME_WORKOUTS;

  constructor(private router: Router, private translate: TranslateService) {
    this.translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    // Initially collapsed; customize if you want defaults
  }

  toggleSection(section: string): void {
    this.expandedSection = this.expandedSection === section ? null : section;
  }

  isExpanded(section: string): boolean {
    return this.expandedSection === section;
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
    if (mg && muscle) {
      const path = `/exercises/home/${mg}/${muscle}`;
      this.router.navigate([path]);
    }
  }
}

// Sample home workout data
const HOME_WORKOUTS = [
  {
    day: 'upper',
    muscleGroup: 'Chest, Shoulders, Triceps',
    exercises: [
      {
        mg: 'chest',
        name: 'Push-Ups',
        sets: 4,
        reps: '10-15',
        notes: 'Focus on form',
      },
      {
        mg: 'shoulders',
        name: 'Pike Push-Ups',
        sets: 3,
        reps: '8-12',
        notes: null,
      },
      {
        mg: 'arms',
        name: 'Chair Dips',
        sets: 3,
        reps: '10-12',
        notes: 'Use chair',
      },
      { mg: 'abs', name: 'Crunches', sets: 4, reps: '10-12', notes: null },
    ],
  },
  {
    day: 'lower',
    muscleGroup: 'Quads, Hamstrings, Glutes, Calves',
    exercises: [
      {
        mg: 'legs',
        name: 'Bodyweight Squats',
        sets: 4,
        reps: '15-20',
        notes: null,
      },
      { mg: 'legs', name: 'Lunges', sets: 3, reps: '12-15', notes: 'Each leg' },
      {
        mg: 'calves',
        name: 'Calf Raises',
        sets: 3,
        reps: '20-25',
        notes: null,
      },
      { mg: 'abs', name: 'Leg Raises', sets: 3, reps: '20-25', notes: null },
    ],
  },
  {
    day: 'full-body',
    muscleGroup: 'Core, Back, Legs, Chest',
    exercises: [
      {
        mg: 'abs',
        name: 'Plank',
        sets: 3,
        reps: '60s',
        notes: 'Keep body straight',
      },
      {
        mg: 'back',
        name: 'Superman Exercise',
        sets: 3,
        reps: '15-20',
        notes: null,
      },
      {
        mg: 'legs',
        name: 'Burpees',
        sets: 3,
        reps: '10-12',
        notes: 'Full-body cardio',
      },
    ],
  },
];
