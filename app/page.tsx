"use client";

import { useState, useEffect } from "react";

interface Message {
    username: string;
    message: string;
    timestamp: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [username, setUsername] = useState("Anonymous");

    // メッセージの取得
    useEffect(() => {
        async function fetchMessages() {
            const res = await fetch("/api/chat");
            const data = await res.json();
            setMessages(data);
        }
        fetchMessages();
    }, []);

    // メッセージの送信
    async function sendMessage() {
        await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, message: newMessage }),
        });
        setNewMessage(""); // 入力フィールドをクリア
        // 再取得
        const res = await fetch("/api/chat");
        const data = await res.json();
        setMessages(data);
    }

    return (
        <div>
            <h1>Chat Room</h1>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.username}</strong>: {msg.message}{" "}
                        <em>{new Date(msg.timestamp).toLocaleString()}</em>
                    </div>
                ))}
            </div>
            <input type="text" placeholder="Your name" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input
                type="text"
                placeholder="Type your message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}
