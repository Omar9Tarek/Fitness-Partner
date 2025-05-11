import { IMealPlan } from '../../models/i-meal-plan';

export const MEAL_PLANS: IMealPlan[] = [
  {
    id: 1,
    target: 'Weight Loss',
    plan: {
      breakfast: {
        calories: 250,
        protein: 15,
        carbs: 20,
        fats: 12,
        items: [
          {
            name: 'Boiled Eggs',
            image: '/assets/Eggs.jpg',
            quantity: '2 pieces',
          },
          {
            name: 'Oatmeal with Fruits',
            image: '/assets/meals-imgs/Oatmeal.jpeg',
            quantity: '1/2 cup',
          },
        ],
      },
      lunch: {
        calories: 350,
        protein: 28,
        carbs: 30,
        fats: 10,
        items: [
          {
            name: 'Grilled Chicken Breast',
            image: '/assets/meals-imgs/Chicken Breast.jpeg',
            quantity: '100g',
          },
          {
            name: 'Steamed Vegetables',
            image: '/assets/meals-imgs/Steamed Vegetables.jpeg',
            quantity: '1 cup',
          },
        ],
      },
      dinner: {
        calories: 300,
        protein: 25,
        carbs: 15,
        fats: 12,
        items: [
          {
            name: 'Tuna Salad',
            image: '/assets/meals-imgs/Tuna Salad.jpeg',
            quantity: '85g',
          },
          {
            name: 'Yogurt',
            image: '/assets/foods-imgs/Yogurt.jpg',
            quantity: '150g',
          },
        ],
      },
      snack: {
        calories: 120,
        protein: 5,
        carbs: 4,
        fats: 10,
        items: [
          {
            name: 'Almonds',
            image: '/assets/meals-imgs/Almonds.jpeg',
            quantity: '15 pieces',
          },
        ],
      },
    },
  },
  {
    id: 2,
    target: 'Muscle Gain',
    plan: {
      breakfast: {
        calories: 450,
        protein: 25,
        carbs: 40,
        fats: 18,
        items: [
          {
            name: 'Scrambled Eggs with Toast',
            image: '/assets/meals-imgs/Scrambled Eggs with Toast.jpeg',
            quantity: '3 eggs + 2 slices bread',
          },
          {
            name: 'Banana Smoothie',
            image: '/assets/meals-imgs/Banana Smoothie.jpeg',
            quantity: '250ml',
          },
        ],
      },
      lunch: {
        calories: 650,
        protein: 45,
        carbs: 55,
        fats: 22,
        items: [
          {
            name: 'Grilled Steak',
            image: '/assets/meals-imgs/Beef Steak.jpeg',
            quantity: '150g',
          },
          {
            name: 'Quinoa Salad',
            image: '/assets/meals-imgs/Quinoa.jpeg',
            quantity: '1 cup cooked',
          },
        ],
      },
      dinner: {
        calories: 550,
        protein: 40,
        carbs: 45,
        fats: 18,
        items: [
          {
            name: 'Salmon with Sweet Potato',
            image: '/assets/meals-imgs/Salmon with Sweet Potato.jpeg',
            quantity: '120g salmon + 100g sweet potato',
          },
          {
            name: 'Green Salad',
            image: '/assets/meals-imgs/Green Salad.jpeg',
            quantity: '1 serving',
          },
        ],
      },
      snack: {
        calories: 250,
        protein: 25,
        carbs: 15,
        fats: 8,
        items: [
          {
            name: 'Protein Shake',
            image: '/assets/meals-imgs/Protein Shake.jpeg',
            quantity: '30g (1 scoop) with water',
          },
        ],
      },
    },
  },
  {
    id: 3,
    target: 'High Protein',
    plan: {
      breakfast: {
        calories: 280,
        protein: 28,
        carbs: 8,
        fats: 14,
        items: [
          {
            name: 'Boiled Eggs',
            image: '/assets/Eggs.jpg',
            quantity: '3 pieces',
          },
          {
            name: 'Cottage Cheese',
            image: '/assets/meals-imgs/Cottage Cheese.jpeg',
            quantity: '100g',
          },
        ],
      },
      lunch: {
        calories: 450,
        protein: 40,
        carbs: 12,
        fats: 25,
        items: [
          {
            name: 'Chicken Breast',
            image: '/assets/meals-imgs/Chicken Breast.jpeg',
            quantity: '150g',
          },
          {
            name: 'Avocado',
            image: '/assets/Avocado.jpg',
            quantity: '1/2 piece (75g)',
          },
        ],
      },
      dinner: {
        calories: 450,
        protein: 38,
        carbs: 10,
        fats: 28,
        items: [
          {
            name: 'Beef Steak',
            image: '/assets/meals-imgs/Beef Steak.jpeg',
            quantity: '150g',
          },
          {
            name: 'Broccoli',
            image: '/assets/meals-imgs/Broccoli.jpeg',
            quantity: '1 cup (100g)',
          },
        ],
      },
      snack: {
        calories: 170,
        protein: 18,
        carbs: 7,
        fats: 8,
        items: [
          {
            name: 'Greek Yogurt',
            image: '/assets/meals-imgs/Greek Yogurt.jpeg',
            quantity: '170g',
          },
        ],
      },
    },
  },
  {
    id: 4,
    target: 'Balanced Diet',
    plan: {
      breakfast: {
        calories: 350,
        protein: 18,
        carbs: 25,
        fats: 20,
        items: [
          {
            name: 'Eggs & Avocado Toast',
            image: '/assets/meals-imgs/Eggs & Avocado Toast.jpeg',
            quantity: '2 eggs + 1 slice bread + 40g avocado',
          },
        ],
      },
      lunch: {
        calories: 450,
        protein: 30,
        carbs: 45,
        fats: 12,
        items: [
          {
            name: 'Grilled Chicken & Rice',
            image: '/assets/meals-imgs/Grilled Chicken & Rice.jpeg',
            quantity: '120g chicken + 1/2 cup rice',
          },
        ],
      },
      dinner: {
        calories: 350,
        protein: 18,
        carbs: 30,
        fats: 12,
        items: [
          {
            name: 'Lentil Soup',
            image: '/assets/meals-imgs/lentil soup.jpeg',
            quantity: '250ml (1 bowl)',
          },
        ],
      },
      snack: {
        calories: 180,
        protein: 5,
        carbs: 20,
        fats: 9,
        items: [
          {
            name: 'Apple & Peanut Butter',
            image: '/assets/meals-imgs/Apple & Peanut Butter.jpeg',
            quantity: '1 small apple + 1 tbsp peanut butter',
          },
        ],
      },
    },
  },
  {
    id: 5,
    target: 'Low Carb',
    plan: {
      breakfast: {
        calories: 300,
        protein: 18,
        carbs: 5,
        fats: 22,
        items: [
          {
            name: 'Eggs & Cheese',
            image: '/assets/meals-imgs/Eggs & Cheese.jpeg',
            quantity: '2 eggs + 30g cheese',
          },
        ],
      },
      lunch: {
        calories: 400,
        protein: 35,
        carbs: 8,
        fats: 25,
        items: [
          {
            name: 'Chicken Caesar Salad',
            image: '/assets/meals-imgs/Chicken Caesar Salad.jpeg',
            quantity: '120g chicken + salad',
          },
        ],
      },
      dinner: {
        calories: 450,
        protein: 35,
        carbs: 12,
        fats: 28,
        items: [
          {
            name: 'Beef Stir-Fry',
            image: '/assets/meals-imgs/Beef Stir-Fry.jpeg',
            quantity: '150g beef + vegetables',
          },
        ],
      },
      snack: {
        calories: 160,
        protein: 6,
        carbs: 5,
        fats: 14,
        items: [
          {
            name: 'Almonds',
            image: '/assets/meals-imgs/Almonds.jpeg',
            quantity: '20 pieces',
          },
        ],
      },
    },
  },
  {
    id: 6,
    target: 'Vegetarian',
    plan: {
      breakfast: {
        calories: 280,
        protein: 12,
        carbs: 38,
        fats: 8,
        items: [
          {
            name: 'Greek Yogurt & Granola',
            image: '/assets/meals-imgs/Greek Yogurt.jpeg',
            quantity: '150g yogurt + 30g granola',
          },
        ],
      },
      lunch: {
        calories: 420,
        protein: 18,
        carbs: 50,
        fats: 14,
        items: [
          {
            name: 'Chickpea Buddha Bowl',
            image: '/assets/meals-imgs/Chickpea Buddha Bowl.jpeg',
            quantity: '1/2 cup chickpeas + vegetables + 1/4 cup quinoa',
          },
        ],
      },
      dinner: {
        calories: 380,
        protein: 15,
        carbs: 40,
        fats: 15,
        items: [
          {
            name: 'Veggie Stir-Fry',
            image: '/assets/meals-imgs/veg-stir-fry.jpeg',
            quantity: '2 eggs + mixed vegetables',
          },
        ],
      },
      snack: {
        calories: 120,
        protein: 2,
        carbs: 25,
        fats: 2,
        items: [
          {
            name: 'Fruit Salad',
            image: '/assets/meals-imgs/Fruit Salad.jpeg',
            quantity: '1 cup (150g)',
          },
        ],
      },
    },
  },
  {
    id: 7,
    target: 'Keto',
    plan: {
      breakfast: {
        calories: 480,
        protein: 22,
        carbs: 2,
        fats: 42,
        items: [
          {
            name: 'Bacon & Eggs',
            image: '/assets/meals-imgs/bacon-egges.jpeg',
            quantity: '3 eggs + 3 strips bacon',
          },
        ],
      },
      lunch: {
        calories: 550,
        protein: 35,
        carbs: 8,
        fats: 42,
        items: [
          {
            name: 'Avocado Chicken Salad',
            image: '/assets/meals-imgs/Avocado Chicken Salad.jpeg',
            quantity: '120g chicken + 1/2 avocado',
          },
        ],
      },
      dinner: {
        calories: 520,
        protein: 32,
        carbs: 5,
        fats: 40,
        items: [
          {
            name: 'Salmon & Asparagus',
            image: '/assets/meals-imgs/Salmon & Asparagus.jpeg',
            quantity: '150g salmon + 100g asparagus',
          },
        ],
      },
      snack: {
        calories: 180,
        protein: 7,
        carbs: 4,
        fats: 16,
        items: [
          {
            name: 'Almonds',
            image: '/assets/meals-imgs/Almonds.jpeg',
            quantity: '23 pieces',
          },
        ],
      },
    },
  },
  {
    id: 8,
    target: 'Diabetic Friendly',
    plan: {
      breakfast: {
        calories: 280,
        protein: 12,
        carbs: 35,
        fats: 8,
        items: [
          {
            name: 'Steel-Cut Oats',
            image: '/assets/meals-imgs/Steel-Cut Oats.jpeg',
            quantity: '1/3 cup dry (cooked with water)',
          },
        ],
      },
      lunch: {
        calories: 380,
        protein: 25,
        carbs: 30,
        fats: 15,
        items: [
          {
            name: 'Turkey Wrap',
            image: '/assets/meals-imgs/Turkey Wrap.jpeg',
            quantity: '90g turkey + whole grain wrap',
          },
        ],
      },
      dinner: {
        calories: 400,
        protein: 30,
        carbs: 25,
        fats: 18,
        items: [
          {
            name: 'Grilled Fish & Veggies',
            image: '/assets/meals-imgs/Grilled Fish & Veggies.jpeg',
            quantity: '120g fish + 1 cup vegetables',
          },
        ],
      },
      snack: {
        calories: 130,
        protein: 12,
        carbs: 8,
        fats: 6,
        items: [
          {
            name: 'Greek Yogurt',
            image: '/assets/meals-imgs/Greek Yogurt.jpeg',
            quantity: '150g',
          },
        ],
      },
    },
  },
  {
    id: 9,
    target: 'Heart Healthy',
    plan: {
      breakfast: {
        calories: 300,
        protein: 10,
        carbs: 45,
        fats: 8,
        items: [
          {
            name: 'Oatmeal with Berries',
            image: '/assets/meals-imgs/Oatmeal.jpeg',
            quantity: '1/2 cup oats + 50g berries',
          },
        ],
      },
      lunch: {
        calories: 450,
        protein: 35,
        carbs: 38,
        fats: 12,
        items: [
          {
            name: 'Grilled Chicken & Veggies',
            image: '/assets/meals-imgs/Grilled Chicken & Veggies.jpeg',
            quantity: '120g chicken + 1.5 cups vegetables',
          },
        ],
      },
      dinner: {
        calories: 420,
        protein: 28,
        carbs: 22,
        fats: 22,
        items: [
          {
            name: 'Salmon & Spinach',
            image: '/assets/meals-imgs/Salmon & Spinach.jpeg',
            quantity: '120g salmon + 2 cups spinach',
          },
        ],
      },
      snack: {
        calories: 130,
        protein: 5,
        carbs: 8,
        fats: 10,
        items: [
          {
            name: 'Mixed Nuts',
            image: '/assets/meals-imgs/Mixed Nuts.jpeg',
            quantity: '20g (1/4 cup)',
          },
        ],
      },
    },
  },
  {
    id: 10,
    target: 'Gluten Free',
    plan: {
      breakfast: {
        calories: 300,
        protein: 8,
        carbs: 40,
        fats: 10,
        items: [
          {
            name: 'Smoothie Bowl',
            image: '/assets/meals-imgs/Smoothie Bowl.jpeg',
            quantity: '250ml (1 bowl)',
          },
        ],
      },
      lunch: {
        calories: 480,
        protein: 32,
        carbs: 40,
        fats: 18,
        items: [
          {
            name: 'Grilled Shrimp & Rice Noodles',
            image: '/assets/meals-imgs/Grilled Shrimp & Rice Noodles.jpeg',
            quantity: '120g shrimp + 1 cup rice noodles',
          },
        ],
      },
      dinner: {
        calories: 450,
        protein: 28,
        carbs: 35,
        fats: 18,
        items: [
          {
            name: 'Chicken & Quinoa',
            image: '/assets/meals-imgs/Chicken & Quinoa.jpeg',
            quantity: '120g chicken + 3/4 cup cooked quinoa',
          },
        ],
      },
      snack: {
        calories: 150,
        protein: 2,
        carbs: 30,
        fats: 4,
        items: [
          {
            name: 'Fruit Salad',
            image: '/assets/meals-imgs/Fruit Salad.jpeg',
            quantity: '1 cup (150g)',
          },
        ],
      },
    },
  },
];
