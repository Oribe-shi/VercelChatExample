import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

// POST: 新しいチャットメッセージを追加
export async function POST(req: Request) {
    const { username, message } = await req.json();

    // メッセージの保存
    const timestamp = Date.now();
    const chatData = { username, message, timestamp };
    await kv.rpush("chat_messages", JSON.stringify(chatData));

    return NextResponse.json({ success: true });
}

// GET: チャット履歴を取得
export async function GET() {
    const messages = await kv.lrange("chat_messages", 0, -1); // 全メッセージ取得
    const parsedMessages = messages.map((msg) => JSON.parse(msg));
    return NextResponse.json(parsedMessages);
}
