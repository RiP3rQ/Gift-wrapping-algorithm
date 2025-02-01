# 🎁 Gift-wrapping-algorithm visualization 📈

## Description

A simple interactive web application that visualizes the gift wrapping algorithm (also known as Jarvis March) for finding the convex hull of a set of points. Designed for college-level educational purposes, this educational tool helps users understand how the algorithm works step by step, through animated visualization.

## Tech Stack

- **Next.js 15**
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Shadcn UI**
- **Zod**
- **React Hook Form**

## Features

- **Interactive Visualization**: Watch the algorithm work in real-time with step-by-step animation
- **Custom Input**: Enter your own set of points or generate random ones
- **Canvas Drawing**: High-performance canvas-based rendering
- **Point Validation**: Input validation ensures points are within valid range (-50 to 50)

## Algorithm Implementation

The Gift Wrapping algorithm finds the convex hull by:

`1. Locating the leftmost point`

`2. Iteratively selecting points that make the largest counterclockwise turn`

`3. Continuing until reaching the starting point`

## Installation

Install and run the Gift Wrapping Algorithm visualization:

Clone the repository:

```bash
git clone https://github.com/your-username/gift-wrapping-algorithm.git
```

Navigate to project directory:

```bash
cd gift-wrapping-algorithm
```

Install dependencies:

```bash
pnpm install
```

Run development server:

```bash
pnpm run dev
```

## Usage

`1. Open http://localhost:3000 in your browser`

`2. Click "Generate Random Points" or enter custom points`

`3. Press "Start Animation" to watch the algorithm in action`

`4. Use the tooltip feature by hovering over points and lines`

`5. Reset and try different point configurations`
