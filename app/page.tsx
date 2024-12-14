"use client";

import React, { useState, useEffect } from "react";
import { DiscordSDK } from "@discord/embedded-app-sdk";
import { DiscordProxy } from "@robojs/patch";

export default function Home() {
    const [userName, setUserName] = useState<string | null>(null);
    const [userIcon, setUserIcon] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [frameId, setFrameId] = useState<string | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");

    useEffect(() => {
        // DiscordProxy.patch() を最初に呼び出す
        DiscordProxy.patch();

        const initializeDiscordSdk = async () => {
            // URLのクエリパラメータを取得
            const urlParams = new URLSearchParams(window.location.search);

            // 'frame_id'がクエリに含まれているか確認
            const frameIdFromUrl = urlParams.get("frame_id");
            setFrameId(frameIdFromUrl);

            if (!frameIdFromUrl) {
                window.location.href = "/index.html";
                return;
            }

            const discordSdk = new DiscordSDK(process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!);

            try {
                // SDKの初期化
                await discordSdk.ready();

                // 認証コードの取得
                const { code } = await discordSdk.commands.authorize({
                    client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
                    response_type: "code",
                    state: "",
                    prompt: "none",
                    scope: ["identify"],
                });

                // サーバーからアクセストークンを取得
                const response = await fetch("/api/token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ code }),
                });

                const text = await response.text(); // レスポンスをテキストとして取得して確認

                const { access_token } = JSON.parse(text); // 文字列として受け取ったレスポンスをパース

                // アクセストークンを使用して認証
                const auth = await discordSdk.commands.authenticate({
                    access_token,
                });

                if (!auth) {
                    setError("Authentication failed.");
                    return;
                }

                // ユーザー情報の取得
                const user = await fetch("https://discord.com/api/v10/users/@me", {
                    headers: {
                        Authorization: `Bearer ${auth.access_token}`,
                        "Content-Type": "application/json",
                    },
                }).then((response) => response.json());

                setUserName(user.global_name || user.username);
                setUserIcon(user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : null);

                // ユーザー情報の取得後にメッセージを取得
                if (userName) {
                    fetchMessages(); // ユーザー名が設定された後にメッセージを取得
                }
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    console.error("Error initializing Discord SDK", error);
                    setError("Failed to initialize Discord SDK.");
                }
            }
        };

        initializeDiscordSdk();
    }, [userName]);

    const fetchMessages = async () => {
        const response = await fetch("/api/messages");
        const data = await response.json();
        setMessages(data.messages);
    };

    const sendMessage = async () => {
        if (newMessage.trim()) {
            await fetch("/api/sendMessage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: newMessage }),
            });
            setNewMessage("");
            fetchMessages();
        }
    };

    const deleteMessage = async (messageId: number) => {
        await fetch(`/api/deleteMessage/${messageId}`, { method: "DELETE" });
        fetchMessages();
    };

    return (
        <div style={{ fontFamily: "Arial, sans-serif", textAlign: "center", marginTop: "50px" }}>
            <h1>Discord Activity</h1>
            <p>{frameId ? `Frame ID: ${frameId}` : "No frame_id found in the URL."}</p>

            {!userName ? (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "50vh",
                    }}
                >
                    {error ? <p style={{ color: "red" }}>{error}</p> : <p style={{ fontSize: "24px" }}>Loading...</p>}
                </div>
            ) : (
                <div>
                    <p style={{ fontSize: "20px" }}>
                        Welcome, <strong>{userName}</strong>!
                    </p>
                    {userIcon && (
                        <img
                            src={userIcon}
                            alt="User Avatar"
                            style={{
                                display: "block",
                                margin: "20px 25% 20px 25%",
                                width: "50%",
                                borderRadius: "10%",
                            }}
                        />
                    )}
                    <div>
                        {messages.map((msg, index) => (
                            <div key={index}>
                                <p>{msg}</p>
                                <button onClick={() => deleteMessage(index)}>削除</button>
                            </div>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="メッセージを入力"
                    />
                    <button onClick={sendMessage}>送信</button>
                </div>
            )}
        </div>
    );
}
