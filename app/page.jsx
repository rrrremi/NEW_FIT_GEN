"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Dumbbell, Sparkles, Play, Target, BarChart3, Zap, ChevronRight } from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on client-side
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%)]" />
      </div>

      {/* Hero */}
      <section className="mx-auto mt-12 w-full max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl"
        >
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="relative grid gap-6 md:grid-cols-[1.5fr,1fr]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80">
                <Sparkles className="h-3.5 w-3.5" /> AI-Powered Fitness
              </div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Your Perfect Workout Awaits
              </h1>
              <p className="mt-2 max-w-prose text-sm text-white/70">
                Generate personalized workouts based on your goals, fitness level, and available equipment. Powered by advanced AI.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {isAuthenticated ? (
                  <Link href="/protected/workouts/generate">
                    <button className="rounded-2xl border border-white/10 bg-gradient-to-r from-fuchsia-500/20 to-cyan-400/20 px-5 py-3 text-sm text-white/90 backdrop-blur-xl hover:from-fuchsia-500/30 hover:to-cyan-400/30 transition-all">
                      <span className="flex items-center">
                        <Play className="mr-2 h-4 w-4" /> Generate Workout
                      </span>
                    </button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 backdrop-blur-xl hover:bg-white/10 transition-colors">
                        Sign In
                      </button>
                    </Link>
                    <Link href="/auth/signup">
                      <button className="rounded-2xl border border-white/10 bg-gradient-to-r from-fuchsia-500/20 to-cyan-400/20 px-5 py-3 text-sm text-white/90 backdrop-blur-xl hover:from-fuchsia-500/30 hover:to-cyan-400/30 transition-all">
                        Get Started
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Quick Features */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <h3 className="text-sm font-medium text-white/90 mb-3">Why Choose FitGen?</h3>
                <div className="space-y-3 text-xs text-white/70">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-fuchsia-400" />
                    <span>Personalized AI workouts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-cyan-400" />
                    <span>Track your progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span>Adaptive training plans</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto mt-10 w-full max-w-6xl px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-sm font-medium text-white/90 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Personalized Workouts
                </h3>
              </div>
              <div className="p-4 text-xs text-white/70">
                <p>Get custom workout plans based on your fitness level, goals, and available equipment.</p>
              </div>
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-sm font-medium text-white/90 flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Progress Tracking
                </h3>
              </div>
              <div className="p-4 text-xs text-white/70">
                <p>Monitor your fitness journey with detailed statistics and workout history.</p>
              </div>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-sm font-medium text-white/90 flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Adaptive Training
                </h3>
              </div>
              <div className="p-4 text-xs text-white/70">
                <p>As you progress, your workout plans evolve to keep you challenged and motivated.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
