import { z } from 'zod'

export interface Point {
    x: number;
    y: number;
}

export interface Step {
    currentPoint: Point;
    triedPoints: Point[];
    nextHullPoint: Point;
}

function orientation(p: Point, q: Point, r: Point): number {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val === 0) return 0;
    return val > 0 ? 1 : 2;
}

export function giftWrapping(points: Point[]): Step[] {
    if (points.length < 3) return [];

    const steps: Step[] = [];
    let leftmost = 0;
    for (let i = 1; i < points.length; i++) {
        if (points[i].x < points[leftmost].x) {
            leftmost = i;
        }
    }

    let p = leftmost;
    do {
        const currentStep: Step = {
            currentPoint: points[p],
            triedPoints: [],
            nextHullPoint: points[p],
        };

        let q = (p + 1) % points.length;
        for (let i = 0; i < points.length; i++) {
            if (i !== p) {
                currentStep.triedPoints.push(points[i]);
                if (orientation(points[p], points[i], points[q]) === 2) {
                    q = i;
                }
            }
        }

        currentStep.nextHullPoint = points[q];
        steps.push(currentStep);
        p = q;
    } while (p !== leftmost);

    return steps;
}

export function generateRandomPoints(count: number, min: number, max: number): Point[] {
    return Array.from({ length: count }, () => ({
        x: Math.floor(Math.random() * (max - min + 1)) + min,
        y: Math.floor(Math.random() * (max - min + 1)) + min,
    }));
}

export function getConvexHullShape(points: Point[]): string {
    const lineCount = points.length;
    if (lineCount <= 1) return "point";
    if (lineCount === 2) return "segment";
    if (lineCount === 3) return "triangle";
    if (lineCount === 4) return "quadrilateral";
    if (lineCount === 5) return "pentagon";
    if (lineCount === 6) return "hexagon";
    if (lineCount === 7) return "heptagon";
    if (lineCount === 8) return "octagon";
    if (lineCount === 9) return "nonagon";
    if (lineCount === 10) return "decagon";
    return `polygon with ${lineCount} sides`;
}

export const pointSchema = z.object({
    x: z.number().int().gte(-50).lte(50),
    y: z.number().int().gte(-50).lte(50),
})

export const pointsInputSchema = z.array(pointSchema).min(2).max(20)

export const customPointsSchema = z.string().refine(
    (val) => {
        const lines = val.split('\n');
        if (lines.length < 2 || lines.length > 20) return false;
        return lines.every(line => /^-?\d+,\s*-?\d+$/.test(line.trim()));
    },
    {
        message: "Invalid input. Please enter 2-20 points in the format 'x,y' (one per line), with values between -50 and 50."
    }
)

