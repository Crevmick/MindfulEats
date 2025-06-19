import Meal from '../model/mealLog.js'; // Adjusted path

const foodToCategory = {
  // Fruits
  "apple": "fruit",
  "banana": "fruit",
  "orange": "fruit",
  "grapes": "fruit",
  "strawberry": "fruit",
  "blueberry": "fruit",
  "raspberry": "fruit",
  "mango": "fruit",
  "pineapple": "fruit",
  "watermelon": "fruit",
  // Vegetables
  "broccoli": "vegetable",
  "carrot": "vegetable",
  "spinach": "vegetable",
  "lettuce": "vegetable",
  "tomato": "vegetable",
  "cucumber": "vegetable",
  "bell pepper": "vegetable",
  "onion": "vegetable",
  "garlic": "vegetable",
  "potato": "vegetable_starchy",
  "sweet potato": "vegetable_starchy",
  // Grains
  "bread": "grain", // general bread
  "white bread": "grain_refined",
  "whole wheat bread": "grain_whole",
  "rice": "grain", // general rice
  "white rice": "grain_refined",
  "brown rice": "grain_whole",
  "pasta": "grain", // general pasta, can be refined
  "whole wheat pasta": "grain_whole",
  "oats": "grain_whole",
  "quinoa": "grain_whole",
  "cereal": "grain", // general cereal
  "sugary cereal": "sweets", // more specific
  // Proteins
  "chicken": "protein",
  "beef": "protein",
  "pork": "protein",
  "fish": "protein",
  "salmon": "protein",
  "tuna": "protein",
  "eggs": "protein",
  "beans": "protein_plant", // also a legume/vegetable
  "lentils": "protein_plant", // also a legume/vegetable
  "tofu": "protein_plant",
  "tempeh": "protein_plant",
  // Dairy & Alternatives
  "milk": "dairy",
  "cheese": "dairy",
  "yogurt": "dairy",
  "almond milk": "dairy_alternative",
  "soy milk": "dairy_alternative",
  "oat milk": "dairy_alternative",
  // Fats & Oils
  "butter": "fat",
  "olive oil": "fat",
  "avocado": "fat", // also a fruit
  "nuts": "fat_healthy", // e.g., almonds, walnuts, cashews
  "seeds": "fat_healthy", // e.g., chia seeds, flax seeds, sunflower seeds
  // Sweets & Processed Snacks
  "cake": "sweets",
  "cookies": "sweets",
  "ice cream": "sweets",
  "chocolate": "sweets", // dark chocolate can be okay, but generally sugary
  "candy": "sweets",
  "pastry": "sweets",
  "chips": "snacks_processed",
  "soda": "beverage_sugary",
  // Beverages
  "water": "beverage",
  "coffee": "beverage",
  "tea": "beverage",
};

function getFoodCategory(foodName) {
  if (!foodName) {
    return "unknown";
  }
  const lowerFoodName = foodName.toLowerCase();
  for (const food in foodToCategory) {
    if (lowerFoodName.includes(food)) {
      return foodToCategory[food];
    }
  }
  return "unknown";
}

function mapPortionToQuantitative(portionString) {
  if (!portionString) {
    return null;
  }
  const lowerPortion = portionString.toLowerCase();
  if (lowerPortion.includes("small")) return 1;
  if (lowerPortion.includes("medium")) return 2;
  if (lowerPortion.includes("large")) return 3;
  if (lowerPortion.includes("1 cup") || lowerPortion.includes("one cup")) return 2;
  if (lowerPortion.includes("1/2 cup") || lowerPortion.includes("half cup")) return 1;
  const match = lowerPortion.match(/(\d+(\.\d+)?)/);
  if (match && match[1]) {
    return parseFloat(match[1]);
  }
  return 1;
}

function detectFrequentSnacking(meals, actualDaysWithLogging) {
  if (!meals || meals.length === 0 || actualDaysWithLogging === 0) {
    return null;
  }
  const snacks = meals.filter(meal => meal.mealType === 'snack');
  const totalSnacks = snacks.length;
  const avgSnacks = totalSnacks / actualDaysWithLogging;

  if (avgSnacks > 2) {
    return {
      name: "Frequent Snacking",
      detected: true,
      details: `Average of ${avgSnacks.toFixed(1)} snacks per day over ${actualDaysWithLogging} day(s) with logs.`
    };
  }
  return null;
}

