"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/auth-store";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authenticateUser } from "@/hooks/authenticateUser";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    mobile: '', // Treat mobile as a string
  });
  const { token } = useAuthStore(); // Access token from Zustand
  const { toast } = useToast();

  useEffect(() => {
    console.log("token", token);
    if (token) {
      router.push('/');
    }
  }, [token, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value, // Keep mobile as a string
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.mobile.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your mobile number.",
      });
      return;
    }

    setIsLoading(true);

    try {
      await authenticateUser(formData); // Pass consistent formData
      toast({
        title: "Success",
        description: "Login successful!",
      });
    //   router.push('/dashboard'); // Redirect to dashboard
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Invalid credentials. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-[#1875AA40]">
    <Card className="w-full max-w-md bg-white shadow-lg">
      <CardHeader className="bg-[#004185] text-white rounded-t-lg">
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription className="text-[#FFFFFF80]">Enter your credentials to login.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-[#231F20]">
              Username
            </Label>
            <Input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="border-[#1875AA] focus:ring-[#004185]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#231F20]">
              Password
            </Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="border-[#1875AA] focus:ring-[#004185]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-[#231F20]">
              Mobile Number
            </Label>
            <Input
              type="text"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className="border-[#1875AA] focus:ring-[#004185]"
              required
            />
          </div>
          <Button
            type="submit"
            className={`w-full bg-[#1875AA] hover:bg-[#004185] text-white transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
  );
}
