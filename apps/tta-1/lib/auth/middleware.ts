import { NextRequest } from "next/server";
import { verifyToken, type TokenPayload } from "./jwt";

export async function getAuthUser(
    request: NextRequest
): Promise<TokenPayload | null> {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.substring(7);
    return verifyToken(token);
}

export function requireAuth(user: TokenPayload | null): asserts user is TokenPayload {
    if (!user) {
        throw new Error("Unauthorized");
    }
}

export function requireRole(
    user: TokenPayload | null,
    role: "TEACHER" | "STUDENT" | "ADMIN"
): asserts user is TokenPayload {
    requireAuth(user);
    if (user.role !== role) {
        throw new Error("Forbidden: Insufficient permissions");
    }
}
