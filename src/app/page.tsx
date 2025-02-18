"use client"; // Oznacza, że ten komponent będzie działał po stronie przeglądarki

/**
 * Import niezbędnych bibliotek i komponentów:
 * - React hooks do zarządzania stanem i efektami
 * - Funkcje algorytmu z naszego własnego modułu
 * - Komponenty UI z biblioteki shadcn/ui do budowy interfejsu
 */
import { useEffect, useRef, useState } from "react";
import {
  generateRandomPoints,
  getConvexHullShape,
  giftWrapping,
} from "@/lib/gift-wrapping-algorithm";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { PageFooter } from "@/components/page-footer";
import { GiftWrappingResults } from "@/components/gift-wrapping-results";
import { formSchema } from "@/schema/custom-points-schema";
import { ActionButtons } from "@/components/action-buttons";
import { Point, Step } from "@/types/geometry";
import {
  drawAxis,
  drawAxisLabels,
  drawConvexHull,
  drawCurrentLine,
  drawPoints,
} from "@/lib/canvas-functions";
import { CANVAS_HEIGTH, CANVAS_WIDTH } from "@/constants";

/**
 * Główny komponent aplikacji odpowiedzialny za wizualizację algorytmu Gift Wrapping
 * Zawiera całą logikę związaną z:
 * - Rysowaniem na canvasie
 * - Animacją algorytmu
 * - Obsługą interakcji użytkownika
 */
export default function GiftWrappingVisualization() {
  /**
   * Deklaracja wszystkich stanów komponentu:
   * - canvasRef: referencja do elementu canvas do rysowania
   * - points: lista wszystkich punktów na płaszczyźnie
   * - steps: kroki algorytmu do wizualizacji
   * - currentStep: aktualny krok animacji
   * - currentTriedIndex: indeks aktualnie sprawdzanego punktu
   * - isAnimating: czy animacja jest w trakcie
   * - isComplete: czy algorytm zakończył działanie
   * - convexHullShape: nazwa kształtu otoczki (np. "trójkąt")
   * - convexHullVertices: punkty tworzące otoczkę
   * - isModalOpen: czy modal z formularzem jest otwarty
   */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTriedIndex, setCurrentTriedIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [convexHullShape, setConvexHullShape] = useState("");
  const [convexHullVertices, setConvexHullVertices] = useState<Point[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Effect Hook uruchamiany przy pierwszym renderowaniu
   * Generuje początkowy zestaw losowych punktów
   */
  useEffect(() => {
    resetPoints();
  }, []);

  /**
   * Effect Hook odpowiedzialny za animację algorytmu
   * Kontroluje przejścia między kolejnymi krokami i punktami
   */
  useEffect(() => {
    if (isAnimating && !isComplete) {
      if (currentTriedIndex < steps[currentStep]?.triedPoints.length - 1) {
        const timer = setTimeout(() => {
          setCurrentTriedIndex((prev) => prev + 1);
        }, 50);
        return () => clearTimeout(timer);
      } else if (currentStep < steps.length - 1) {
        const timer = setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
          setCurrentTriedIndex(-1);
        }, 500);
        return () => clearTimeout(timer);
      } else {
        setIsComplete(true);
        setConvexHullVertices(steps.map((step) => step.currentPoint));
        setConvexHullShape(
          getConvexHullShape(steps.map((step) => step.currentPoint)),
        );
      }
    }
  }, [isAnimating, currentStep, currentTriedIndex, steps, isComplete]);

  /**
   * Główny Effect Hook odpowiedzialny za rysowanie na canvasie
   * Aktualizuje canvas przy każdej zmianie stanu wpływającej na wizualizację
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Czyszczenie canvasa
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGTH);

    // Rysowanie osi współrzędnych
    drawAxis(ctx);
    // Rysowanie etykiet osi
    drawAxisLabels(ctx);
    // Rysowanie wszystkich punktów
    drawPoints(ctx, points);
    // Rysowanie aktualnej otoczki (zielone linie)
    drawConvexHull(ctx, steps, currentStep, isComplete);
    // Rysowanie aktualnie sprawdzanej linii (czerwone linie)
    drawCurrentLine(ctx, steps, currentStep, currentTriedIndex, isComplete);
  }, [points, steps, currentStep, currentTriedIndex, isComplete]);

  // Funkcja do resetowania punktów
  const resetPoints = (newPoints?: Point[]) => {
    const pointsToUse = newPoints || generateRandomPoints(10, -50, 50);
    setPoints(pointsToUse);
    const newSteps = giftWrapping(pointsToUse);
    setSteps(newSteps);
    setCurrentStep(0);
    setCurrentTriedIndex(-1);
    setIsAnimating(false);
    setIsComplete(false);
    setConvexHullVertices([]);
    setConvexHullShape("");
  };

  // Funkcja do rozpoczęcia animacji
  const startAnimation = () => {
    setIsAnimating(true);
    setCurrentStep(0);
    setCurrentTriedIndex(-1);
    setIsComplete(false);
  };

  // Funkcja obsługująca przesłanie formularza
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newPoints = values.points.split("\n").map((line) => {
      const [x, y] = line.split(",").map((num) => parseInt(num.trim()));
      return { x, y };
    });
    resetPoints(newPoints);
    setIsModalOpen(false);
  };

  /**
   * Renderowanie interfejsu użytkownika:
   * - Nagłówek z tytułem
   * - Opis algorytmu
   * - Canvas z wizualizacją
   * - Przyciski kontrolne
   * - Modal z formularzem
   * - Sekcja wyników
   * - Stopka
   */
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <PageHeader />
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGTH}
        className="border border-gray-300 bg-white mb-4"
      />
      <ActionButtons
        isAnimating={isAnimating}
        startAnimation={startAnimation}
        resetPoints={resetPoints}
        onSubmit={onSubmit}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
      <GiftWrappingResults
        isComplete={isComplete}
        convexHullShape={convexHullShape}
        convexHullVertices={convexHullVertices}
      />
      <PageFooter />
    </div>
  );
}
