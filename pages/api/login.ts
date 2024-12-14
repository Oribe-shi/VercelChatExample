// pages/api/login.ts
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { NEXT_PUBLIC_DISCORD_CLIENT_ID, DISCORD_REDIRECT_URI } = process.env;

    if (!NEXT_PUBLIC_DISCORD_CLIENT_ID || !DISCORD_REDIRECT_URI) {
        return res.status(500).json({ error: "Missing environment variables" });
    }

    const url = `https://discord.com/oauth2/authorize?client_id=${NEXT_PUBLIC_DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        DISCORD_REDIRECT_URI
    )}&response_type=code&scope=identify guilds`;

    res.redirect(url);
}
