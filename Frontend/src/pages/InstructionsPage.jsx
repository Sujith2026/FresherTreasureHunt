import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import { Alert, AlertDescription } from "../components/Alert";
import Badge from "../components/Badge";
import {
  UserPlus,
  Target,
  QrCode,
  Trophy,
  CheckCircle,
  AlertTriangle,
  Clock,
  Award,
} from "lucide-react";

function InstructionsPage() {
  const steps = [
    {
      icon: UserPlus,
      title: "1. Sign Up & Create Team",
      description:
        "Create an account and register your team to join the hunt. Choose a unique team name.",
      color: "blue",
    },
    {
      icon: Target,
      title: "2. Understand the Rules",
      description:
        "Familiarize yourself with the game mechanics, point system, and progression stages. Knowledge is power!",
      color: "purple",
    },
    {
      icon: QrCode,
      title: "3. Scan QR Codes",
      description:
        "Find and scan QR codes scattered throughout the venue. Each code must be scanned in the correct sequence to progress.",
      color: "green",
    },
    {
      icon: Trophy,
      title: "4. Climb the Leaderboard",
      description:
        "Earn points by scanning codes correctly. Compete with other teams and aim for the top spot on the leaderboard!",
      color: "yellow",
    },
  ];

  const rules = [
    {
      icon: CheckCircle,
      text: "Scan QR codes in the correct sequence to progress through stages",
      variant: "success",
    },
    {
      icon: AlertTriangle,
      text: "Scanning out of order may result in point deductions",
      variant: "warning",
    },
    {
      icon: Clock,
      text: "Each scan is timestamped - speed matters in the rankings",
      variant: "info",
    },
    {
      icon: Award,
      text: "Bonus points are awarded for completing stages quickly",
      variant: "default",
    },
  ];

  return (
    <div className="min-h-screen py-8 md:py-12 px-3 md:px-4 bg-linear-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="text-center mb-8 md:mb-12">
          <Badge className="mb-3 md:mb-4 text-xs md:text-sm">
            <CheckCircle className="h-3 w-3 mr-1" />
            Instructions
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">
            How It Works
          </h1>
          <p className="text-base md:text-xl text-gray-600 px-2">
            Follow these steps to participate in the FRESHER Treasure Hunt
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
          {steps.map((step, index) => {
            const colorClasses = {
              blue: "bg-blue-100 text-blue-600",
              purple: "bg-purple-100 text-purple-600",
              green: "bg-green-100 text-green-600",
              yellow: "bg-yellow-100 text-yellow-600",
            };

            return (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-600 shadow-md"
              >
                <CardContent className="flex items-start gap-3 md:gap-4 p-4 md:p-6">
                  <div
                    className={`p-2 md:p-3 rounded-full ${
                      colorClasses[step.color]
                    } shrink-0`}
                  >
                    <step.icon className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                      {step.title}
                    </h2>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Rules & Guidelines */}
        <Card className="mb-8 md:mb-12 bg-linear-to-br from-blue-50 to-purple-50 border-2 shadow-lg">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-2xl md:text-3xl flex items-center gap-2">
              <Target className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
              Important Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4 px-3 md:px-6">
            {rules.map((rule, index) => (
              <Alert
                key={index}
                variant={rule.variant}
                className="text-sm md:text-base"
              >
                <rule.icon className="h-4 w-4" />
                <AlertDescription className="font-medium leading-relaxed">
                  {rule.text}
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-green-50 border-green-200 border-2 shadow-lg">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
              <Award className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
              Pro Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            <ul className="space-y-3 md:space-y-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-sm md:text-base text-gray-700 leading-relaxed">
                  <strong>Stay Organized:</strong> Coordinate with your team
                  members to cover more ground efficiently
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-sm md:text-base text-gray-700 leading-relaxed">
                  <strong>Read Carefully:</strong> Pay attention to clues and
                  instructions at each stage
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-sm md:text-base text-gray-700 leading-relaxed">
                  <strong>Check the Leaderboard:</strong> Monitor your progress
                  and adjust your strategy
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-sm md:text-base text-gray-700 leading-relaxed">
                  <strong>Move Quickly:</strong> Time is a factor in the final
                  rankings
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Alert variant="info" className="mt-6 md:mt-8 text-sm md:text-base">
          <AlertDescription>
            <p className="font-semibold mb-2">Need Help?</p>
            <p className="text-xs md:text-sm leading-relaxed">
              If you encounter any issues during the hunt, contact the event
              organizers or check the FAQ section. Remember to keep your camera
              permissions enabled for QR scanning!
            </p>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

export default InstructionsPage;
