"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Loader2 } from "lucide-react";

export default function AuthPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Login failed");
            }

            // Store token and user data
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Redirect based on role
            if (data.user.role === "STUDENT") {
                router.push("/student/dashboard");
            } else {
                router.push("/");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const role = formData.get("role") as "TEACHER" | "STUDENT";

        const signupData: any = {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            name: formData.get("name") as string,
            role,
        };

        if (role === "STUDENT") {
            const classCode = formData.get("classCode") as string;
            const grade = formData.get("grade") as string;
            const parentEmail = formData.get("parentEmail") as string;

            if (classCode) signupData.classCode = classCode;
            if (grade) signupData.grade = grade;
            if (parentEmail) signupData.parentEmail = parentEmail;
        }

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(signupData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Signup failed");
            }

            // Auto-login after signup
            const loginResponse = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: signupData.email,
                    password: signupData.password,
                }),
            });

            const loginData = await loginResponse.json();

            if (loginResponse.ok) {
                localStorage.setItem("token", loginData.token);
                localStorage.setItem("user", JSON.stringify(loginData.user));

                if (role === "STUDENT") {
                    router.push("/student/dashboard");
                } else {
                    router.push("/");
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="fixed inset-0 -z-10 h-full w-full bg-background">
                <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
            </div>

            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 mb-4">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome to TTA-1</CardTitle>
                    <CardDescription>Sign in to your account or create a new one</CardDescription>
                </CardHeader>

                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input
                                        id="login-email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-password">Password</Label>
                                    <Input
                                        id="login-password"
                                        name="password"
                                        type="password"
                                        required
                                    />
                                </div>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Sign In
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup">
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signup-role">I am a...</Label>
                                    <select
                                        id="signup-role"
                                        name="role"
                                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                                        required
                                        defaultValue="TEACHER"
                                        onChange={(e) => {
                                            const studentFields = document.getElementById("student-fields");
                                            if (studentFields) {
                                                studentFields.style.display =
                                                    e.target.value === "STUDENT" ? "block" : "none";
                                            }
                                        }}
                                    >
                                        <option value="TEACHER">Teacher</option>
                                        <option value="STUDENT">Student</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="signup-name">Full Name</Label>
                                    <Input id="signup-name" name="name" required />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <Input
                                        id="signup-email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="signup-password">Password</Label>
                                    <Input
                                        id="signup-password"
                                        name="password"
                                        type="password"
                                        minLength={8}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        At least 8 characters
                                    </p>
                                </div>

                                <div id="student-fields" className="space-y-4" style={{ display: 'none' }}>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-classCode">Class Code</Label>
                                        <Input
                                            id="signup-classCode"
                                            name="classCode"
                                            placeholder="Enter code from your teacher"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-grade">Grade (Optional)</Label>
                                        <Input id="signup-grade" name="grade" placeholder="e.g., 7th Grade" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-parentEmail">Parent Email (Optional)</Label>
                                        <Input
                                            id="signup-parentEmail"
                                            name="parentEmail"
                                            type="email"
                                            placeholder="parent@example.com"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
