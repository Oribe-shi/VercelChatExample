// pages/api/token.ts
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // 1. POST メソッドをチェック
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    // 2. リクエストボディから認可コードを取得
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: "Authorization code is required" });
    }

    try {
        // 3. Discord のトークンエンドポイントにリクエスト
        const tokenResponse = await fetch(`${process.env.DISCORD_API_BASE_URL}/oauth2/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
                client_secret: process.env.DISCORD_CLIENT_SECRET!,
                code,
                grant_type: "authorization_code",
                redirect_uri: process.env.DISCORD_REDIRECT_URI!,
            }).toString(),
        });

        // 4. トークンリクエストが成功したか確認
        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            console.error("Error fetching token from Discord: ", errorData);
            return res.status(tokenResponse.status).json({ error: "Failed to fetch token", details: errorData });
        }

        // 5. レスポンスを JSON に変換
        const tokenData = await tokenResponse.json();

        // 6. トークン情報をクライアントに返す
        res.status(200).json(tokenData);
    } catch (error) {
        console.error("Error during token exchange: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
