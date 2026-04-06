import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Check, Zap, Star } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <Badge
                variant="secondary"
                className="w-fit bg-gray-800/60 text-gray-300 border-gray-700/50 backdrop-blur-sm px-4 py-1.5"
              >
                <Star className="w-3.5 h-3.5 mr-1.5 fill-current" />
                Trusted by 10,000+ teams
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                Organize your work with{" "}
                <span className="text-white">
                  Karya<span className="text-orange-500">Setu</span>
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-400 leading-relaxed max-w-xl">
                The visual way to manage any project, workflow, or team. Move
                work forward with boards, lists, and cards.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base font-semibold px-8 py-6 cursor-pointer bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 transition-all rounded-lg"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base font-medium px-8 py-6 cursor-pointer border-gray-700/50 text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-gray-600 backdrop-blur-sm transition-all rounded-lg"
                >
                  View Pricing
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-400 mr-2" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-400 mr-2" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-400 mr-2" />
                <span>Setup in minutes</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 lg:p-8 border border-gray-800/50">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-white">Project Board</h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                    <h4 className="font-medium text-sm text-gray-400 mb-3">
                      To Do
                    </h4>
                    <div className="space-y-2.5">
                      <div className="bg-gray-900/80 p-3 rounded-lg border border-gray-700/50 text-sm text-white hover:border-gray-600 transition-colors">
                        Design new logo
                      </div>
                      <div className="bg-gray-900/80 p-3 rounded-lg border border-gray-700/50 text-sm text-white hover:border-gray-600 transition-colors">
                        Update website
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                    <h4 className="font-medium text-sm text-gray-400 mb-3">
                      In Progress
                    </h4>
                    <div className="space-y-2.5">
                      <div className="bg-gray-900/80 p-3 rounded-lg border border-gray-700/50 text-sm text-white hover:border-gray-600 transition-colors truncate">
                        Write documentation
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                    <h4 className="font-medium text-sm text-gray-400 mb-3">
                      Done
                    </h4>
                    <div className="space-y-2.5">
                      <div className="bg-gray-900/80 p-3 rounded-lg border border-gray-700/50 text-sm text-white hover:border-gray-600 transition-colors">
                        Setup project
                      </div>
                      <div className="bg-gray-900/80 p-3 rounded-lg border border-gray-700/50 text-sm text-white hover:border-gray-600 transition-colors">
                        Team meeting
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 rounded-full shadow-lg shadow-blue-500/50 animate-bounce-slow">
              <Zap className="w-6 h-6" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-green-500 to-green-600 text-white p-3 rounded-full shadow-lg shadow-green-500/50 animate-bounce-slow">
              <Check className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
