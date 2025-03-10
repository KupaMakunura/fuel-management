"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { API } from "@/services";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async () => {
    setIsLoading(true);

    if (email === "") {
      toast({
        title: "Missing Fields",
        description: "Enter email to continue",
        variant: "destructive",
        className: "bg-red-500 text-white",
      });
      setIsLoading(false);
      return;
    }

    const requestData = {
      email: email,
    };

    try {
      const response = await API.post("/forgot-password", requestData);
      if (response.status === 200) {
        toast({
          title: "Verification",
          description: "Sent 6 digit OTP to your phone number",
          variant: "default",
          className: "bg-green-500 text-white",
        });
      }

      if (response.status === 400) {
        toast({
          title: "Bad Request",
          description: "An unexpected error occurred , try again ",
          variant: "destructive",
          className: "bg-red-500 text-white",
        });
      }
    } catch (error: any) {
      if (error.status === 404) {
        toast({
          title: "Email not found",
          description: "User does not exist",
          variant: "destructive",
          className: "bg-red-500 text-white",
        });
      }

      if (error.status === 500) {
        toast({
          title: "Server error",
          description: "An unexpected error occurred , try again",
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
            Forgot Password
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

            <Button
              onClick={handleForgotPassword}
              className="w-full bg-primary hover:bg-gray-800 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Verification Code"}
            </Button>

            <div className="text-center">
              <div className="text-sm text-black">
                Remember your password?{" "}
                <Link
                  href="/"
                  className="font-medium text-black hover:text-gray-800"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
