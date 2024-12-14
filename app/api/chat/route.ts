import { createClient } from "redis";
import { NextResponse } from "next/server";

// Redisクライアントの作成
const redis = createClient({
    url: process.env.KV_URL,
});
redis.connect();

// POST: 新しいチャットメッセージを追加
export async function POST(req: Request) {
    try {
        const { username, message } = await req.json();
        const timestamp = Date.now();
        const chatData = JSON.stringify({ username, message, timestamp });

        // Redisにメッセージを保存
        await redis.rPush("chat_messages", chatData);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving message:", error);
        return NextResponse.json({ success: false, error: "Error saving message" }, { status: 500 });
    }
}

// GET: チャット履歴を取得
export async function GET() {
    try {
        // Redisからチャット履歴を取得
        const messages = await redis.lRange("chat_messages", 0, -1);
        const parsedMessages = messages.map((msg) => JSON.parse(msg));
        return NextResponse.json(parsedMessages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ success: false, error: "Error fetching messages" }, { status: 500 });
    }
}
