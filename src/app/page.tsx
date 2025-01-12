"use client"

import { useState, useEffect, useRef } from 'react'
import { Point, Step, giftWrapping, generateRandomPoints, getConvexHullShape, customPointsSchema } from '../lib/gift-wrapping-algorithm'
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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  points: customPointsSchema
})

export default function GiftWrappingVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [points, setPoints] = useState<Point[]>([])
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [currentTriedIndex, setCurrentTriedIndex] = useState(-1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [convexHullShape, setConvexHullShape] = useState("")
  const [convexHullVertices, setConvexHullVertices] = useState<Point[]>([])
  const [hoveredElement, setHoveredElement] = useState<{ type: 'point' | 'line', data: Point | [Point, Point] } | null>(null)

  const width = 800
  const height = 600
  const margin = 50
  const scale = (width - 2 * margin) / 100

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      points: '',
    },
  })

  useEffect(() => {
    resetPoints()
  }, [])

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
    ctx.moveTo(margin, height / 2)
    ctx.lineTo(width - margin, height / 2)
    ctx.moveTo(width / 2, margin)
    ctx.lineTo(width / 2, height - margin)
    ctx.stroke()

    // Draw axis labels
    ctx.fillStyle = 'black'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('-50', margin, height / 2 + 15)
    ctx.fillText('50', width - margin, height / 2 + 15)
    ctx.fillText('-50', width / 2 - 15, height - margin + 15)
    ctx.fillText('50', width / 2 - 15, margin - 5)

    // Draw points
    ctx.fillStyle = 'blue'
    points.forEach((point) => {
      const x = width / 2 + point.x * scale
      const y = height / 2 - point.y * scale
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })

    // Draw hull (green lines)
    ctx.strokeStyle = 'green'
    ctx.lineWidth = 2
    ctx.beginPath()
    steps.slice(0, currentStep + 1).forEach((step, index) => {
      const x = width / 2 + step.currentPoint.x * scale
      const y = height / 2 - step.currentPoint.y * scale
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
      ctx.moveTo(width / 2 + currentPoint.x * scale, height / 2 - currentPoint.y * scale)
      ctx.lineTo(width / 2 + triedPoint.x * scale, height / 2 - triedPoint.y * scale)
      ctx.stroke()
    }

    // Draw tooltip
    if (hoveredElement) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.font = '14px Arial'
      ctx.textAlign = 'left'

      let tooltipText: string
      let tooltipX: number
      let tooltipY: number

      if (hoveredElement.type === 'point') {
        const point = hoveredElement.data as Point
        tooltipText = `(${point.x}, ${point.y})`
        tooltipX = width / 2 + point.x * scale + 10
        tooltipY = height / 2 - point.y * scale - 10
      } else {
        const [start, end] = hoveredElement.data as [Point, Point]
        tooltipText = `(${start.x}, ${start.y}) to (${end.x}, ${end.y})`
        tooltipX = (width / 2 + start.x * scale + width / 2 + end.x * scale) / 2
        tooltipY = (height / 2 - start.y * scale + height / 2 - end.y * scale) / 2 - 10
      }

      ctx.fillRect(tooltipX, tooltipY - 20, ctx.measureText(tooltipText).width + 10, 25)
      ctx.fillStyle = 'white'
      ctx.fillText(tooltipText, tooltipX + 5, tooltipY)
    }
  }, [points, steps, currentStep, currentTriedIndex, isComplete, hoveredElement])

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

  const handleRandomGenerate = () => {
    const count = Math.floor(Math.random() * 19) + 2 // 2 to 20 points
    const newPoints = generateRandomPoints(count, -50, 50)
    form.setValue('points', newPoints.map(p => `${p.x},${p.y}`).join('\n'))
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newPoints = values.points.split('\n').map(line => {
      const [x, y] = line.split(',').map(num => parseInt(num.trim()))
      return { x, y }
    })
    resetPoints(newPoints)
    setIsModalOpen(false)
  }

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const canvasX = (x - width / 2) / scale
    const canvasY = -(y - height / 2) / scale

    // Check if mouse is over a point
    for (const point of points) {
      if (Math.abs(point.x - canvasX) < 2 && Math.abs(point.y - canvasY) < 2) {
        setHoveredElement({ type: 'point', data: point })
        return
      }
    }

    // Check if mouse is over a line
    for (let i = 0; i < steps.length; i++) {
      const start = steps[i].currentPoint
      const end = steps[(i + 1) % steps.length].currentPoint
      const dist = distanceToLine(canvasX, canvasY, start.x, start.y, end.x, end.y)
      if (dist < 2) {
        setHoveredElement({ type: 'line', data: [start, end] })
        return
      }
    }

    setHoveredElement(null)
  }

  const distanceToLine = (x: number, y: number, x1: number, y1: number, x2: number, y2: number) => {
    const A = x - x1
    const B = y - y1
    const C = x2 - x1
    const D = y2 - y1

    const dot = A * C + B * D
    const len_sq = C * C + D * D
    const param = (len_sq !== 0) ? dot / len_sq : -1

    let xx, yy

    if (param < 0) {
      xx = x1
      yy = y1
    } else if (param > 1) {
      xx = x2
      yy = y2
    } else {
      xx = x1 + param * C
      yy = y1 + param * D
    }

    const dx = x - xx
    const dy = y - yy
    return Math.sqrt(dx * dx + dy * dy)
  }

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <h1 className="text-3xl font-bold mb-4">Gift Wrapping Algorithm Visualization</h1>
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="border border-gray-300 bg-white mb-4"
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={() => setHoveredElement(null)}
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                      control={form.control}
                      name="points"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>Points</FormLabel>
                            <FormControl>
                              <Textarea
                                  placeholder="0,0
10,10
-20,30"
                                  className="h-[200px]"
                                  {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleRandomGenerate}>
                      Random Generate
                    </Button>
                    <Button type="submit">Submit</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        {isComplete && (
            <div className="text-left w-full max-w-md">
              <h2 className="text-xl font-bold mb-2">Results:</h2>
              <p>Shape: {convexHullShape}</p>
              <p>Number of lines: {convexHullVertices.length}</p>
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

