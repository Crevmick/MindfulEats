import { analyzeDietaryPatterns } from '../Service/dietaryPatternService.js';

export const getDietaryAnalysis = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming authenticateUser middleware populates req.user

    let daysToAnalyze = 7; // Default value
    if (req.query.days) {
      const parsedDays = parseInt(req.query.days, 10);
      if (!isNaN(parsedDays) && parsedDays > 0) {
        daysToAnalyze = parsedDays;
      }
    }

    const analysisResult = await analyzeDietaryPatterns(userId, daysToAnalyze);

    if (analysisResult.error) {
      // If there was an error string in the result (e.g., from database fetch failure)
      return res.status(500).json({
        success: false,
        message: analysisResult.error,
        data: null
      });
    }

    // Successfully fetched and analyzed
    return res.status(200).json({
      success: true,
      message: "Dietary analysis successful",
      data: analysisResult
    });

  } catch (error) {
    // Catch any unexpected errors during the process
    console.error("Error in getDietaryAnalysis controller:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while analyzing dietary patterns.",
      data: null
    });
  }
};
