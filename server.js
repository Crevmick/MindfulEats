//importing dependencies 
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './Config/db.js';
import signUpRoute from './routes/Auth/signup.js';  // Import signUpRoute for user registration
import signInRoute from './routes/Auth/signin.js';  // Import signInRoute for user login
import userRoutes from './routes/Auth/Users.js'; 
import dietaryAnalysisRouter from './routes/Analysis/dietaryAnalysisRoute.js';
import insightRouter from './routes/Insights/insightRoutes.js';
import mealRoutes from './routes/Meal/mealRoute.js';
import passwordResetRoutes from './routes/Auth/forgetPasswordRoute.js'; 
import otpRoute from './routes/Auth/otpRoute.js';


//importing route
import authRouter from './routes/Auth/GoogleRoute.js';  // Import authRouter for Google login
import moodLogRoutes from './routes/Auth/moodLogRoute.js'; // Import mood log routes
dotenv.config();

//connect DB 
connectDB();  



//Initialiing the application
const app = express();

//middleware
app.use(express.json()); // for parsing JSON body
app.use(morgan('dev'));
app.use(cors());
app.use(helmet()); //  To secure HTTP headers
app.use(cookieParser());

// Mount routes for Google authentication
app.use('/auth', authRouter); // This will handle /auth/google and /auth/google/callback

// mounting Routes
app.use('/api/auth/', signUpRoute);
app.use('/api/auth/', signInRoute);
app.use('/api/auth/users', userRoutes); // Route to get all users
app.use('/api/dietary-analysis', dietaryAnalysisRouter);
app.use('/api/insights', insightRouter);
app.use('/api/meals', mealRoutes); // Import and use meal routes
app.use('/api/moodlogs', moodLogRoutes); // Import and use mood log routes
app.use('/api/auth', passwordResetRoutes);
app.use('/api/auth', otpRoute);




// Serve static files from uploads folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>MindfullEat api</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 50px;
              background-color: #f4f4f9;
              color: #333;
            }
            h1 {
              color: #4CAF50;
            }
            p {
              font-size: 18px;
            }
            a {
              color: #007bff;
              text-decoration: none;
              font-weight: bold;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <h1>MindfullEat api</h1>
          <p>Status: <span style="color: green;">Success</span></p>
          <p>To view the API documentation, click below:</p>
          <p><a href="#" target="_blank">View API Documentation</a></p>
        </body>
      </html>
    `);
  });

//listen to our server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


