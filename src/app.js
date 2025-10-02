import express from 'express';

import authRouter from "./routes/auth.routes.js"
import githubRouter from "./routes/github.routes.js"

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json())

app.use('/auth', authRouter);
app.use('/github', githubRouter)

app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

app.listen(PORT, () => {
    console.log(`now listening on port ${PORT}`)
});





