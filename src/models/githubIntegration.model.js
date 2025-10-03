import mongoose from "mongoose";

const GithubIntegrationSchema = new mongoose.Schema({
  github_user_id: { type: Number, unique: true, index: true },
  login: String,
  name: String,
  avatar_url: String,
  token: String,
  connectedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const GithubIntegration = mongoose.model("github_integration", GithubIntegrationSchema);