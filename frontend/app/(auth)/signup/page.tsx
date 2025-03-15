"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { API } from "@/services";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSignUp = async () => {
    setIsLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Missing Fields",
        description: "Please enter all required fields",
        variant: "destructive",
        className: "bg-red-500 text-white",
      });
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Error",
        description: "Passwords do not match",
        variant: "destructive",
        className: "bg-red-500 text-white",
      });
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
        className: "bg-red-500 text-white",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await API.post("/users/", {
        name,
        email,
        password,
      });

      if (response.status === 201) {
        toast({
          title: "Success",
          description: "Account created successfully",
          variant: "default",
          className: "bg-green-500 text-white",
        });

        const user = response.data.data;

        localStorage.setItem("email", user.email);

        router.replace("/two-factor-auth");
      }
    } catch (error: any) {
      const status = error.response?.status;

      if (status === 409) {
        toast({
          title: "Error",
          description: "Email already exists",
          variant: "destructive",
          className: "bg-red-500 text-white",
        });
      } else {
        console.log(error);
        toast({
          title: "Error",
          description: "Something went wrong",
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
            Create your account
          </h2>
        </div>
        <div className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="mt-1"
                placeholder="Enter your full name"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
                autoComplete="new-password"
                required
                className="mt-1"
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1"
                placeholder="Confirm your password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleSignUp}
            className="w-full bg-primary hover:bg-gray-800 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign up"}
          </Button>

          <div className="text-center">
            <div className="text-sm text-black">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-black hover:text-gray-800"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
