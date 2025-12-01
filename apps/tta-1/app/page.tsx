"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (!token || !userStr) {
            // Not authenticated, redirect to auth page
            router.push("/auth");
            return;
        }

        try {
            const user = JSON.parse(userStr);

            // Redirect based on role
            if (user.role === "STUDENT") {
                router.push("/student/dashboard");
            } else if (user.role === "TEACHER" || user.role === "ADMIN") {
                router.push("/teacher");
            } else {
                // Unknown role, redirect to auth
                router.push("/auth");
            }
        } catch (error) {
            // Invalid user data, redirect to auth
            router.push("/auth");
        }
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Redirecting...</p>
            </div>
        </div>
    );
}
