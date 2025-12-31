import { getDriveClient, ensureFolder } from "./google-drive";
import { Readable } from "stream";

const MEDIA_FOLDER_NAME = "Vietbaopro Media";

/**
 * Upload an image to Google Drive and make it publicly readable.
 */
export async function uploadImageToDrive(
    fileName: string,
    mimeType: string,
    buffer: Buffer
) {
    const drive = getDriveClient();

    // 1. Ensure the Media folder exists
    const folderId = await ensureFolder(MEDIA_FOLDER_NAME);

    // 2. Upload the file
    const fileMetadata: any = {
        name: fileName,
        parents: [folderId],
    };

    const media = {
        mimeType: mimeType,
        body: Readable.from(buffer),
    };

    const response: any = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, webViewLink, webContentLink",
    });

    const fileId = response.data.id;

    if (!fileId) {
        throw new Error("Failed to upload file to Google Drive");
    }

    // 3. Make the file public (Anyone with link can view)
    // Note: In a production app, you might want to be more restrictive,
    // but for an e-learning platform displaying thumbnails/images, public works best.
    await drive.permissions.create({
        fileId: fileId,
        requestBody: {
            role: "reader",
            type: "anyone",
        },
    });

    // 4. Return the ID and link
    // Note: webContentLink is better for direct <img> tags in some cases, 
    // but Drive links often need a 'export' or 'u/0/d/...' format to work reliably in <img>.
    // We'll return a direct thumbnail link if possible using a known format.
    return {
        id: fileId,
        url: `https://lh3.googleusercontent.com/u/0/d/${fileId}`, // Direct link format
        webViewLink: response.data.webViewLink,
    };
}

/**
 * List images in the Media folder for the library.
 */
export async function listMediaLibrary() {
    const drive = getDriveClient();
    const folderId = await ensureFolder(MEDIA_FOLDER_NAME);

    const response: any = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`,
        fields: "files(id, name, thumbnailLink, webViewLink, mimeType)",
        orderBy: "createdTime desc",
    });

    return response.data.files || [];
}
