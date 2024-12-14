// pages/api/callback.ts
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { code } = req.query;
    const { NEXT_PUBLIC_DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI } = process.env;

    if (!code) {
        return res.status(400).json({ error: "No code provided" });
    }

    try {
        // Discordからアクセストークンを取得
        const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: NEXT_PUBLIC_DISCORD_CLIENT_ID!,
                client_secret: DISCORD_CLIENT_SECRET!,
                code: code as string,
                grant_type: "authorization_code",
                redirect_uri: DISCORD_REDIRECT_URI!,
            }),
        });

        const tokenData = await tokenRes.json();

        if (tokenData.error) {
            return res.status(400).json({ error: tokenData.error_description });
        }

        // アクセストークンを返す
        res.redirect(`/?access_token=${tokenData.access_token}`);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
}
