import {
    debounceTime,
    filter,
    from,
    fromEvent,
    map,
    switchMap,
    tap,
} from "rxjs";
import { predloziGradova } from "./PribavljanjePodataka";
export function napraviAutocompletePolja(
    poljeInput: HTMLInputElement,
    listaPredlogaZaPolje: HTMLElement
) {
    nadgledajUnosGrada(poljeInput, listaPredlogaZaPolje);
    nadgledajListuPredlogaGradova(poljeInput, listaPredlogaZaPolje);
    nadgledajKlikVanListePredloga(poljeInput, listaPredlogaZaPolje);
}
function nadgledajUnosGrada(
    poljeInput: HTMLInputElement,
    listaPredlogaZaPolje: HTMLElement
) {
    const unosGradova$ = fromEvent(poljeInput, "input").pipe(
        debounceTime(500),
        map((event: Event) => (event.target as HTMLInputElement).value)
    );

    unosGradova$.pipe(filter((p) => p === "")).subscribe(() => {
        listaPredlogaZaPolje.style.display = "none";
    });

    unosGradova$
        .pipe(
            filter((p) => p !== ""),
            switchMap((p) => predloziGradova(p)),
            tap(() => {
                listaPredlogaZaPolje.innerHTML = "";
                listaPredlogaZaPolje.style.display = "block";
            }),
            switchMap((gradovi) => from(gradovi))
        )
        .subscribe((grad) => {
            const listItem = document.createElement("li");
            listItem.textContent = grad.name;
            listaPredlogaZaPolje.appendChild(listItem);
        });
}

function nadgledajListuPredlogaGradova(
    poljeInput: HTMLInputElement,
    listaPredlogaZaPolje: HTMLElement
) {
    fromEvent(listaPredlogaZaPolje, "click")
        .pipe(
            filter((event: Event) => event.target instanceof HTMLElement),
            map((event: Event) => (event.target as HTMLElement).textContent)
        )
        .subscribe((izabraniGrad: string) => {
            poljeInput.value = izabraniGrad;
            listaPredlogaZaPolje.style.display = "none";
        });
}
function nadgledajKlikVanListePredloga(
    poljeInput: HTMLInputElement,
    listaPredlogaZaPolje: HTMLElement
) {
    fromEvent(document, "click")
        .pipe(
            filter(
                (e: Event) =>
                    e.target !== poljeInput && e.target !== listaPredlogaZaPolje
            )
        )
        .subscribe(() => {
            listaPredlogaZaPolje.style.display = "none";
        });
}
