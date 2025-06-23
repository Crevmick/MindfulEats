import Meal from '../model/mealLog.js'; 


const foodToCategory = {
  // Fruits
  "apple": "fruit",
  "apples": "fruit",
  "banana": "fruit",
  "bananas": "fruit",
  "orange": "fruit",
  "oranges": "fruit",
  "grape": "fruit",
  "grapes": "fruit",
  "strawberry": "fruit",
  "strawberries": "fruit",
  "blueberry": "fruit",
  "blueberries": "fruit",
  "raspberry": "fruit",
  "raspberries": "fruit",
  "mango": "fruit",
  "mangoes": "fruit",
  "pineapple": "fruit",
  "pineapples": "fruit",
  "watermelon": "fruit",
  "watermelons": "fruit",
  // Vegetables
  "broccoli": "vegetable",
  "carrot": "vegetable",
  "carrots": "vegetable",
  "spinach": "vegetable",
  "lettuce": "vegetable",
  "tomato": "vegetable",
  "tomatoes": "vegetable",
  "cucumber": "vegetable",
  "cucumbers": "vegetable",
  "bell pepper": "vegetable",
  "bell peppers": "vegetable",
  "onion": "vegetable",
  "onions": "vegetable",
  "garlic": "vegetable",
  "potato": "vegetable_starchy",
  "potatoes": "vegetable_starchy",
  "sweet potato": "vegetable_starchy",
  "sweet potatoes": "vegetable_starchy",
  // Grains
  "whole wheat bread": "grain_whole",
  "white bread": "grain_refined",
  "bread": "grain",
  "breads": "grain",
  "white rice": "grain_refined",
  "brown rice": "grain_whole",
  "rice": "grain",
  "rices": "grain",
  "whole wheat pasta": "grain_whole",
  "pasta": "grain",
  "pastas": "grain",
  "oats": "grain_whole",
  "quinoa": "grain_whole",
  "cereal": "grain",
  "cereals": "grain",
  "sugary cereal": "sweets",
  // Proteins
  "chicken": "protein",
  "beef": "protein",
  "pork": "protein",
  "fish": "protein",
  "salmon": "protein",
  "tuna": "protein",
  "egg": "protein",
  "eggs": "protein",
  "bean": "protein_plant",
  "beans": "protein_plant",
  "lentil": "protein_plant",
  "lentils": "protein_plant",
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
  "avocado": "fat",
  "avocados": "fat",
  "nut": "fat_healthy",
  "nuts": "fat_healthy",
  "seed": "fat_healthy",
  "seeds": "fat_healthy",
  // Sweets & Processed Snacks
  "cake": "sweets",
  "cakes": "sweets",
  "cookie": "sweets",
  "cookies": "sweets",
  "ice cream": "sweets",
  "chocolate": "sweets",
  "candy": "sweets",
  "pastry": "sweets",
  "pastries": "sweets",
  "chips": "snacks_processed", 
  "soda": "beverage_sugary",
  // Beverages
  "water": "beverage",
  "coffee": "beverage",
  "tea": "beverage",
};

function getFoodCategory(foodName) {
  if (typeof foodName !== 'string') return "unknown";
  let normalized = foodName
    .replace(/[0-9]/g, '') 
    .replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/gi, '')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  if (!normalized) return "unknown";

  // Try direct and word-boundary match first
  const keys = Object.keys(foodToCategory).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    if (regex.test(normalized)) {
      return foodToCategory[key];
    }
  }

  // Try plural/singular fallback for each word in the input
  const words = normalized.split(' ');
  for (let i = 0; i < words.length; i++) {
    let word = words[i];

    // Skip empty or numeric words
    if (!word || /^\d+$/.test(word)) continue;

    // Try singular (strip 's' or 'es')
    let singular = word;
    if (word.endsWith('es')) {
      singular = word.slice(0, -2);
    } else if (word.endsWith('s')) {
      singular = word.slice(0, -1);
    }

    // Try plural (add 's' and 'es')
    let pluralS = word + 's';
    let pluralES = word + 'es';

    // Check mapping for singular, pluralS, pluralES
    if (foodToCategory[singular]) return foodToCategory[singular];
    if (foodToCategory[pluralS]) return foodToCategory[pluralS];
    if (foodToCategory[pluralES]) return foodToCategory[pluralES];
  }

  return "unknown";
}
function mapPortionToQuantitative(portionString) {
  if (portionString === null || portionString === undefined) return null;
  if (typeof portionString !== 'string' || portionString.trim() === '') return 1;
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
  if (!meals || meals.length === 0 || actualDaysWithLogging === 0) return null;
  const snacks = meals.filter(meal => meal.mealType === 'snack');
  const totalSnacks = snacks.length;
  const avgSnacks = totalSnacks / actualDaysWithLogging;
  if (avgSnacks > 2) {
    return { name: "Frequent Snacking", detected: true, details: `Average of ${avgSnacks.toFixed(1)} snacks per day over ${actualDaysWithLogging} day(s) with logs.` };
  }
  return null;
}