function detectSkippingBreakfast(meals, actualDaysWithLogging) {
  if (!meals || meals.length === 0 || actualDaysWithLogging === 0) {
    return null;
  }

  const mealsByDate = {};
  meals.forEach(meal => {
    const mealDate = new Date(meal.createdAt).toISOString().split('T')[0];
    if (!mealsByDate[mealDate]) {
      mealsByDate[mealDate] = [];
    }
    mealsByDate[mealDate].push(meal);
  });

  const uniqueLoggingDays = Object.keys(mealsByDate).length;
  if (uniqueLoggingDays === 0) return null;

  let skippedBreakfastDays = 0;
  for (const date in mealsByDate) {
    const hasBreakfast = mealsByDate[date].some(meal => meal.mealType === 'breakfast');
    if (!hasBreakfast) {
      skippedBreakfastDays++;
    }
  }

  if (skippedBreakfastDays > uniqueLoggingDays * 0.4) {
    return {
      name: "Skipping Breakfast",
      detected: true,
      details: `Skipped breakfast on ${skippedBreakfastDays} out of ${uniqueLoggingDays} day(s) with logs.`
    };
  }
  return null;
}

function detectHighIntake(meals, targetCategory, categoryDisplayName, mealFrequencyThreshold) {
  if (!meals || meals.length === 0) {
    return null;
  }
  const mealsWithCategory = meals.map(meal => ({
    ...meal,
    foodCategory: meal.foodCategory || getFoodCategory(meal.predictedFoodName)
  }));

  const matchingMeals = mealsWithCategory.filter(meal => meal.foodCategory === targetCategory);
  const percentage = matchingMeals.length / meals.length;

  if (percentage > mealFrequencyThreshold) {
    return {
      name: `High Intake of ${categoryDisplayName}`,
      detected: true,
      details: `${(percentage * 100).toFixed(0)}% of logged meals included ${categoryDisplayName}.`
    };
  }
  return null;
}

function analyzeOverallCarbIntake(meals) {
  if (!meals || meals.length === 0) {
    return null;
  }
  const sugarySnackPattern = detectHighIntake(meals, 'sweets', 'Sugary Foods/Snacks', 0.2);
  if (sugarySnackPattern) {
    return sugarySnackPattern;
  }

  const refinedGrainPattern = detectHighIntake(meals, 'grain_refined', 'Refined Grains', 0.3);
  if (refinedGrainPattern) {
    return refinedGrainPattern;
  }
  return null;
}

function generateInsights(detectedPatterns) {
  const insights = [];
  if (!detectedPatterns || detectedPatterns.length === 0) {
      insights.push("Based on your recent logs, no specific dietary patterns requiring immediate attention were flagged. Keep up the mindful logging!");
      return insights;
  }

  let positiveDetections = 0;
  detectedPatterns.forEach(pattern => {
      if (!pattern || !pattern.detected) return;
      positiveDetections++;

      let insightMsg = "";
      switch (pattern.name) {
          case "Frequent Snacking":
              insightMsg = `Noticed frequent snacking: ${pattern.details}. Consider if these are hunger-driven or if healthier alternatives could be chosen.`;
              break;
          case "Skipping Breakfast":
              insightMsg = `Breakfast was skipped on several days: ${pattern.details}. A balanced breakfast can provide energy for the day.`;
              break;
          case "High Sugary Food/Snack Intake":
              insightMsg = `Sugary foods/snacks appear regularly: ${pattern.details}. These can affect energy levels; exploring alternatives might be beneficial.`;
              break;
          case "High Refined Grain Intake":
              insightMsg = `Refined grains are common in your meals: ${pattern.details}. Swapping for whole grains can boost fiber.`;
              break;
          case "High Intake of Processed Snacks":
              insightMsg = `Processed snacks are appearing frequently: ${pattern.details}. Whole foods are generally richer in nutrients.`;
              break;
          case "High Intake of Sugary Beverages":
              insightMsg = `Sugary drinks are noted in your logs: ${pattern.details}. Water or unsweetened beverages are healthier choices for hydration.`;
              break;
          default:
              if (pattern.name && pattern.name.startsWith("High Intake of")) {
                insightMsg = `${pattern.name} was noted: ${pattern.details}. Reflect on how this aligns with your dietary goals.`;
              } else {
                insightMsg = `A pattern regarding '${pattern.name}' was noted: ${pattern.details}. Reflect on how this aligns with your dietary goals.`;
              }
      }
      if (insightMsg) insights.push(insightMsg);
  });

  if (positiveDetections === 0) {
      insights.push("Your dietary habits seem balanced based on the patterns we track. Well done!");
  }
  return insights;
}

