import React from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "Up to 3 boards",
        "Basic task management",
        "Limited team members",
        "Community support",
      ],
      popular: false,
    },
    {
      name: "Professional",
      price: "$9.99",
      description: "For growing teams",
      features: [
        "Unlimited boards",
        "Advanced task management",
        "Up to 10 team members",
        "Priority email support",
        "Custom colors & branding",
        "Activity timeline",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Everything in Professional",
        "Unlimited team members",
        "Advanced permissions",
        "Dedicated support",
        "SSO & security",
        "SLA guarantee",
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <Navbar className="z-0" />
      <div className="py-6 sm:py-12 container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Choose Your Plan
          </h1>
          <p className="text-sm sm:text-lg text-gray-300">
            Select the perfect plan for your needs
          </p>
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`flex flex-col border-gray-800 bg-gray-900/50 backdrop-blur-sm ${plan.popular ? 'ring-2 ring-orange-500 md:scale-105 bg-gray-900/70' : ''}`}
              >
                <CardHeader>
                  <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.price !== "Custom" && (
                      <span className="text-gray-400">/month</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-orange-500 hover:bg-orange-600' : 'border-gray-700 text-gray-300 hover:bg-gray-800/50'}`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
