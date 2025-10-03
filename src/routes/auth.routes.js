import express from "express";

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("Hello kido");
});

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
const CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;

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

    console.log("Token Data:", tokenData);
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
  } catch (err) {
    console.error("OAuth Error: err.response?.data || err.message");
    res.redirect(`${FRONTEND_URL}/integration-failed`);
  }
});

export default router;
