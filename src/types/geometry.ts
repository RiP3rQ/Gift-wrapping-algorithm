/**
 * Typ reprezentujący punkt na płaszczyźnie
 * Składa się z dwóch współrzędnych x i y
 * @property x - Współrzędna x punktu
 * @property y - Współrzędna y punktu
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Typ reprezentujący krok algorytmu otoczki wypukłej
 * Składa się z trzech punktów:
 * - currentPoint: Aktualny punkt otoczki
 * - triedPoints: Lista punktów sprawdzonych w tym kroku
 * - collinearPoints: Lista punktów współliniowych z aktualnym punktem
 * - nextHullPoint: Następny punkt otoczki
 */
export interface Step {
  currentPoint: Point;
  triedPoints: Point[];
  collinearPoints: Point[];
  nextHullPoint: Point;
}
