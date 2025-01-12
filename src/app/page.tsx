"use client"

import { useState, useEffect, useRef } from 'react'
import { Point, Step, giftWrapping, generateRandomPoints, getConvexHullShape } from '../lib/gift-wrapping-algorithm'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function GiftWrappingVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [points, setPoints] = useState<Point[]>([])
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [currentTriedIndex, setCurrentTriedIndex] = useState(-1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [customPoints, setCustomPoints] = useState("")
  const [convexHullShape, setConvexHullShape] = useState("")
  const [convexHullVertices, setConvexHullVertices] = useState<Point[]>([])

  const width = 800
  const height = 600
  const margin = 50

  const [scale, setScale] = useState(1)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)

  useEffect(() => {
    resetPoints()
  }, [])

  useEffect(() => {
    if (points.length > 0) {
      const minX = Math.min(...points.map(p => p.x))
      const maxX = Math.max(...points.map(p => p.x))
      const minY = Math.min(...points.map(p => p.y))
      const maxY = Math.max(...points.map(p => p.y))

      const rangeX = maxX - minX
      const rangeY = maxY - minY

      const scaleX = (width - 2 * margin) / rangeX
      const scaleY = (height - 2 * margin) / rangeY
      const newScale = Math.min(scaleX, scaleY)

      setScale(newScale)
      setOffsetX((width - (maxX + minX) * newScale) / 2)
      setOffsetY((height + (maxY + minY) * newScale) / 2)
    }
  }, [points])

  useEffect(() => {
    if (isAnimating && !isComplete) {
      if (currentTriedIndex < steps[currentStep]?.triedPoints.length - 1) {
        const timer = setTimeout(() => {
          setCurrentTriedIndex((prev) => prev + 1)
        }, 50)
        return () => clearTimeout(timer)
      } else if (currentStep < steps.length - 1) {
        const timer = setTimeout(() => {
          setCurrentStep((prev) => prev + 1)
          setCurrentTriedIndex(-1)
        }, 500)
        return () => clearTimeout(timer)
      } else {
        setIsComplete(true)
        setConvexHullVertices(steps.map(step => step.currentPoint))
        setConvexHullShape(getConvexHullShape(steps.map(step => step.currentPoint)))
      }
    }
  }, [isAnimating, currentStep, currentTriedIndex, steps, isComplete])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, width, height)

    // Draw axes
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, offsetY)
    ctx.lineTo(width, offsetY)
    ctx.moveTo(offsetX, 0)
    ctx.lineTo(offsetX, height)
    ctx.stroke()

    // Draw axis labels
    ctx.fillStyle = 'black'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('0', offsetX, offsetY + 15)

    // X-axis labels
    for (let i = -50; i <= 50; i += 25) {
      const x = offsetX + i * scale
      ctx.fillText(i.toString(), x, offsetY + 15)
    }

    // Y-axis labels
    for (let i = -50; i <= 50; i += 25) {
      const y = offsetY - i * scale
      ctx.fillText(i.toString(), offsetX - 20, y + 5)
    }

    // Draw points
    ctx.fillStyle = 'blue'
    points.forEach((point) => {
      const x = offsetX + point.x * scale
      const y = offsetY - point.y * scale
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })

    // Draw hull (green lines)
    ctx.strokeStyle = 'green'
    ctx.lineWidth = 2
    ctx.beginPath()
    steps.slice(0, currentStep + 1).forEach((step, index) => {
      const x = offsetX + step.currentPoint.x * scale
      const y = offsetY - step.currentPoint.y * scale
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    if (isComplete) {
      ctx.closePath()
    }
    ctx.stroke()

    // Draw current tried line (red)
    if (!isComplete && currentStep < steps.length && currentTriedIndex >= 0) {
      const currentPoint = steps[currentStep].currentPoint
      const triedPoint = steps[currentStep].triedPoints[currentTriedIndex]
      ctx.strokeStyle = 'red'
      ctx.beginPath()
      ctx.moveTo(offsetX + currentPoint.x * scale, offsetY - currentPoint.y * scale)
      ctx.lineTo(offsetX + triedPoint.x * scale, offsetY - triedPoint.y * scale)
      ctx.stroke()
    }
  }, [points, steps, currentStep, currentTriedIndex, isComplete, scale, offsetX, offsetY])

  const resetPoints = (newPoints?: Point[]) => {
    const pointsToUse = newPoints || generateRandomPoints(10, -50, 50)
    setPoints(pointsToUse)
    const newSteps = giftWrapping(pointsToUse)
    setSteps(newSteps)
    setCurrentStep(0)
    setCurrentTriedIndex(-1)
    setIsAnimating(false)
    setIsComplete(false)
    setConvexHullVertices([])
    setConvexHullShape("")
  }

  const startAnimation = () => {
    setIsAnimating(true)
    setCurrentStep(0)
    setCurrentTriedIndex(-1)
    setIsComplete(false)
  }

  const handleCustomPointsSubmit = () => {
    try {
      const newPoints = customPoints.split('\n').map(line => {
        const [x, y] = line.split(',').map(num => parseInt(num.trim()))
        if (isNaN(x) || isNaN(y) || x < -50 || x > 50 || y < -50 || y > 50) {
          throw new Error('Invalid point')
        }
        return { x, y }
      })
      if (newPoints.length < 2 || newPoints.length > 20) {
        throw new Error('Invalid number of points')
      }
      resetPoints(newPoints)
      setIsModalOpen(false)
    } catch (error) {
      alert('Invalid input. Please enter 2-20 points in the format "x,y" (one per line), with values between -50 and 50.')
    }
  }

  const handleRandomGenerate = () => {
    const count = Math.floor(Math.random() * 19) + 2 // 2 to 20 points
    const newPoints = generateRandomPoints(count, -50, 50)
    setCustomPoints(newPoints.map(p => `${p.x},${p.y}`).join('\n'))
  }

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <h1 className="text-3xl font-bold mb-4">Gift Wrapping Algorithm Visualization</h1>
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="border border-gray-300 bg-white mb-4"
        />
        <div className="space-x-4 mb-4">
          <Button onClick={startAnimation} disabled={isAnimating}>
            Start Animation
          </Button>
          <Button onClick={() => resetPoints()} variant="outline">
            Reset Points
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Custom Points</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Enter Custom Points</DialogTitle>
                <DialogDescription>
                  Enter points in the format "x,y" (one per line). Values should be between -50 and 50.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Label htmlFor="points">Points</Label>
                <textarea
                    id="points"
                    className="w-full h-40 p-2 border rounded"
                    value={customPoints}
                    onChange={(e) => setCustomPoints(e.target.value)}
                    placeholder="0,0
10,10
-20,30"
                />
              </div>
              <DialogFooter>
                <Button onClick={handleRandomGenerate} variant="outline">Random Generate</Button>
                <Button onClick={handleCustomPointsSubmit}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {isComplete && (
            <div className="text-left w-full max-w-md">
              <h2 className="text-xl font-bold mb-2">Results:</h2>
              <p>Shape: {convexHullShape}</p>
              <p>Vertices:</p>
              <ul className="list-disc pl-5">
                {convexHullVertices.map((vertex, index) => (
                    <li key={index}>({vertex.x}, {vertex.y})</li>
                ))}
              </ul>
            </div>
        )}
      </div>
  )
}

