import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IMealPlan } from './../models/i-meal-plan';
import { MEAL_PLANS } from '../public/meals-planner/meal-plans-data';

@Injectable({
  providedIn: 'root',
})
export class MealPlannerService {
  constructor() {}

  getAll(): Observable<IMealPlan[]> {
    return of(MEAL_PLANS);
  }

  getByTarget(goal: string): Observable<IMealPlan | undefined> {
    const plan = MEAL_PLANS.find(
      (p) => p.target.toLowerCase() === goal.toLowerCase()
    );
    return of(plan);
  }
}