function generateRecommendations(detectedPatterns) {
    const recommendations = [];
    if (!detectedPatterns || detectedPatterns.length === 0) {
        recommendations.push("Continue to focus on balanced meals and mindful eating. Explore new healthy recipes to keep your meals interesting and nutritious!");
        return recommendations;
    }

    let positiveDetections = 0;
    detectedPatterns.forEach(pattern => {
        if (!pattern || !pattern.detected) return;
        positiveDetections++;

        let recMsg = "";
        switch (pattern.name) {
            case "Frequent Snacking":
                recMsg = "If hunger strikes between meals, try whole food snacks like fruits, nuts, or yogurt. Planning balanced meals can also help reduce the urge for frequent snacking.";
                break;
            case "Skipping Breakfast":
                recMsg = "Consider incorporating a quick, nutritious breakfast into your mornings. Even a piece of fruit with some nuts or a simple smoothie can provide a good start.";
                break;
            case "High Sugary Food/Snack Intake":
                recMsg = "To cut down on sugary snacks, keep healthier options like fruit or a small portion of dark chocolate handy. Gradually reducing portion sizes can also be effective.";
                break;
            case "High Refined Grain Intake":
                recMsg = "Try swapping refined grains for whole grain alternatives in your next meal, such as choosing whole wheat bread over white, or brown rice instead of white rice.";
                break;
            case "High Intake of Processed Snacks":
                recMsg = "Aim to replace one processed snack with a whole food option each day. Fruits, vegetables with hummus, or a handful of nuts are great choices.";
                break;
            case "High Intake of Sugary Beverages":
                recMsg = "Choose water, unsweetened tea, or sparkling water with a splash of fruit for hydration instead of sugary drinks. Keep a water bottle nearby as a reminder.";
                break;
            default:
                 if (pattern.name && pattern.name.startsWith("High Intake of")) {
                    recMsg = `For your intake of ${pattern.name.substring(15)}, consider exploring healthier alternatives or adjusting portion sizes. Small changes can make a big difference.`;
                } else {
                    recMsg = `For the pattern '${pattern.name}', consider exploring healthier alternatives or adjusting portion sizes. Small changes can make a big difference.`;
                }
        }
        if (recMsg) recommendations.push(recMsg);
    });

    if (positiveDetections === 0) {
        recommendations.push("Your current logs show balanced habits according to our tracked patterns. Keep up the great work and continue exploring nutritious food choices!");
    }
    return recommendations;
}

async function analyzeDietaryPatterns(userId, daysToAnalyze = 7) {
  try {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - daysToAnalyze);

    const meals = await Meal.find({
      userId: userId,
      createdAt: { $gte: startDate }
    }).lean();

    if (!meals || meals.length === 0) {
      return { patterns: [], insights: generateInsights([]), recommendations: generateRecommendations([]), summary: "No meal data found for the selected period." };
    }

    const mealDates = meals.map(meal => new Date(meal.createdAt).toISOString().split('T')[0]);
    const actualDaysWithLogging = new Set(mealDates).size;

    if (actualDaysWithLogging === 0) {
        return { patterns: [], insights: generateInsights([]), recommendations: generateRecommendations([]), summary: "No meal logs found for the specified period." };
    }

    const detectedPatterns = [];

    const frequentSnacking = detectFrequentSnacking(meals, actualDaysWithLogging);
    if (frequentSnacking) detectedPatterns.push(frequentSnacking);

    const skippingBreakfast = detectSkippingBreakfast(meals, actualDaysWithLogging);
    if (skippingBreakfast) detectedPatterns.push(skippingBreakfast);

    const highProcessedSnacks = detectHighIntake(meals, 'snacks_processed', 'Processed Snacks', 0.15);
    if (highProcessedSnacks) detectedPatterns.push(highProcessedSnacks);

    const highSugaryDrinks = detectHighIntake(meals, 'beverage_sugary', 'Sugary Beverages', 0.1);
    if (highSugaryDrinks) detectedPatterns.push(highSugaryDrinks);

    const carbIntakePattern = analyzeOverallCarbIntake(meals);
    if (carbIntakePattern) {
      if (!detectedPatterns.some(p => p.name === carbIntakePattern.name)) {
        detectedPatterns.push(carbIntakePattern);
      }
    }

    const insights = generateInsights(detectedPatterns);
    const recommendations = generateRecommendations(detectedPatterns);
    return { patterns: detectedPatterns, insights: insights, recommendations: recommendations };

  } catch (error) {
    console.error("Error in analyzeDietaryPatterns:", error);
    return { patterns: [], insights: generateInsights([]), recommendations: generateRecommendations([]), error: "Failed to analyze dietary patterns due to a server error." };
  }
}

module.exports = {
  getFoodCategory,
  mapPortionToQuantitative,
  detectFrequentSnacking,
  detectSkippingBreakfast,
  detectHighIntake,
  analyzeOverallCarbIntake,
  analyzeDietaryPatterns,
  generateInsights,
  generateRecommendations, // Export the new function
  foodToCategory
};
