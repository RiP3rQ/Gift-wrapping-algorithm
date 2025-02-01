"use client";

import { Button } from "@/components/ui/button";
import { JSX } from "react";
import { CustomPointsDialogWithTriggerButton } from "@/components/custom-points-dialog";
import { z } from "zod";
import { formSchema } from "@/schema/custom-points-schema";
import { Point } from "@/types/geometry";

/**
 * Właściwości komponentu ActionButtons
 * @constructor
 * @param {() => void} startAnimation - Funkcja rozpoczynająca animację
 * @param {boolean} isAnimating - Czy animacja jest w trakcie
 * @param {(newPoints?: Point[]) => void} resetPoints - Funkcja resetująca punkty
 * @param {(values: z.infer<typeof formSchema>) => void} onSubmit - Funkcja obsługująca zatwierdzenie formularza
 * @param {boolean} isModalOpen - Czy modal jest otwarty
 * @param {(isOpen: boolean) => void} setIsModalOpen - Funkcja zmieniająca stan modala
 */
interface Props {
  startAnimation: () => void;
  isAnimating: boolean;
  resetPoints: (newPoints?: Point[]) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
}

/**
 * Komponent przycisków akcji
 * @param {Props} props - Właściwości komponentu
 * @returns {JSX.Element} Komponent ActionButtons
 */
export function ActionButtons({
  resetPoints,
  startAnimation,
  isAnimating,
  onSubmit,
  isModalOpen,
  setIsModalOpen,
}: Readonly<Props>): JSX.Element {
  return (
    <div className="space-x-4 mb-4">
      <Button onClick={startAnimation} disabled={isAnimating}>
        Rozpocznij animację
      </Button>
      <Button onClick={() => resetPoints()} variant="outline">
        Resetuj punkty
      </Button>
      <CustomPointsDialogWithTriggerButton
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onSubmit={onSubmit}
      />
    </div>
  );
}
