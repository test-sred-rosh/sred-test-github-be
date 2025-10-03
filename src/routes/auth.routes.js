import express from "express";
import jwt from "jsonwebtoken";

import { GithubIntegration } from "../models/githubIntegration.model.js";

const router = express.Router();


const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
const CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;

router.get("/me", (req, res) => {
	console.log("COOKIES", req.cookies);
  const token = req.cookies.APP_JWT;
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.APP_JWT_SECRET);
    return res.json({ user: decoded });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

router.get("/github/login", (req, res) => {
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${CALLBACK_URL}&scope=repo,read:org,user`;
  res.redirect(redirectUrl);
});

router.get("/github/callback", async (req, res) => {
  const { code } = req.query;
  console.log("GitHub OAuth Code:", code);


  if (!code) {
    return res.status(400).json({ error: "No code returned from GitHub" });
  }

  try {
  	const githubAccessUrl = "https://github.com/login/oauth/access_token";
		const reqBody = {
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			code,
			redirect_uri: CALLBACK_URL
		};
    const tokenRes = await fetch(githubAccessUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
				"Content-Type": "application/json"
      },
      body: JSON.stringify(reqBody),
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
 		if (!accessToken) throw new Error("No access token")

    console.log("Token Data:", tokenData);
    
		const  userRes = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});
		const user = await userRes.json();

		console.log("User Data: ", user);

		const doc = await GithubIntegration.findOneAndUpdate(
			{ github_user_id: user.id },
			{
				login: user.login,
				name: user.name,
				avatar_url: user.avatar_url,
				token: accessToken,
			},
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);	

		console.log("Created/Updated Doc: ", doc);

		const appJwt = jwt.sign({user_id: doc._id.toString()}, process.env.APP_JWT_SECRET, {expiresIn: "30d"});

		console.log("Created/JWT: ", appJwt);


		res.cookie("APP_JWT", appJwt, {
			httpOnly: true,
			secure: false, // set to true if using HTTPS, should be for Production
			sameSite: "lax",
			maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
		})

		return res.redirect(`${FRONTEND_URL}/integration-success`);

  } catch (err) {
    console.error("OAuth Error: ", err.response?.data || err.message || err);
    res.redirect(`${FRONTEND_URL}/integration-failed`);
  }
});

export default router;
