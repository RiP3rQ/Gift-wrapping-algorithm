import { JSX } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "@/schema/custom-points-schema";
import { generateRandomPoints } from "@/lib/gift-wrapping-algorithm";

/**
 * Komponent dialogu do wprowadzania niestandardowych punktów
 * Zawiera formularz do wprowadzania punktów w formacie tekstowym
 * oraz przycisk do generowania losowych punktów
 * @param isModalOpen - czy dialog jest otwarty
 * @param setIsModalOpen - funkcja do zmiany stanu dialogu
 * @param onSubmit - funkcja do obsługi zatwierdzenia formularza
 * @returns Komponent dialogu z przyciskiem wyzwalającym
 */
interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
}

/**
 * Komponent dialogu do wprowadzania niestandardowych punktów
 * @param isModalOpen - czy dialog jest otwarty
 * @param setIsModalOpen - funkcja do zmiany stanu dialogu
 * @param onSubmit - funkcja do obsługi zatwierdzenia formularza
 * @constructor
 */
export function CustomPointsDialogWithTriggerButton({
  isModalOpen,
  setIsModalOpen,
  onSubmit,
}: Readonly<Props>): JSX.Element {
  /**
   * Inicjalizacja formularza do wprowadzania własnych punktów
   * Wykorzystuje react-hook-form do zarządzania stanem i walidacji
   */
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      points: "",
    },
  });

  // Funkcja do generowania losowych punktów
  const handleRandomGenerate = () => {
    const count = Math.floor(Math.random() * 19) + 1; // 1 do 20 punktów
    const newPoints = generateRandomPoints(count, -50, 50);
    form.setValue("points", newPoints.map((p) => `${p.x},${p.y}`).join("\n"));
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Niestandardowe punkty</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Wprowadź niestandardowe punkty</DialogTitle>
          <DialogDescription>
            Wprowadź punkty w formacie &#34;x,y&#34; (jeden na linię). Wartości
            powinny być między -50 a 50 (tylko liczby całkowite).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
  );
}
