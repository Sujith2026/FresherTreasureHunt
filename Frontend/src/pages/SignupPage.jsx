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
import { UserPlus } from "lucide-react";

function SignupPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    teamName: "",
    leaderName: "",
    leaderEmail: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
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
    } else if (formData.teamName.trim().length < 3) {
      newErrors.teamName = "Team name must be at least 3 characters";
    }

    if (!formData.leaderName.trim()) {
      newErrors.leaderName = "Leader name is required";
    } else if (formData.leaderName.trim().length < 2) {
      newErrors.leaderName = "Leader name must be at least 2 characters";
    }

    if (!formData.leaderEmail.trim()) {
      newErrors.leaderEmail = "Leader email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.leaderEmail.trim())) {
      newErrors.leaderEmail = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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

    const { confirmPassword, ...registrationData } = formData;
    const result = await register(registrationData);

    if (result.success) {
      navigate("/scan-qr");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center py-8 md:py-12 px-3 md:px-4 bg-linear-to-br from-indigo-50 via-white to-purple-50">
      <Card className="w-full max-w-md shadow-xl border-2">
        <CardHeader className="text-center pb-4 md:pb-6">
          <div className="flex justify-center mb-3 md:mb-4">
            <div className="bg-indigo-100 p-3 md:p-4 rounded-full">
              <UserPlus className="h-7 w-7 md:h-8 md:w-8 text-indigo-600" />
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl">Create Team</CardTitle>
          <CardDescription className="text-sm md:text-base text-gray-600">
            Register your team for the hunt
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
                placeholder="Choose a unique team name"
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
                htmlFor="leaderName"
              >
                Leader Name
              </label>
              <Input
                type="text"
                id="leaderName"
                name="leaderName"
                value={formData.leaderName}
                onChange={handleChange}
                className={`text-base h-12 ${
                  errors.leaderName
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                placeholder="Enter team leader's name"
              />
              {errors.leaderName && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <span className="text-xs">⚠</span> {errors.leaderName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm md:text-base font-medium text-gray-700"
                htmlFor="leaderEmail"
              >
                Leader Email
              </label>
              <Input
                type="email"
                id="leaderEmail"
                name="leaderEmail"
                value={formData.leaderEmail}
                onChange={handleChange}
                className={`text-base h-12 ${
                  errors.leaderEmail
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                placeholder="Enter leader's email address"
              />
              {errors.leaderEmail && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <span className="text-xs">⚠</span> {errors.leaderEmail}
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
                placeholder="Create a strong password"
              />
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <span className="text-xs">⚠</span> {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm md:text-base font-medium text-gray-700"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`text-base h-12 ${
                  errors.confirmPassword
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                placeholder="Re-enter your password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <span className="text-xs">⚠</span> {errors.confirmPassword}
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
              {loading ? "Creating Team..." : "Create Team"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="px-4 md:px-6">
          <p className="text-center text-sm md:text-base text-gray-600 w-full">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
            >
              Log In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default SignupPage;
