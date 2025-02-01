import { JSX } from "react";

/**
 * Komponent nagłówka strony
 * @constructor
 */
export function PageHeader(): JSX.Element {
  return (
    <>
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
    </>
  );
}
