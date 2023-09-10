import {
    Observable,
    debounceTime,
    fromEvent,
    map,
    startWith,
    withLatestFrom,
} from "rxjs";
import { PribavljanjePodataka } from "./PribavljanjePodataka";

export class Nadgledanje {
    static nadgledajPovratnaKartaCheck(
        povratnaKartaInput: HTMLInputElement,
        datumPovratkaInput: HTMLInputElement
    ) {
        fromEvent(povratnaKartaInput, "change").subscribe((event) => {
            if (povratnaKartaInput.checked) {
                datumPovratkaInput.disabled = false;
            } else {
                datumPovratkaInput.disabled = true;
                datumPovratkaInput.value = "";
            }
        });
    }
    static nadgledajdugmeZameniPolazisteIOdrediste(
        dugmeZameniPolazisteIOdrediste: HTMLElement,
        polazisteInput: HTMLInputElement,
        odredisteInput: HTMLInputElement
    ) {
        {
            fromEvent(dugmeZameniPolazisteIOdrediste, "click").subscribe(
                (event) => {
                    const trenutnoPolaziste = polazisteInput.value;
                    const trenutnoOdrediste = odredisteInput.value;
                    polazisteInput.value = trenutnoOdrediste;
                    odredisteInput.value = trenutnoPolaziste;
                }
            );
        }
    }
    static nadgledajPromenuCene(tipKlaseInput: HTMLInputElement) {
        return fromEvent(tipKlaseInput, "change").pipe(
            map(
                (
                    p: InputEvent //p kad stigne je neki event ne znamo koji, specifiiramo odmah blize da je InputEvent
                ) => (<HTMLInputElement>p.target).value
            ),
            // tap((p) => console.log(p)),
            startWith(tipKlaseInput.value) //kad se napravi tok tipoviKlase$ da se izemituje tipKlaseInput.value
        );
    }

    static nadgledajDugmeRezervisi(
        tipoviKlase$: Observable<string>,
        brojOsoba$: Observable<number>,
        dugmeRezervisi: HTMLButtonElement
    ) {
        return fromEvent(dugmeRezervisi, "click").pipe(
            withLatestFrom(brojOsoba$), //pravi niz, prvi element je event a drugi je ta poslednja emitovana vrednost
            withLatestFrom(tipoviKlase$),
            //tok this.dugmeRezervisi se okida kada kliknemo to dugme i nama kada kliknemo dugme treba broj osoba i tip klase
            // i sa ove dve withLatestFrom ubacujemo zadnje vrednosti od to u ovaj tok
            //dodaje u objekat toka poslednju vrednost koja se emituje iz dogadjaja broj osoba i dog tipoviKlase
            map((p) => ({
                brojOsoba: p[0][1],
                tipKlase: p[1], //da se lakse snadjemo izmapiramo
            }))
        );
    }
}