function detectSkippingBreakfast(meals, actualDaysWithLogging) {
  if (!meals || meals.length === 0 || actualDaysWithLogging === 0) return null;
  const mealsByDate = {};
  meals.forEach(meal => {
    const mealDate = new Date(meal.createdAt).toISOString().split('T')[0];
    if (!mealsByDate[mealDate]) mealsByDate[mealDate] = [];
    mealsByDate[mealDate].push(meal);
  });
  const uniqueLoggingDays = Object.keys(mealsByDate).length;
  if (uniqueLoggingDays === 0) return null;
  let skippedBreakfastDays = 0;
  for (const date in mealsByDate) {
    if (!mealsByDate[date].some(meal => meal.mealType === 'breakfast')) skippedBreakfastDays++;
  }
  if (skippedBreakfastDays > uniqueLoggingDays * 0.4) {
    return { name: "Skipping Breakfast", detected: true, details: `Skipped breakfast on ${skippedBreakfastDays} out of ${uniqueLoggingDays} day(s) with logs.` };
  }
  return null;
}

function detectHighIntake(meals, targetCategory, categoryDisplayName, mealFrequencyThreshold) {
  if (!meals || meals.length === 0) return null;
  const mealsWithCategory = meals.map(meal => {
    let category = (typeof meal.foodCategory === "string" && meal.foodCategory.trim() !== "")
      ? meal.foodCategory
      : getFoodCategory(meal.predictedFoodName);
    return { ...meal, foodCategory: category };
  });
  const matchingMeals = mealsWithCategory.filter(meal => meal.foodCategory === targetCategory);
  const percentage = matchingMeals.length / meals.length;
  if (percentage > mealFrequencyThreshold) {
    return { name: `High Intake of ${categoryDisplayName}`, detected: true, details: `${(percentage * 100).toFixed(0)}% of logged meals included ${categoryDisplayName}.` };
  }
  return null;
}


function analyzeOverallCarbIntake(meals) {
  if (!meals || meals.length === 0) return null;
  const sugarySnackPattern = detectHighIntake(meals, 'sweets', 'Sugary Foods/Snacks', 0.2);
  if (sugarySnackPattern) return sugarySnackPattern;
  const refinedGrainPattern = detectHighIntake(meals, 'grain_refined', 'Refined Grains', 0.3);
  if (refinedGrainPattern) return refinedGrainPattern;
  return null;
}

