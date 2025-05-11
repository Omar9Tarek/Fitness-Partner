export interface IMealPlan {
  id: number;
  target: string;
  plan: {
    breakfast: IMealDetails;
    lunch: IMealDetails;
    dinner: IMealDetails;
    snack: IMealDetails;
  };
}

export interface IMealDetails {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  items: IMealItem[];
}

export interface IMealItem {
  name: string;
  image: string;
  quantity: string;
}
