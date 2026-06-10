// Built-in food database. Macros are approximate, per listed serving.
// cal = kcal, p = protein g, c = carbs g, f = fat g
// cat: protein | carb | fat | dairy | fruit | veg | snack | meal
const FOODS = [
  // Proteins
  { name: "Chicken breast (6 oz cooked)", cat: "protein", cal: 280, p: 52, c: 0, f: 6 },
  { name: "Chicken thigh (6 oz cooked)", cat: "protein", cal: 360, p: 44, c: 0, f: 20 },
  { name: "Ground beef 90/10 (6 oz cooked)", cat: "protein", cal: 308, p: 46, c: 0, f: 13 },
  { name: "Ground beef 80/20 (6 oz cooked)", cat: "protein", cal: 414, p: 42, c: 0, f: 27 },
  { name: "Ground turkey 93/7 (6 oz cooked)", cat: "protein", cal: 320, p: 44, c: 0, f: 15 },
  { name: "Sirloin steak (6 oz cooked)", cat: "protein", cal: 342, p: 52, c: 0, f: 14 },
  { name: "Pork tenderloin (6 oz cooked)", cat: "protein", cal: 274, p: 48, c: 0, f: 8 },
  { name: "Salmon (6 oz cooked)", cat: "protein", cal: 350, p: 38, c: 0, f: 22 },
  { name: "Tilapia / white fish (6 oz cooked)", cat: "protein", cal: 218, p: 44, c: 0, f: 4 },
  { name: "Shrimp (6 oz cooked)", cat: "protein", cal: 202, p: 39, c: 2, f: 3 },
  { name: "Tuna packet (2.6 oz)", cat: "protein", cal: 70, p: 16, c: 0, f: 1, snack: true },
  { name: "Egg (1 large)", cat: "protein", cal: 72, p: 6, c: 0, f: 5 },
  { name: "Egg whites (1 cup)", cat: "protein", cal: 126, p: 26, c: 2, f: 0 },
  { name: "Hard-boiled eggs (2)", cat: "protein", cal: 144, p: 12, c: 1, f: 10, snack: true },
  { name: "Whey protein (1 scoop)", cat: "protein", cal: 120, p: 24, c: 3, f: 1.5, snack: true },
  { name: "Casein protein (1 scoop)", cat: "protein", cal: 120, p: 24, c: 3, f: 1, snack: true },
  { name: "Tofu, firm (6 oz)", cat: "protein", cal: 160, p: 17, c: 4, f: 9 },
  { name: "Tempeh (4 oz)", cat: "protein", cal: 220, p: 21, c: 10, f: 12 },
  { name: "Deli turkey (4 oz)", cat: "protein", cal: 120, p: 24, c: 2, f: 1, snack: true },
  { name: "Beef jerky (1 oz)", cat: "protein", cal: 80, p: 13, c: 3, f: 1, snack: true },

  // Dairy
  { name: "Greek yogurt, nonfat (1 cup)", cat: "dairy", cal: 130, p: 23, c: 9, f: 0, snack: true },
  { name: "Greek yogurt, 2% (1 cup)", cat: "dairy", cal: 170, p: 22, c: 9, f: 4.5, snack: true },
  { name: "Cottage cheese, lowfat (1 cup)", cat: "dairy", cal: 180, p: 25, c: 8, f: 5, snack: true },
  { name: "Skyr (1 cup)", cat: "dairy", cal: 150, p: 26, c: 10, f: 0, snack: true },
  { name: "Milk, 2% (1 cup)", cat: "dairy", cal: 122, p: 8, c: 12, f: 5 },
  { name: "Milk, whole (1 cup)", cat: "dairy", cal: 149, p: 8, c: 12, f: 8 },
  { name: "String cheese (1 stick)", cat: "dairy", cal: 80, p: 7, c: 1, f: 6, snack: true },
  { name: "Cheddar cheese (1 oz)", cat: "dairy", cal: 114, p: 7, c: 0, f: 9 },

  // Carbs
  { name: "White rice, cooked (1 cup)", cat: "carb", cal: 205, p: 4, c: 45, f: 0 },
  { name: "Brown rice, cooked (1 cup)", cat: "carb", cal: 216, p: 5, c: 45, f: 2 },
  { name: "Pasta, cooked (1 cup)", cat: "carb", cal: 220, p: 8, c: 43, f: 1 },
  { name: "Oats, dry (1/2 cup)", cat: "carb", cal: 150, p: 5, c: 27, f: 3 },
  { name: "Sweet potato (1 medium)", cat: "carb", cal: 103, p: 2, c: 24, f: 0 },
  { name: "White potato (1 medium)", cat: "carb", cal: 161, p: 4, c: 37, f: 0 },
  { name: "Quinoa, cooked (1 cup)", cat: "carb", cal: 222, p: 8, c: 39, f: 4 },
  { name: "Whole wheat bread (2 slices)", cat: "carb", cal: 160, p: 8, c: 28, f: 2 },
  { name: "Bagel (1 plain)", cat: "carb", cal: 277, p: 11, c: 55, f: 1 },
  { name: "Tortilla, flour (1 large)", cat: "carb", cal: 140, p: 4, c: 24, f: 3 },
  { name: "Rice cakes (2)", cat: "carb", cal: 70, p: 1, c: 15, f: 0, snack: true },
  { name: "Cereal w/ milk (1 bowl)", cat: "carb", cal: 250, p: 9, c: 42, f: 5 },
  { name: "Black beans (1 cup)", cat: "carb", cal: 227, p: 15, c: 41, f: 1 },
  { name: "Lentils, cooked (1 cup)", cat: "carb", cal: 230, p: 18, c: 40, f: 1 },

  // Fruit
  { name: "Banana (1 medium)", cat: "fruit", cal: 105, p: 1, c: 27, f: 0, snack: true },
  { name: "Apple (1 medium)", cat: "fruit", cal: 95, p: 0, c: 25, f: 0, snack: true },
  { name: "Orange (1 medium)", cat: "fruit", cal: 62, p: 1, c: 15, f: 0, snack: true },
  { name: "Blueberries (1 cup)", cat: "fruit", cal: 84, p: 1, c: 21, f: 0, snack: true },
  { name: "Strawberries (1 cup)", cat: "fruit", cal: 49, p: 1, c: 12, f: 0, snack: true },
  { name: "Grapes (1 cup)", cat: "fruit", cal: 104, p: 1, c: 27, f: 0, snack: true },

  // Veg
  { name: "Broccoli (1 cup cooked)", cat: "veg", cal: 55, p: 4, c: 11, f: 0 },
  { name: "Green beans (1 cup cooked)", cat: "veg", cal: 44, p: 2, c: 10, f: 0 },
  { name: "Spinach (2 cups raw)", cat: "veg", cal: 14, p: 2, c: 2, f: 0 },
  { name: "Mixed salad w/ vinaigrette", cat: "veg", cal: 150, p: 3, c: 12, f: 10 },
  { name: "Baby carrots (1 cup)", cat: "veg", cal: 50, p: 1, c: 12, f: 0, snack: true },
  { name: "Edamame (1 cup)", cat: "veg", cal: 188, p: 18, c: 14, f: 8, snack: true },

  // Fats
  { name: "Peanut butter (2 tbsp)", cat: "fat", cal: 190, p: 8, c: 7, f: 16, snack: true },
  { name: "Almonds (1 oz, ~23)", cat: "fat", cal: 164, p: 6, c: 6, f: 14, snack: true },
  { name: "Cashews (1 oz)", cat: "fat", cal: 157, p: 5, c: 9, f: 12, snack: true },
  { name: "Avocado (1/2)", cat: "fat", cal: 120, p: 1, c: 6, f: 11 },
  { name: "Olive oil (1 tbsp)", cat: "fat", cal: 119, p: 0, c: 0, f: 14 },
  { name: "Butter (1 tbsp)", cat: "fat", cal: 102, p: 0, c: 0, f: 12 },

  // Snacks / combos / meals
  { name: "Protein bar (typical)", cat: "snack", cal: 210, p: 20, c: 22, f: 7, snack: true },
  { name: "Protein shake w/ milk", cat: "snack", cal: 242, p: 32, c: 15, f: 6, snack: true },
  { name: "Apple + peanut butter (2 tbsp)", cat: "snack", cal: 285, p: 8, c: 32, f: 16, snack: true },
  { name: "Greek yogurt + berries + honey", cat: "snack", cal: 250, p: 24, c: 35, f: 0, snack: true },
  { name: "Cottage cheese + pineapple", cat: "snack", cal: 240, p: 26, c: 25, f: 5, snack: true },
  { name: "Rice cakes + PB (2 + 1 tbsp)", cat: "snack", cal: 165, p: 5, c: 19, f: 8, snack: true },
  { name: "Trail mix (1/4 cup)", cat: "snack", cal: 175, p: 5, c: 16, f: 11, snack: true },
  { name: "Hummus + carrots", cat: "snack", cal: 160, p: 5, c: 18, f: 8, snack: true },
  { name: "Tuna + crackers", cat: "snack", cal: 200, p: 18, c: 18, f: 6, snack: true },
  { name: "PB&J sandwich", cat: "meal", cal: 380, p: 13, c: 45, f: 17 },
  { name: "Chicken burrito bowl (typical)", cat: "meal", cal: 650, p: 45, c: 70, f: 20 },
  { name: "Chicken + rice + broccoli plate", cat: "meal", cal: 540, p: 56, c: 56, f: 8 },
  { name: "Oatmeal + whey + banana", cat: "meal", cal: 375, p: 30, c: 57, f: 5 },
  { name: "3-egg omelet + toast", cat: "meal", cal: 380, p: 26, c: 30, f: 17 },
  { name: "Burger + fries (restaurant)", cat: "meal", cal: 950, p: 35, c: 90, f: 50 },
  { name: "Slice of pizza (large)", cat: "meal", cal: 300, p: 13, c: 36, f: 12 },
];
