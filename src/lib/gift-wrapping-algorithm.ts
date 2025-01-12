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
    if (points.length <= 1) return "point";
    if (points.length === 2) return "segment";
    if (points.length === 3) return "triangle";
    return "quadrilateral or polygon";
}

