'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ProgressiveWorkoutGenerationProps {
  isVisible: boolean
  currentStep: number
  steps: string[]
  className?: string
}

export const ProgressiveWorkoutGeneration: React.FC<ProgressiveWorkoutGenerationProps> = ({
  isVisible,
  currentStep,
  steps,
  className = ''
}) => {
  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${className}`}
    >
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-fuchsia-400/30 border-t-fuchsia-400"
          />
          <h3 className="text-xl font-semibold text-white mb-2">Generating Your Workout</h3>
          <p className="text-white/70 text-sm">AI is crafting your personalized fitness plan</p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: index <= currentStep ? 1 : 0.3
              }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                index < currentStep
                  ? 'bg-green-500 text-white'
                  : index === currentStep
                  ? 'bg-fuchsia-500 text-white animate-pulse'
                  : 'bg-white/20 text-white/50'
              }`}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              <span className={`text-sm ${
                index <= currentStep ? 'text-white' : 'text-white/50'
              }`}>
                {step}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="flex justify-center">
            <div className="text-xs text-white/50">
              This may take 10-30 seconds...
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProgressiveWorkoutGeneration
