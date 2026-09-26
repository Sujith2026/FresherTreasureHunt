import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import Badge from "../components/Badge";
import {
  Sparkles,
  Target,
  Users,
  Lightbulb,
  TrendingUp,
  Heart,
} from "lucide-react";

function AboutPage() {
  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "Pushing boundaries with cutting-edge technology and creative problem-solving",
    },
    {
      icon: Users,
      title: "Collaboration",
      description:
        "Building strong teams and fostering a community of learners and innovators",
    },
    {
      icon: TrendingUp,
      title: "Excellence",
      description:
        "Striving for the highest standards in technical and educational pursuits",
    },
    {
      icon: Heart,
      title: "Passion",
      description:
        "Driven by enthusiasm for technology, learning, and continuous improvement",
    },
  ];

  return (
    <div className="min-h-screen py-8 md:py-12 px-3 md:px-4 bg-linear-to-b from-purple-50 to-white">
      <div className="max-w-5xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="text-center mb-10 md:mb-16">
          <Badge className="mb-3 md:mb-4 bg-purple-100 text-purple-700 border-purple-300 text-xs md:text-sm">
            <Sparkles className="h-3 w-3 mr-1" />
            About Us
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">
            About FRESHER
          </h1>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto px-2 leading-relaxed">
            The Ultimate Tech Realm for Knowledge, Reasoning, Innovation, Sports
            & Teaching Advancement
          </p>
        </div>

        {/* Mission Card */}
        <Card className="mb-8 md:mb-12 bg-linear-to-br from-blue-50 to-purple-50 border-2 border-purple-200 shadow-lg">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-2xl md:text-3xl flex items-center gap-2 md:gap-3">
              <Target className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4 text-sm md:text-lg text-gray-700 px-4 md:px-6 leading-relaxed">
            <p>
              FRESHER is built on the principles of{" "}
              <strong>innovation</strong> and <strong>collaboration</strong>,
              leveraging cutting-edge technology to create an engaging platform
              for learning, competition, and growth.
            </p>
            <p>
              Our mission is to provide the tools, resources, and experiences
              necessary for individuals and teams to excel in various technical
              and non-technical domains. From interactive challenges and QR code
              hunts to competitive leaderboards and team collaboration,
              FRESHER is your partner in the journey toward excellence.
            </p>
          </CardContent>
        </Card>

        {/* Values Grid */}
        <div className="mb-8 md:mb-12">
          <div className="text-center mb-6 md:mb-8 px-2">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Our Core Values
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {values.map((value, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow border-2 shadow-md"
              >
                <CardContent className="flex items-start gap-3 md:gap-4 p-4 md:p-6">
                  <div className="bg-purple-100 p-2 md:p-3 rounded-full shrink-0">
                    <value.icon className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 leading-tight">
                      {value.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* What We Offer */}
        <Card className="mb-8 md:mb-12 shadow-lg">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-2xl md:text-3xl">
              What We Offer
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-start gap-2 md:gap-3">
                  <Badge
                    variant="success"
                    className="mt-1 shrink-0 text-xs md:text-sm"
                  >
                    1
                  </Badge>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base md:text-lg mb-1 leading-tight">
                      Interactive Challenges
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                      Engaging QR code hunts and technical challenges designed
                      to test your skills
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 md:gap-3">
                  <Badge
                    variant="success"
                    className="mt-1 shrink-0 text-xs md:text-sm"
                  >
                    2
                  </Badge>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base md:text-lg mb-1 leading-tight">
                      Real-Time Competition
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                      Live leaderboards tracking your progress against other
                      teams
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 md:gap-3">
                  <Badge
                    variant="success"
                    className="mt-1 shrink-0 text-xs md:text-sm"
                  >
                    3
                  </Badge>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base md:text-lg mb-1 leading-tight">
                      Team Collaboration
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                      Tools for effective teamwork and coordination
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-start gap-2 md:gap-3">
                  <Badge
                    variant="success"
                    className="mt-1 shrink-0 text-xs md:text-sm"
                  >
                    4
                  </Badge>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base md:text-lg mb-1 leading-tight">
                      Learning Resources
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                      Comprehensive guides and instructions to help you succeed
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 md:gap-3">
                  <Badge
                    variant="success"
                    className="mt-1 shrink-0 text-xs md:text-sm"
                  >
                    5
                  </Badge>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base md:text-lg mb-1 leading-tight">
                      Analytics & Insights
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                      Detailed scan history and performance tracking
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 md:gap-3">
                  <Badge
                    variant="success"
                    className="mt-1 shrink-0 text-xs md:text-sm"
                  >
                    6
                  </Badge>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base md:text-lg mb-1 leading-tight">
                      Community Building
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                      Connect with like-minded individuals passionate about
                      technology
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Info */}
        <Card className="bg-gray-50 border-2 shadow-lg">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-xl md:text-2xl">
              Platform Technology
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4 leading-relaxed">
              FRESHER is built using modern web technologies to ensure a fast,
              responsive, and reliable experience:
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs md:text-sm">
                React
              </Badge>
              <Badge variant="secondary" className="text-xs md:text-sm">
                Node.js
              </Badge>
              <Badge variant="secondary" className="text-xs md:text-sm">
                MongoDB
              </Badge>
              <Badge variant="secondary" className="text-xs md:text-sm">
                Express
              </Badge>
              <Badge variant="secondary" className="text-xs md:text-sm">
                TailwindCSS
              </Badge>
              <Badge variant="secondary" className="text-xs md:text-sm">
                JWT Authentication
              </Badge>
              <Badge variant="secondary" className="text-xs md:text-sm">
                QR Code Technology
              </Badge>
              <Badge variant="secondary" className="text-xs md:text-sm">
                Real-time Updates
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AboutPage;
