import express from "express";

const router = express.Router();

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
const CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;


router.get("/login", (req, res) => {
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${CALLBACK_URL}&scope=repo,read:org,user`;
  res.redirect(redirectUrl);
});

router.get("/callback", async (req, res) => {
	const githubAccessUrl = "https://github.com/login/oauth/access_token"
  const { code } = req.query;
	const reqBody = {
		client_id: CLIENT_ID,
		client_secret: CLIENT_SECRET,
		code,
		redirect_uri: CALLBACK_URL
	}

	if (!code) {
    return res.status(400).json({ error: "No code returned from GitHub" });
  }

	try {
		const tokenRes = await fetch(githubAccessUrl, {
			method: 'POST',
			headers: {
				Accept: "application/json"
			},
			body: JSON.stringify(reqBody)
		});
		const rokenRes = await tokenRes.json();
		console.log("Token Response:", rokenRes);
		const accessToken = rokenRes.access_token;

		console.log("Access Token:", accessToken);
		res.send("GitHub integration successful!");

		// const userRes = await fetch("https://api.github.com/user", {
		// 	headers: {
		// 		Authorization: `Bearer ${accessToken}`
		// 	}
		// });
		// const userData = await userRes.json();
		// const githubUsername = userData.login;

		// if (!githubUsername) {
		// 	throw new Error("No GitHub username found");
		// }

		// res.redirect(`${FRONTEND_URL}/integration-success?username=${githubUsername}`);

		
	} catch (err){
		console.error("OAuth Error: err.response?.data || err.message");
		res.redirect(`${FRONTEND_URL}/integration-failed`);
	}



});

export default router;
