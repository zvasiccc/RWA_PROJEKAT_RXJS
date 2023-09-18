import {
    concatMap,
    filter,
    from,
    fromEvent,
    map,
    merge,
    share,
    switchMap,
    tap,
    withLatestFrom,
    zip,
} from "rxjs";
import { napraviAutocompletePolja } from "./Autocomplete";
import { PovratniLet } from "./Povratni let";
import { formatStringUDate } from "./FormatiranjeDatuma";
import { Let } from "./Let";
import {
    subToPovratnaKartaCheck,
    subToZamenaPolazisteIOdrediste,
} from "./Nadgledanje";
import { pribaviNekeLetove } from "./PribavljanjePodataka";
import { Rezervacija } from "./Rezervacija";
//TODO da nisu sve static nego moze export function
fromEvent(document, "DOMContentLoaded").subscribe(() => {
    const polazisteInput = document.getElementById(
        "polaziste"
    ) as HTMLInputElement;

    const predloziListaPolaziste = document.getElementById(
        "predloziListaPolaziste"
    );

    const odredisteInput = document.getElementById(
        "odrediste"
    ) as HTMLInputElement;

    const predloziListaOdrediste = document.getElementById(
        "predloziListaOdrediste"
    );

    const datumPolaskaInput = document.getElementById(
        "datumPolaska"
    ) as HTMLInputElement;

    const datumPovratkaInput = document.getElementById(
        "datumPovratka"
    ) as HTMLInputElement;
    const brojOsobaInput = document.getElementById(
        "brojOsoba"
    ) as HTMLInputElement;
    const tipKlaseInput = document.getElementById(
        "tipKlase"
    ) as HTMLInputElement;
    const povratnaKartaInput = document.getElementById(
        "povratnaKarta"
    ) as HTMLInputElement;
    const dugmeZameniPolazisteIOdrediste = document.getElementById(
        "zameniPolazisteIOdrediste"
    );
    const dugmePretragaLetova = document.getElementById("dugmePretragaLetova");
    //TODO zasto se menja kod povratnih letova kapacitet biznis i premijum ekonomske
    const dugmeUcitajVise = document.getElementById("dugmeUcitajViseLetova");
    const listaLetovaElement = document.getElementById("listaLetova");
    let indeksStranice: number = 1;
    const brojLetovaPoStranici = 3;
    napraviAutocompletePolja(polazisteInput, predloziListaPolaziste);
    napraviAutocompletePolja(odredisteInput, predloziListaOdrediste);
    subToPovratnaKartaCheck(povratnaKartaInput, datumPovratkaInput);
    subToZamenaPolazisteIOdrediste(
        dugmeZameniPolazisteIOdrediste,
        polazisteInput,
        odredisteInput
    );

    const pretragaRequest$ = fromEvent(dugmePretragaLetova, "click").pipe(
        tap((event) => {
            event.preventDefault();
            indeksStranice = 1;
            dugmeUcitajVise.removeAttribute("hidden");
            listaLetovaElement.innerHTML = "";
        }),
        share()
    );
    const ucitajJosRequest$ = fromEvent(dugmeUcitajVise, "click").pipe(
        tap(() => indeksStranice++),
        share()
    );
    const odlazniLetoviFetch$ = merge(pretragaRequest$, ucitajJosRequest$).pipe(
        map(
            () =>
                new Rezervacija(
                    polazisteInput.value,
                    odredisteInput.value,
                    new Date(formatStringUDate(datumPolaskaInput.value)),
                    new Date(formatStringUDate(datumPovratkaInput.value)),
                    +brojOsobaInput.value,
                    tipKlaseInput.value,
                    povratnaKartaInput.checked
                )
        ),
        concatMap((rez) =>
            pribaviNekeLetove(rez, brojLetovaPoStranici, indeksStranice)
        ),
        share()
    );
    odlazniLetoviFetch$.subscribe((p) => p);

    const dolazniLetoviFetch$ = pretragaRequest$.pipe(
        filter(() => povratnaKartaInput.checked),
        map(
            () =>
                new Rezervacija(
                    odredisteInput.value,
                    polazisteInput.value,
                    new Date(formatStringUDate(datumPovratkaInput.value)),
                    new Date(formatStringUDate(datumPolaskaInput.value)),
                    +brojOsobaInput.value,
                    tipKlaseInput.value,
                    povratnaKartaInput.checked
                )
        ),
        concatMap((rez) => pribaviNekeLetove(rez)),
        share()
    );
    dolazniLetoviFetch$.subscribe((p) => p);

    const jednosmerniLet$ = odlazniLetoviFetch$.pipe(
        filter(() => !povratnaKartaInput.checked),
        map((p) => <Let[]>p)
    );

    const pretragaPovratniLet$ = pretragaRequest$.pipe(
        filter(() => povratnaKartaInput.checked),
        switchMap(() => zip(odlazniLetoviFetch$, dolazniLetoviFetch$))
    );
    const ucitajVisePovratniLet$ = ucitajJosRequest$.pipe(
        filter(() => povratnaKartaInput.checked),
        switchMap(() => odlazniLetoviFetch$),
        withLatestFrom(dolazniLetoviFetch$)
    );
    const povratniLet$ = merge(
        pretragaPovratniLet$,
        ucitajVisePovratniLet$
    ).pipe(
        map((p) => {
            const arr: Let[] = [];
            p[0].forEach((odlazak) => {
                p[1].forEach((povratak) => {
                    arr.push(new PovratniLet(odlazak, povratak) as Let);
                });
            });
            return arr;
        })
    );

    merge(
        jednosmerniLet$.pipe(filter(() => !povratnaKartaInput.checked)),
        povratniLet$.pipe(filter(() => povratnaKartaInput.checked))
    )
        .pipe(concatMap((p) => from(p)))
        .subscribe((p) => p.draw(listaLetovaElement));
});
