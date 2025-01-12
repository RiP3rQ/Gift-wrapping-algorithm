import { z } from 'zod'

// Definicja typów dla punktu i kroku algorytmu
export interface Point {
    x: number;
    y: number;
}

export interface Step {
    currentPoint: Point;
    triedPoints: Point[];
    nextHullPoint: Point;
}

// Funkcja pomocnicza do określenia orientacji trzech punktów
function orientation(p: Point, q: Point, r: Point): number {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val === 0) return 0;
    return val > 0 ? 1 : 2;
}

// Implementacja algorytmu Gift Wrapping (Jarvis March)
export function giftWrapping(points: Point[]): Step[] {
    if (points.length < 1) return [];

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

// Funkcja do generowania losowych punktów
export function generateRandomPoints(count: number, min: number, max: number): Point[] {
    return Array.from({ length: count }, () => ({
        x: Math.floor(Math.random() * (max - min + 1)) + min,
        y: Math.floor(Math.random() * (max - min + 1)) + min,
    }));
}

// Funkcja do określania kształtu otoczki wypukłej
export function getConvexHullShape(points: Point[]): string {
    const lineCount = points.length;
    if (lineCount <= 1) return "punkt";
    if (lineCount === 2) return "odcinek";
    if (lineCount === 3) return "trójkąt";
    if (lineCount === 4) return "czworokąt";
    if (lineCount === 5) return "pięciokąt";
    if (lineCount === 6) return "sześciokąt";
    if (lineCount === 7) return "siedmiokąt";
    if (lineCount === 8) return "ośmiokąt";
    if (lineCount === 9) return "dziewięciokąt";
    if (lineCount === 10) return "dziesięciokąt";
    return `wielokąt o ${lineCount} bokach`;
}

// Schemat walidacji dla pojedynczego punktu
export const pointSchema = z.object({
    x: z.number().int().gte(-50).lte(50),
    y: z.number().int().gte(-50).lte(50),
})

// Schemat walidacji dla tablicy punktów
export const pointsInputSchema = z.array(pointSchema).min(1).max(20)

// Schemat walidacji dla niestandardowego wprowadzania punktów
export const customPointsSchema = z.string().refine(
    (val) => {
        const lines = val.split('\n');
        if (lines.length < 1 || lines.length > 20) return false;
        return lines.every(line => /^-?\d+,\s*-?\d+$/.test(line.trim()));
    },
    {
        message: "Nieprawidłowe dane wejściowe. Wprowadź od 1 do 20 punktów w formacie 'x,y' (jeden na linię), z wartościami od -50 do 50."
    }
)

