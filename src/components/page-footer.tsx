import { JSX } from "react";

/**
 * Komponent stopki strony
 * @constructor
 */
export function PageFooter(): JSX.Element {
  return (
    <footer className="mt-8 text-center text-gray-500 text-sm">
      <p>
        Zaimplementowane przez: Rafał Pompa & Krystian Snarski & Dawid Przybilla
        @2025
      </p>
    </footer>
  );
}
