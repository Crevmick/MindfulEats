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
    describe('getFoodCategory(foodName) - Additional Cases', () => {
        it('should match foods with extra whitespace', () => {
            assert.strictEqual(getFoodCategory('  apple  '), 'fruit', 'Whitespace should not affect matching');
            assert.strictEqual(getFoodCategory('  white bread'), 'grain_refined', 'Leading whitespace');
            assert.strictEqual(getFoodCategory('chocolate   '), 'sweets', 'Trailing whitespace');
        });

        it('should match foods with punctuation', () => {
            assert.strictEqual(getFoodCategory('apple!'), 'fruit', 'Exclamation mark');
            assert.strictEqual(getFoodCategory('white bread.'), 'grain_refined', 'Period');
            assert.strictEqual(getFoodCategory('cake,'), 'sweets', 'Comma');
        });

        it('should match foods with plural forms if substring matches', () => {
            assert.strictEqual(getFoodCategory('apples'), 'fruit', 'Plural apples');
            assert.strictEqual(getFoodCategory('cookies'), 'sweets', 'Plural cookies');
            assert.strictEqual(getFoodCategory('chips'), 'snacks_processed', 'Plural chips');
        });

        it('should prioritize longer keys over shorter ones', () => {
            // "white bread" should match before "bread"
            assert.strictEqual(getFoodCategory('white bread sandwich'), 'grain_refined', 'Longer key prioritized');
            // "whole wheat bread" should match before "bread"
            assert.strictEqual(getFoodCategory('whole wheat bread toast'), 'grain_whole', 'Whole wheat bread prioritized');
        });

        it('should not match unrelated substrings', () => {
            assert.strictEqual(getFoodCategory('pineapple'), 'fruit', 'Should match pineapple as fruit');
            assert.strictEqual(getFoodCategory('breadfruit'), 'unknown', 'Should not match bread in breadfruit');
        });

        it('should match foods with mixed casing and punctuation', () => {
            assert.strictEqual(getFoodCategory('ChOcOlAtE!'), 'sweets', 'Mixed case and punctuation');
            assert.strictEqual(getFoodCategory('  BaNaNa.  '), 'fruit', 'Whitespace, punctuation, and mixed case');
        });

        it('should match foods with numbers in the name', () => {
            assert.strictEqual(getFoodCategory('2 eggs'), 'protein', 'Number before food');
            assert.strictEqual(getFoodCategory('egg'), 'protein', 'Singular egg should map to protein via "eggs"');
        });

        it('should match foods with synonyms if present in mapping', () => {
            assert.strictEqual(getFoodCategory('oatmeal'), 'unknown', 'Oatmeal not in mapping');
            assert.strictEqual(getFoodCategory('oats'), 'grain_whole', 'Oats in mapping');
        });

        it('should not throw on non-string input', () => {
            assert.strictEqual(getFoodCategory(123), 'unknown', 'Numeric input');
            assert.strictEqual(getFoodCategory({}), 'unknown', 'Object input');
            assert.strictEqual(getFoodCategory([]), 'unknown', 'Array input');
        });
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

        it('should use getFoodCategory as fallback if meal.foodCategory is missing and NOT detect if below threshold', () => {
            const meals = [ // Categories will be: fruit (apple pie), sweets (cake), fruit (banana), protein (chicken)
                { predictedFoodName: "apple pie" },
                { predictedFoodName: "cake" },
                { predictedFoodName: "banana" },
                { predictedFoodName: "chicken" }
            ];
            // Only 1/4 meals is 'sweets' (25%). Threshold is 0.4 (40%). So, should be null.
            const result = detectHighIntake(meals, 'sweets', 'Sugary Delights', 0.4);
            assert.strictEqual(result, null, 'Test Case 36d Failed: Fallback check - should be null as 25% < 40%');
        });

        it('should use getFoodCategory as fallback and DETECT if above threshold', () => {
            const meals = [ // Categories: sweets, sweets, sweets, fruit
                { predictedFoodName: "cake" },
                { predictedFoodName: "chocolate cookie" }, // 'cookie' is sweets
                { predictedFoodName: "ice cream" },
                { predictedFoodName: "apple" },
            ];
             // 3/4 meals are 'sweets' (75%). Threshold is 0.7 (70%). So, should detect.
            const result = detectHighIntake(meals, 'sweets', 'Sweet Overload', 0.7);
            assert.ok(result, 'Test Case 36g Failed: Fallback should detect');
            assert.strictEqual(result.name, "High Intake of Sweet Overload", 'Test Case 36h Failed: Fallback name for detection');
            assert.strictEqual(result.details, "75% of logged meals included Sweet Overload.", "Test Case 36i Failed: Fallback details for detection");
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

        it('should generate correct insight for a single detected pattern (Frequent Snacking - old type for coverage)', () => {
            const patterns = [{ name: "Frequent Snacking", type: "frequent_snacking", detected: true, details: "Average of 3.0 snacks per day" }];
            const insights = generateInsights(patterns);
            assert.strictEqual(insights.length, 1, 'Test Case 43a Failed: Length for single pattern');
            assert.ok(insights[0].includes("Noticed frequent snacking") && insights[0].includes("Average of 3.0 snacks per day"), 'Test Case 43b Failed: Frequent snacking insight content');
        });

        it('should generate insights for multiple NEW pattern types', () => {
            const patterns = [
                { name: "Emotional Eating: Negative Mood (Sad) and sweets", type: "emotional_eating_category_logged", detected: true, details: "Often consumed 'sweets'..." },
                { name: "Pattern: Pizza (food item) and Predicted Negative Mood (Frustrated)", type: "food_predicted_negative_mood", detected: true, details: "Consuming 'Pizza' was often followed..." }
            ];
            const insights = generateInsights(patterns);
            assert.strictEqual(insights.length, 2, 'Test Case 44a Failed: Length for multiple new patterns');
            assert.ok(insights.some(insight => insight.includes("pattern of Negative Mood (Sad) and sweets")), 'Test Case 44b Failed: Missing emotional eating insight');
            assert.ok(insights.some(insight => insight.includes("pattern: Pizza (food item) and Predicted Negative Mood (Frustrated)")), 'Test Case 44c Failed: Missing food_predicted_negative_mood insight');
        });


        it('should ignore patterns with detected: false and provide appropriate message if no true detections', () => {
            const patterns = [{ name: "Frequent Snacking", type: "frequent_snacking", detected: false, details: "Avg 1 snack" }];
            const insights = generateInsights(patterns);
            assert.strictEqual(insights.length, 1, 'Test Case 45a Failed: Length for detected:false');
            // Updated expected message for no actionable patterns
            assert.ok(insights[0].includes("No specific actionable patterns detected") || insights[0].includes("Your dietary habits seem balanced"), 'Test Case 45b Failed: Balanced message for detected:false');
        });

        it('should provide specific messages for true detections alongside ignored false ones (new types)', () => {
            const patterns = [
                { name: "Frequent Snacking", type: "frequent_snacking", detected: false, details: "Avg 1 snack" },
                { name: "Potential Link: Positive Mood (Happy) and Consumption of Salad", type: "logged_mood_specific_food", detected: true, details: "Associated 'Salad' with positive mood (happy)..." }
            ];
            const insights = generateInsights(patterns);
            assert.strictEqual(insights.length, 1, 'Test Case 45c Failed: Length for mixed true/false');
            assert.ok(insights[0].includes("observed a potential link: Positive Mood (Happy) and Consumption of Salad"), 'Test Case 45d Failed: Correct insight for true detection');
        });

        it('should use default insight for unhandled new pattern types if any (though all current ones should be handled)', () => {
            const patterns = [{ name: "Very New Pattern", type: "unknown_future_type", detected: true, details: "Some details here" }];
            const insights = generateInsights(patterns);
            assert.strictEqual(insights.length, 1, 'Test Case 46a Failed: Length for unknown pattern type');
            assert.ok(insights[0].includes("A pattern regarding 'Very New Pattern' was noted"), 'Test Case 46b Failed: Default message for unknown pattern type');
        });

        it('should generate insight for logged_mood_specific_food', () => {
            const patterns = [{ name: "Potential Link: Negative Mood (Anxious) and Consumption of Coffee", type: "logged_mood_specific_food", detected: true, details: "..." }];
            const insights = generateInsights(patterns);
            assert.ok(insights[0].includes("observed a potential link: Negative Mood (Anxious) and Consumption of Coffee"));
        });

        it('should generate insight for food_predicted_positive_mood', () => {
            const patterns = [{ name: "Pattern: Salmon (food item) and Predicted Positive Mood (Grateful)", type: "food_predicted_positive_mood", detected: true, details: "..." }];
            const insights = generateInsights(patterns);
            assert.ok(insights[0].includes("found a positive pattern: Salmon (food item) and Predicted Positive Mood (Grateful)"));
        });


    });

    describe('generateRecommendations(detectedPatterns) - Updated Tests', () => {
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

        it('should generate correct recommendation for a single detected pattern (Skipping Breakfast - old type for coverage)', () => {
            const patterns = [{ name: "Skipping Breakfast", type: "skipping_breakfast", detected: true, details: "Skipped 3 of 7 days" }];
            const recommendations = generateRecommendations(patterns);
            assert.strictEqual(recommendations.length, 1, 'Test Case 48a Failed: Length for single pattern');
            assert.ok(recommendations[0].includes("quick, nutritious breakfast"), 'Test Case 48b Failed: Skipping breakfast recommendation content');
        });

        it('should generate recommendations for multiple NEW pattern types', () => {
            const patterns = [
                 { name: "Emotional Eating: Negative Mood (Stressed) and snacks_processed", type: "emotional_eating_category_logged", detected: true, details: "Often consumed 'snacks_processed'..." },
                 { name: "Pattern: Consumption of Coffee (food item) and Predicted Negative Mood (Anxious)", type: "food_predicted_negative_mood", detected: true, details: "Consuming 'Coffee' was often followed..." } // Corrected name
            ];
            const recommendations = generateRecommendations(patterns);
            assert.strictEqual(recommendations.length, 2, 'Test Case 49a Failed: Length for multiple new patterns');
            assert.ok(recommendations.some(rec => rec.includes("When negative mood (stressed) occurs and you tend to reach for 'snacks_processed'")), 'Test Case 49b Failed: Missing emotional eating recommendation');
            assert.ok(recommendations.some(rec => rec.includes("Since consuming 'Coffee' seems linked to a predicted negative mood (anxious)")), 'Test Case 49c Failed: Missing food_predicted_negative_mood recommendation');
        });

        it('should ignore patterns with detected: false and provide appropriate message if no true detections', () => {
            const patterns = [{ name: "Skipping Breakfast", type: "skipping_breakfast", detected: false, details: "Skipped 0 days" }];
            const recommendations = generateRecommendations(patterns);
            assert.strictEqual(recommendations.length, 1, 'Test Case 50a Failed: Length for detected:false');
            assert.ok(recommendations[0].includes("No specific actionable recommendations") || recommendations[0].includes("Your current logs show balanced habits"), 'Test Case 50b Failed: Balanced message for detected:false');
        });


        it('should provide specific messages for true detections alongside ignored false ones (new types)', () => {
            const patterns = [
                { name: "Skipping Breakfast", type: "skipping_breakfast", detected: false, details: "Skipped 0 days" },
                // Corrected name format below
                { name: "Pattern: Consumption of Yogurt (food item) and Predicted Positive Mood (Happy)", type: "food_predicted_positive_mood", detected: true, details: "Consuming 'Yogurt'..." }
            ];
            const recommendations = generateRecommendations(patterns);
            assert.strictEqual(recommendations.length, 1, 'Test Case 50c Failed: Length for mixed true/false');
            // Added exclamation mark to match generated message
            assert.ok(recommendations[0].includes("great that consuming 'Yogurt' is often followed by a predicted positive mood (happy)!"), 'Test Case 50d Failed: Correct rec for true detection');
        });

        it('should use default recommendation for unhandled new pattern types if any', () => {
            const patterns = [{ name: "Brand New Habit", type: "super_new_type", detected: true, details: "Done it thrice" }];
            const recommendations = generateRecommendations(patterns);
            assert.strictEqual(recommendations.length, 1, 'Test Case 51a Failed: Length for unknown pattern type');
            assert.ok(recommendations[0].includes("For the pattern 'Brand New Habit'"), 'Test Case 51b Failed: Default message for unknown pattern type');
        });

        it('should generate recommendation for logged_mood_specific_food', () => {
            const patterns = [{ name: "Potential Link: Negative Mood (Sad) and Consumption of Ice Cream", type: "logged_mood_specific_food", detected: true, details: "..." }];
            const recommendations = generateRecommendations(patterns);
            assert.ok(recommendations[0].includes("When experiencing negative mood (sad), and you've noticed a link with 'Ice Cream'"));
        });

        it('should generate recommendation for high_intake', () => {
            const patterns = [{ name: "High Intake of Sugary Beverages", type: "high_intake", detected: true, details: "..." }];
            const recommendations = generateRecommendations(patterns);
            assert.ok(recommendations[0].includes("For your high intake of sugary beverages"));
        });

    });

    // Tests for detectEmotionalEating
    describe('detectEmotionalEating(meals) - Updated Tests', () => {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);

        it('should return empty array for empty meals input', () => {
            assert.deepStrictEqual(detectEmotionalEating([]), [], "Test Case EE1 Failed: Empty meals array");
        });

        it('should detect Logged Mood (Sad) -> Comfort Food (sweets) pattern', () => {
            const meals = [
                { predictedFoodName: "Chocolate Bar", foodCategory: 'sweets', createdAt: new Date(oneHourAgo), moodLogId: { moodScore: "Sad", createdAt: new Date(now) } },
                { predictedFoodName: "Cake", foodCategory: 'sweets', createdAt: new Date(oneHourAgo), moodLogId: { moodScore: "Sad", createdAt: new Date(now) } },
                { predictedFoodName: "Apple", foodCategory: 'fruit', createdAt: new Date(oneHourAgo), moodLogId: { moodScore: "Sad", createdAt: new Date(now) } }, // Sad mood, not comfort
                { predictedFoodName: "Candy", foodCategory: 'sweets', createdAt: new Date(oneHourAgo), moodLogId: { moodScore: "Happy", createdAt: new Date(now) } }, // Happy mood, comfort food
            ];
            // 2 out of 3 times when "Sad" was logged near a meal, 'sweets' were eaten. (66.7% > threshold 40%)
            // Total "Sad" occurrences near meals = 3.
            const patterns = detectEmotionalEating(meals);
            const specificPattern = patterns.find(p => p.type === "emotional_eating_category_logged" && p.name.includes("Negative Mood (Sad) and sweets"));
            assert.ok(specificPattern, "Test Case EE2 Failed: Pattern 'Negative Mood (Sad) and sweets' not detected");
            if (specificPattern) {
                assert.strictEqual(specificPattern.detected, true, "Test Case EE2a Failed: Detected flag");
                assert.strictEqual(specificPattern.details, "When negative mood (sad) was logged near a meal, foods from the 'sweets' category were consumed in 2 of 3 such instances.", "Test Case EE2b Failed: Details mismatch");
            }
        });

        it('should detect Logged Mood (Anxious) -> Specific Food (Pizza) pattern', () => {
            const meals = [
                { predictedFoodName: "Pizza", foodCategory: 'grain', createdAt: new Date(oneHourAgo), moodLogId: { moodScore: "Anxious", createdAt: new Date(now) } },
                { predictedFoodName: "Pizza", foodCategory: 'grain', createdAt: new Date(oneHourAgo), moodLogId: { moodScore: "Anxious", createdAt: new Date(now) } },
                { predictedFoodName: "Salad", foodCategory: 'vegetable', createdAt: new Date(oneHourAgo), moodLogId: { moodScore: "Anxious", createdAt: new Date(now) } },
            ];
            // 2 out of 3 times when "Anxious" was logged, "Pizza" was eaten (66.7% > threshold 20% for specific food)
            const patterns = detectEmotionalEating(meals);
            const specificPattern = patterns.find(p => p.type === "logged_mood_specific_food" && p.name.includes("Negative Mood (Anxious) and Consumption of Pizza"));
            assert.ok(specificPattern, "Test Case EE2c Failed: Pattern 'Negative Mood (Anxious) and Consumption of Pizza' not detected");
            if (specificPattern) {
                assert.strictEqual(specificPattern.details, "When negative mood (anxious) was logged near a meal, 'Pizza' was consumed in 2 of 3 such instances.", "Test Case EE2d Failed: Details mismatch for specific food");
            }
        });

        it('should NOT detect Logged Mood -> Food if time difference is too large', () => {
            const meals = [
                { predictedFoodName: "Chocolate Bar", foodCategory: 'sweets', createdAt: new Date(fiveHoursAgo), moodLogId: { moodScore: "Sad", createdAt: new Date(now) } },
                { predictedFoodName: "Cake", foodCategory: 'sweets', createdAt: new Date(fiveHoursAgo), moodLogId: { moodScore: "Sad", createdAt: new Date(now) } },
            ];
            const patterns = detectEmotionalEating(meals);
            assert.strictEqual(patterns.length, 0, "Test Case EE3 Failed: Pattern should NOT be detected due to large time diff");
        });

        it('should NOT detect Logged Mood -> Food if MIN_OCCURRENCES for mood not met', () => {
            const meals = [ // MIN_OCCURRENCES is 2
                { predictedFoodName: "Chocolate Bar", foodCategory: 'sweets', createdAt: new Date(oneHourAgo), moodLogId: { moodScore: "Sad", createdAt: new Date(now) } },
            ];
            const patterns = detectEmotionalEating(meals);
            assert.strictEqual(patterns.length, 0, "Test Case EE3b Failed: Pattern should NOT be detected for low mood occurrences");
        });

        it('should detect Food (sweets category) -> Predicted Negative Mood (Frustrated)', () => {
            const meals = [
                { predictedFoodName: "Candy Bar", foodCategory: 'sweets', predictedPostMealMood: 'Frustrated', createdAt: new Date() },
                { predictedFoodName: "Cookie", foodCategory: 'sweets', predictedPostMealMood: 'Frustrated', createdAt: new Date() },
                { predictedFoodName: "Donut", foodCategory: 'sweets', predictedPostMealMood: 'Happy', createdAt: new Date() }, // sweets, positive prediction
                { predictedFoodName: "Apple", foodCategory: 'fruit', predictedPostMealMood: 'Frustrated', createdAt: new Date() },   // Not comfort food
            ];
            // 2 out of 3 times (66.7%) when 'sweets' (category) were eaten, 'Frustrated' was predicted.
            const patterns = detectEmotionalEating(meals);
            const specificPattern = patterns.find(p => p.type === "food_predicted_negative_mood" && p.name.includes("Consumption of sweets (category) and Predicted Negative Mood (Frustrated)"));
            assert.ok(specificPattern, "Test Case EE4 Failed: Pattern 'sweets (category) and Predicted Negative Mood (Frustrated)' not detected");
            if (specificPattern) {
                assert.strictEqual(specificPattern.detected, true, "Test Case EE4a Failed: Detected flag");
                assert.strictEqual(specificPattern.details, "Consuming 'sweets' was followed by a predicted mood of 'Frustrated' in 2 of 3 instances where this category was logged with a prediction.", "Test Case EE4b Failed: Details mismatch");
            }
        });
         it('should detect Specific Food (Ice Cream) -> Predicted Positive Mood (Happy)', () => {
            const meals = [
                { predictedFoodName: "Ice Cream", foodCategory: 'sweets', predictedPostMealMood: 'Happy', createdAt: new Date() },
                { predictedFoodName: "Ice Cream", foodCategory: 'sweets', predictedPostMealMood: 'Happy', createdAt: new Date() },
                { predictedFoodName: "Ice Cream", foodCategory: 'sweets', predictedPostMealMood: 'Neutral', createdAt: new Date() },
            ];
            // 2 out of 3 times (66.7%) when 'Ice Cream' was eaten, 'Happy' was predicted.
            const patterns = detectEmotionalEating(meals);
            const specificPattern = patterns.find(p => p.type === "food_predicted_positive_mood" && p.name.includes("Consumption of Ice Cream (food item) and Predicted Positive Mood (Happy)"));
            assert.ok(specificPattern, "Test Case EE4c Failed: Pattern 'Ice Cream and Predicted Positive Mood (Happy)' not detected");
        });


        it('should NOT detect Food -> Predicted Mood if frequency is low', () => {
            const meals = [
                { predictedFoodName: "Cake", foodCategory: 'sweets', predictedPostMealMood: 'Sad', createdAt: new Date() }, // 1 out of 3 < 40%
                { predictedFoodName: "Cookie", foodCategory: 'sweets', predictedPostMealMood: 'Happy', createdAt: new Date() },
                { predictedFoodName: "Muffin", foodCategory: 'sweets', predictedPostMealMood: 'Neutral', createdAt: new Date() },
            ];
            const patterns = detectEmotionalEating(meals);
            const relevantPatterns = patterns.filter(p => p.type === "food_predicted_negative_mood" || p.type === "food_predicted_positive_mood");
            assert.strictEqual(relevantPatterns.length, 0, "Test Case EE5 Failed: Pattern should NOT be detected for low frequency");
        });


        it('should handle meals without moodLogId or predictedPostMealMood gracefully', () => {
            const meals = [
                { predictedFoodName: "Brownie", foodCategory: 'sweets', createdAt: new Date() }, // No moodLogId, no predictedPostMealMood
                { predictedFoodName: "Apple", moodLogId: { moodScore: null, createdAt: new Date(now) }, foodCategory: 'fruit', createdAt: new Date(oneHourAgo) }, // moodScore is null
            ];
            const patterns = detectEmotionalEating(meals);
            assert.deepStrictEqual(patterns, [], "Test Case EE6 Failed: Should return empty for incomplete data");
        });

        it('should handle multiple emotional eating patterns simultaneously and correctly identify types', () => {
            const meals = [
                // Logged Sad mood -> sweets
                { predictedFoodName: "Candy", foodCategory: 'sweets', createdAt: new Date(oneHourAgo), moodLogId: { moodScore: "Sad", createdAt: new Date(now) } },
                { predictedFoodName: "Chocolate", foodCategory: 'sweets', createdAt: new Date(oneHourAgo), moodLogId: { moodScore: "Sad", createdAt: new Date(now) } },
                // Pizza -> Predicted Anxious Mood
                { predictedFoodName: "Pizza", foodCategory: 'grain', predictedPostMealMood: 'Anxious', createdAt: new Date() },
                { predictedFoodName: "Pizza", foodCategory: 'grain', predictedPostMealMood: 'Anxious', createdAt: new Date() },
            ];
            // Additional tests for dietaryPatternService.js

            describe('getFoodCategory(foodName) - Robustness and Edge Cases', () => {
                it('should not match substrings inside other words (e.g., bread in breadfruit)', () => {
                    assert.strictEqual(getFoodCategory('breadfruit'), 'unknown', 'Should not match bread in breadfruit');
                    assert.strictEqual(getFoodCategory('grapefruit'), 'unknown', 'Should not match grape in grapefruit');
                });

                it('should prioritize longer keys over shorter ones (white bread vs bread)', () => {
                    assert.strictEqual(getFoodCategory('white bread'), 'grain_refined', 'white bread should be grain_refined');
                    assert.strictEqual(getFoodCategory('whole wheat bread'), 'grain_whole', 'whole wheat bread should be grain_whole');
                    assert.strictEqual(getFoodCategory('bread'), 'grain', 'plain bread should be grain');
                });

                it('should handle punctuation and whitespace robustly', () => {
                    assert.strictEqual(getFoodCategory('  white bread.  '), 'grain_refined', 'Whitespace and period');
                    assert.strictEqual(getFoodCategory('whole wheat bread!'), 'grain_whole', 'Exclamation mark');
                    assert.strictEqual(getFoodCategory('cake,'), 'sweets', 'Comma');
                    assert.strictEqual(getFoodCategory('banana...'), 'fruit', 'Ellipsis');
                });

                it('should handle plural and singular forms if mapping exists', () => {
                    assert.strictEqual(getFoodCategory('eggs'), 'protein', 'Plural eggs');
            assert.strictEqual(getFoodCategory('egg'), 'protein', 'Singular egg maps to protein via "eggs"'); // Corrected assertion
                    assert.strictEqual(getFoodCategory('cookies'), 'sweets', 'Plural cookies');
            assert.strictEqual(getFoodCategory('cookie'), 'sweets', 'Singular cookie maps to sweets via "cookies"'); // Corrected assertion
                });

                it('should return "unknown" for non-string input', () => {
                    assert.strictEqual(getFoodCategory(123), 'unknown', 'Numeric input');
                    assert.strictEqual(getFoodCategory({}), 'unknown', 'Object input');
                    assert.strictEqual(getFoodCategory([]), 'unknown', 'Array input');
                    assert.strictEqual(getFoodCategory(null), 'unknown', 'Null input');
                    assert.strictEqual(getFoodCategory(undefined), 'unknown', 'Undefined input');
                });

                it('should handle empty string input', () => {
                    assert.strictEqual(getFoodCategory(''), 'unknown', 'Empty string');
                    assert.strictEqual(getFoodCategory('   '), 'unknown', 'Whitespace only');
                });

                it('should match foods with numbers and ignore numbers', () => {
                    assert.strictEqual(getFoodCategory('2 eggs'), 'protein', 'Number before food');
                    assert.strictEqual(getFoodCategory('one apple'), 'fruit', 'Word number before food');
                });
            });

            describe('mapPortionToQuantitative(portionString) - Edge Cases', () => {
                it('should return null for null or undefined input', () => {
                    assert.strictEqual(mapPortionToQuantitative(null), null, 'Null input');
                    assert.strictEqual(mapPortionToQuantitative(undefined), null, 'Undefined input');
                });

                it('should return 1 for empty string or whitespace', () => {
                    assert.strictEqual(mapPortionToQuantitative(''), 1, 'Empty string');
                    assert.strictEqual(mapPortionToQuantitative('   '), 1, 'Whitespace only');
                });

                it('should extract numbers even with extra text', () => {
                    assert.strictEqual(mapPortionToQuantitative('about 3.5 cups'), 3.5, 'Decimal number');
                    assert.strictEqual(mapPortionToQuantitative('2.0 servings'), 2.0, 'Float number');
                    assert.strictEqual(mapPortionToQuantitative('100 grams'), 100, 'Integer number');
                });

                it('should return 1 for non-matching text', () => {
                    assert.strictEqual(mapPortionToQuantitative('unknown portion'), 1, 'Non-matching text');
                });
            });

            describe('detectHighIntake fallback logic', () => {
        it('should use getFoodCategory fallback for predictedFoodName and NOT detect if below threshold', () => {
            const meals = [ // fruit (apple pie), sweets (cake), fruit (banana), protein (chicken)
                { predictedFoodName: "apple pie" },
                { predictedFoodName: "cake" },
                { predictedFoodName: "banana" },
                { predictedFoodName: "chicken" }
                    ];
            // 1/4 sweets (25%) < 0.4 threshold. Expect null.
                    const result = detectHighIntake(meals, 'sweets', 'Sugary Delights', 0.4);
            assert.strictEqual(result, null, 'Fallback should not detect high intake if below threshold');
        });

        it('should use getFoodCategory fallback for predictedFoodName and DETECT if above threshold', () => {
            const meals = [ // sweets (cake), sweets (cookie), sweets (ice cream), fruit (apple)
                { predictedFoodName: "cake" },
                { predictedFoodName: "chocolate cookie" },
                { predictedFoodName: "ice cream" },
                { predictedFoodName: "apple" }
            ];
            // 3/4 sweets (75%) > 0.7 threshold. Expect detection.
            const result = detectHighIntake(meals, 'sweets', 'Sugary Delights', 0.7);
            assert.ok(result, 'Fallback should detect high intake if above threshold');
                    assert.strictEqual(result.name, "High Intake of Sugary Delights");
            assert.strictEqual(result.details, "75% of logged meals included Sugary Delights.");
                });


                it('should not detect high intake if fallback does not match enough', () => {
                    const meals = [
                        { predictedFoodName: "banana" },
                        { predictedFoodName: "chicken" }
                    ];
                    const result = detectHighIntake(meals, 'sweets', 'Sugary Delights', 0.4);
                    assert.strictEqual(result, null, 'Fallback should not detect if not enough matches');
                });
            });

            describe('getFoodCategory(foodName) - Regression for known bugs', () => {
                it('should not throw TypeError for non-string input', () => {
                    assert.doesNotThrow(() => getFoodCategory(123), 'Should not throw for number');
                    assert.doesNotThrow(() => getFoodCategory({}), 'Should not throw for object');
                    assert.doesNotThrow(() => getFoodCategory([]), 'Should not throw for array');
                });

                it('should not match "bread" in "breadfruit"', () => {
                    assert.strictEqual(getFoodCategory('breadfruit'), 'unknown', 'No false positive for breadfruit');
                });

                it('should match "white bread" before "bread"', () => {
                    assert.strictEqual(getFoodCategory('white bread'), 'grain_refined', 'white bread prioritized');
                    assert.strictEqual(getFoodCategory('bread'), 'grain', 'plain bread');
                });
            });
        });
    });
