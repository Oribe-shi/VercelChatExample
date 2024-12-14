export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ja">
            <body style={{ fontFamily: "Arial, sans-serif", margin: "0", padding: "0" }}>
                <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>{children}</div>
            </body>
        </html>
    );
}
