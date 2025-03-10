"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API } from "@/services";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    setIsLoading(true);

    if (!email || !password) {
      toast({
        title: "Missing Fields",
        description: "Please enter email and password",
        variant: "destructive",
        className: "bg-red-500 text-white",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await API.post("/users/login/", {
        email: email,
        password: password,
      });

      if (response.status === 200) {
        toast({
          title: "Authentication Successful",
          description: "Welcome to the Fuel Management System",
          variant: "default",
          className: "bg-green-500 text-white",
        });

        const user = response.data.data;
        localStorage.setItem("email", user.email);

        router.replace("/two-factor-auth");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Wrong details please check and try again",
          variant: "destructive",
          className: "bg-red-500 text-white",
        });
      } else {
        toast({
          title: "Server Error",
          description: "Internal Server Error please try again",
          variant: "destructive",
          className: "bg-red-500 text-white",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <div className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-black hover:text-gray-800"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full bg-primary hover:bg-gray-800 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="text-center">
            <div className="text-sm text-black">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-black hover:text-gray-800"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
