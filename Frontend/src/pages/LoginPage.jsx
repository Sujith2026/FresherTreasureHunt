import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/Card";
import Input from "../components/Input";
import { Alert, AlertDescription } from "../components/Alert";
import { LogIn } from "lucide-react";

function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    teamName: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.teamName.trim()) {
      newErrors.teamName = "Team name is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await login(formData);
    if (result.success) {
      navigate("/scan-qr");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center py-8 md:py-12 px-3 md:px-4 bg-linear-to-br from-blue-50 via-white to-indigo-50">
      <Card className="w-full max-w-md shadow-xl border-2">
        <CardHeader className="text-center pb-4 md:pb-6">
          <div className="flex justify-center mb-3 md:mb-4">
            <div className="bg-blue-100 p-3 md:p-4 rounded-full">
              <LogIn className="h-7 w-7 md:h-8 md:w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl">Welcome Back</CardTitle>
          <CardDescription className="text-sm md:text-base text-gray-600">
            Login to your team account
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 md:px-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div className="space-y-2">
              <label
                className="block text-sm md:text-base font-medium text-gray-700"
                htmlFor="teamName"
              >
                Team Name
              </label>
              <Input
                type="text"
                id="teamName"
                name="teamName"
                value={formData.teamName}
                onChange={handleChange}
                className={`text-base h-12 ${
                  errors.teamName
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                placeholder="Enter your team name"
              />
              {errors.teamName && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <span className="text-xs">⚠</span> {errors.teamName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm md:text-base font-medium text-gray-700"
                htmlFor="password"
              >
                Password
              </label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`text-base h-12 ${
                  errors.password
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <span className="text-xs">⚠</span> {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full text-base md:text-lg"
              size="lg"
              loading={loading}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 px-4 md:px-6">
          <p className="text-center text-sm md:text-base text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default LoginPage;
