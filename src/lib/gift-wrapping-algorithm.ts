import { z } from "zod";

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

/**
 * Sprawdza orientację trzech punktów względem siebie.
 * @param p - Punkt początkowy
 * @param q - Punkt środkowy
 * @param r - Punkt końcowy
 * @returns {number}
 * - 0: punkty są współliniowe
 * - 1: punkty tworzą skręt w prawo
 * - 2: punkty tworzą skręt w lewo
 */
function orientation(p: Point, q: Point, r: Point): number {
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (val === 0) return 0;
  return val > 0 ? 1 : 2;
}

/**
 * Implementuje algorytm Gift Wrapping (znany również jako algorytm Jarvisa)
 * do znajdowania otoczki wypukłej zbioru punktów.
 *
 * Algorytm działa następująco:
 * 1. Znajduje najbardziej wysunięty na lewo punkt (startowy)
 * 2. Iteracyjnie znajduje kolejne punkty otoczki, sprawdzając kąty między punktami
 * 3. Zapisuje każdy krok algorytmu do wizualizacji
 *
 * @param points - Tablica punktów do przetworzenia
 * @returns Tablica kroków algorytmu pokazująca proces tworzenia otoczki
 */
export function giftWrapping(points: Point[]): Step[] {
  // Sprawdzenie czy tablica nie jest pusta
  if (points.length < 1) return [];

  const steps: Step[] = [];

  // Znajdź punkt najbardziej wysunięty na lewo (o najmniejszej współrzędnej x)
  let leftmost = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i].x < points[leftmost].x) {
      leftmost = i;
    }
  }

  // p to indeks aktualnie rozpatrywanego punktu otoczki
  let p = leftmost;
  do {
    // Utworzenie nowego kroku algorytmu dla wizualizacji
    const currentStep: Step = {
      currentPoint: points[p], // Aktualny punkt otoczki
      triedPoints: [], // Lista punktów sprawdzonych w tym kroku
      nextHullPoint: points[p], // Następny punkt otoczki (początkowo ustawiony na aktualny)
    };

    // q to kandydat na następny punkt otoczki (początkowo następny punkt w tablicy)
    let q = (p + 1) % points.length;

    // Sprawdź każdy punkt jako potencjalny następny punkt otoczki
    for (let i = 0; i < points.length; i++) {
      if (i !== p) {
        // Pomijamy aktualny punkt
        // Dodaj punkt do listy sprawdzonych w tym kroku
        currentStep.triedPoints.push(points[i]);

        // Jeśli znaleziono punkt bardziej "na lewo" (orientation === 2),
        // to staje się on nowym kandydatem na następny punkt otoczki
        if (orientation(points[p], points[i], points[q]) === 2) {
          q = i;
        }
      }
    }

    // Zapisz znaleziony następny punkt otoczki
    currentStep.nextHullPoint = points[q];
    steps.push(currentStep);

    // Przejdź do następnego punktu otoczki
    p = q;

    // Kontynuuj, aż wrócimy do punktu startowego
  } while (p !== leftmost);

  return steps;
}

/**
 * Generuje zadaną liczbę losowych punktów w określonym zakresie.
 * Punkty są generowane jako liczby całkowite w podanym przedziale [min, max].
 *
 * @param count - Liczba punktów do wygenerowania
 * @param min - Minimalna wartość dla współrzędnych x i y
 * @param max - Maksymalna wartość dla współrzędnych x i y
 * @returns Tablica wygenerowanych losowo punktów
 */
export function generateRandomPoints(
  count: number,
  min: number,
  max: number
): Point[] {
  return Array.from({ length: count }, () => ({
    x: Math.floor(Math.random() * (max - min + 1)) + min,
    y: Math.floor(Math.random() * (max - min + 1)) + min,
  }));
}

/**
 * Określa nazwę kształtu geometrycznego na podstawie liczby punktów otoczki wypukłej.
 * Zwraca polską nazwę wielokąta od punktu do dziesięciokąta,
 * dla większej liczby punktów zwraca ogólną nazwę wielokąta z liczbą boków.
 *
 * @param points - Tablica punktów tworzących otoczkę wypukłą
 * @returns Polska nazwa kształtu geometrycznego
 */
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

/**
 * Schema walidacji Zod dla pojedynczego punktu.
 * Sprawdza czy:
 * - współrzędne x i y są liczbami całkowitymi
 * - wartości mieszczą się w przedziale [-50, 50]
 */
export const pointSchema = z.object({
  x: z.number().int().gte(-50).lte(50),
  y: z.number().int().gte(-50).lte(50),
});

/**
 * Schema walidacji dla tablicy punktów.
 * Wymaga:
 * - minimum 1 punkt
 * - maksymalnie 20 punktów
 * - każdy punkt musi spełniać warunki pointSchema
 */
export const pointsInputSchema = z.array(pointSchema).min(1).max(20);

/**
 * Schema walidacji dla wprowadzania punktów w formacie tekstowym.
 * Akceptuje tekst w formacie:
 * - każdy punkt w nowej linii
 * - format punktu: "x,y"
 * - wartości x,y muszą być liczbami całkowitymi
 * - dozwolone od 1 do 20 punktów
 */
export const customPointsSchema = z.string().refine(
  (val) => {
    const lines = val.split("\n");
    if (lines.length < 1 || lines.length > 20) return false;
    return lines.every((line) => /^-?\d+,\s*-?\d+$/.test(line.trim()));
  },
  {
    message:
      "Nieprawidłowe dane wejściowe. Wprowadź od 1 do 20 punktów w formacie 'x,y' (jeden na linię), z wartościami od -50 do 50.",
  }
);
