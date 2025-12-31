import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/google/callback`;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    try {
        const oauth2Client = new google.auth.OAuth2(
            CLIENT_ID,
            CLIENT_SECRET,
            REDIRECT_URI
        );

        const { tokens } = await oauth2Client.getToken(code);

        return new NextResponse(
            `
      <html>
        <body style="font-family: sans-serif; padding: 2rem; background: #000; color: #fff;">
          <h1>Google Auth Successful!</h1>
          <p>Copy the Refresh Token below and add it to your <strong>.env.local</strong> file:</p>
          <pre style="background: #222; padding: 1rem; border-radius: 8px; border: 1px solid #444; overflow: auto; color: #00ff00;">GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}</pre>
          <p style="color: #888;">Once added, restart your server and you will have persistent access to Google Drive.</p>
        </body>
      </html>
      `,
            {
                headers: { "Content-Type": "text/html; charset=utf-8" },
            }
        );
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
