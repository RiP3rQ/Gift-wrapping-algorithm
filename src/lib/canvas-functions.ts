import { CANVAS_HEIGTH, CANVAS_MARGIN, CANVAS_WIDTH } from "@/constants";
import { Point, Step } from "@/types/geometry";

/**
 * Rysuje osie układu współrzędnych na płaszczyźnie z uwzględnieniem marginesów
 * @param ctx - Kontekst rysowania canvasa
 */
export function drawAxis(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(CANVAS_MARGIN, CANVAS_HEIGTH / 2);
  ctx.lineTo(CANVAS_WIDTH - CANVAS_MARGIN, CANVAS_HEIGTH / 2);
  ctx.moveTo(CANVAS_WIDTH / 2, CANVAS_MARGIN);
  ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGTH - CANVAS_MARGIN);
  ctx.stroke();
}

/**
 * Rysuje etykiety osi współrzędnych na płaszczyźnie z uwzględnieniem marginesów
 * @param ctx - Kontekst rysowania canvasa
 */
export function drawAxisLabels(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "black";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText("-50", CANVAS_MARGIN, CANVAS_HEIGTH / 2 + 15);
  ctx.fillText("50", CANVAS_WIDTH - CANVAS_MARGIN, CANVAS_HEIGTH / 2 + 15);
  ctx.fillText(
    "-50",
    CANVAS_WIDTH / 2 - 15,
    CANVAS_HEIGTH - CANVAS_MARGIN + 15,
  );
  ctx.fillText("50", CANVAS_WIDTH / 2 - 15, CANVAS_MARGIN - 5);
}

/**
 * Rysuje punkty na płaszczyźnie z uwzględnieniem marginesów
 * @param ctx - Kontekst rysowania canvasa
 * @param points - Tablica punktów do narysowania
 */
export function drawPoints(
  ctx: CanvasRenderingContext2D,
  points: Point[],
): void {
  ctx.fillStyle = "blue";
  points.forEach((point) => {
    const x =
      CANVAS_WIDTH / 2 + (point.x / 100) * (CANVAS_WIDTH - 2 * CANVAS_MARGIN);
    const y =
      CANVAS_HEIGTH / 2 - (point.y / 100) * (CANVAS_HEIGTH - 2 * CANVAS_MARGIN);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
  });
}

/**
 * Rysuje otoczkę wypukłą na płaszczyźnie z uwzględnieniem marginesów
 * @param ctx - Kontekst rysowania canvasa
 * @param steps - Tablica kroków algorytmu
 * @param currentStep - Numer aktualnego kroku
 * @param isComplete - Czy algorytm zakończył działanie
 */
export function drawConvexHull(
  ctx: CanvasRenderingContext2D,
  steps: Step[],
  currentStep: number,
  isComplete: boolean,
): void {
  ctx.strokeStyle = "green";
  ctx.lineWidth = 2;
  ctx.beginPath();
  steps.slice(0, currentStep + 1).forEach((step, index) => {
    const x =
      CANVAS_WIDTH / 2 +
      (step.currentPoint.x / 100) * (CANVAS_WIDTH - 2 * CANVAS_MARGIN);
    const y =
      CANVAS_HEIGTH / 2 -
      (step.currentPoint.y / 100) * (CANVAS_HEIGTH - 2 * CANVAS_MARGIN);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  if (isComplete) {
    ctx.closePath();
  }
  ctx.stroke();
}

/**
 * Rysuje linię łączącą aktualny punkt z punktem sprawdzanym na płaszczyźnie
 * @param ctx - Kontekst rysowania canvasa
 * @param steps - Tablica kroków algorytmu
 * @param currentStep - Numer aktualnego kroku
 * @param currentTriedIndex - Indeks aktualnie sprawdzanego punktu
 * @param isComplete - Czy algorytm zakończył działanie
 */
export function drawCurrentLine(
  ctx: CanvasRenderingContext2D,
  steps: Step[],
  currentStep: number,
  currentTriedIndex: number,
  isComplete: boolean,
): void {
  if (!isComplete && currentStep < steps.length && currentTriedIndex >= 0) {
    const currentPoint = steps[currentStep].currentPoint;
    const triedPoint = steps[currentStep].triedPoints[currentTriedIndex];
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(
      CANVAS_WIDTH / 2 +
        (currentPoint.x / 100) * (CANVAS_WIDTH - 2 * CANVAS_MARGIN),
      CANVAS_HEIGTH / 2 -
        (currentPoint.y / 100) * (CANVAS_HEIGTH - 2 * CANVAS_MARGIN),
    );
    ctx.lineTo(
      CANVAS_WIDTH / 2 +
        (triedPoint.x / 100) * (CANVAS_WIDTH - 2 * CANVAS_MARGIN),
      CANVAS_HEIGTH / 2 -
        (triedPoint.y / 100) * (CANVAS_HEIGTH - 2 * CANVAS_MARGIN),
    );
    ctx.stroke();
  }
}
