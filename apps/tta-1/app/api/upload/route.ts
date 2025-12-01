import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { getAuthUser } from "@/lib/auth/middleware";

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, ""); // Sanitize filename
        const finalFilename = `${uniqueSuffix}-${filename}`;

        // Save to public/uploads
        const uploadDir = join(process.cwd(), "public", "uploads");
        const filepath = join(uploadDir, finalFilename);

        await writeFile(filepath, buffer);

        // Return public URL
        const url = `/uploads/${finalFilename}`;

        return NextResponse.json({ url });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}
