import { z } from "zod";

/**
 * Schema walidacji dla wprowadzania punktów w formacie tekstowym.
 * Akceptuje tekst w formacie:
 * - każdy punkt w nowej linii
 * - format punktu: "x,y" lub "x, y"
 * - wartości x,y muszą być liczbami całkowitymi
 * - dozwolone od 1 do 20 punktów
 */
export const customPointsSchema = z.string().refine(
  (val) => {
    const lines = val
      .trim()
      .split("\n")
      .map((line) => line.trim());
    if (lines.length < 1 || lines.length > 20) return false;

    return lines.every((line) => {
      const match = line.match(/^(-?\d+),\s*(-?\d+)$/);
      if (!match) return false;

      const x = Number(match[1]);
      const y = Number(match[2]);

      return (
        Number.isInteger(x) &&
        Number.isInteger(y) &&
        x >= -50 &&
        x <= 50 &&
        y >= -50 &&
        y <= 50
      );
    });
  },
  {
    message:
      "Nieprawidłowe dane wejściowe. Wprowadź od 1 do 20 punktów w formacie 'x,y' (jeden na linię), z wartościami od -50 do 50 (tylko liczby całkowite).",
  },
);

/**
 * Schema formularza definiująca zasady walidacji dla wprowadzanych punktów
 * Wykorzystuje bibliotekę Zod do sprawdzania poprawności danych
 */
export const formSchema = z.object({
  points: customPointsSchema,
});
