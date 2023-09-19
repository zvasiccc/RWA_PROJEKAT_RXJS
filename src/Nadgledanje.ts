import {
    Observable,
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
            map((checked) => !checked)
        )
        .subscribe((isDisabled) => (datumPovratkaInput.disabled = isDisabled));
}

export function subToZamenaPolazisteIOdrediste(
    dugmeZameniPolazisteIOdrediste: HTMLElement,
    polazisteInput: HTMLInputElement,
    odredisteInput: HTMLInputElement
) {
    fromEvent(dugmeZameniPolazisteIOdrediste, "click").subscribe((event) => {
        event.preventDefault();
        const trenutnoPolaziste = polazisteInput.value;
        const trenutnoOdrediste = odredisteInput.value;
        polazisteInput.value = trenutnoOdrediste;
        odredisteInput.value = trenutnoPolaziste;
    });
}
export function nadgledajPromenuCene(inputPolje: HTMLInputElement) {
    return fromEvent(inputPolje, "change").pipe(
        map((event: Event) => (event.target as HTMLInputElement).value),
        startWith(inputPolje.value)
    );
}

export function nadgledajDugmeRezervisi(
    tipoviKlase$: Observable<string>,
    brojOsoba$: Observable<number>,
    dugmeRezervisi: HTMLButtonElement
) {
    return fromEvent(dugmeRezervisi, "click").pipe(
        withLatestFrom(brojOsoba$, tipoviKlase$),
        map((p) => ({
            brojOsoba: p[1],
            tipKlase: p[2],
        }))
    );
}
