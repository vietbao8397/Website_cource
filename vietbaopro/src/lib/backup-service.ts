import { createClient } from "@supabase/supabase-js";
import { uploadToDrive, ensureFolder } from "./google-drive";

/**
 * Perform a full backup of all important tables to Google Drive
 */
export async function performFullBackup() {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const tables = ["profiles", "courses", "lessons", "orders", "enrollments", "categories", "blog_posts"];
    const backupData: Record<string, any> = {
        timestamp: new Date().toISOString(),
        tables: {},
    };

    console.log("Starting backup process...");

    for (const table of tables) {
        const { data, error } = await supabaseAdmin.from(table).select("*");
        if (error) {
            console.error(`Error fetching table ${table}:`, error);
            backupData.tables[table] = { error: error.message };
        } else {
            backupData.tables[table] = data;
        }
    }

    const backupFileName = `vietbaopro_backup_${new Date().toISOString().split("T")[0]}_${Date.now()}.json`;
    const backupContent = JSON.stringify(backupData, null, 2);

    try {
        // Ensure Backup Folder exists
        const folderId = await ensureFolder("Vietbaopro_Backups");

        // Upload to Drive
        const result = await uploadToDrive(
            backupFileName,
            backupContent,
            "application/json",
            folderId!
        );

        console.log(`Backup successful! File ID: ${result.id}`);
        return {
            success: true,
            fileName: backupFileName,
            fileId: result.id,
            timestamp: backupData.timestamp
        };
    } catch (error: any) {
        console.error("Backup failed:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
