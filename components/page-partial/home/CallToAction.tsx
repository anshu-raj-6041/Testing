import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function CallToAction() {
  return (
    <section className="py-20 bg-gradient-to-r from-orange-600/20 via-orange-500/10 to-transparent backdrop-blur-sm">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white">
            Ready to get organized?
          </h2>
          <p className="text-xl text-gray-300">
            Join thousands of teams who trust KaryaSetu to manage their
            projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="text-lg px-8 py-6 cursor-pointer bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30"
              >
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:text-white cursor-pointer"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
