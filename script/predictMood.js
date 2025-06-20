import * as tf from '@tensorflow/tfjs';

// Mappings (consistent with trainModel.js)
const moodMap = { 'Frustrated': 0, 'Sad': 1, 'Anxious': 2, 'Neutral': 3, 'Grateful': 4, 'Happy': 5 };
const mealMap = { 'breakfast': 0, 'lunch': 1, 'dinner': 2, 'snack': 3 };

// Inverse of moodMap to map prediction index back to mood string
const indexToMood = Object.fromEntries(Object.entries(moodMap).map(([k, v]) => [v, k]));

let model = null; // Variable to store the loaded model

/**
 * Loads the trained TensorFlow.js model.
 * This function is called automatically when predictMoodForMeal is first used.
 */
async function loadModel() {
  if (model) {
    return model; // Return already loaded model
  }
  try {
    console.log('Loading trained model...');
    model = await tf.loadLayersModel('file://./trained_model/model.json');
    console.log('Model loaded successfully.');
    // Optional: model.summary(); // Log model summary if needed
    return model;
  } catch (error) {
    console.error('Error loading the trained model:', error);
    throw new Error('Failed to load the prediction model. Please ensure the model exists at ./trained_model/model.json');
  }
}

/**
 * Predicts the post-meal mood based on meal data.
 * @param {object} mealData - Data for the meal.
 * @param {number} mealData.mealSizeCode - Numeric code for meal size (0:small, 1:medium, 2:large).
 * @param {number} mealData.hungerBefore - Hunger level before meal (1-10).
 * @param {number} mealData.hungerAfter - Hunger level after meal (1-10).
 * @param {string} mealData.mealTypeString - Type of meal ('breakfast', 'lunch', 'dinner', 'snack').
 * @param {number} mealData.hourOfDay - Hour of the day the meal was consumed (0-23).
 * @returns {Promise<string|null>} The predicted mood string (e.g., "Happy") or null if prediction fails.
 */
export async function predictMoodForMeal(mealData) {
  if (!model) {
    try {
      await loadModel(); // Ensure model is loaded
    } catch (loadError) {
      console.error("Model not available for prediction:", loadError.message);
      return null; // Or rethrow, depending on desired error handling
    }
  }

  if (!mealData) {
    console.error("Prediction failed: mealData is null or undefined.");
    return null;
  }

  try {
    const mealTypeStringLower = mealData.mealTypeString?.toLowerCase();
    const numericMealType = mealMap[mealTypeStringLower] ?? mealMap['snack']; // Default to snack if unknown

    // Validate input data structure (basic check)
    if (
      typeof mealData.mealSizeCode !== 'number' ||
      typeof mealData.hungerBefore !== 'number' ||
      typeof mealData.hungerAfter !== 'number' ||
      typeof mealData.hourOfDay !== 'number'
    ) {
      console.error("Invalid mealData structure for prediction:", mealData);
      throw new Error("Invalid input data for prediction.");
    }

    const inputArray = [
      mealData.mealSizeCode,
      mealData.hungerBefore,
      mealData.hungerAfter,
      numericMealType,
      mealData.hourOfDay
    ];

    // console.log("Input array for prediction:", inputArray); // For debugging

    const inputTensor = tf.tensor2d([inputArray]);
    const predictionTensor = model.predict(inputTensor);

    let predictedClassIndex;
    if (Array.isArray(predictionTensor)) { // Sometimes predict returns an array of tensors
        predictedClassIndex = (await predictionTensor[0].argMax(1).data())[0];
    } else {
        predictedClassIndex = (await predictionTensor.argMax(1).data())[0];
    }

    // Dispose tensors to free memory
    inputTensor.dispose();
    if (Array.isArray(predictionTensor)) {
        predictionTensor.forEach(t => t.dispose());
    } else {
        predictionTensor.dispose();
    }

    const predictedMood = indexToMood[predictedClassIndex];
    // console.log(`Predicted class index: ${predictedClassIndex}, Mood: ${predictedMood}`); // For debugging

    if (predictedMood === undefined) {
        console.error(`Prediction resulted in an undefined mood for index: ${predictedClassIndex}`);
        return null; // Or a default mood string
    }

    return predictedMood;

  } catch (error) {
    console.error('Error during mood prediction:', error);
    // Consider if specific error messages should be returned or if null is sufficient
    return null;
  }
}

// Example Usage (can be commented out or removed for production)
/*
(async () => {
  try {
    // No need to call loadModel() here, predictMoodForMeal will do it.
    const exampleMealData1 = {
      mealSizeCode: 1, // medium
      hungerBefore: 5,
      hungerAfter: 2,
      mealTypeString: "lunch",
      hourOfDay: 13
    };
    let predictedMood = await predictMoodForMeal(exampleMealData1);
    console.log("Example 1 - Predicted mood:", predictedMood);

    const exampleMealData2 = {
      mealSizeCode: 0, // small
      hungerBefore: 7,
      hungerAfter: 5,
      mealTypeString: "snack",
      hourOfDay: 16
    };
    predictedMood = await predictMoodForMeal(exampleMealData2);
    console.log("Example 2 - Predicted mood:", predictedMood);

    const exampleMealData3 = {
      mealSizeCode: 2, // large
      hungerBefore: 8,
      hungerAfter: 1,
      mealTypeString: "dinner",
      hourOfDay: 19
    };
    predictedMood = await predictMoodForMeal(exampleMealData3);
    console.log("Example 3 - Predicted mood:", predictedMood);

  } catch (error) {
    // This catch is for errors in the example usage itself,
    // not for errors during prediction if predictMoodForMeal handles them by returning null.
    console.error("Error in example usage:", error);
  }
})();
*/
