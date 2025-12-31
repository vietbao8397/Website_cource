import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/google/callback`;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

/**
 * Get an authenticated OAuth2 client.
 * If GOOGLE_REFRESH_TOKEN is set, it will automatically refresh the access token.
 */
export function getGoogleAuthClient(): OAuth2Client {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
    }

    const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
    );

    if (REFRESH_TOKEN) {
        oauth2Client.setCredentials({
            refresh_token: REFRESH_TOKEN,
        });
    }

    return oauth2Client;
}

/**
 * Get the Google Drive API client.
 */
export function getDriveClient() {
    const auth = getGoogleAuthClient();
    return google.drive({ version: "v3", auth });
}

/**
 * Get the YouTube API client.
 */
export function getYoutubeClient() {
    const auth = getGoogleAuthClient();
    return google.youtube({ version: "v3", auth });
}

/**
 * Simple utility to list files (test access)
 */
export async function listDriveFiles() {
    const drive = getDriveClient();
    const res = await drive.files.list({
        pageSize: 10,
        fields: "nextPageToken, files(id, name, mimeType)",
    });
    return res.data.files;
}

/**
 * Helper to get the AUTH URL for initial setup
 */
export function getGoogleAuthUrl() {
    const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
    );

    return oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/drive",
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/drive.readonly",
            "https://www.googleapis.com/auth/drive.metadata.readonly",
            "https://www.googleapis.com/auth/youtube.readonly",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        ],
        prompt: "consent",
    });
}

/**
 * Upload a string or buffer as a file to a specific folder
 */
export async function uploadToDrive(
    name: string,
    content: string | Buffer,
    mimeType: string,
    folderId?: string
) {
    const drive = getDriveClient();

    const fileMetadata: any = {
        name,
        parents: folderId ? [folderId] : undefined,
    };

    const media = {
        mimeType,
        body: typeof content === "string" ? content : Buffer.from(content),
    };

    try {
        const res = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: "id",
        });
        return res.data;
    } catch (error) {
        console.error("Error uploading to Drive:", error);
        throw error;
    }
}

/**
 * Ensure a folder exists, creating it if not
 */
export async function ensureFolder(folderName: string) {
    const drive = getDriveClient();

    // Search for the folder
    const response = await drive.files.list({
        q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: "files(id, name)",
    });

    const folders = response.data.files;
    if (folders && folders.length > 0) {
        return folders[0].id;
    }

    // Create it if it doesn't exist
    const fileMetadata = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
    };

    const folder = await drive.files.create({
        requestBody: fileMetadata,
        fields: "id",
    });

    return folder.data.id;
}
