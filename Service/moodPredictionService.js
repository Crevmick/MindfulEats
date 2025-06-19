import { predictMoodForMeal } from '../script/predictMood.js'; // Path based on typical project structure

const portionSizeToMealSizeCodeMap = {
  'small': 0,
  'medium': 1,
  'large': 2
};

/**
 * Predicts mood based on meal characteristics.
 * This service acts as a wrapper around the prediction script,
 * providing a cleaner interface for the rest of the application.
 *
 * @param {object} mealObject - Object containing meal details.
 * @param {string} mealObject.portionSize - e.g., "small", "medium", "large".
 * @param {number} mealObject.hungerBefore - Hunger level before meal (1-10).
 * @param {number} mealObject.hungerAfter - Hunger level after meal (1-10).
 * @param {string} mealObject.mealType - Type of meal, e.g., "breakfast", "lunch", "dinner", "snack".
 * @param {number} mealObject.hourOfDay - Hour of the day the meal was consumed (0-23).
 * @returns {Promise<string|null>} Predicted mood string (e.g., "Happy") or null if prediction fails.
 */
export async function getPredictedMood(mealObject) {
  try {
    if (!mealObject) {
      console.warn("moodPredictionService.getPredictedMood: mealObject is null or undefined.");
      return null;
    }

    // Normalize portionSize and map to mealSizeCode
    const normalizedPortionSize = mealObject.portionSize?.toLowerCase();
    const mealSizeCode = portionSizeToMealSizeCodeMap[normalizedPortionSize] ?? 1; // Default to medium (1)

    // Prepare the data structure expected by the prediction script
    const mealDataForScript = {
      mealSizeCode: mealSizeCode,
      hungerBefore: mealObject.hungerBefore,
      hungerAfter: mealObject.hungerAfter,
      mealTypeString: mealObject.mealType, // The script expects 'mealTypeString'
      hourOfDay: mealObject.hourOfDay
    };

    // Basic validation for required fields before calling the prediction script
    if (
      mealDataForScript.hungerBefore == null || // Using == null to catch both null and undefined
      mealDataForScript.hungerAfter == null ||
      !mealDataForScript.mealTypeString || // Check for empty string as well
      mealDataForScript.hourOfDay == null
    ) {
      console.warn("moodPredictionService.getPredictedMood: Missing or invalid required fields in mealObject for prediction.", mealDataForScript);
      return null;
    }

    // Call the actual prediction function from the script
    const predictedMood = await predictMoodForMeal(mealDataForScript);

    return predictedMood;

  } catch (error) {
    // Log errors that occur within this service or are propagated from predictMoodForMeal
    console.error("Error in moodPredictionService.getPredictedMood:", error);
    return null;
  }
}

// Example of how this service might be used (for testing or demonstration)
/*
async function testPrediction() {
  const exampleMeal = {
    portionSize: "Medium",
    hungerBefore: 6,
    hungerAfter: 3,
    mealType: "Lunch", // Will be passed as mealTypeString
    hourOfDay: 13
  };

  const mood = await getPredictedMood(exampleMeal);
  if (mood) {
    console.log(`Service predicted mood: ${mood}`);
  } else {
    console.log("Service could not predict mood.");
  }

  const exampleMealInvalid = {
    // portionSize: "Small", // Intentionally missing portionSize to test default
    hungerBefore: null, // Intentionally invalid
    hungerAfter: 2,
    mealType: "Snack",
    hourOfDay: 16
  };
  const moodInvalid = await getPredictedMood(exampleMealInvalid);
   if (moodInvalid) {
    console.log(`Service predicted mood (invalid input test): ${moodInvalid}`);
  } else {
    console.log("Service could not predict mood with invalid input (as expected).");
  }
}

// testPrediction();
*/
