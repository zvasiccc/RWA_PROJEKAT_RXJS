import { debounceTime, fromEvent } from "rxjs";
import { PribavljanjePodataka } from "./PribavljanjePodataka";

export class NadgledanjeAutocomplete {
    static nadgledajListuPredlogaGradova(
        poljeInput: HTMLInputElement,
        listaPredlogaZaPolje: HTMLElement
    ) {
        fromEvent(listaPredlogaZaPolje, "click").subscribe((event) => {
            if (event.target instanceof HTMLElement) {
                // dodajemo click listener na listu predloga
                const izabraniGrad = event.target.textContent;
                poljeInput.value = izabraniGrad;
                listaPredlogaZaPolje.style.display = "none";
            }
        });
    }
    static nadgledajKlikVanListePredloga(
        poljeInput: HTMLInputElement,
        listaPredlogaZaPolje: HTMLElement
    ) {
        document.addEventListener("click", (e) => {
            if (e.target !== poljeInput && e.target !== listaPredlogaZaPolje) {
                listaPredlogaZaPolje.style.display = "none";
            }
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
                    );
                } catch (err) {
                    console.log(err);
                }
            });
    }
}
