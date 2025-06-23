# 🧠 MindfulEats Backend

Backend API for **MindfulEats** — a behavioral weight management platform that combines **mindful eating**, **mood tracking**, and **AI-driven dietary pattern analysis** to promote healthy, sustainable habits.

---

## ⚙️ Tech Stack

* **Node.js**
* **Express.js**
* **MongoDB** with Mongoose
* **TensorFlow\.js** for AI-based food classification & pattern detection
* **Cloudinary** for meal image storage
* **Clarifai & Food101** integration for food recognition (image → prediction)
* **Postman** for API documentation & testing

---

## 🚀 Project Status

✅ **Actively in development**

The backend currently includes:

* 🔐 **User authentication** (JWT-secured)
* 🍱 **Meal logging** with hunger levels, images, and food predictions
* 😊 **Mood logging** for emotion analysis
* 🧠 **AI-powered dietary pattern detection** (e.g., snacking habits, meal skipping)


Live API: [https://mindfuleats.onrender.com](https://mindfuleats.onrender.com)
Postman Docs: [API Documentation](https://documenter.getpostman.com/view/43171328/2sB2xCgoZS)

---

## 🚧 Development Milestones

| Week | Milestone                                                               |
| ---- | ----------------------------------------------------------------------- |
| 1    | ✅ Set up database, user authentication, basic mood/meal logging         |
| 2    | ✅ Integrated AI food prediction (TF.js + Clarifai), added group support |
| 3    | 🚧 Building habit engine, notifications, and content delivery APIs      |

---

## 🛠️ Getting Started

```bash
# 1. Clone this repo
git clone https://github.com/your-username/mindfuleats-backend.git

# 2. Navigate into the project
cd mindfuleats-backend

# 3. Install dependencies
npm install

# 4. Set up your environment
cp .env.example .env
# Fill in MONGODB_URL, JWT_SECRET, etc.

# 5. Run the server
npm run dev
```

---

## 🔍 Environment Variables

Make sure your `.env` includes:

```
MONGODB_URL=your_mongo_connection_string
JWT_SECRET=your_secret_key
CLARIFAI_API_KEY=your_api_key
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

---

## 📂 Folder Structure (Short Overview)

```
├── controllers/        # API logic
├── model/              # Mongoose schemas
├── routes/             # API route definitions
├── middleware/         # Auth, error handling, etc.
├── Service/            # Business logic, dietary pattern AI, etc.
├── seed/               # Sample data for testing
└── server.js           # Entry point
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 📬 Contact

For questions, feedback, or contributions:

* Open an issue on GitHub
* Reach out to the team directly via the API docs link above