function detectEmotionalEating(meals) {
    const detectedPatterns = [];
    if (!meals || meals.length === 0) return detectedPatterns;

    // Mood labels from MoodLog schema (e.g., 'Happy', 'Sad', 'Frustrated')
    const negativeMoodLabels = ['Frustrated', 'Sad', 'Anxious'];
    const positiveMoodLabels = ['Happy', 'Grateful'];
    // Comfort food categories remain the same
    const comfortFoodCategories = ['sweets', 'snacks_processed'];

    const MIN_OCCURRENCES = 2; // Adjusted for more sensitivity
    const SIGNIFICANT_COOCCURRENCE_THRESHOLD = 0.4; // Adjusted threshold
    const MAX_TIME_DIFF_HOURS = 3; // Max time diff between meal and mood log

    // Store associations:
    // 1. Logged Mood -> Food Item/Category
    // 2. Food Item/Category -> Predicted Mood (from meal.predictedPostMealMood)
    const moodToFoodAssociations = {}; // Key: "Negative Mood (Frustrated)" Value: { totalOccurrences: N, foodItems: { "Pizza": count, ... }, foodCategories: { "sweets": count, ... } }
    const foodToPredictedMoodAssociations = {}; // Key: "Pizza" or "category:sweets", Value: { totalOccurrences: N, predictedMoods: { "Happy": count, ... } }

    meals.forEach(meal => {
        const mealTime = new Date(meal.createdAt);
        const foodName = meal.predictedFoodName || meal.foodName || "Unknown Food";
        const foodCategory = meal.foodCategory || getFoodCategory(foodName);

        // --- Part 1: Analyze Logged Moods around Meals ---
        if (meal.moodLogId && meal.moodLogId.moodScore && meal.moodLogId.createdAt) {
            const loggedMoodLabel = meal.moodLogId.moodScore; // This is the string label like "Happy", "Sad"
            const moodTime = new Date(meal.moodLogId.createdAt);
            const timeDiffHours = Math.abs(moodTime - mealTime) / (1000 * 60 * 60);

            if (timeDiffHours <= MAX_TIME_DIFF_HOURS) {
                let moodTypePrefix = "Other Mood";
                if (negativeMoodLabels.includes(loggedMoodLabel)) moodTypePrefix = "Negative Mood";
                else if (positiveMoodLabels.includes(loggedMoodLabel)) moodTypePrefix = "Positive Mood";

                const associationKey = `${moodTypePrefix} (${loggedMoodLabel})`;

                if (!moodToFoodAssociations[associationKey]) {
                    moodToFoodAssociations[associationKey] = {
                        totalOccurrences: 0,
                        foodItems: {},
                        foodCategories: {}
                    };
                }
                moodToFoodAssociations[associationKey].totalOccurrences++;
                moodToFoodAssociations[associationKey].foodItems[foodName] = (moodToFoodAssociations[associationKey].foodItems[foodName] || 0) + 1;
                moodToFoodAssociations[associationKey].foodCategories[foodCategory] = (moodToFoodAssociations[associationKey].foodCategories[foodCategory] || 0) + 1;
            }
        }

        // --- Part 2: Analyze Predicted Post-Meal Moods ---
        if (meal.predictedPostMealMood) {
            const predictedMood = meal.predictedPostMealMood;

            // For specific food item
            if (!foodToPredictedMoodAssociations[foodName]) {
                foodToPredictedMoodAssociations[foodName] = { totalOccurrences: 0, predictedMoods: {} };
            }
            foodToPredictedMoodAssociations[foodName].totalOccurrences++;
            foodToPredictedMoodAssociations[foodName].predictedMoods[predictedMood] = (foodToPredictedMoodAssociations[foodName].predictedMoods[predictedMood] || 0) + 1;

            // For food category
            const categoryKey = `category:${foodCategory}`;
            if (!foodToPredictedMoodAssociations[categoryKey]) {
                foodToPredictedMoodAssociations[categoryKey] = { totalOccurrences: 0, predictedMoods: {} };
            }
            foodToPredictedMoodAssociations[categoryKey].totalOccurrences++;
            foodToPredictedMoodAssociations[categoryKey].predictedMoods[predictedMood] = (foodToPredictedMoodAssociations[categoryKey].predictedMoods[predictedMood] || 0) + 1;
        }
    });

    // --- Generate Patterns from Associations ---

    // From Logged Mood -> Food
    for (const moodKey in moodToFoodAssociations) {
        const data = moodToFoodAssociations[moodKey];
        if (data.totalOccurrences < MIN_OCCURRENCES) continue;

        // Check specific food items
        for (const foodItem in data.foodItems) {
            const count = data.foodItems[foodItem];
            if (count >= MIN_OCCURRENCES && (count / data.totalOccurrences) >= (SIGNIFICANT_COOCCURRENCE_THRESHOLD / 2)) { // Lenient for specific items
                detectedPatterns.push({
                    name: `Potential Link: ${moodKey} and Consumption of ${foodItem}`,
                    type: "logged_mood_specific_food",
                    detected: true,
                    details: `When ${moodKey.toLowerCase()} was logged near a meal, '${foodItem}' was consumed in ${count} of ${data.totalOccurrences} such instances.`
                });
            }
        }
        // Check food categories (especially for negative moods and comfort foods)
        if (moodKey.startsWith("Negative Mood")) {
            for (const category in data.foodCategories) {
                const count = data.foodCategories[category];
                if (comfortFoodCategories.includes(category) && count >= MIN_OCCURRENCES && (count / data.totalOccurrences) >= SIGNIFICANT_COOCCURRENCE_THRESHOLD) {
                    detectedPatterns.push({
                        name: `Emotional Eating: ${moodKey} and ${category}`,
                        type: "emotional_eating_category_logged",
                        detected: true,
                        details: `When ${moodKey.toLowerCase()} was logged near a meal, foods from the '${category}' category were consumed in ${count} of ${data.totalOccurrences} such instances.`
                    });
                }
            }
        }
    }

    // From Food -> Predicted Mood
    for (const foodOrCatKey in foodToPredictedMoodAssociations) {
        const data = foodToPredictedMoodAssociations[foodOrCatKey];
        if (data.totalOccurrences < MIN_OCCURRENCES) continue;

        const itemName = foodOrCatKey.startsWith('category:') ? foodOrCatKey.replace('category:', '') : foodOrCatKey;
        const itemType = foodOrCatKey.startsWith('category:') ? "category" : "food item";

        for (const predictedMood in data.predictedMoods) {
            const count = data.predictedMoods[predictedMood];
            if (count >= MIN_OCCURRENCES && (count / data.totalOccurrences) >= SIGNIFICANT_COOCCURRENCE_THRESHOLD) {
                // Check if this predicted mood is notably negative or positive
                let significance = "";
                if (negativeMoodLabels.includes(predictedMood)) significance = "Negative";
                else if (positiveMoodLabels.includes(predictedMood)) significance = "Positive";

                if (significance) { // Only report if it's a clearly positive or negative prediction
                    detectedPatterns.push({
                        name: `Pattern: Consumption of ${itemName} (${itemType}) and Predicted ${significance} Mood (${predictedMood})`,
                        type: `food_predicted_${significance.toLowerCase()}_mood`,
                        detected: true,
                        details: `Consuming '${itemName}' was followed by a predicted mood of '${predictedMood}' in ${count} of ${data.totalOccurrences} instances where this ${itemType} was logged with a prediction.`
                    });
                }
            }
        }
    }
    return detectedPatterns;
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
      // Use pattern.type for more specific insights
      switch (pattern.type) {
          case "frequent_snacking": // Assuming new type for detectFrequentSnacking if refactored
              insightMsg = `Noticed frequent snacking: ${pattern.details}. Consider if these are hunger-driven or if healthier alternatives could be chosen.`;
              break;
          case "skipping_breakfast": // Assuming new type for detectSkippingBreakfast
              insightMsg = `Breakfast was skipped on several days: ${pattern.details}. A balanced breakfast can provide energy for the day.`;
              break;
          case "high_intake": // Assuming new type for detectHighIntake
              // Example: pattern.name could be "High Intake of Processed Snacks"
              insightMsg = `Noticed ${pattern.name}: ${pattern.details}. Reflect on how this aligns with your dietary goals.`;
              break;
          case "logged_mood_specific_food":
              // pattern.name example: "Potential Link: Negative Mood (Sad) and Consumption of Chocolate Cake"
              insightMsg = `We've observed a potential link: ${pattern.name.replace("Potential Link: ", "")}. ${pattern.details} Understanding these connections can be a first step towards mindful eating.`;
              break;
          case "emotional_eating_category_logged":
              // pattern.name example: "Emotional Eating: Negative Mood (Stressed) and sweets"
              insightMsg = `It seems there's a pattern of ${pattern.name.replace("Emotional Eating: ", "")}. ${pattern.details} Recognizing this can help in finding alternative coping strategies or healthier comfort options.`;
              break;
          case "food_predicted_negative_mood":
              // pattern.name example: "Pattern: Pizza (food item) and Predicted Negative Mood (Frustrated)"
              insightMsg = `Our analysis suggests a pattern: ${pattern.name.replace("Pattern: ", "")}. ${pattern.details} This could be due to various factors like energy crashes or specific ingredients.`;
              break;
          case "food_predicted_positive_mood":
              // pattern.name example: "Pattern: Salad (food item) and Predicted Positive Mood (Happy)"
              insightMsg = `We found a positive pattern: ${pattern.name.replace("Pattern: ", "")}. ${pattern.details} It's great to see what foods might be contributing to positive feelings post-meal!`;
              break;
          default:
              // Fallback for original pattern names if they are still used or for new unhandled types
              if (pattern.name) {
                // Generic handling for older or unspecific pattern names
                if (pattern.name.startsWith("Emotional Eating:")) {
                    const parts = pattern.name.replace("Emotional Eating: ", "").split(" and ");
                    const moodPart = parts[0]; // e.g., "User-Logged Mood (Score 2)" or "Negative Mood (Sad)"
                    const foodPart = parts[1]; // e.g., "sweets"
                    insightMsg = `It appears that when you reported feeling ${moodPart.toLowerCase()}, you often consumed '${foodPart}'. ${pattern.details} Recognizing this pattern is the first step.`;
                } else if (pattern.name.startsWith("Pattern:") && pattern.name.includes("and Predicted")) {
                    const foodPart = pattern.name.split(" and Predicted")[0].replace("Pattern: ", "");
                    const moodInfo = pattern.name.split(" and Predicted ")[1];
                    insightMsg = `Our analysis suggests that consuming '${foodPart}' may often be followed by a predicted ${moodInfo.toLowerCase()}. ${pattern.details}`;
                } else if (pattern.name.startsWith("High Intake of")) {
                  insightMsg = `${pattern.name} was noted: ${pattern.details}. Reflect on how this aligns with your dietary goals.`;
                } else if (pattern.name === "Frequent Snacking" || pattern.name === "Skipping Breakfast") {
                  insightMsg = `A pattern of '${pattern.name}' was observed: ${pattern.details}.`;
                } else {
                  insightMsg = `A pattern regarding '${pattern.name}' was noted: ${pattern.details}. Reflect on how this aligns with your dietary goals.`;
                }
              } else {
                insightMsg = `An interesting dietary pattern was noted: ${pattern.details}. Consider how this fits with your overall wellness goals.`;
              }
      }
      if (insightMsg) insights.push(insightMsg);
  });

  if (positiveDetections === 0 && insights.length === 0) {
      insights.push("Your dietary habits seem balanced based on the patterns we track. Well done!");
  } else if (positiveDetections > 0 && insights.length === 0) { // Should not happen if messages are generated
      insights.push("Several dietary patterns were noted. Review them to understand your eating habits better.");
  } else if (insights.length === 0 && detectedPatterns.length > 0 && positiveDetections === 0) {
      // This case implies patterns were detected but all had 'detected: false' or were filtered out.
      insights.push("No specific actionable patterns detected in this period, but keep logging for more insights!");
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
        // Use pattern.type for more specific recommendations
        switch (pattern.type) {
            case "frequent_snacking":
                recMsg = "If hunger strikes between meals, try whole food snacks like fruits, nuts, or yogurt. Planning balanced meals can also help reduce the urge for frequent snacking.";
                break;
            case "skipping_breakfast":
                recMsg = "Consider incorporating a quick, nutritious breakfast into your mornings. Even a piece of fruit with some nuts or a simple smoothie can provide a good start.";
                break;
            case "high_intake":
                 // Example: pattern.name "High Intake of Processed Snacks"
                const itemToReduce = pattern.name.replace("High Intake of ", "").toLowerCase();
                recMsg = `For your high intake of ${itemToReduce}, consider exploring healthier alternatives or adjusting portion sizes. For example, if it's processed snacks, try whole fruits or nuts.`;
                break;
            case "logged_mood_specific_food":
                const foodItem = pattern.name.split(" and Consumption of ")[1];
                const moodContext = pattern.name.split(" and Consumption of ")[0].replace("Potential Link: ", "");
                recMsg = `When experiencing ${moodContext.toLowerCase()}, and you've noticed a link with '${foodItem}', you might explore if this food choice is serving your emotional needs or if other activities or healthier food options could provide comfort.`;
                break;
            case "emotional_eating_category_logged":
                const moodInfo = pattern.name.split(" and ")[0].replace("Emotional Eating: ", "");
                const comfortCategory = pattern.name.split(" and ")[1];
                recMsg = `When ${moodInfo.toLowerCase()} occurs and you tend to reach for '${comfortCategory}', try exploring non-food related activities you enjoy (e.g., music, walk, chat). If choosing food, perhaps a smaller portion or a healthier alternative within or outside that category?`;
                break;
            case "food_predicted_negative_mood":
                const foodLinkedToNegative = pattern.name.split(" and Predicted")[0].replace("Pattern: Consumption of ", "").replace(" (food item)", "").replace(" (category)", "");
                const predictedNegativeMood = pattern.name.split("Predicted ")[1];
                recMsg = `Since consuming '${foodLinkedToNegative}' seems linked to a predicted ${predictedNegativeMood.toLowerCase()}, you could experiment with reducing its frequency or portion size. Pairing it with nutrient-dense foods (like fiber or protein) might also help stabilize energy and mood.`;
                break;
            case "food_predicted_positive_mood":
                 const foodLinkedToPositive = pattern.name.split(" and Predicted")[0].replace("Pattern: Consumption of ", "").replace(" (food item)", "").replace(" (category)", "");
                const predictedPositiveMood = pattern.name.split("Predicted ")[1];
                recMsg = `It's great that consuming '${foodLinkedToPositive}' is often followed by a predicted ${predictedPositiveMood.toLowerCase()}! Continue enjoying these choices that seem to work well for you.`;
                break;
            default:
                // Fallback for original pattern names
                if (pattern.name) {
                    if (pattern.name.startsWith("Emotional Eating:")) {
                        const parts = pattern.name.replace("Emotional Eating: ", "").split(" and ");
                        const moodPart = parts[0]; const foodPart = parts[1];
                        recMsg = `When experiencing ${moodPart.toLowerCase()}, and you reach for '${foodPart}', try exploring non-food activities or healthier comfort food options.`;
                    } else if (pattern.name.startsWith("Pattern:") && pattern.name.includes("and Predicted")) {
                        const foodPart = pattern.name.split(" and Predicted")[0].replace("Pattern: ", "");
                        recMsg = `For '${foodPart}', which seems linked to less positive predicted moods, consider reducing its intake or pairing it with protein or fiber.`;
                    } else if (pattern.name.startsWith("High Intake of")) {
                        recMsg = `For your intake of ${pattern.name.substring(15)}, consider exploring healthier alternatives or adjusting portion sizes.`;
                    } else if (pattern.name === "Frequent Snacking") {
                         recMsg = "If hunger strikes between meals, try whole food snacks like fruits, nuts, or yogurt.";
                    } else if (pattern.name === "Skipping Breakfast") {
                        recMsg = "Consider incorporating a quick, nutritious breakfast into your mornings.";
                    } else {
                        recMsg = `For the pattern '${pattern.name}', consider exploring healthier alternatives or adjusting portion sizes.`;
                    }
                } else {
                     recMsg = "Reflect on the detected pattern and consider if small adjustments could support your wellness goals.";
                }
        }
        if (recMsg) recommendations.push(recMsg);
    });

    if (positiveDetections === 0 && recommendations.length === 0) {
        recommendations.push("Your current logs show balanced habits according to our tracked patterns. Keep up the great work and continue exploring nutritious food choices!");
    } else if (positiveDetections > 0 && recommendations.length === 0) { // Should not happen
         recommendations.push("Review the detected patterns and consider making small, sustainable changes towards your health goals.");
    } else if (recommendations.length === 0 && detectedPatterns.length > 0 && positiveDetections === 0) {
        recommendations.push("No specific actionable recommendations for this period, but continue your mindful logging!");
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
    }).populate('moodLogId').lean();

    if (!meals || meals.length === 0) {
      return {
        patterns: [],
        insights: ["No meal data found for the selected period. Start logging your meals to get an analysis."],
        recommendations: ["Log your meals and moods regularly to get started."],
        summary: "No meal data found for the selected period."
      };
    }

    const mealDates = meals.map(meal => new Date(meal.createdAt).toISOString().split('T')[0]);
    const actualDaysWithLogging = new Set(mealDates).size;

    const MIN_LOGGING_DAYS = 5;
    const MIN_TOTAL_MEALS = 10;

    if (actualDaysWithLogging < MIN_LOGGING_DAYS && meals.length < MIN_TOTAL_MEALS) {
      return {
        patterns: [],
        insights: [`Log meals and moods for at least ${MIN_LOGGING_DAYS} different days (or a total of ${MIN_TOTAL_MEALS} meals) to receive personalized dietary patterns and insights. You currently have ${actualDaysWithLogging} day(s) with logs and ${meals.length} total meals.`],
        recommendations: ["Continue logging your meals and moods regularly to unlock your personalized analysis."],
        summary: `Insufficient data for full analysis. Please log for at least ${MIN_LOGGING_DAYS} days or ${MIN_TOTAL_MEALS} meals.`
      };
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

    const emotionalPatterns = detectEmotionalEating(meals);
    if (emotionalPatterns && emotionalPatterns.length > 0) {
      detectedPatterns.push(...emotionalPatterns);
    }

    const insights = generateInsights(detectedPatterns);
    const recommendations = generateRecommendations(detectedPatterns);
    return { patterns: detectedPatterns, insights: insights, recommendations: recommendations };

  } catch (error) {
    console.error("Error in analyzeDietaryPatterns:", error);
    return { patterns: [], insights: generateInsights([]), recommendations: generateRecommendations([]), error: "Failed to analyze dietary patterns due to a server error." };
  }
}

export {
  getFoodCategory,
  mapPortionToQuantitative,
  detectFrequentSnacking,
  detectSkippingBreakfast,
  detectHighIntake,
  analyzeOverallCarbIntake,
  detectEmotionalEating,
  analyzeDietaryPatterns,
  generateInsights,
  generateRecommendations,
  foodToCategory
};