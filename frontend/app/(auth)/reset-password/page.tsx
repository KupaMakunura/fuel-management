"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { API } from "@/services";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleResetPassword = async () => {
    setIsLoading(true);

    if (!password || !confirmPassword) {
      toast({
        title: "Missing Fields",
        description: "Enter passwords to continue",
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
      const response = await API.post(
        "/reset-password",
        {
          password,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.user.access_token}`,
          },
        }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Your password has been reset successfully",
          variant: "default",
          className: "bg-green-500 text-white",
        });
        router.replace("/login");
      }
    } catch (error: any) {
      const status = error.response?.status;

      if (status === 404) {
        toast({
          title: "Error",
          description: "User does not exist",
          variant: "destructive",
          className: "bg-red-500 text-white",
        });
      } else if (status === 400) {
        toast({
          title: "Error",
          description: "Bad request, please try again",
          variant: "destructive",
          className: "bg-red-500 text-white",
        });
      } else {
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
            Reset your password
          </h2>
        </div>
        <div className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow">
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1"
                placeholder="Enter new password"
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
                placeholder="Confirm new password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleResetPassword}
            className="w-full bg-primary hover:bg-gray-800 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Resetting password..." : "Reset password"}
          </Button>
        </div>
      </div>
    </div>
  );
}
