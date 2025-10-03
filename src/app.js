import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import authRouter from "./routes/auth.routes.js"
import githubRouter from "./routes/github.routes.js"
import cookieParser from 'cookie-parser';


const app = express();
const PORT = process.env.PORT || 3000;

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/rosh_github_integration";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


app.use(cors({ origin: "http://localhost:4200", credentials: true }));
app.use(express.json())
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/github', githubRouter)

app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

app.listen(PORT, () => {
    console.log(`now listening on port ${PORT}`)
});





