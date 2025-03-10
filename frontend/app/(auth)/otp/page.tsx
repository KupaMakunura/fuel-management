"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { API } from "@/services";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const { data: session } = useSession();
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

    console.log(enteredOTP);

    if (enteredOTP.length !== 6) {
      toast({
        title: "OTP Error",
        description: "OTP must have 6 digits",
        variant: "destructive",
        className: "bg-red-500 text-white",
      });
    } else {
      try {
        const requestData = {
          otp: enteredOTP,
        };
        const response = await API.post("/verify-otp", requestData, {
          headers: {
            Authorization: `Bearer ${session?.user.access_token}`,
          },
        });

        if (response.status === 200) {
          toast({
            title: "OTP Verification Successful",
            description: "OTP is correct",
            variant: "default",
            className: "bg-green-500 text-white",
          });
          router.replace("/overview");
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
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Image
            src="/placeholder.svg?height=40&width=40"
            alt="PricePick logo"
            width={40}
            height={40}
            className="mx-auto h-10 w-auto"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the 6-digit code sent to your email
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className=" py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="otp" className="sr-only">
                One-time password
              </Label>
              <div className="flex justify-between mt-1">
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

            <div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-blue-400"
              >
                Verify
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Resend code
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
