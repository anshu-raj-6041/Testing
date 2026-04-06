import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";

export default function Pricing() {
  return (
    <section className="py-20 bg-transparent">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan right for your team. Upgrade or downgrade at
            any time.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground">Free</CardTitle>
              <div className="text-4xl font-bold text-foreground">$0</div>
              <CardDescription className="text-muted-foreground">
                Perfect for individuals and small teams
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center text-muted-foreground">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span>1 board</span>
                </li>
                <li className="flex items-center text-muted-foreground">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span>Unlimited cards</span>
                </li>
                <li className="flex items-center text-muted-foreground">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span>Basic integrations</span>
                </li>
              </ul>
              <Link href="/sign-up" className="block">
                <Button variant="outline" className="w-full cursor-pointer border-border text-muted-foreground hover:bg-accent/50 hover:text-foreground">
                  Get Started Free
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary bg-card/70 backdrop-blur-sm relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground">Pro</CardTitle>
              <div className="text-4xl font-bold text-foreground">$9.99</div>
              <CardDescription className="text-muted-foreground">
                For growing teams and businesses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center text-muted-foreground">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span>Unlimited boards</span>
                </li>
                <li className="flex items-center text-muted-foreground">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center text-muted-foreground">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Link href="/pricing" className="block">
                <Button className="w-full cursor-pointer bg-primary hover:bg-orange-600 text-primary-foreground">
                  Start Pro Trial
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground">Enterprise</CardTitle>
              <div className="text-4xl font-bold text-foreground">$29.99</div>
              <CardDescription className="text-muted-foreground">For large organizations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center text-muted-foreground">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-center text-muted-foreground">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span>SSO integration</span>
                </li>
                <li className="flex items-center text-muted-foreground">
                  <Check className="w-5 h-5 text-green-400 mr-3" />
                  <span>24/7 phone support</span>
                </li>
              </ul>
              <Link href="/pricing" className="block">
                <Button variant="outline" className="w-full cursor-pointer border-border text-muted-foreground hover:bg-accent/50 hover:text-foreground">
                  Contact Sales
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Link href="/pricing">
            <Button
              variant="ghost"
              className="text-primary hover:text-orange-300 cursor-pointer"
            >
              View all pricing details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
