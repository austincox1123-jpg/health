import type { FoodItem } from '../types';

/**
 * Seeded food database for the nutrition tracker.
 *
 * Conventions:
 * - ids are stable, deterministic, kebab-case, prefixed 'food-'.
 * - Macros are per the stated servingLabel and sourced from common USDA values.
 * - Numeric tags are applied by rule: high_protein >= 20 g protein,
 *   low_carb <= 10 g carbs, low_fat <= 3 g fat, high_fiber >= 5 g fiber.
 * - 'vegan' always implies 'vegetarian'.
 */
export const foodLibrary: FoodItem[] = [
  // ---------- Lean proteins ----------
  {
    id: 'food-chicken-breast', name: 'Chicken Breast (skinless)', category: 'protein',
    servingLabel: '100 g cooked', calories: 165, proteinG: 31, carbsG: 0, fatG: 3.6,
    allergens: [], tags: ['high_protein', 'low_carb'], isCustom: false,
  },
  {
    id: 'food-chicken-thigh', name: 'Chicken Thigh (skinless)', category: 'protein',
    servingLabel: '100 g cooked', calories: 209, proteinG: 26, carbsG: 0, fatG: 10.9,
    allergens: [], tags: ['high_protein', 'low_carb'], isCustom: false,
  },
  {
    id: 'food-ground-turkey-93', name: 'Ground Turkey (93/7)', category: 'protein',
    servingLabel: '100 g cooked', calories: 213, proteinG: 27, carbsG: 0, fatG: 11.6,
    allergens: [], tags: ['high_protein', 'low_carb'], isCustom: false,
  },
  {
    id: 'food-deli-turkey-breast', name: 'Deli Turkey Breast', category: 'protein',
    servingLabel: '3 oz (85 g)', calories: 90, proteinG: 18, carbsG: 2, fatG: 1,
    allergens: [], tags: ['low_carb', 'low_fat', 'quick'], isCustom: false,
  },
  {
    id: 'food-ground-beef-90', name: 'Lean Ground Beef (90/10)', category: 'protein',
    servingLabel: '100 g cooked', calories: 217, proteinG: 26, carbsG: 0, fatG: 12,
    allergens: [], tags: ['high_protein', 'low_carb'], isCustom: false,
  },
  {
    id: 'food-sirloin-steak', name: 'Sirloin Steak', category: 'protein',
    servingLabel: '100 g cooked', calories: 200, proteinG: 29, carbsG: 0, fatG: 9,
    allergens: [], tags: ['high_protein', 'low_carb'], isCustom: false,
  },
  {
    id: 'food-pork-loin', name: 'Pork Loin', category: 'protein',
    servingLabel: '100 g cooked', calories: 196, proteinG: 27, carbsG: 0, fatG: 9.5,
    allergens: [], tags: ['high_protein', 'low_carb'], isCustom: false,
  },
  {
    id: 'food-deli-ham', name: 'Deli Ham', category: 'protein',
    servingLabel: '3 oz (85 g)', calories: 91, proteinG: 14, carbsG: 2.3, fatG: 2.9,
    allergens: [], tags: ['low_carb', 'low_fat', 'quick'], isCustom: false,
  },
  {
    id: 'food-salmon', name: 'Salmon (Atlantic)', category: 'protein',
    servingLabel: '100 g cooked', calories: 206, proteinG: 22, carbsG: 0, fatG: 13,
    allergens: ['fish'], tags: ['high_protein', 'low_carb'], isCustom: false,
  },
  {
    id: 'food-canned-tuna', name: 'Canned Tuna (in water)', category: 'protein',
    servingLabel: '1 can drained (120 g)', calories: 120, proteinG: 27, carbsG: 0, fatG: 1,
    allergens: ['fish'], tags: ['high_protein', 'low_carb', 'low_fat', 'quick'], isCustom: false,
  },
  {
    id: 'food-tilapia', name: 'Tilapia', category: 'protein',
    servingLabel: '100 g cooked', calories: 128, proteinG: 26, carbsG: 0, fatG: 2.7,
    allergens: ['fish'], tags: ['high_protein', 'low_carb', 'low_fat'], isCustom: false,
  },
  {
    id: 'food-cod', name: 'Cod (white fish)', category: 'protein',
    servingLabel: '100 g cooked', calories: 105, proteinG: 23, carbsG: 0, fatG: 0.9,
    allergens: ['fish'], tags: ['high_protein', 'low_carb', 'low_fat'], isCustom: false,
  },
  {
    id: 'food-sardines', name: 'Sardines (canned in oil)', category: 'protein',
    servingLabel: '1 can drained (92 g)', calories: 191, proteinG: 22.7, carbsG: 0, fatG: 10.5,
    allergens: ['fish'], tags: ['high_protein', 'low_carb', 'quick'], isCustom: false,
  },
  {
    id: 'food-shrimp', name: 'Shrimp', category: 'protein',
    servingLabel: '100 g cooked', calories: 99, proteinG: 24, carbsG: 0.2, fatG: 0.3,
    allergens: ['shellfish'], tags: ['high_protein', 'low_carb', 'low_fat'], isCustom: false,
  },
  {
    id: 'food-egg', name: 'Whole Egg', category: 'protein',
    servingLabel: '1 large egg', calories: 72, proteinG: 6.3, carbsG: 0.4, fatG: 4.8,
    allergens: ['eggs'], tags: ['low_carb', 'breakfast', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-egg-whites', name: 'Egg Whites', category: 'protein',
    servingLabel: '3 large egg whites', calories: 51, proteinG: 10.8, carbsG: 0.7, fatG: 0.2,
    allergens: ['eggs'], tags: ['low_carb', 'low_fat', 'breakfast', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-whey-protein', name: 'Whey Protein Powder', category: 'protein',
    servingLabel: '1 scoop (30 g)', calories: 120, proteinG: 24, carbsG: 3, fatG: 1.5,
    allergens: ['dairy'], tags: ['high_protein', 'low_carb', 'low_fat', 'post_workout', 'quick', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-casein-protein', name: 'Casein Protein Powder', category: 'protein',
    servingLabel: '1 scoop (33 g)', calories: 120, proteinG: 24, carbsG: 3, fatG: 1,
    allergens: ['dairy'], tags: ['high_protein', 'low_carb', 'low_fat', 'quick', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-greek-yogurt-nonfat', name: 'Greek Yogurt (nonfat, plain)', category: 'protein',
    servingLabel: '1 cup (245 g)', calories: 140, proteinG: 24, carbsG: 9, fatG: 0.7,
    allergens: ['dairy'], tags: ['high_protein', 'low_carb', 'low_fat', 'breakfast', 'quick', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-cottage-cheese', name: 'Cottage Cheese (low-fat)', category: 'protein',
    servingLabel: '1 cup (226 g)', calories: 183, proteinG: 24, carbsG: 11, fatG: 5,
    allergens: ['dairy'], tags: ['high_protein', 'quick', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-tofu-firm', name: 'Tofu (firm)', category: 'protein',
    servingLabel: '100 g', calories: 80, proteinG: 9, carbsG: 2, fatG: 4.5,
    allergens: ['soy'], tags: ['low_carb', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-tempeh', name: 'Tempeh', category: 'protein',
    servingLabel: '100 g', calories: 192, proteinG: 20, carbsG: 8, fatG: 11,
    allergens: ['soy'], tags: ['high_protein', 'low_carb', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-edamame', name: 'Edamame (shelled)', category: 'protein',
    servingLabel: '1 cup (155 g)', calories: 188, proteinG: 18.5, carbsG: 13.8, fatG: 8.1, fiberG: 8,
    allergens: ['soy'], tags: ['high_fiber', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-lentils', name: 'Lentils', category: 'protein',
    servingLabel: '1 cup cooked (198 g)', calories: 230, proteinG: 18, carbsG: 40, fatG: 0.8, fiberG: 15.6,
    allergens: [], tags: ['low_fat', 'high_fiber', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-black-beans', name: 'Black Beans', category: 'protein',
    servingLabel: '1 cup cooked (172 g)', calories: 227, proteinG: 15, carbsG: 41, fatG: 0.9, fiberG: 15,
    allergens: [], tags: ['low_fat', 'high_fiber', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-chickpeas', name: 'Chickpeas', category: 'protein',
    servingLabel: '1 cup cooked (164 g)', calories: 269, proteinG: 14.5, carbsG: 45, fatG: 4.2, fiberG: 12.5,
    allergens: [], tags: ['high_fiber', 'vegan', 'vegetarian'], isCustom: false,
  },

  // ---------- Grains & starchy carbs ----------
  {
    id: 'food-white-rice', name: 'White Rice', category: 'grain',
    servingLabel: '1 cup cooked (158 g)', calories: 205, proteinG: 4.3, carbsG: 44.5, fatG: 0.4,
    allergens: [], tags: ['low_fat', 'post_workout', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-brown-rice', name: 'Brown Rice', category: 'grain',
    servingLabel: '1 cup cooked (195 g)', calories: 248, proteinG: 5.5, carbsG: 51.7, fatG: 2, fiberG: 3.2,
    allergens: [], tags: ['low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-oats', name: 'Rolled Oats', category: 'grain',
    servingLabel: '1/2 cup dry (40 g)', calories: 150, proteinG: 5.3, carbsG: 27.4, fatG: 2.6, fiberG: 4.1,
    allergens: [], tags: ['low_fat', 'breakfast', 'pre_workout', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-quinoa', name: 'Quinoa', category: 'grain',
    servingLabel: '1 cup cooked (185 g)', calories: 222, proteinG: 8.1, carbsG: 39.4, fatG: 3.6, fiberG: 5.2,
    allergens: [], tags: ['high_fiber', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-pasta', name: 'Pasta (white)', category: 'grain',
    servingLabel: '1 cup cooked (140 g)', calories: 220, proteinG: 8.1, carbsG: 43.2, fatG: 1.3, fiberG: 2.5,
    allergens: ['gluten'], tags: ['low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-pasta-whole-wheat', name: 'Whole Wheat Pasta', category: 'grain',
    servingLabel: '1 cup cooked (140 g)', calories: 174, proteinG: 7.5, carbsG: 37, fatG: 1, fiberG: 6,
    allergens: ['gluten'], tags: ['low_fat', 'high_fiber', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-whole-wheat-bread', name: 'Whole Wheat Bread', category: 'grain',
    servingLabel: '1 slice (32 g)', calories: 82, proteinG: 4, carbsG: 13.7, fatG: 1.1, fiberG: 1.9,
    allergens: ['gluten'], tags: ['low_fat', 'breakfast', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-white-bread', name: 'White Bread', category: 'grain',
    servingLabel: '1 slice (28 g)', calories: 75, proteinG: 2.6, carbsG: 14.2, fatG: 1,
    allergens: ['gluten'], tags: ['low_fat', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-flour-tortilla', name: 'Flour Tortilla', category: 'grain',
    servingLabel: '1 large 10-in (70 g)', calories: 210, proteinG: 5.7, carbsG: 35.9, fatG: 5.2,
    allergens: ['gluten'], tags: ['quick', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-corn-tortillas', name: 'Corn Tortillas', category: 'grain',
    servingLabel: '2 tortillas (50 g)', calories: 109, proteinG: 2.8, carbsG: 22.4, fatG: 1.4, fiberG: 3.1,
    allergens: [], tags: ['low_fat', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-baked-potato', name: 'Baked Potato (russet)', category: 'grain',
    servingLabel: '1 medium (173 g)', calories: 161, proteinG: 4.3, carbsG: 36.6, fatG: 0.2, fiberG: 3.8,
    allergens: [], tags: ['low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-sweet-potato', name: 'Sweet Potato', category: 'grain',
    servingLabel: '1 medium baked (150 g)', calories: 135, proteinG: 3, carbsG: 31.2, fatG: 0.2, fiberG: 5,
    allergens: [], tags: ['low_fat', 'high_fiber', 'pre_workout', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-bagel', name: 'Bagel (plain)', category: 'grain',
    servingLabel: '1 bagel (105 g)', calories: 289, proteinG: 11.1, carbsG: 56.1, fatG: 1.7,
    allergens: ['gluten'], tags: ['low_fat', 'breakfast', 'pre_workout', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-bran-flakes', name: 'Bran Flakes Cereal', category: 'grain',
    servingLabel: '1 cup (39 g)', calories: 135, proteinG: 4, carbsG: 32, fatG: 1, fiberG: 7,
    allergens: ['gluten'], tags: ['low_fat', 'high_fiber', 'breakfast', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-english-muffin', name: 'English Muffin (whole wheat)', category: 'grain',
    servingLabel: '1 muffin (57 g)', calories: 134, proteinG: 5.8, carbsG: 26.7, fatG: 1.4, fiberG: 4.4,
    allergens: ['gluten'], tags: ['low_fat', 'breakfast', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },

  // ---------- Fruits ----------
  {
    id: 'food-banana', name: 'Banana', category: 'fruit',
    servingLabel: '1 medium (118 g)', calories: 105, proteinG: 1.3, carbsG: 27, fatG: 0.4, fiberG: 3.1,
    allergens: [], tags: ['low_fat', 'quick', 'pre_workout', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-apple', name: 'Apple', category: 'fruit',
    servingLabel: '1 medium (182 g)', calories: 95, proteinG: 0.5, carbsG: 25.1, fatG: 0.3, fiberG: 4.4,
    allergens: [], tags: ['low_fat', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-orange', name: 'Orange', category: 'fruit',
    servingLabel: '1 medium (131 g)', calories: 62, proteinG: 1.2, carbsG: 15.4, fatG: 0.2, fiberG: 3.1,
    allergens: [], tags: ['low_fat', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-blueberries', name: 'Blueberries', category: 'fruit',
    servingLabel: '1 cup (148 g)', calories: 84, proteinG: 1.1, carbsG: 21.4, fatG: 0.5, fiberG: 3.6,
    allergens: [], tags: ['low_fat', 'breakfast', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-strawberries', name: 'Strawberries', category: 'fruit',
    servingLabel: '1 cup sliced (166 g)', calories: 53, proteinG: 1.1, carbsG: 12.7, fatG: 0.5, fiberG: 3.3,
    allergens: [], tags: ['low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-raspberries', name: 'Raspberries', category: 'fruit',
    servingLabel: '1 cup (123 g)', calories: 64, proteinG: 1.5, carbsG: 14.7, fatG: 0.8, fiberG: 8,
    allergens: [], tags: ['low_fat', 'high_fiber', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-grapes', name: 'Grapes', category: 'fruit',
    servingLabel: '1 cup (151 g)', calories: 104, proteinG: 1.1, carbsG: 27.3, fatG: 0.2, fiberG: 1.4,
    allergens: [], tags: ['low_fat', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-watermelon', name: 'Watermelon', category: 'fruit',
    servingLabel: '1 cup diced (152 g)', calories: 46, proteinG: 0.9, carbsG: 11.5, fatG: 0.2,
    allergens: [], tags: ['low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-pineapple', name: 'Pineapple', category: 'fruit',
    servingLabel: '1 cup chunks (165 g)', calories: 83, proteinG: 0.9, carbsG: 21.6, fatG: 0.2, fiberG: 2.3,
    allergens: [], tags: ['low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-mango', name: 'Mango', category: 'fruit',
    servingLabel: '1 cup pieces (165 g)', calories: 99, proteinG: 1.4, carbsG: 24.7, fatG: 0.6, fiberG: 2.6,
    allergens: [], tags: ['low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-peach', name: 'Peach', category: 'fruit',
    servingLabel: '1 medium (150 g)', calories: 59, proteinG: 1.4, carbsG: 14.3, fatG: 0.4, fiberG: 2.3,
    allergens: [], tags: ['low_fat', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-pear', name: 'Pear', category: 'fruit',
    servingLabel: '1 medium (178 g)', calories: 101, proteinG: 0.6, carbsG: 27, fatG: 0.2, fiberG: 5.5,
    allergens: [], tags: ['low_fat', 'high_fiber', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-kiwi', name: 'Kiwi', category: 'fruit',
    servingLabel: '2 fruits (138 g)', calories: 84, proteinG: 1.6, carbsG: 20.2, fatG: 0.7, fiberG: 4.1,
    allergens: [], tags: ['low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-raisins', name: 'Raisins', category: 'fruit',
    servingLabel: '1/4 cup (40 g)', calories: 120, proteinG: 1.2, carbsG: 31.7, fatG: 0.2, fiberG: 1.6,
    allergens: [], tags: ['low_fat', 'quick', 'pre_workout', 'vegan', 'vegetarian'], isCustom: false,
  },

  // ---------- Vegetables ----------
  {
    id: 'food-broccoli', name: 'Broccoli', category: 'vegetable',
    servingLabel: '1 cup cooked (156 g)', calories: 60, proteinG: 4, carbsG: 11.2, fatG: 0.7, fiberG: 5.1,
    allergens: [], tags: ['low_fat', 'high_fiber', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-spinach', name: 'Spinach (raw)', category: 'vegetable',
    servingLabel: '2 cups (60 g)', calories: 16, proteinG: 1.7, carbsG: 2.2, fatG: 0.2, fiberG: 1.3,
    allergens: [], tags: ['low_carb', 'low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-carrots', name: 'Carrots', category: 'vegetable',
    servingLabel: '1 cup chopped (128 g)', calories: 52, proteinG: 1.2, carbsG: 12.3, fatG: 0.3, fiberG: 3.6,
    allergens: [], tags: ['low_fat', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-bell-pepper', name: 'Bell Pepper', category: 'vegetable',
    servingLabel: '1 medium (119 g)', calories: 34, proteinG: 1.2, carbsG: 7.2, fatG: 0.4, fiberG: 2.5,
    allergens: [], tags: ['low_carb', 'low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-cucumber', name: 'Cucumber', category: 'vegetable',
    servingLabel: '1 cup sliced (104 g)', calories: 18, proteinG: 0.7, carbsG: 3.8, fatG: 0.1,
    allergens: [], tags: ['low_carb', 'low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-tomato', name: 'Tomato', category: 'vegetable',
    servingLabel: '1 medium (123 g)', calories: 24, proteinG: 1.1, carbsG: 4.8, fatG: 0.2, fiberG: 1.5,
    allergens: [], tags: ['low_carb', 'low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-romaine-lettuce', name: 'Romaine Lettuce', category: 'vegetable',
    servingLabel: '2 cups shredded (94 g)', calories: 18, proteinG: 1.2, carbsG: 3.1, fatG: 0.3, fiberG: 2,
    allergens: [], tags: ['low_carb', 'low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-green-beans', name: 'Green Beans', category: 'vegetable',
    servingLabel: '1 cup cooked (125 g)', calories: 48, proteinG: 2.4, carbsG: 9.8, fatG: 0.4, fiberG: 4,
    allergens: [], tags: ['low_carb', 'low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-asparagus', name: 'Asparagus', category: 'vegetable',
    servingLabel: '1 cup cooked (180 g)', calories: 45, proteinG: 4.3, carbsG: 7.4, fatG: 0.4, fiberG: 3.6,
    allergens: [], tags: ['low_carb', 'low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-zucchini', name: 'Zucchini', category: 'vegetable',
    servingLabel: '1 cup cooked (180 g)', calories: 30, proteinG: 2, carbsG: 4.8, fatG: 0.6, fiberG: 2,
    allergens: [], tags: ['low_carb', 'low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-cauliflower', name: 'Cauliflower', category: 'vegetable',
    servingLabel: '1 cup chopped (107 g)', calories: 29, proteinG: 2, carbsG: 5.3, fatG: 0.3, fiberG: 2.1,
    allergens: [], tags: ['low_carb', 'low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-brussels-sprouts', name: 'Brussels Sprouts', category: 'vegetable',
    servingLabel: '1 cup cooked (156 g)', calories: 62, proteinG: 4, carbsG: 11, fatG: 0.8, fiberG: 4.1,
    allergens: [], tags: ['low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-kale', name: 'Kale', category: 'vegetable',
    servingLabel: '1 cup cooked (118 g)', calories: 40, proteinG: 2.5, carbsG: 7.3, fatG: 0.5, fiberG: 2.6,
    allergens: [], tags: ['low_carb', 'low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-mushrooms', name: 'Mushrooms (white)', category: 'vegetable',
    servingLabel: '1 cup sliced (70 g)', calories: 18, proteinG: 2.2, carbsG: 2.3, fatG: 0.2,
    allergens: [], tags: ['low_carb', 'low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-onion', name: 'Onion', category: 'vegetable',
    servingLabel: '1/2 cup chopped (80 g)', calories: 32, proteinG: 0.9, carbsG: 7.5, fatG: 0.1, fiberG: 1.4,
    allergens: [], tags: ['low_carb', 'low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-mixed-vegetables', name: 'Mixed Vegetables (frozen)', category: 'vegetable',
    servingLabel: '1 cup cooked (160 g)', calories: 62, proteinG: 2.6, carbsG: 11.9, fatG: 0.5, fiberG: 4,
    allergens: [], tags: ['low_fat', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },

  // ---------- Dairy ----------
  {
    id: 'food-whole-milk', name: 'Whole Milk', category: 'dairy',
    servingLabel: '1 cup (244 g)', calories: 149, proteinG: 7.7, carbsG: 11.7, fatG: 8,
    allergens: ['dairy'], tags: ['quick', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-milk-2-percent', name: 'Milk (2%)', category: 'dairy',
    servingLabel: '1 cup (244 g)', calories: 122, proteinG: 8, carbsG: 12, fatG: 4.8,
    allergens: ['dairy'], tags: ['quick', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-skim-milk', name: 'Skim Milk', category: 'dairy',
    servingLabel: '1 cup (245 g)', calories: 83, proteinG: 8.3, carbsG: 12.2, fatG: 0.2,
    allergens: ['dairy'], tags: ['low_fat', 'quick', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-cheddar-cheese', name: 'Cheddar Cheese', category: 'dairy',
    servingLabel: '1 oz (28 g)', calories: 113, proteinG: 6.4, carbsG: 0.9, fatG: 9.3,
    allergens: ['dairy'], tags: ['low_carb', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-mozzarella', name: 'Mozzarella (part-skim)', category: 'dairy',
    servingLabel: '1 oz (28 g)', calories: 72, proteinG: 6.9, carbsG: 0.8, fatG: 4.5,
    allergens: ['dairy'], tags: ['low_carb', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-string-cheese', name: 'String Cheese', category: 'dairy',
    servingLabel: '1 stick (28 g)', calories: 80, proteinG: 6.7, carbsG: 1, fatG: 6,
    allergens: ['dairy'], tags: ['low_carb', 'quick', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-parmesan', name: 'Parmesan (grated)', category: 'dairy',
    servingLabel: '2 tbsp (10 g)', calories: 42, proteinG: 3.8, carbsG: 0.3, fatG: 2.8,
    allergens: ['dairy'], tags: ['low_carb', 'low_fat', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-yogurt-plain', name: 'Yogurt (plain, whole milk)', category: 'dairy',
    servingLabel: '1 cup (245 g)', calories: 149, proteinG: 8.5, carbsG: 11.4, fatG: 8,
    allergens: ['dairy'], tags: ['breakfast', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-greek-yogurt-whole', name: 'Greek Yogurt (whole milk)', category: 'dairy',
    servingLabel: '1 cup (245 g)', calories: 220, proteinG: 20, carbsG: 9, fatG: 11,
    allergens: ['dairy'], tags: ['high_protein', 'low_carb', 'breakfast', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-cream-cheese', name: 'Cream Cheese', category: 'dairy',
    servingLabel: '2 tbsp (30 g)', calories: 100, proteinG: 1.8, carbsG: 1.6, fatG: 10,
    allergens: ['dairy'], tags: ['low_carb', 'vegetarian'], isCustom: false,
  },

  // ---------- Fats, nuts & seeds ----------
  {
    id: 'food-olive-oil', name: 'Olive Oil', category: 'fat',
    servingLabel: '1 tbsp (14 g)', calories: 119, proteinG: 0, carbsG: 0, fatG: 13.5,
    allergens: [], tags: ['low_carb', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-coconut-oil', name: 'Coconut Oil', category: 'fat',
    servingLabel: '1 tbsp (14 g)', calories: 117, proteinG: 0, carbsG: 0, fatG: 13.5,
    allergens: [], tags: ['low_carb', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-butter', name: 'Butter', category: 'fat',
    servingLabel: '1 tbsp (14 g)', calories: 102, proteinG: 0.1, carbsG: 0, fatG: 11.5,
    allergens: ['dairy'], tags: ['low_carb', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-mayonnaise', name: 'Mayonnaise', category: 'fat',
    servingLabel: '1 tbsp (14 g)', calories: 94, proteinG: 0.1, carbsG: 0.1, fatG: 10.3,
    allergens: ['eggs'], tags: ['low_carb', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-avocado', name: 'Avocado', category: 'fat',
    servingLabel: '1/2 medium (75 g)', calories: 120, proteinG: 1.5, carbsG: 6.4, fatG: 11, fiberG: 5,
    allergens: [], tags: ['low_carb', 'high_fiber', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-almonds', name: 'Almonds', category: 'fat',
    servingLabel: '1 oz (28 g, ~23 nuts)', calories: 164, proteinG: 6, carbsG: 6.1, fatG: 14.2, fiberG: 3.5,
    allergens: ['tree_nuts'], tags: ['low_carb', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-walnuts', name: 'Walnuts', category: 'fat',
    servingLabel: '1 oz (28 g)', calories: 185, proteinG: 4.3, carbsG: 3.9, fatG: 18.5, fiberG: 1.9,
    allergens: ['tree_nuts'], tags: ['low_carb', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-cashews', name: 'Cashews', category: 'fat',
    servingLabel: '1 oz (28 g)', calories: 157, proteinG: 5.2, carbsG: 8.6, fatG: 12.4, fiberG: 0.9,
    allergens: ['tree_nuts'], tags: ['low_carb', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-peanut-butter', name: 'Peanut Butter', category: 'fat',
    servingLabel: '2 tbsp (32 g)', calories: 190, proteinG: 8, carbsG: 7, fatG: 16, fiberG: 1.9,
    allergens: ['peanuts'], tags: ['low_carb', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-almond-butter', name: 'Almond Butter', category: 'fat',
    servingLabel: '2 tbsp (32 g)', calories: 196, proteinG: 6.7, carbsG: 6, fatG: 17.8, fiberG: 3.3,
    allergens: ['tree_nuts'], tags: ['low_carb', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-chia-seeds', name: 'Chia Seeds', category: 'fat',
    servingLabel: '2 tbsp (28 g)', calories: 138, proteinG: 4.7, carbsG: 12, fatG: 8.7, fiberG: 9.8,
    allergens: [], tags: ['high_fiber', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-flaxseed', name: 'Flaxseed (ground)', category: 'fat',
    servingLabel: '2 tbsp (14 g)', calories: 75, proteinG: 2.6, carbsG: 4, fatG: 5.9, fiberG: 3.8,
    allergens: [], tags: ['low_carb', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-pumpkin-seeds', name: 'Pumpkin Seeds', category: 'fat',
    servingLabel: '1 oz (28 g)', calories: 158, proteinG: 8.6, carbsG: 3, fatG: 13.9, fiberG: 1.7,
    allergens: [], tags: ['low_carb', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },

  // ---------- Snacks ----------
  {
    id: 'food-protein-bar', name: 'Protein Bar', category: 'snack',
    servingLabel: '1 bar (60 g)', calories: 210, proteinG: 20, carbsG: 22, fatG: 7, fiberG: 3,
    allergens: ['dairy', 'soy'], tags: ['high_protein', 'quick', 'post_workout', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-rice-cakes', name: 'Rice Cakes (plain)', category: 'snack',
    servingLabel: '2 cakes (18 g)', calories: 70, proteinG: 1.5, carbsG: 14.6, fatG: 0.5,
    allergens: [], tags: ['low_fat', 'quick', 'pre_workout', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-dark-chocolate', name: 'Dark Chocolate (70%)', category: 'snack',
    servingLabel: '1 oz (28 g)', calories: 170, proteinG: 2.2, carbsG: 13, fatG: 12.2, fiberG: 3.1,
    allergens: [], tags: ['quick', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-popcorn', name: 'Popcorn (air-popped)', category: 'snack',
    servingLabel: '3 cups popped (24 g)', calories: 93, proteinG: 3, carbsG: 18.6, fatG: 1.1, fiberG: 3.6,
    allergens: [], tags: ['low_fat', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-beef-jerky', name: 'Beef Jerky', category: 'snack',
    // Most commercial jerky is marinated in soy sauce.
    servingLabel: '1 oz (28 g)', calories: 82, proteinG: 9.4, carbsG: 6.3, fatG: 1.1,
    allergens: ['soy'], tags: ['low_carb', 'low_fat', 'quick'], isCustom: false,
  },
  {
    id: 'food-hummus', name: 'Hummus', category: 'snack',
    // Contains tahini (sesame paste).
    servingLabel: '1/4 cup (60 g)', calories: 100, proteinG: 4.7, carbsG: 8.6, fatG: 5.8, fiberG: 3.4,
    allergens: ['sesame'], tags: ['low_carb', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-wheat-crackers', name: 'Whole Wheat Crackers', category: 'snack',
    servingLabel: '6 crackers (28 g)', calories: 120, proteinG: 2.5, carbsG: 19, fatG: 4, fiberG: 2.9,
    allergens: ['gluten'], tags: ['quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-pretzels', name: 'Pretzels', category: 'snack',
    servingLabel: '1 oz (28 g)', calories: 108, proteinG: 2.9, carbsG: 22.5, fatG: 0.8,
    allergens: ['gluten'], tags: ['low_fat', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-tortilla-chips', name: 'Tortilla Chips', category: 'snack',
    servingLabel: '1 oz (28 g)', calories: 138, proteinG: 2, carbsG: 19, fatG: 6.5, fiberG: 1.2,
    allergens: [], tags: ['quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-trail-mix', name: 'Trail Mix', category: 'snack',
    servingLabel: '1/4 cup (35 g)', calories: 175, proteinG: 5, carbsG: 16, fatG: 11, fiberG: 2,
    allergens: ['tree_nuts', 'peanuts'], tags: ['quick', 'vegetarian'], isCustom: false,
  },

  // ---------- Beverages ----------
  {
    id: 'food-chocolate-milk', name: 'Chocolate Milk (low-fat)', category: 'beverage',
    servingLabel: '1 cup (250 g)', calories: 158, proteinG: 8, carbsG: 26, fatG: 2.5,
    allergens: ['dairy'], tags: ['low_fat', 'post_workout', 'quick', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-orange-juice', name: 'Orange Juice', category: 'beverage',
    servingLabel: '1 cup (248 g)', calories: 112, proteinG: 1.7, carbsG: 25.8, fatG: 0.5,
    allergens: [], tags: ['low_fat', 'breakfast', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-sports-drink', name: 'Sports Drink', category: 'beverage',
    servingLabel: '12 fl oz (355 ml)', calories: 80, proteinG: 0, carbsG: 21, fatG: 0,
    allergens: [], tags: ['low_fat', 'pre_workout', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-beer', name: 'Beer (regular lager)', category: 'beverage',
    // ~13 g of alcohol contributes ~96 kcal beyond protein/carb/fat.
    servingLabel: '12 fl oz (355 ml)', calories: 153, proteinG: 1.6, carbsG: 12.6, fatG: 0,
    allergens: ['gluten'], tags: ['low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-almond-milk', name: 'Almond Milk (unsweetened)', category: 'beverage',
    servingLabel: '1 cup (240 ml)', calories: 30, proteinG: 1, carbsG: 1, fatG: 2.5,
    allergens: ['tree_nuts'], tags: ['low_carb', 'low_fat', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-oat-milk', name: 'Oat Milk', category: 'beverage',
    servingLabel: '1 cup (240 ml)', calories: 120, proteinG: 3, carbsG: 16, fatG: 5, fiberG: 2,
    allergens: [], tags: ['quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-protein-shake-rtd', name: 'Protein Shake (ready-to-drink)', category: 'beverage',
    servingLabel: '1 bottle (11 fl oz)', calories: 160, proteinG: 30, carbsG: 5, fatG: 3,
    allergens: ['dairy'], tags: ['high_protein', 'low_carb', 'low_fat', 'post_workout', 'quick', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-coconut-water', name: 'Coconut Water', category: 'beverage',
    servingLabel: '1 cup (240 ml)', calories: 46, proteinG: 1.8, carbsG: 9, fatG: 0.5,
    allergens: [], tags: ['low_carb', 'low_fat', 'quick', 'vegan', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-kefir', name: 'Kefir (low-fat)', category: 'beverage',
    servingLabel: '1 cup (240 ml)', calories: 104, proteinG: 9, carbsG: 12, fatG: 2.5,
    allergens: ['dairy'], tags: ['low_fat', 'breakfast', 'quick', 'vegetarian'], isCustom: false,
  },

  // ---------- Simple meals (summed macros) ----------
  {
    id: 'food-chicken-rice-bowl', name: 'Chicken & Rice Bowl', category: 'meal',
    servingLabel: '1 bowl (150 g chicken + 1 cup rice + veg)', calories: 500, proteinG: 50, carbsG: 48, fatG: 8, fiberG: 3,
    allergens: [], tags: ['high_protein', 'post_workout'], isCustom: false,
  },
  {
    id: 'food-oatmeal-with-protein', name: 'Oatmeal with Protein Powder', category: 'meal',
    servingLabel: '1 bowl (1/2 cup oats + 1 scoop whey)', calories: 270, proteinG: 29, carbsG: 30, fatG: 4, fiberG: 4.1,
    allergens: ['dairy'], tags: ['high_protein', 'breakfast', 'pre_workout', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-pbj-sandwich', name: 'PB&J Sandwich', category: 'meal',
    servingLabel: '1 sandwich (2 slices bread + 2 tbsp PB + jelly)', calories: 390, proteinG: 13, carbsG: 48, fatG: 18, fiberG: 4,
    allergens: ['gluten', 'peanuts'], tags: ['quick', 'pre_workout', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-burrito-bowl', name: 'Chicken Burrito Bowl', category: 'meal',
    servingLabel: '1 bowl (chicken, rice, black beans, cheese, salsa)', calories: 650, proteinG: 45, carbsG: 65, fatG: 22, fiberG: 8,
    allergens: ['dairy'], tags: ['high_protein', 'high_fiber'], isCustom: false,
  },
  {
    id: 'food-tuna-sandwich', name: 'Tuna Salad Sandwich', category: 'meal',
    servingLabel: '1 sandwich (2 slices bread + tuna + mayo)', calories: 360, proteinG: 32, carbsG: 30, fatG: 13, fiberG: 4,
    allergens: ['gluten', 'fish', 'eggs'], tags: ['high_protein', 'quick'], isCustom: false,
  },
  {
    id: 'food-eggs-and-toast', name: 'Eggs & Toast', category: 'meal',
    servingLabel: '3 eggs + 2 slices whole wheat toast + butter', calories: 410, proteinG: 26, carbsG: 29, fatG: 21, fiberG: 4,
    allergens: ['eggs', 'gluten', 'dairy'], tags: ['high_protein', 'breakfast', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-protein-smoothie', name: 'Protein Smoothie', category: 'meal',
    servingLabel: '1 smoothie (whey + banana + milk + PB)', calories: 440, proteinG: 37, carbsG: 46, fatG: 15, fiberG: 4,
    allergens: ['dairy', 'peanuts'], tags: ['high_protein', 'post_workout', 'breakfast', 'quick', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-greek-yogurt-parfait', name: 'Greek Yogurt Parfait', category: 'meal',
    servingLabel: '1 cup greek yogurt + berries + granola', calories: 320, proteinG: 27, carbsG: 45, fatG: 4, fiberG: 4,
    allergens: ['dairy'], tags: ['high_protein', 'breakfast', 'quick', 'vegetarian'], isCustom: false,
  },
  {
    id: 'food-steak-and-potatoes', name: 'Steak & Potatoes', category: 'meal',
    servingLabel: '170 g sirloin + 1 baked potato + butter', calories: 600, proteinG: 53, carbsG: 37, fatG: 27, fiberG: 4,
    allergens: ['dairy'], tags: ['high_protein'], isCustom: false,
  },
  {
    id: 'food-salmon-quinoa-bowl', name: 'Salmon & Quinoa Bowl', category: 'meal',
    servingLabel: '1 bowl (140 g salmon + 1 cup quinoa + greens)', calories: 550, proteinG: 40, carbsG: 45, fatG: 22, fiberG: 7,
    allergens: ['fish'], tags: ['high_protein', 'high_fiber'], isCustom: false,
  },
];
