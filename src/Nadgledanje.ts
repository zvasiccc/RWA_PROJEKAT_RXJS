import {
    Observable,
    distinctUntilChanged,
    filter,
    fromEvent,
    map,
    startWith,
    withLatestFrom,
} from "rxjs";

export class Nadgledanje {
    static nadgledajPovratnaKartaCheck(
        povratnaKartaInput: HTMLInputElement,
        datumPovratkaInput: HTMLInputElement
    ) {
        fromEvent(povratnaKartaInput, "change")
            .pipe(
                map(
                    (event: Event) => (event.target as HTMLInputElement).checked
                ),
                distinctUntilChanged() // ovaj operator osigurava da se akcije izvrsavaju samo kada se stvarno promeni stanje cekiranja
            )
            .subscribe((isChecked: boolean) => {
                if (isChecked) {
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
                    event.preventDefault(); //bez ovoga se opet ucita stranica
                    const trenutnoPolaziste = polazisteInput.value;
                    const trenutnoOdrediste = odredisteInput.value;
                    polazisteInput.value = trenutnoOdrediste;
                    odredisteInput.value = trenutnoPolaziste;
                }
            );
        }
    }
    static nadgledajPromenuCene(inputPolje: HTMLInputElement) {
        return fromEvent(inputPolje, "change").pipe(
            map(
                (
                    p: InputEvent //emituje se ceo input event a nama treba samo vrednost iz input polja
                ) => (<HTMLInputElement>p.target).value
            ),
            startWith(inputPolje.value) //bez ovoga se nista ne prikazuje dok se ne opali prvi change
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
