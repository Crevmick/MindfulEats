import Meal from '../model/mealLog.js'; 

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
  "bread": "grain",
  "white bread": "grain_refined",
  "whole wheat bread": "grain_whole",
  "rice": "grain",
  "white rice": "grain_refined",
  "brown rice": "grain_whole",
  "pasta": "grain",
  "whole wheat pasta": "grain_whole",
  "oats": "grain_whole",
  "quinoa": "grain_whole",
  "cereal": "grain",
  "sugary cereal": "sweets",
  // Proteins
  "chicken": "protein",
  "beef": "protein",
  "pork": "protein",
  "fish": "protein",
  "salmon": "protein",
  "tuna": "protein",
  "eggs": "protein",
  "beans": "protein_plant",
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
  "nuts": "fat_healthy",
  "seeds": "fat_healthy",
  // Sweets & Processed Snacks
  "cake": "sweets",
  "cookies": "sweets",
  "ice cream": "sweets",
  "chocolate": "sweets",
  "candy": "sweets",
  "pastry": "sweets",
  "chips": "snacks_processed", 
  "soda": "beverage_sugary",
  // Beverages
  "water": "beverage",
  "coffee": "beverage",
  "tea": "beverage",
};

// Helper to map mood scores to descriptive names if needed (currently not used by detectEmotionalEating directly for user moods)
// const userMoodScoreToName = { 1: 'Very Negative', 2: 'Negative', 3: 'Neutral', 4: 'Positive', 5: 'Very Positive' };

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
  const mealsWithCategory = meals.map(meal => ({ ...meal, foodCategory: meal.foodCategory || getFoodCategory(meal.predictedFoodName) }));
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

    // Define mood scores that are considered negative (e.g., 1 or 2 on a 1-5 scale)
    // This needs to align with how MoodLog.moodScore is defined and used.
    // For this example, let's assume moodScore is 1-5, where 1 and 2 are negative.
    const negativeUserMoodScores = [1, 2];
    // For user-facing messages, mapping score to a name would be better if available from MoodLog model.
    // E.g. if moodLogId.mood is "Sad", "Anxious", "Frustrated".
    // For now, we'll use a generic "Negative User-Logged Mood" or the score itself.

    const comfortFoodCategories = ['sweets', 'snacks_processed'];
    const negativePredictedMoods = ['Frustrated', 'Sad', 'Anxious']; // From TF model output

    const MIN_OCCURRENCES = 3; // Min times a mood or category must appear to be considered for a pattern
    const SIGNIFICANT_COOCCURRENCE_THRESHOLD = 0.5; // 50%

    // Correlation 1: User-logged negative mood -> Comfort Food
    const moodToComfortFoodStats = {}; // Stores { moodScore: { total: 0, comfort: 0, categoryCounts: {} } }

    meals.forEach(meal => {
        if (meal.moodLogId && meal.moodLogId.moodScore && negativeUserMoodScores.includes(meal.moodLogId.moodScore)) {
            const moodScore = meal.moodLogId.moodScore;
            // Using moodScore directly; ideally, map this to a mood name like "Sad" if MoodLog has it.
            const moodIdentifier = `User-Logged Mood (Score ${moodScore})`;

            if (!moodToComfortFoodStats[moodIdentifier]) {
                moodToComfortFoodStats[moodIdentifier] = { total: 0, comfort: 0, categoryCounts: {} };
            }
            moodToComfortFoodStats[moodIdentifier].total++;

            const currentFoodCategory = meal.foodCategory || getFoodCategory(meal.predictedFoodName);
            if (comfortFoodCategories.includes(currentFoodCategory)) {
                moodToComfortFoodStats[moodIdentifier].comfort++;
                moodToComfortFoodStats[moodIdentifier].categoryCounts[currentFoodCategory] = (moodToComfortFoodStats[moodIdentifier].categoryCounts[currentFoodCategory] || 0) + 1;
            }
        }
    });

    for (const mood in moodToComfortFoodStats) {
        const stats = moodToComfortFoodStats[mood];
        if (stats.total >= MIN_OCCURRENCES && (stats.comfort / stats.total) >= SIGNIFICANT_COOCCURRENCE_THRESHOLD) {
            // Find the most common comfort category for this mood
            let mostCommonCat = "";
            let maxCount = 0;
            for(const cat in stats.categoryCounts) {
                if(stats.categoryCounts[cat] > maxCount) {
                    maxCount = stats.categoryCounts[cat];
                    mostCommonCat = cat;
                }
            }
            if (mostCommonCat) { // Ensure there was at least one comfort food
                 detectedPatterns.push({
                    name: `Emotional Eating: ${mood} and ${mostCommonCat}`,
                    detected: true,
                    details: `Often consumed '${mostCommonCat}' when ${mood.toLowerCase()} was reported (${stats.comfort} out of ${stats.total} instances).`
                });
            }
        }
    }

    // Correlation 2: Comfort Food -> Predicted Negative Mood
    const comfortFoodToNegativePredictionStats = {}; // { foodCategory: { total: 0, negativePrediction: 0, predictionCounts: {} } }

    meals.forEach(meal => {
        const currentFoodCategory = meal.foodCategory || getFoodCategory(meal.predictedFoodName);
        if (comfortFoodCategories.includes(currentFoodCategory)) {
            if (!comfortFoodToNegativePredictionStats[currentFoodCategory]) {
                comfortFoodToNegativePredictionStats[currentFoodCategory] = { total: 0, negativePrediction: 0, predictionCounts: {} };
            }
            comfortFoodToNegativePredictionStats[currentFoodCategory].total++;

            if (meal.predictedPostMealMood && negativePredictedMoods.includes(meal.predictedPostMealMood)) {
                comfortFoodToNegativePredictionStats[currentFoodCategory].negativePrediction++;
                const predMood = meal.predictedPostMealMood;
                comfortFoodToNegativePredictionStats[currentFoodCategory].predictionCounts[predMood] = (comfortFoodToNegativePredictionStats[currentFoodCategory].predictionCounts[predMood] || 0) + 1;
            }
        }
    });

    for (const category in comfortFoodToNegativePredictionStats) {
        const stats = comfortFoodToNegativePredictionStats[category];
        if (stats.total >= MIN_OCCURRENCES && (stats.negativePrediction / stats.total) >= SIGNIFICANT_COOCCURRENCE_THRESHOLD) {
            let mostCommonPredMood = "";
            let maxCount = 0;
             for(const predMood in stats.predictionCounts) {
                if(stats.predictionCounts[predMood] > maxCount) {
                    maxCount = stats.predictionCounts[predMood];
                    mostCommonPredMood = predMood;
                }
            }
            if(mostCommonPredMood){ // Ensure there was at least one negative predicted mood
                detectedPatterns.push({
                    name: `Pattern: ${category} and Negative Predicted Mood`,
                    detected: true,
                    details: `Consuming '${category}' was often followed by a predicted mood of '${mostCommonPredMood}' (${stats.negativePrediction} out of ${stats.total} instances where ${category} was eaten).`
                });
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
          // Insights for Emotional Eating
          default:
              if (pattern.name && pattern.name.startsWith("Emotional Eating:")) {
                  // Example: "Emotional Eating: User-Logged Mood (Score 2) and sweets"
                  const parts = pattern.name.replace("Emotional Eating: ", "").split(" and ");
                  const moodPart = parts[0]; // e.g., "User-Logged Mood (Score 2)" or potentially a mood name
                  const foodPart = parts[1];
                  insightMsg = `It appears that when you reported ${moodPart.toLowerCase()}, you often consumed '${foodPart}'. ${pattern.details} Recognizing this pattern is the first step to finding alternative coping strategies or healthier comfort options.`;
              } else if (pattern.name && pattern.name.startsWith("Pattern:") && pattern.name.includes("and Negative Predicted Mood")) {
                  // Example: "Pattern: sweets and Negative Predicted Mood"
                  const foodPart = pattern.name.replace("Pattern: ", "").split(" and Negative Predicted Mood")[0];
                  insightMsg = `Our analysis suggests that consuming '${foodPart}' may often be followed by less positive predicted moods. ${pattern.details} This could be due to factors like energy crashes or nutrient imbalances.`;
              } else if (pattern.name && pattern.name.startsWith("High Intake of")) {
                insightMsg = `${pattern.name} was noted: ${pattern.details}. Reflect on how this aligns with your dietary goals.`;
              } else {
                insightMsg = `A pattern regarding '${pattern.name}' was noted: ${pattern.details}. Reflect on how this aligns with your dietary goals.`;
              }
      }
      if (insightMsg) insights.push(insightMsg);
  });

  if (positiveDetections === 0 && insights.length === 0) { // Check insights.length too in case default cases didn't add anything
      insights.push("Your dietary habits seem balanced based on the patterns we track. Well done!");
  } else if (positiveDetections > 0 && insights.length === 0) {
      // This case might occur if new patterns are detected but don't have specific insight messages yet
      insights.push("Several dietary patterns were noted. Review them to understand your eating habits better.");
  } else if (positiveDetections === 0 && insights.length > 0){
      // This case means some default message was already added, no need for another one.
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
            // Recommendations for Emotional Eating
            default:
                 if (pattern.name && pattern.name.startsWith("Emotional Eating:")) {
                    const parts = pattern.name.replace("Emotional Eating: ", "").split(" and ");
                    const moodPart = parts[0];
                    const foodPart = parts[1];
                    recMsg = `When experiencing ${moodPart.toLowerCase()}, try exploring non-food related activities you enjoy, like listening to music, a short walk, or talking to a friend. If you do seek comfort in food, consider if options like a piece of fruit, a warm herbal tea, or a small portion of nuts might also satisfy.`;
                } else if (pattern.name && pattern.name.startsWith("Pattern:") && pattern.name.includes("and Negative Predicted Mood")) {
                    const foodPart = pattern.name.replace("Pattern: ", "").split(" and Negative Predicted Mood")[0];
                    recMsg = `For '${foodPart}', which seems linked to less positive predicted moods, consider reducing its intake or pairing it with protein or fiber (like nuts or fruit) to potentially stabilize energy levels. Experiment to see if this influences your subsequent mood positively.`;
                } else if (pattern.name && pattern.name.startsWith("High Intake of")) {
                    recMsg = `For your intake of ${pattern.name.substring(15)}, consider exploring healthier alternatives or adjusting portion sizes. Small changes can make a big difference.`;
                } else {
                    recMsg = `For the pattern '${pattern.name}', consider exploring healthier alternatives or adjusting portion sizes. Small changes can make a big difference.`;
                }
        }
        if (recMsg) recommendations.push(recMsg);
    });

    if (positiveDetections === 0 && recommendations.length === 0) {
        recommendations.push("Your current logs show balanced habits according to our tracked patterns. Keep up the great work and continue exploring nutritious food choices!");
    } else if (positiveDetections > 0 && recommendations.length === 0) {
         recommendations.push("Review the detected patterns and consider making small, sustainable changes towards your health goals.");
    } else if (positiveDetections === 0 && recommendations.length > 0) {
        // Default message already added.
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