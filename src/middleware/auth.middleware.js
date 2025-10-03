import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const token = req.cookies?.app_session || (req.headers.authorization?.split(" ")[1]);
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    req.user = jwt.verify(token, process.env.APP_JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}