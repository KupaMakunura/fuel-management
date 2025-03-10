"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleChange = (
    element: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (isNaN(Number(element.target.value))) return false;

    setOtp([
      ...otp.map((d, idx) => (idx === index ? element.target.value : d)),
    ]);

    if (element.target.value && element.target.nextSibling) {
      (element.target.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOTP = otp.join("");

    if (enteredOTP.length !== 6) {
      toast({
        title: "OTP Error",
        description: "OTP must have 6 digits",
        variant: "destructive",
        className: "bg-red-500 text-white",
      });
    } else {
      try {
        const result = await signIn("credentials", {
          code: enteredOTP,
          email: localStorage.getItem("email"),
          redirect: false,
        });

        if (result?.ok) {
          toast({
            title: "OTP Verification Successful",
            description: "OTP is correct",
            variant: "default",
            className: "bg-green-500 text-white",
          });
          router.replace("/overview");
        } else {
          toast({
            title: "OTP Verification Error",
            description: "Verification failed",
            variant: "destructive",
            className: "bg-red-500 text-white",
          });
        }
      } catch (error) {
        toast({
          title: "OTP Verification Error",
          description: "Verification failed",
          variant: "destructive",
          className: "bg-red-500 text-white",
        });
      }
    }
  };

  return (
    <div className="container relative h-screen flex flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Two Factor Authentication
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="otp" className="sr-only">
              One-time password
            </Label>
            <div className="flex justify-center gap-2 mt-1">
              {otp.map((data, index) => (
                <Input
                  key={index}
                  type="text"
                  name="otp"
                  maxLength={1}
                  value={data}
                  onChange={(e) => handleChange(e, index)}
                  onFocus={(e) => e.target.select()}
                  className="w-12 h-12 text-center text-2xl"
                />
              ))}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full">
            Verify
          </Button>
        </form>

        <div className="text-center">
          <Button variant="link" className="text-sm">
            Resend code
          </Button>
        </div>
      </div>
    </div>
  );
}
