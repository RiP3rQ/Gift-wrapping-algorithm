import { JSX } from "react";
import { Point } from "@/types/geometry";

/**
 * Komponent prezentujący wyniki algorytmu Gift Wrapping
 * @constructor
 * @param {boolean} isComplete - Czy algorytm zakończył działanie
 * @param {string} convexHullShape - Nazwa kształtu otoczki
 * @param {Point[]} convexHullVertices - Punkty tworzące otoczkę
 */
interface Props {
  isComplete: boolean;
  convexHullShape: string;
  convexHullVertices: Point[];
}

/**
 * Komponent prezentujący wyniki algorytmu Gift Wrapping
 * @param {Props} props - Właściwości komponentu
 * @returns {JSX.Element} Komponent GiftWrappingResults
 */
export function GiftWrappingResults({
  isComplete,
  convexHullShape,
  convexHullVertices,
}: Readonly<Props>): JSX.Element | null {
  // Jeśli algorytm nie zakończył działania, nie wyświetlaj wyników
  if (!isComplete) {
    return null;
  }

  // Wyświetl wyniki algorytmu
  return (
    <div className="text-left w-full max-w-md">
      <h2 className="text-xl font-bold mb-2">Wyniki:</h2>
      <p>Kształt: {convexHullShape}</p>
      <p>Liczba linii: {convexHullVertices.length}</p>
      <p>Wierzchołki:</p>
      <ul className="list-disc pl-5">
        {convexHullVertices.map((vertex, index) => (
          <li key={index}>
            ({vertex.x}, {vertex.y})
          </li>
        ))}
      </ul>
    </div>
  );
}
