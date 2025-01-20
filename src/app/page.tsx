"use client"; // Oznacza, że ten komponent będzie działał po stronie przeglądarki

/**
 * Import niezbędnych bibliotek i komponentów:
 * - React hooks do zarządzania stanem i efektami
 * - Funkcje algorytmu z naszego własnego modułu
 * - Komponenty UI z biblioteki shadcn/ui do budowy interfejsu
 */
import { useState, useEffect, useRef } from "react";
import {
  Point,
  Step,
  giftWrapping,
  generateRandomPoints,
  getConvexHullShape,
  customPointsSchema,
} from "../lib/gift-wrapping-algorithm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

/**
 * Schema formularza definiująca zasady walidacji dla wprowadzanych punktów
 * Wykorzystuje bibliotekę Zod do sprawdzania poprawności danych
 */
const formSchema = z.object({
  points: customPointsSchema,
});

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
   * - isModalOpen: czy modal z formularzem jest otwarty
   * - convexHullShape: nazwa kształtu otoczki (np. "trójkąt")
   * - convexHullVertices: punkty tworzące otoczkę
   * - hoveredElement: element nad którym jest kursor myszy
   */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTriedIndex, setCurrentTriedIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [convexHullShape, setConvexHullShape] = useState("");
  const [convexHullVertices, setConvexHullVertices] = useState<Point[]>([]);
  const [hoveredElement, setHoveredElement] = useState<{
    type: "point" | "line";
    data: Point | [Point, Point];
  } | null>(null);

  /**
   * Stałe określające wymiary i skalę obszaru rysowania:
   * - width, height: wymiary canvasa w pikselach
   * - margin: margines od krawędzi
   * - scale: współczynnik skalowania między współrzędnymi matematycznymi a pikselami
   */
  const width = 800;
  const height = 600;
  const margin = 50;
  const scale = (width - 2 * margin) / 100;

  /**
   * Inicjalizacja formularza do wprowadzania własnych punktów
   * Wykorzystuje react-hook-form do zarządzania stanem i walidacji
   */
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      points: "",
    },
  });

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
          getConvexHullShape(steps.map((step) => step.currentPoint))
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
    ctx.clearRect(0, 0, width, height);

    // Rysowanie osi współrzędnych
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin, height / 2);
    ctx.lineTo(width - margin, height / 2);
    ctx.moveTo(width / 2, margin);
    ctx.lineTo(width / 2, height - margin);
    ctx.stroke();

    // Rysowanie etykiet osi
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("-50", margin, height / 2 + 15);
    ctx.fillText("50", width - margin, height / 2 + 15);
    ctx.fillText("-50", width / 2 - 15, height - margin + 15);
    ctx.fillText("50", width / 2 - 15, margin - 5);

    // Rysowanie wszystkich punktów
    ctx.fillStyle = "blue";
    points.forEach((point) => {
      const x = width / 2 + (point.x / 100) * (width - 2 * margin);
      const y = height / 2 - (point.y / 100) * (height - 2 * margin);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Rysowanie aktualnej otoczki (zielone linie)
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.beginPath();
    steps.slice(0, currentStep + 1).forEach((step, index) => {
      const x = width / 2 + (step.currentPoint.x / 100) * (width - 2 * margin);
      const y =
        height / 2 - (step.currentPoint.y / 100) * (height - 2 * margin);
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

    // Rysowanie aktualnie sprawdzanej linii (czerwone linie)
    if (!isComplete && currentStep < steps.length && currentTriedIndex >= 0) {
      const currentPoint = steps[currentStep].currentPoint;
      const triedPoint = steps[currentStep].triedPoints[currentTriedIndex];
      ctx.strokeStyle = "red";
      ctx.beginPath();
      ctx.moveTo(
        width / 2 + (currentPoint.x / 100) * (width - 2 * margin),
        height / 2 - (currentPoint.y / 100) * (height - 2 * margin)
      );
      ctx.lineTo(
        width / 2 + (triedPoint.x / 100) * (width - 2 * margin),
        height / 2 - (triedPoint.y / 100) * (height - 2 * margin)
      );
      ctx.stroke();
    }

    // Rysowanie dymka z informacją
    if (hoveredElement) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.font = "14px Arial";
      ctx.textAlign = "left";

      let tooltipText: string;
      let tooltipX: number;
      let tooltipY: number;

      if (hoveredElement.type === "point") {
        const point = hoveredElement.data as Point;
        tooltipText = `(${point.x}, ${point.y})`;
        tooltipX = width / 2 + (point.x / 100) * (width - 2 * margin) + 10;
        tooltipY = height / 2 - (point.y / 100) * (height - 2 * margin) - 10;
      } else {
        const [start, end] = hoveredElement.data as [Point, Point];
        tooltipText = `(${start.x}, ${start.y}) do (${end.x}, ${end.y})`;
        tooltipX =
          (width / 2 +
            (start.x / 100) * (width - 2 * margin) +
            width / 2 +
            (end.x / 100) * (width - 2 * margin)) /
          2;
        tooltipY =
          (height / 2 -
            (start.y / 100) * (height - 2 * margin) +
            height / 2 -
            (end.y / 100) * (height - 2 * margin)) /
            2 -
          10;
      }

      ctx.fillRect(
        tooltipX,
        tooltipY - 20,
        ctx.measureText(tooltipText).width + 10,
        25
      );
      ctx.fillStyle = "white";
      ctx.fillText(tooltipText, tooltipX + 5, tooltipY);
    }
  }, [
    points,
    steps,
    currentStep,
    currentTriedIndex,
    isComplete,
    hoveredElement,
  ]);

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

  // Funkcja do generowania losowych punktów
  const handleRandomGenerate = () => {
    const count = Math.floor(Math.random() * 19) + 1; // 1 do 20 punktów
    const newPoints = generateRandomPoints(count, -50, 50);
    form.setValue("points", newPoints.map((p) => `${p.x},${p.y}`).join("\n"));
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

  // Funkcja obsługująca ruch myszy nad canvasem
  const handleCanvasMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const canvasX = (x - width / 2) / scale;
    const canvasY = -(y - height / 2) / scale;

    // Sprawdzanie, czy mysz jest nad punktem
    for (const point of points) {
      if (Math.abs(point.x - canvasX) < 2 && Math.abs(point.y - canvasY) < 2) {
        setHoveredElement({ type: "point", data: point });
        return;
      }
    }

    // Sprawdzanie, czy mysz jest nad linią
    for (let i = 0; i < steps.length; i++) {
      const start = steps[i].currentPoint;
      const end = steps[(i + 1) % steps.length].currentPoint;
      const dist = distanceToLine(
        canvasX,
        canvasY,
        start.x,
        start.y,
        end.x,
        end.y
      );
      if (dist < 2) {
        setHoveredElement({ type: "line", data: [start, end] });
        return;
      }
    }

    setHoveredElement(null);
  };

  // Funkcja do obliczania odległości punktu od linii
  const distanceToLine = (
    x: number,
    y: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    const param = len_sq !== 0 ? dot / len_sq : -1;

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
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
      <h1 className="text-3xl font-bold mb-4">
        Wizualizacja algorytmu Gift Wrapping(Jarvisa)
      </h1>
      <div className="max-w-3xl mx-auto my-8">
        <h2 className="text-2xl font-bold mb-4">
          Opis algorytmu otoczki wypukłej (Gift Wrapping Algorithm)
        </h2>
        <ol className="list-decimal list-inside">
          <li className="mb-2">
            <span className="font-semibold">
              Znajdź punkt o najmniejszej współrzędnej x
            </span>{" "}
            (lub najbardziej na lewo, jeśli istnieje kilka punktów o tej samej
            najmniejszej współrzędnej x). Ten punkt na pewno będzie należał do
            otoczki wypukłej.
          </li>
          <li className="mb-2">
            <span className="font-semibold">
              Rozpocznij &#34;owijanie&#34; pozostałych punktów
            </span>
            , znajdując kolejny punkt, który tworzy najmniejszy kąt przeciwny do
            ruchu wskazówek zegara z bieżącym punktem i poprzednim punktem na
            otoczce.
          </li>
          <li className="mb-2">
            <span className="font-semibold">
              Dodaj znaleziony punkt do otoczki wypukłej
            </span>
            .
          </li>
          <li className="mb-2">
            <span className="font-semibold">Powtarzaj kroki 2 i 3</span>, aż
            wrócisz do punktu startowego, kompletując w ten sposób całą otoczkę
            wypukłą.
          </li>
          <li className="mb-2">
            <span className="font-semibold">W każdym kroku</span> algorytm
            rozważa wszystkie pozostałe punkty i wybiera ten, który tworzy
            najmniejszy kąt przeciwny do ruchu wskazówek zegara z bieżącym
            punktem i poprzednim punktem na otoczce. Ten punkt staje się
            następnym punktem na otoczce, a proces się powtarza, aż wróci do
            punktu startowego.
          </li>
        </ol>
        <p className="mt-4">
          Algorytm otoczki wypukłej jest prosty w zrozumieniu i implementacji, a
          jego złożoność czasowa wynosi O(nh), gdzie n to liczba punktów
          wejściowych, a h to liczba punktów na otoczce wypukłej. W najgorszym
          przypadku, gdy wszystkie punkty należą do otoczki wypukłej, złożoność
          czasowa wynosi O(n^2).
        </p>
      </div>
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
          Rozpocznij animację
        </Button>
        <Button onClick={() => resetPoints()} variant="outline">
          Resetuj punkty
        </Button>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Niestandardowe punkty</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Wprowadź niestandardowe punkty</DialogTitle>
              <DialogDescription>
                Wprowadź punkty w formacie &#34;x,y&#34; (jeden na linię).
                Wartości powinny być między -50 a 50.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Punkty</FormLabel>
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRandomGenerate}
                  >
                    Generuj losowo
                  </Button>
                  <Button type="submit">Zatwierdź</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      {isComplete && (
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
      )}
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>
          Zaimplementowane przez: Rafał Pompa & Krystian Snarski & Dawid
          Przybilla @2025
        </p>
      </footer>
    </div>
  );
}
