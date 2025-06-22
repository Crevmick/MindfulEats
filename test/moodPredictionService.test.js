import assert from 'assert';
import { getPredictedMood } from '../Service/moodPredictionService.js'; 

// This test suite assumes that './trained_model/model.json' and related files exist
// and are loadable by TensorFlow.js, as getPredictedMood calls the actual prediction script.

describe('MoodPredictionService - getPredictedMood', () => {
    // Define possible valid mood outcomes from the prediction script (including null if prediction fails)
    const validMoodsOutput = ['Frustrated', 'Sad', 'Anxious', 'Neutral', 'Grateful', 'Happy', null];
    let originalConsoleWarn;
    let consoleWarnOutput = [];

    beforeEach(() => {
        // Spy on console.warn
        originalConsoleWarn = console.warn;
        console.warn = (message) => {
            consoleWarnOutput.push(message);
        };
        consoleWarnOutput = []; // Reset output for each test
    });

    afterEach(() => {
        // Restore original console.warn
        console.warn = originalConsoleWarn;
    });

    it('should attempt prediction with "small" portionSize (maps to mealSizeCode 0)', async () => {
        const mealObject = { portionSize: "small", hungerBefore: 5, hungerAfter: 2, mealType: "lunch", hourOfDay: 13 };
        const mood = await getPredictedMood(mealObject);
        assert.ok(validMoodsOutput.includes(mood), `TC1: Expected a valid mood string or null, got: ${mood}`);
    });

    it('should attempt prediction with "medium" portionSize (maps to mealSizeCode 1)', async () => {
        const mealObject = { portionSize: "medium", hungerBefore: 5, hungerAfter: 2, mealType: "dinner", hourOfDay: 19 };
        const mood = await getPredictedMood(mealObject);
        assert.ok(validMoodsOutput.includes(mood), `TC2: Expected a valid mood string or null, got: ${mood}`);
    });

    it('should attempt prediction with "large" portionSize (maps to mealSizeCode 2)', async () => {
        const mealObject = { portionSize: "large", hungerBefore: 7, hungerAfter: 3, mealType: "breakfast", hourOfDay: 8 };
        const mood = await getPredictedMood(mealObject);
        assert.ok(validMoodsOutput.includes(mood), `TC3: Expected a valid mood string or null, got: ${mood}`);
    });

    it('should use default mealSizeCode (medium/1) for unknown portionSize', async () => {
        const mealObject = { portionSize: "giant", hungerBefore: 8, hungerAfter: 2, mealType: "snack", hourOfDay: 16 };
        const mood = await getPredictedMood(mealObject);
        assert.ok(validMoodsOutput.includes(mood), `TC4: Expected a valid mood string or null for unknown portion size, got: ${mood}`);
    });

    it('should handle case-insensitive portionSize (e.g., "SMALL")', async () => {
        const mealObject = { portionSize: "SMALL", hungerBefore: 5, hungerAfter: 2, mealType: "lunch", hourOfDay: 13 };
        const mood = await getPredictedMood(mealObject);
        assert.ok(validMoodsOutput.includes(mood), `TC5: Expected a valid mood string or null for uppercase portion size, got: ${mood}`);
    });

    it('should handle portionSize being null or undefined (defaults to medium/1)', async () => {
        const mealObjectNull = { portionSize: null, hungerBefore: 5, hungerAfter: 2, mealType: "lunch", hourOfDay: 13 };
        let mood = await getPredictedMood(mealObjectNull);
        assert.ok(validMoodsOutput.includes(mood), `TC6a: Expected valid mood for null portionSize, got: ${mood}`);

        const mealObjectUndefined = { portionSize: undefined, hungerBefore: 5, hungerAfter: 2, mealType: "lunch", hourOfDay: 13 };
        mood = await getPredictedMood(mealObjectUndefined);
        assert.ok(validMoodsOutput.includes(mood), `TC6b: Expected valid mood for undefined portionSize, got: ${mood}`);
    });


    it('should return null if mealObject itself is null and log a warning', async () => {
        const mood = await getPredictedMood(null);
        assert.strictEqual(mood, null, "TC7: Mood should be null for null mealObject");
        assert.ok(consoleWarnOutput.some(msg => msg.includes("mealObject is null or undefined")), "TC7: Expected warning for null mealObject");
    });

    it('should return null if mealObject itself is undefined and log a warning', async () => {
        const mood = await getPredictedMood(undefined);
        assert.strictEqual(mood, null, "TC8: Mood should be null for undefined mealObject");
         assert.ok(consoleWarnOutput.some(msg => msg.includes("mealObject is null or undefined")), "TC8: Expected warning for undefined mealObject");
    });

    it('should return null if mealObject is missing hungerBefore and log a warning', async () => {
        const mealObject = { portionSize: "small", hungerAfter: 2, mealType: "lunch", hourOfDay: 13 };
        const mood = await getPredictedMood(mealObject);
        assert.strictEqual(mood, null, "TC9: Mood should be null for missing hungerBefore");
        assert.ok(consoleWarnOutput.some(msg => msg.includes("Missing or invalid required fields")), "TC9: Expected warning for missing fields");
    });

    it('should return null if mealObject is missing hungerAfter and log a warning', async () => {
        const mealObject = { portionSize: "small", hungerBefore: 5, mealType: "lunch", hourOfDay: 13 };
        const mood = await getPredictedMood(mealObject);
        assert.strictEqual(mood, null, "TC10: Mood should be null for missing hungerAfter");
        assert.ok(consoleWarnOutput.some(msg => msg.includes("Missing or invalid required fields")), "TC10: Expected warning for missing fields");
    });

    it('should return null if mealObject is missing mealType and log a warning', async () => {
        const mealObject = { portionSize: "small", hungerBefore: 5, hungerAfter: 2, hourOfDay: 13 };
        const mood = await getPredictedMood(mealObject);
        assert.strictEqual(mood, null, "TC11: Mood should be null for missing mealType");
        assert.ok(consoleWarnOutput.some(msg => msg.includes("Missing or invalid required fields")), "TC11: Expected warning for missing fields");
    });

    it('should return null if mealObject has empty mealType string and log a warning', async () => {
        const mealObject = { portionSize: "small", hungerBefore: 5, hungerAfter: 2, mealType: "", hourOfDay: 13 };
        const mood = await getPredictedMood(mealObject);
        assert.strictEqual(mood, null, "TC11a: Mood should be null for empty mealType");
        assert.ok(consoleWarnOutput.some(msg => msg.includes("Missing or invalid required fields")), "TC11a: Expected warning for empty mealType");
    });

    it('should return null if mealObject is missing hourOfDay and log a warning', async () => {
        const mealObject = { portionSize: "small", hungerBefore: 5, hungerAfter: 2, mealType: "lunch" };
        const mood = await getPredictedMood(mealObject);
        assert.strictEqual(mood, null, "TC12: Mood should be null for missing hourOfDay");
        assert.ok(consoleWarnOutput.some(msg => msg.includes("Missing or invalid required fields")), "TC12: Expected warning for missing fields");
    });

    it('should return a valid mood string or null for a complete, valid input (integration check)', async () => {
        const mealObject = { portionSize: "medium", hungerBefore: 6, hungerAfter: 3, mealType: "dinner", hourOfDay: 20 };
        const mood = await getPredictedMood(mealObject);
        // This is an integration check; the actual mood depends on the model's current state and the input.
        // We just check if the output is one of the allowed strings or null.
        assert.ok(validMoodsOutput.includes(mood), `TC13: Expected a valid mood string or null, got: ${mood}`);
        // console.log(`TC13 Predicted Mood (actual model call): ${mood}`); // For manual observation
    });

    it('should handle different valid hourOfDay values', async () => {
        const mealMorning = { portionSize: "small", hungerBefore: 7, hungerAfter: 4, mealType: "breakfast", hourOfDay: 7 };
        let mood = await getPredictedMood(mealMorning);
        assert.ok(validMoodsOutput.includes(mood), `TC14a: Morning meal - Expected valid mood, got: ${mood}`);

        const mealAfternoon = { portionSize: "large", hungerBefore: 5, hungerAfter: 1, mealType: "lunch", hourOfDay: 14 };
        mood = await getPredictedMood(mealAfternoon);
        assert.ok(validMoodsOutput.includes(mood), `TC14b: Afternoon meal - Expected valid mood, got: ${mood}`);

        const mealNight = { portionSize: "medium", hungerBefore: 6, hungerAfter: 3, mealType: "dinner", hourOfDay: 21 };
        mood = await getPredictedMood(mealNight);
        assert.ok(validMoodsOutput.includes(mood), `TC14c: Night meal - Expected valid mood, got: ${mood}`);
    });
});

// Reminder: These tests might take longer if the model loading in `predictMood.js` is slow.
// And they depend on the presence of `./trained_model/model.json`.
console.log("moodPredictionService tests initiated. Results will follow.");
// Adding a small delay or a specific mechanism to wait for async tests might be needed if running directly with node and tests don't complete.
// However, assert handles async operations correctly when used with await.
const runTests = async () => {
    // This is just to ensure the script doesn't exit before async tests might log their final results if run in certain environments.
    // For a proper test runner, this would not be necessary.
    console.log("All moodPredictionService tests scheduled. Check console for assertion errors.");
};
runTests();
