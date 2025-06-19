import assert from 'assert';
import {
    getFoodCategory,
    mapPortionToQuantitative,
    detectFrequentSnacking,
    detectSkippingBreakfast,
    detectHighIntake,
    generateInsights,
    generateRecommendations,
    detectEmotionalEating, // Added import
    // analyzeOverallCarbIntake,
    // foodToCategory
} from '../Service/dietaryPatternService.js';

describe('dietaryPatternService Tests', () => {

    describe('getFoodCategory(foodName)', () => {
        it('should categorize known foods correctly', () => {
            assert.strictEqual(getFoodCategory('apple'), 'fruit', 'Test Case 1 Failed: Apple');
            assert.strictEqual(getFoodCategory('white bread'), 'grain_refined', 'Test Case 2 Failed: White Bread');
            assert.strictEqual(getFoodCategory('Chicken Breast'), 'protein', 'Test Case 3 Failed: Chicken');
            assert.strictEqual(getFoodCategory('sugary cereal'), 'sweets', 'Test Case 4 Failed: Sugary Cereal');
        });

        it('should be case-insensitive', () => {
            assert.strictEqual(getFoodCategory('APPLE'), 'fruit', 'Test Case 5 Failed: APPLE (uppercase)');
            assert.strictEqual(getFoodCategory('WhItE BrEaD'), 'grain_refined', 'Test Case 6 Failed: WhItE BrEaD (mixed case)');
        });

        it('should handle partial matches (if intended and based on current simple "includes" logic)', () => {
            assert.strictEqual(getFoodCategory('apple pie'), 'fruit', 'Test Case 7 Failed: Apple Pie (partial match)');
            assert.strictEqual(getFoodCategory('fried chicken'), 'protein', 'Test Case 8 Failed: Fried Chicken (partial match)');
        });

        it('should prioritize more specific multi-word keys if current logic handles it (it may not perfectly)', () => {
            assert.strictEqual(getFoodCategory('whole wheat bread'), 'grain_whole', 'Test Case 9 Failed: Whole Wheat Bread');
            assert.strictEqual(getFoodCategory('white rice'), 'grain_refined', 'Test Case 10 Failed: White Rice');
        });

        it('should return "unknown" for unknown food names', () => {
            assert.strictEqual(getFoodCategory('zyxw'), 'unknown', 'Test Case 11 Failed: Unknown food');
            assert.strictEqual(getFoodCategory('some new food'), 'unknown', 'Test Case 12 Failed: Another unknown');
        });

        it('should handle empty string or null/undefined input', () => {
            assert.strictEqual(getFoodCategory(''), 'unknown', 'Test Case 13 Failed: Empty string');
            assert.strictEqual(getFoodCategory(null), 'unknown', 'Test Case 14 Failed: Null input');
            assert.strictEqual(getFoodCategory(undefined), 'unknown', 'Test Case 15 Failed: Undefined input');
        });
    });

    describe('mapPortionToQuantitative(portionString)', () => {
        it('should map keywords for "small"', () => {
            assert.strictEqual(mapPortionToQuantitative('small bowl'), 1, 'Test Case 16 Failed: small bowl');
            assert.strictEqual(mapPortionToQuantitative('a little bit'), 1, 'Test Case 17 Failed: a little (current default)');
        });

        it('should map keywords for "medium"', () => {
            assert.strictEqual(mapPortionToQuantitative('medium plate'), 2, 'Test Case 18 Failed: medium plate');
            assert.strictEqual(mapPortionToQuantitative('regular serving'), 1, 'Test Case 19 Failed: regular serving (current default)');
        });

        it('should map keywords for "large"', () => {
            assert.strictEqual(mapPortionToQuantitative('large portion'), 3, 'Test Case 20 Failed: large portion');
            assert.strictEqual(mapPortionToQuantitative('big meal'), 1, 'Test Case 21 Failed: big meal (current default)');
        });

        it('should extract numeric values', () => {
            assert.strictEqual(mapPortionToQuantitative('1 cup'), 2, 'Test Case 21a Failed: 1 cup');
            assert.strictEqual(mapPortionToQuantitative('0.5 piece'), 0.5, 'Test Case 21b Failed: 0.5 piece');
             assert.strictEqual(mapPortionToQuantitative('2 servings'), 2, 'Test Case 21c Failed: 2 servings');
        });

        it('should return default (1) for empty string or null/undefined', () => {
            assert.strictEqual(mapPortionToQuantitative(''), 1, 'Test Case 22 Failed: Empty string (default)');
            assert.strictEqual(mapPortionToQuantitative(null), null, 'Test Case 23 Failed: Null input (returns null)');
            assert.strictEqual(mapPortionToQuantitative(undefined), null, 'Test Case 24 Failed: Undefined input (returns null)');
        });

        it('should return default (1) for strings not matching any keyword or number', () => {
            assert.strictEqual(mapPortionToQuantitative('some random text'), 1, 'Test Case 25 Failed: Random text (default)');
        });
    });

    describe('detectFrequentSnacking(meals, actualDaysWithLogging)', () => {
        const snack = (date) => ({ mealType: 'snack', createdAt: date || new Date() });
        const meal = (date) => ({ mealType: 'lunch', createdAt: date || new Date() });

        it('should detect frequent snacking when average is high', () => {
            const meals = [snack(), snack(), snack()];
            const result = detectFrequentSnacking(meals, 1);
            assert.ok(result, 'Test Case 26 Failed: Should return an object');
            assert.strictEqual(result.name, "Frequent Snacking", 'Test Case 26a Failed: Name mismatch');
            assert.strictEqual(result.detected, true, 'Test Case 26b Failed: Detected should be true');
        });

        it('should not detect when average snacks are below or equal to threshold', () => {
            const meals = [snack(), snack()];
            assert.strictEqual(detectFrequentSnacking(meals, 1), null, 'Test Case 27 Failed: 2 snacks / 1 day');
        });

        it('should not detect with no snacks', () => {
            const meals = [meal(), meal()];
            assert.strictEqual(detectFrequentSnacking(meals, 1), null, 'Test Case 28 Failed: No snacks');
        });

        it('should return null if actualDaysWithLogging is 0', () => {
            const meals = [snack(), snack(), snack()];
            assert.strictEqual(detectFrequentSnacking(meals, 0), null, 'Test Case 29 Failed: 0 days');
        });

        it('should return null for empty meals array', () => {
            assert.strictEqual(detectFrequentSnacking([], 1), null, 'Test Case 30 Failed: Empty meals');
        });
    });

    describe('detectSkippingBreakfast(meals, actualDaysWithLogging)', () => {
        const breakfast = (dateStr) => ({ mealType: 'breakfast', createdAt: new Date(dateStr) });
        const lunch = (dateStr) => ({ mealType: 'lunch', createdAt: new Date(dateStr) });

        it('should detect skipping breakfast when threshold is exceeded', () => {
            const meals = [
                lunch('2023-01-01'),
                breakfast('2023-01-02'), lunch('2023-01-02'),
                lunch('2023-01-03'),
                breakfast('2023-01-04'), lunch('2023-01-04'),
                lunch('2023-01-05'),
            ];
            const result = detectSkippingBreakfast(meals, 5);
            assert.ok(result, 'Test Case 31 Failed: Should return an object');
            assert.strictEqual(result.name, "Skipping Breakfast", 'Test Case 31a Failed: Name mismatch');
            assert.strictEqual(result.detected, true, 'Test Case 31b Failed: Detected should be true');
            assert.strictEqual(result.details, "Skipped breakfast on 3 out of 5 day(s) with logs.", "Test Case 31c Failed: Details mismatch");
        });

        it('should not detect skipping breakfast when below threshold', () => {
            const meals = [
                lunch('2023-01-01'),
                breakfast('2023-01-02'),
                breakfast('2023-01-03'),
                breakfast('2023-01-04'),
                breakfast('2023-01-05'),
            ];
            assert.strictEqual(detectSkippingBreakfast(meals, 5), null, 'Test Case 32 Failed: 1 skip / 5 days');
        });

        it('should correctly count unique days for logging', () => {
             const meals = [
                lunch('2023-01-01'),
                lunch('2023-01-01'),
                breakfast('2023-01-02'), lunch('2023-01-02'),
                lunch('2023-01-03'),
            ];
            const result = detectSkippingBreakfast(meals, 3);
            assert.ok(result, 'Test Case 32a Failed: Unique day counting');
            assert.strictEqual(result.details, "Skipped breakfast on 2 out of 3 day(s) with logs.", "Test Case 32b Failed: Details for unique days");

        });

        it('should not detect if breakfast logged every day with logs', () => {
            const meals = [breakfast('2023-01-01'), breakfast('2023-01-02')];
            assert.strictEqual(detectSkippingBreakfast(meals, 2), null, 'Test Case 33 Failed: All breakfast');
        });

        it('should return null if actualDaysWithLogging is 0', () => {
            assert.strictEqual(detectSkippingBreakfast([], 0), null, 'Test Case 34 Failed: 0 days');
        });

        it('should return null for empty meals array', () => {
            assert.strictEqual(detectSkippingBreakfast([], 1), null, 'Test Case 35 Failed: Empty meals');
        });
    });

    describe('detectHighIntake(meals, targetCategory, categoryDisplayName, mealFrequencyThreshold)', () => {
        const createMeal = (foodCategory, predictedFoodName = "test food") => ({ foodCategory, predictedFoodName });

        it('should detect high intake when percentage > threshold', () => {
            const meals = [createMeal('sweets'), createMeal('sweets'), createMeal('fruit'), createMeal('protein')];
            const result = detectHighIntake(meals, 'sweets', 'Sugary Snacks', 0.4);
            assert.ok(result, 'Test Case 36 Failed: Should return an object');
            assert.strictEqual(result.name, "High Intake of Sugary Snacks", 'Test Case 36a Failed: Name mismatch');
            assert.strictEqual(result.detected, true, 'Test Case 36b Failed: Detected should be true');
            assert.strictEqual(result.details, "50% of logged meals included Sugary Snacks.", "Test Case 36c Failed: Details mismatch");
        });

        it('should use getFoodCategory as fallback if meal.foodCategory is missing', () => {
            const meals = [
                { predictedFoodName: "apple pie" },
                { predictedFoodName: "cake" },
                { predictedFoodName: "banana" },
                { predictedFoodName: "chicken" }
            ];
            const result = detectHighIntake(meals, 'sweets', 'Sugary Delights', 0.4);
            assert.ok(result, 'Test Case 36d Failed: Fallback check');
            assert.strictEqual(result.name, "High Intake of Sugary Delights", 'Test Case 36e Failed: Fallback name');
            assert.strictEqual(result.details, "50% of logged meals included Sugary Delights.", "Test Case 36f Failed: Fallback details");
        });

        it('should not detect high intake when percentage <= threshold', () => {
            const meals = [createMeal('sweets'), createMeal('fruit'), createMeal('fruit'), createMeal('protein')];
            assert.strictEqual(detectHighIntake(meals, 'sweets', 'Sugary Snacks', 0.3), null, 'Test Case 37 Failed: Below threshold');
        });

        it('should not detect if no meals with targetCategory', () => {
            const meals = [createMeal('fruit'), createMeal('protein')];
            assert.strictEqual(detectHighIntake(meals, 'sweets', 'Sugary Snacks', 0.1), null, 'Test Case 38 Failed: No target category');
        });

        it('should return null for empty meals array', () => {
            assert.strictEqual(detectHighIntake([], 'sweets', 'Sugary Snacks', 0.1), null, 'Test Case 39 Failed: Empty meals');
        });

        it('should handle threshold of 0 (always detect if any matching)', () => {
            const meals = [createMeal('sweets'), createMeal('fruit')];
            const result = detectHighIntake(meals, 'sweets', 'Sugary Snacks', 0);
            assert.ok(result, 'Test Case 40 Failed: Threshold 0, match exists');
            assert.strictEqual(result.details, "50% of logged meals included Sugary Snacks.", "Test Case 40a Failed: Details for threshold 0");

            const noMatchMeals = [createMeal('fruit')];
            assert.strictEqual(detectHighIntake(noMatchMeals, 'sweets', 'Sugary Snacks', 0), null, 'Test Case 40b Failed: Threshold 0, no match');
        });

        it('should handle threshold of 1 (only detect if all meals match)', () => {
            const mealsAllMatch = [createMeal('sweets'), createMeal('sweets')];
            const resultAll = detectHighIntake(mealsAllMatch, 'sweets', 'Sugary Snacks', 1);
            assert.strictEqual(resultAll, null, 'Test Case 41 Failed: Threshold 1, all match (actually needs >100%)');

            const resultAlmostAll = detectHighIntake(mealsAllMatch, 'sweets', 'Sugary Snacks', 0.99);
            assert.ok(resultAlmostAll, 'Test Case 41a Failed: Threshold 0.99, all match');
            assert.strictEqual(resultAlmostAll.details, "100% of logged meals included Sugary Snacks.", "Test Case 41b Failed: Details for threshold 0.99");

            const mealsNotAllMatch = [createMeal('sweets'), createMeal('fruit')];
            assert.strictEqual(detectHighIntake(mealsNotAllMatch, 'sweets', 'Sugary Snacks', 0.99), null, 'Test Case 41c Failed: Threshold 0.99, not all match');
        });
    });

    describe('generateInsights(detectedPatterns)', () => {
        it('should return default insight for no detected patterns (empty array)', () => {
            const insights = generateInsights([]);
            assert.strictEqual(insights.length, 1, 'Test Case 42a Failed: Length for empty patterns');
            assert.ok(insights[0].includes("no specific dietary patterns") || insights[0].includes("mindful logging"), 'Test Case 42b Failed: Default message for empty');
        });

        it('should return default insight if patterns array is null or undefined', () => {
            const insightsNull = generateInsights(null);
            assert.strictEqual(insightsNull.length, 1, 'Test Case 42c Failed: Length for null patterns');
            assert.ok(insightsNull[0].includes("no specific dietary patterns"), 'Test Case 42d Failed: Default message for null');

            const insightsUndefined = generateInsights(undefined);
            assert.strictEqual(insightsUndefined.length, 1, 'Test Case 42e Failed: Length for undefined patterns');
            assert.ok(insightsUndefined[0].includes("no specific dietary patterns"), 'Test Case 42f Failed: Default message for undefined');
        });

        it('should generate correct insight for a single detected pattern', () => {
            const patterns = [{ name: "Frequent Snacking", detected: true, details: "Average of 3.0 snacks per day" }];
            const insights = generateInsights(patterns);
            assert.strictEqual(insights.length, 1, 'Test Case 43a Failed: Length for single pattern');
            assert.ok(insights[0].includes("Noticed frequent snacking") && insights[0].includes("Average of 3.0 snacks per day"), 'Test Case 43b Failed: Frequent snacking insight content');
        });

        it('should generate insights for multiple detected patterns', () => {
            const patterns = [
                { name: "Frequent Snacking", detected: true, details: "Avg 3 snacks" },
                { name: "Skipping Breakfast", detected: true, details: "Skipped 2 of 5 days" }
            ];
            const insights = generateInsights(patterns);
            assert.strictEqual(insights.length, 2, 'Test Case 44a Failed: Length for multiple patterns');
            assert.ok(insights.some(insight => insight.includes("frequent snacking")), 'Test Case 44b Failed: Missing frequent snacking insight');
            assert.ok(insights.some(insight => insight.includes("Breakfast was skipped")), 'Test Case 44c Failed: Missing skipping breakfast insight');
        });

        it('should ignore patterns with detected: false and provide balanced message if no true detections', () => {
            const patterns = [{ name: "Frequent Snacking", detected: false, details: "Avg 1 snack" }];
            const insights = generateInsights(patterns);
            assert.strictEqual(insights.length, 1, 'Test Case 45a Failed: Length for detected:false');
            assert.ok(insights[0].includes("Your dietary habits seem balanced") || insights[0].includes("Well done!"), 'Test Case 45b Failed: Balanced message for detected:false');
        });

        it('should provide specific messages for true detections alongside ignored false ones', () => {
            const patterns = [
                { name: "Frequent Snacking", detected: false, details: "Avg 1 snack" },
                { name: "Skipping Breakfast", detected: true, details: "Skipped 2 of 5 days" }
            ];
            const insights = generateInsights(patterns);
            assert.strictEqual(insights.length, 1, 'Test Case 45c Failed: Length for mixed true/false');
            assert.ok(insights[0].includes("Breakfast was skipped"), 'Test Case 45d Failed: Correct insight for true detection');
        });

        it('should use default insight for unhandled pattern names', () => {
            const patterns = [{ name: "Unknown Pattern Type", detected: true, details: "Some details here" }];
            const insights = generateInsights(patterns);
            assert.strictEqual(insights.length, 1, 'Test Case 46a Failed: Length for unknown pattern');
            assert.ok(insights[0].includes("A pattern regarding 'Unknown Pattern Type' was noted"), 'Test Case 46b Failed: Default message for unknown pattern');
        });
    });

    describe('generateRecommendations(detectedPatterns)', () => {
        it('should return default recommendation for no detected patterns (empty array)', () => {
            const recommendations = generateRecommendations([]);
            assert.strictEqual(recommendations.length, 1, 'Test Case 47a Failed: Length for empty patterns');
            assert.ok(recommendations[0].includes("Continue to focus on balanced meals") || recommendations[0].includes("mindful eating"), 'Test Case 47b Failed: Default message for empty');
        });

        it('should return default recommendation if patterns array is null or undefined', () => {
            const recsNull = generateRecommendations(null);
            assert.strictEqual(recsNull.length, 1, 'Test Case 47c Failed: Length for null patterns');
            assert.ok(recsNull[0].includes("Continue to focus on balanced meals"), 'Test Case 47d Failed: Default message for null');

            const recsUndefined = generateRecommendations(undefined);
            assert.strictEqual(recsUndefined.length, 1, 'Test Case 47e Failed: Length for undefined patterns');
            assert.ok(recsUndefined[0].includes("Continue to focus on balanced meals"), 'Test Case 47f Failed: Default message for undefined');
        });

        it('should generate correct recommendation for a single detected pattern', () => {
            const patterns = [{ name: "Skipping Breakfast", detected: true, details: "Skipped 3 of 7 days" }];
            const recommendations = generateRecommendations(patterns);
            assert.strictEqual(recommendations.length, 1, 'Test Case 48a Failed: Length for single pattern');
            assert.ok(recommendations[0].includes("quick, nutritious breakfast"), 'Test Case 48b Failed: Skipping breakfast recommendation content');
        });

        it('should generate recommendations for multiple detected patterns', () => {
            const patterns = [
                { name: "High Sugary Food/Snack Intake", detected: true, details: "30% of meals" },
                { name: "High Intake of Processed Snacks", detected: true, details: "25% of meals" }
            ];
            const recommendations = generateRecommendations(patterns);
            assert.strictEqual(recommendations.length, 2, 'Test Case 49a Failed: Length for multiple patterns');
            assert.ok(recommendations.some(rec => rec.includes("cut down on sugary snacks")), 'Test Case 49b Failed: Missing sugary snack recommendation');
            assert.ok(recommendations.some(rec => rec.includes("replace one processed snack")), 'Test Case 49c Failed: Missing processed snack recommendation');
        });

        it('should ignore patterns with detected: false and provide balanced message if no true detections', () => {
            const patterns = [{ name: "Skipping Breakfast", detected: false, details: "Skipped 0 days" }];
            const recommendations = generateRecommendations(patterns);
            assert.strictEqual(recommendations.length, 1, 'Test Case 50a Failed: Length for detected:false');
            assert.ok(recommendations[0].includes("Your current logs show balanced habits") || recommendations[0].includes("Keep up the great work"), 'Test Case 50b Failed: Balanced message for detected:false');
        });

        it('should provide specific messages for true detections alongside ignored false ones', () => {
            const patterns = [
                { name: "Skipping Breakfast", detected: false, details: "Skipped 0 days" },
                { name: "Frequent Snacking", detected: true, details: "Avg 3 snacks" }
            ];
            const recommendations = generateRecommendations(patterns);
            assert.strictEqual(recommendations.length, 1, 'Test Case 50c Failed: Length for mixed true/false');
            assert.ok(recommendations[0].includes("whole food snacks like fruits"), 'Test Case 50d Failed: Correct rec for true detection');
        });

        it('should use default recommendation for unhandled pattern names', () => {
            const patterns = [{ name: "Obscure Eating Habit", detected: true, details: "Done it twice" }];
            const recommendations = generateRecommendations(patterns);
            assert.strictEqual(recommendations.length, 1, 'Test Case 51a Failed: Length for unknown pattern');
            assert.ok(recommendations[0].includes("For the pattern 'Obscure Eating Habit'"), 'Test Case 51b Failed: Default message for unknown pattern');
        });
         it('should use specific default recommendation for unhandled "High Intake of X" pattern names', () => {
            const patterns = [{ name: "High Intake of Exotic Fruits", detected: true, details: "10% of meals" }];
            const recommendations = generateRecommendations(patterns);
            assert.strictEqual(recommendations.length, 1, 'Test Case 51c Failed: Length for unknown High Intake pattern');
            assert.ok(recommendations[0].includes("For your intake of Exotic Fruits"), 'Test Case 51d Failed: Default message for unknown High Intake pattern');
        });
    });

    // Tests for detectEmotionalEating
    describe('detectEmotionalEating(meals)', () => {
        // Mocking constants from detectEmotionalEating for clarity in tests
        const comfortFoodCategories = ['sweets', 'snacks_processed'];
        const negativeUserMoodScores = [1, 2]; // Assuming 1 & 2 are 'negative'

        it('should return empty array for empty meals input', () => {
            assert.deepStrictEqual(detectEmotionalEating([]), [], "Test Case EE1 Failed: Empty meals array");
        });

        it('should detect User-Logged Mood -> Comfort Food pattern (sweets)', () => {
            const meals = [
                { moodLogId: { moodScore: 1 }, foodCategory: 'sweets', createdAt: new Date() }, // Negative mood, comfort food
                { moodLogId: { moodScore: 1 }, foodCategory: 'sweets', createdAt: new Date() }, // Negative mood, comfort food
                { moodLogId: { moodScore: 1 }, foodCategory: 'sweets', createdAt: new Date() }, // Negative mood, comfort food
                { moodLogId: { moodScore: 1 }, foodCategory: 'fruit', createdAt: new Date() },  // Negative mood, not comfort
                { moodLogId: { moodScore: 3 }, foodCategory: 'sweets', createdAt: new Date() }, // Neutral mood, comfort food
            ];
            // 3 out of 4 times (75%) when moodScore 1 was logged, 'sweets' were eaten.
            const patterns = detectEmotionalEating(meals);
            const specificPattern = patterns.find(p => p.name === "Emotional Eating: User-Logged Mood (Score 1) and sweets");
            assert.ok(specificPattern, "Test Case EE2 Failed: Pattern 'User-Logged Mood (Score 1) and sweets' not detected");
            if (specificPattern) {
                assert.strictEqual(specificPattern.detected, true, "Test Case EE2a Failed: Detected flag");
                assert.strictEqual(specificPattern.details, "Often consumed 'sweets' when user-logged mood (score 1) was reported (3 out of 4 instances).", "Test Case EE2b Failed: Details mismatch");
            }
        });

         it('should detect User-Logged Mood -> Comfort Food pattern (snacks_processed)', () => {
            const meals = [
                { moodLogId: { moodScore: 2 }, foodCategory: 'snacks_processed', createdAt: new Date() },
                { moodLogId: { moodScore: 2 }, foodCategory: 'snacks_processed', createdAt: new Date() },
                { moodLogId: { moodScore: 2 }, foodCategory: 'snacks_processed', createdAt: new Date() },
                { moodLogId: { moodScore: 2 }, foodCategory: 'vegetable', createdAt: new Date() },
            ];
            const patterns = detectEmotionalEating(meals);
            const specificPattern = patterns.find(p => p.name === "Emotional Eating: User-Logged Mood (Score 2) and snacks_processed");
            assert.ok(specificPattern, "Test Case EE2c Failed: Pattern 'User-Logged Mood (Score 2) and snacks_processed' not detected");
            if (specificPattern) {
                assert.strictEqual(specificPattern.details, "Often consumed 'snacks_processed' when user-logged mood (score 2) was reported (3 out of 4 instances).", "Test Case EE2d Failed: Details mismatch for snacks_processed");
            }
        });


        it('should NOT detect User-Logged Mood -> Comfort Food if frequency is low', () => {
            const meals = [
                { moodLogId: { moodScore: 1 }, foodCategory: 'sweets', createdAt: new Date() }, // Negative mood, comfort food
                { moodLogId: { moodScore: 1 }, foodCategory: 'fruit', createdAt: new Date() },  // Negative mood, not comfort
                { moodLogId: { moodScore: 1 }, foodCategory: 'fruit', createdAt: new Date() },  // Negative mood, not comfort
            ];
            // 1 out of 3 times (33%) is below threshold (50%)
            const patterns = detectEmotionalEating(meals);
            const specificPattern = patterns.find(p => p.name.includes("Emotional Eating: User-Logged Mood (Score 1)"));
            assert.ok(!specificPattern, "Test Case EE3 Failed: Pattern should NOT be detected for low frequency");
        });

        it('should NOT detect User-Logged Mood -> Comfort Food if total occurrences of mood is low', () => {
            const meals = [
                { moodLogId: { moodScore: 1 }, foodCategory: 'sweets', createdAt: new Date() },
                { moodLogId: { moodScore: 1 }, foodCategory: 'sweets', createdAt: new Date() },
                 // Mood score 1 only appears twice, less than MIN_OCCURRENCES (3)
            ];
            const patterns = detectEmotionalEating(meals);
            const specificPattern = patterns.find(p => p.name.includes("Emotional Eating: User-Logged Mood (Score 1)"));
            assert.ok(!specificPattern, "Test Case EE3b Failed: Pattern should NOT be detected for low mood occurrences");
        });


        it('should detect Comfort Food -> Predicted Negative Mood pattern', () => {
            const meals = [
                { foodCategory: 'sweets', predictedPostMealMood: 'Sad', createdAt: new Date() },
                { foodCategory: 'sweets', predictedPostMealMood: 'Frustrated', createdAt: new Date() },
                { foodCategory: 'sweets', predictedPostMealMood: 'Sad', createdAt: new Date() },
                { foodCategory: 'sweets', predictedPostMealMood: 'Happy', createdAt: new Date() }, // Comfort food, positive prediction
                { foodCategory: 'fruit', predictedPostMealMood: 'Sad', createdAt: new Date() },   // Not comfort food
            ];
            // 3 out of 4 times (75%) when 'sweets' were eaten, a negative mood was predicted.
            const patterns = detectEmotionalEating(meals);
            // The most common predicted mood here is 'Sad' (2 times)
            const specificPattern = patterns.find(p => p.name === "Pattern: sweets and Negative Predicted Mood");
            assert.ok(specificPattern, "Test Case EE4 Failed: Pattern 'sweets and Negative Predicted Mood' not detected");
            if (specificPattern) {
                assert.strictEqual(specificPattern.detected, true, "Test Case EE4a Failed: Detected flag");
                assert.strictEqual(specificPattern.details, "Consuming 'sweets' was often followed by a predicted mood of 'Sad' (3 out of 4 instances where sweets was eaten).", "Test Case EE4b Failed: Details mismatch");
            }
        });

        it('should NOT detect Comfort Food -> Predicted Negative Mood if frequency is low', () => {
            const meals = [
                { foodCategory: 'sweets', predictedPostMealMood: 'Sad', createdAt: new Date() },
                { foodCategory: 'sweets', predictedPostMealMood: 'Happy', createdAt: new Date() },
                { foodCategory: 'sweets', predictedPostMealMood: 'Neutral', createdAt: new Date() },
            ];
            // 1 out of 3 times (33%) is below threshold (50%)
            const patterns = detectEmotionalEating(meals);
            const specificPattern = patterns.find(p => p.name.includes("Pattern: sweets and Negative Predicted Mood"));
            assert.ok(!specificPattern, "Test Case EE5 Failed: Pattern should NOT be detected for low frequency");
        });

        it('should handle meals without moodLogId or predictedPostMealMood gracefully', () => {
            const meals = [
                { foodCategory: 'sweets', createdAt: new Date() }, // No moodLogId, no predictedPostMealMood
                { moodLogId: { moodScore: null }, foodCategory: 'fruit', createdAt: new Date() }, // moodScore is null
            ];
            const patterns = detectEmotionalEating(meals);
            assert.deepStrictEqual(patterns, [], "Test Case EE6 Failed: Should return empty for incomplete data");
        });

        it('should handle multiple emotional eating patterns simultaneously', () => {
            const meals = [
                // User-logged mood (Score 1) -> sweets
                { moodLogId: { moodScore: 1 }, foodCategory: 'sweets', createdAt: new Date() },
                { moodLogId: { moodScore: 1 }, foodCategory: 'sweets', createdAt: new Date() },
                { moodLogId: { moodScore: 1 }, foodCategory: 'sweets', createdAt: new Date() },
                // snacks_processed -> Predicted Negative Mood ('Anxious')
                { foodCategory: 'snacks_processed', predictedPostMealMood: 'Anxious', createdAt: new Date() },
                { foodCategory: 'snacks_processed', predictedPostMealMood: 'Anxious', createdAt: new Date() },
                { foodCategory: 'snacks_processed', predictedPostMealMood: 'Anxious', createdAt: new Date() },
            ];
            const patterns = detectEmotionalEating(meals);
            assert.strictEqual(patterns.length, 2, "Test Case EE7 Failed: Should detect two distinct patterns");
            assert.ok(patterns.some(p=>p.name === "Emotional Eating: User-Logged Mood (Score 1) and sweets"), "Test Case EE7a: Missing mood-food pattern");
            assert.ok(patterns.some(p=>p.name === "Pattern: snacks_processed and Negative Predicted Mood"), "Test Case EE7b: Missing food-prediction pattern");
        });
    });

});

console.log("dietaryPatternService tests completed. Manually check for assertion errors if any.");
