import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FOOD_DATA } from '../public/food-nutrition/food-data';

export interface FoodItem {
  id: number;
  name: string;
  image: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

@Injectable({
  providedIn: 'root',
})
export class FoodNutritionService {
  constructor() {}

  getAllFoods(): Observable<FoodItem[]> {
    return of(FOOD_DATA);
  }

  getFoodById(id: number): Observable<FoodItem | undefined> {
    return of(FOOD_DATA.find((food) => food.id === id));
  }
}
