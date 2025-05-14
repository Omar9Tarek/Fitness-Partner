import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  imports: [CommonModule, TranslateModule],
  selector: 'app-push-pull-legs',
  templateUrl: './push-pull-legs.component.html',
  styleUrls: ['./push-pull-legs.component.css'],
})
export class PushPullLegsComponent implements OnInit {
  expandedSection: string | null = '';
  expandedWorkouts: string[] = []; // Track expanded workout days
  filteredWorkouts = WORKOUTS;

  constructor(private router: Router, private translate: TranslateService) {
    this.translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    // Initially expand all workouts
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
      this.expandedWorkouts.splice(index, 1); // Remove from expanded list
    } else {
      this.expandedWorkouts.push(day); // Add to expanded list
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

// Sample workout data
const WORKOUTS = [
  {
    day: 'push',
    muscleGroup: 'Chest, Shoulders, Triceps',
    exercises: [
      {
        mg: 'chest',
        name: 'Bench Press',
        sets: 4,
        reps: '8-10',
        notes: 'Focus on chest contraction',
      },
      {
        mg: 'shoulders',
        name: 'Dumbbell Shoulder Press',
        sets: 3,
        reps: '8-10',
        notes: 'Keep core tight',
      },
      {
        mg: 'chest',
        name: 'Incline Bench Press',
        sets: 3,
        reps: '10-12',
        notes: null,
      },
      {
        mg: 'shoulders',
        name: 'Lateral Raises',
        sets: 3,
        reps: '12-15',
        notes: 'Controlled movement',
      },
      {
        mg: 'arms',
        name: 'Triceps Pushdown',
        sets: 3,
        reps: '10-12',
        notes: null,
      },
      {
        mg: 'arms',
        name: 'Overhead Tricep Extension',
        sets: 3,
        reps: '10-12',
        notes: null,
      },
    ],
  },
  {
    day: 'pull',
    muscleGroup: 'Back, Biceps, Rear Delts',
    exercises: [
      {
        mg: 'back',
        name: 'Deadlifts',
        sets: 4,
        reps: '6-8',
        notes: 'Focus on form',
      },
      { mg: 'back', name: 'Lat Pulldown', sets: 3, reps: '8-10', notes: null },
      {
        mg: 'back',
        name: 'Barbell Row',
        sets: 3,
        reps: '8-10',
        notes: 'Keep back straight',
      },
      {
        mg: 'shoulders',
        name: 'Face Pull',
        sets: 3,
        reps: '12-15',
        notes: 'For rear delts and rotator cuff',
      },
      {
        mg: 'arms',
        name: 'Cable Bicep Curls',
        sets: 3,
        reps: '10-12',
        notes: null,
      },
      {
        mg: 'arms',
        name: 'Hammer Curls',
        sets: 3,
        reps: '10-12',
        notes: 'Works brachialis and forearms',
      },
    ],
  },
  {
    day: 'legs',
    muscleGroup: 'Quads, Hamstrings, Calves, Core',
    exercises: [
      {
        mg: 'legs',
        name: 'Squats',
        sets: 4,
        reps: '8-10',
        notes: 'Focus on depth and form',
      },
      {
        mg: 'legs',
        name: 'Leg Extension',
        sets: 3,
        reps: '10-12',
        notes: null,
      },
      {
        mg: 'legs',
        name: 'Hamstring Curls',
        sets: 3,
        reps: '8-10',
        notes: 'Focus on hamstrings',
      },
      { mg: 'legs', name: 'Leg Press', sets: 3, reps: '10-12', notes: null },
      { mg: 'legs', name: 'Calf Raises', sets: 4, reps: '15-20', notes: null },
      {
        mg: 'abs',
        name: 'Cable Crunch',
        sets: 3,
        reps: '12-15',
        notes: 'For core',
      },
    ],
  },
];
