import { NextConfig } from "next";

const nextConfig: NextConfig = {
    async headers() {
        const discordClientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;

        if (!discordClientId) {
            throw new Error("NEXT_PUBLIC_DISCORD_CLIENT_ID is not defined in environment variables.");
        }

        const discordApiUrl = `https://${discordClientId}.discordsays.com/.proxy/api/token`;

        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: `
                                default-src 'self'; 
                                connect-src 
                                'self' 
                                https://discord.com/.proxy/api/token
                                ${discordApiUrl}
                                wss://${discordClientId}.discordsays.com/.proxy/ 
                                data: blob:; 
                                script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
                                style-src 'self' 'unsafe-inline';
                            `
                            .replace(/\s+/g, " ")
                            .trim(),
                    },
                ],
            },
        ];
    },
};
