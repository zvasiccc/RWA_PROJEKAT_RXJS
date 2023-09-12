import { debounceTime, filter, fromEvent, map } from "rxjs";
import { PribavljanjePodataka } from "./PribavljanjePodataka";

export class NadgledanjeAutocomplete {
    static nadgledajListuPredlogaGradova(
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
    static nadgledajKlikVanListePredloga(
        poljeInput: HTMLInputElement,
        listaPredlogaZaPolje: HTMLElement
    ) {
        fromEvent(document, "click")
            .pipe(
                filter(
                    (e: Event) =>
                        e.target !== poljeInput &&
                        e.target !== listaPredlogaZaPolje
                )
            )
            .subscribe(() => {
                listaPredlogaZaPolje.style.display = "none";
            });
    }
    static nadgledajUnosGrada(
        poljeInput: HTMLInputElement,
        listaPredlogaZaPolje: HTMLElement
    ) {
        fromEvent(poljeInput, "input")
            .pipe(debounceTime(500))
            .subscribe(async (event) => {
                try {
                    const uneseniTekst = poljeInput.value;
                    if (!uneseniTekst) {
                        listaPredlogaZaPolje.style.display = "none";
                        return;
                    }
                    PribavljanjePodataka.predloziGradova(
                        uneseniTekst,
                        listaPredlogaZaPolje
                    ).subscribe((gradovi) => {
                        listaPredlogaZaPolje.innerHTML = "";
                        gradovi.forEach((grad) => {
                            const listItem = document.createElement("li");
                            listItem.textContent = grad.name;
                            listaPredlogaZaPolje.appendChild(listItem);
                        });
                        listaPredlogaZaPolje.style.display = "block";
                    });
                } catch (err) {
                    console.log(err);
                }
            });
    }
}
