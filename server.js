//importing dependencies 
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';


// //importing DB
// import connectDB from './Config/db,JS';

// dotenv.config();

// //connect DB 
// connectDB();


//Initialiing the application
const app = express();

//middleware
app.use(express.json()); // for parsing JSON body
app.use(morgan('dev'));
app.use(cors());
app.use(helmet()); //  To secure HTTP headers



// Serve static files from uploads folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



//listen to our server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
