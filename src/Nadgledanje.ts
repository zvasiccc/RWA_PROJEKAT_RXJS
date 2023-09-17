import {
    Observable,
    distinctUntilChanged,
    filter,
    fromEvent,
    map,
    startWith,
    tap,
    withLatestFrom,
} from "rxjs";

export function subToPovratnaKartaCheck(
    povratnaKartaInput: HTMLInputElement,
    datumPovratkaInput: HTMLInputElement
) {
    fromEvent(povratnaKartaInput, "change")
        .pipe(
            map((event: Event) => (event.target as HTMLInputElement).checked),
            tap(() => (datumPovratkaInput.value = "")),
            map((checked) => !checked) //kad je checked true mi vratimo false a kad je false mi vratimo true
        )
        .subscribe((isDisabled) => (datumPovratkaInput.disabled = isDisabled));
}

export function subToZamenaPolazisteIOdrediste(
    dugmeZameniPolazisteIOdrediste: HTMLElement,
    polazisteInput: HTMLInputElement,
    odredisteInput: HTMLInputElement
) {
    fromEvent(dugmeZameniPolazisteIOdrediste, "click").subscribe((event) => {
        event.preventDefault(); //bez ovoga se opet ucita stranica
        const trenutnoPolaziste = polazisteInput.value;
        const trenutnoOdrediste = odredisteInput.value;
        polazisteInput.value = trenutnoOdrediste;
        odredisteInput.value = trenutnoPolaziste;
    });
}
export function nadgledajPromenuCene(inputPolje: HTMLInputElement) {
    return fromEvent(inputPolje, "change").pipe(
        map(
            (
                event: Event //emituje se ceo input event a nama treba samo vrednost iz input polja
            ) => (event.target as HTMLInputElement).value
        ),
        startWith(inputPolje.value) //bez ovoga se nista ne prikazuje ako korisnik nista ne unese, ovako kazemo startuj
        //sa onim sto je treuntno tu
    );
}

export function nadgledajDugmeRezervisi(
    tipoviKlase$: Observable<string>,
    brojOsoba$: Observable<number>,
    dugmeRezervisi: HTMLButtonElement
) {
    return fromEvent(dugmeRezervisi, "click").pipe(
        withLatestFrom(brojOsoba$, tipoviKlase$), //uzima zadnju vrednost iz toka, atok se menja tamo kad je napravljen tj na promenu broja u input
        map((p) => ({
            brojOsoba: p[1],
            tipKlase: p[2], //da se lakse snadjemo izmapiramo
        }))
    );
}
