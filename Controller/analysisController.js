import { analyzeDietaryPatterns } from '../Service/dietaryPatternService.js';

export const getDietaryAnalysis = async (req, res) => {
  try {
    const userId = req.user._id; 

    let daysToAnalyze = 7; // Default value for the older endpoint
    if (req.query.days) {
      const parsedDays = parseInt(req.query.days, 10);
      if (!isNaN(parsedDays) && parsedDays > 0) {
        daysToAnalyze = parsedDays;
      }
    }

    const analysisResult = await analyzeDietaryPatterns(userId, daysToAnalyze);

    if (analysisResult.error) {
      return res.status(500).json({
        success: false,
        message: analysisResult.error,
        data: null
      });
    }

    // Check if analysisResult has a summary indicating insufficient data (but not an error)
    if (analysisResult.summary && (analysisResult.summary.includes("Insufficient data") || analysisResult.summary.includes("No meal data"))) {
        return res.status(200).json({
            success: true,
            message: analysisResult.summary, // Use the summary from the service
            data: analysisResult
        });
    }

    return res.status(200).json({
      success: true,
      message: "Dietary analysis successful",
      data: analysisResult
    });

  } catch (error) {
    console.error("Error in getDietaryAnalysis controller:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while analyzing dietary patterns.",
      data: null
    });
  }
};


export const getIntegratedDietaryInsights = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming authenticateUser middleware populates req.user

    let daysToAnalyze = 14; // Default value for the new insights endpoint
    if (req.query.days) {
      const parsedDays = parseInt(req.query.days, 10);
      if (!isNaN(parsedDays) && parsedDays > 0) {
        daysToAnalyze = parsedDays;
      }
    }

    const analysisResult = await analyzeDietaryPatterns(userId, daysToAnalyze);

    // Handle cases: error, insufficient data, or success
    if (analysisResult.error) {
      return res.status(500).json({
        success: false,
        message: analysisResult.error,
        data: null
      });
    }

    // The dietaryPatternService now returns a 'summary' field for insufficient data cases,
    // along with specific insights/recommendations for that scenario.
    // So, we can directly use the summary message.
    if (analysisResult.summary && (analysisResult.summary.includes("Insufficient data") || analysisResult.summary.includes("No meal data"))) {
        return res.status(200).json({
            success: true,
            message: analysisResult.summary, // Use the summary from the service
            data: analysisResult // The service already formats patterns, insights, recs for this
        });
    }

    // Successfully fetched and analyzed with sufficient data
    return res.status(200).json({
      success: true,
      message: "Dietary insights retrieved successfully",
      data: analysisResult
    });

  } catch (error) {
    // Catch any unexpected errors during the process
    console.error("Error in getIntegratedDietaryInsights controller:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while retrieving dietary insights.",
      data: null
    });
  }
};
