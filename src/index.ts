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

import { Rezervacija } from "./Rezervacija";
import {
    subToPovratnaKartaCheck,
    subToZamenaPolazisteIOdrediste,
} from "./Nadgledanje";
import { Let } from "./Let";
import { pribaviNekeLetove } from "./PribavljanjePodataka";
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
    const dugmeUCitajVise = document.getElementById("dugmeUcitajViseLetova");
    const listaLetovaElement = document.getElementById("listaLetova");
    let indeksStranice: number = 1;

    napraviAutocompletePolja(polazisteInput, predloziListaPolaziste);
    napraviAutocompletePolja(odredisteInput, predloziListaOdrediste);
    subToPovratnaKartaCheck(povratnaKartaInput, datumPovratkaInput);
    subToZamenaPolazisteIOdrediste(
        dugmeZameniPolazisteIOdrediste,
        polazisteInput,
        odredisteInput
    );

    const pretragaRequest$ = fromEvent(dugmePretragaLetova, "click").pipe(
        //svaki put kad se kline na dumge se desi ovo ispod
        tap((event) => {
            event.preventDefault();
            indeksStranice = 1;
            dugmeUCitajVise.removeAttribute("hidden");
            listaLetovaElement.innerHTML = "";
        }),
        share() //ako se vise puta pretplatyim na tok, bez share bi emitovao vise puta odnosno emitovao bi se jednom za svaki subscribe,
        //znaci ako imam 3 subscribea jedan klik bi se emitovao 3 puta, a ovako se emituje jednom a mi imamo 3 subsicribea na jedan event
    );
    const ucitajJosRequest$ = fromEvent(dugmeUCitajVise, "click").pipe(
        tap(() => indeksStranice++),
        share()
    );
    const odlazniLetoviFetch$ = merge(pretragaRequest$, ucitajJosRequest$).pipe(
        map(
            //tok je niz kroz koji dobijamo podatke kroz vreme
            //merge radi da na bilo koji od ova 2 dogadjaja se odgovara isto
            //combine latest radi da kad bilo koji od tih tokova emituje on vraca niz poslednje emitovanih vrednosti iz svakog toka, iz svakog toka po jedna vrednost
            () =>
                new Rezervacija(
                    polazisteInput.value,
                    odredisteInput.value,
                    new Date(formatDate(datumPolaskaInput.value)),
                    new Date(formatDate(datumPovratkaInput.value)),
                    +brojOsobaInput.value,
                    tipKlaseInput.value,
                    povratnaKartaInput.checked
                )
        ),
        concatMap((rez) => pribaviNekeLetove(rez, 1, indeksStranice)),
        //TODO da nije hardkodirano da se ucitava samo po 1 let nego npr po 3
        share()
    );
    odlazniLetoviFetch$.subscribe((p) => p); //ne emituje bez ovoga
    const dolazniLetoviFetch$ = pretragaRequest$.pipe(
        //zato sto za dolazne letove nemamo ucitaj vise, nego sve pribavljamo odmah kada se klikne pretraga
        filter(() => povratnaKartaInput.checked), //odnosno ovde emituje svaki dogadjaj samo ako je cekirano, ako nije dolazniLetoviFetch$ tok ne emituje nista
        map(
            () =>
                new Rezervacija(
                    odredisteInput.value,
                    polazisteInput.value,
                    new Date(formatDate(datumPovratkaInput.value)),
                    new Date(formatDate(datumPolaskaInput.value)),
                    +brojOsobaInput.value,
                    tipKlaseInput.value,
                    povratnaKartaInput.checked
                )
        ),
        concatMap((rez) => pribaviNekeLetove(rez)),
        //da je obican map dobili bi observable od observable od jednosmerni let a sad je samo obresvale od jednosmerni
        //pretragaRequest$ je emitovalo klikovi misa, mi smo to izmapirali na rezervaciju, znaci svaki put kad se klikne pretraaga se pravi nova rezervacija
        // a sa concat map se od toka rezervacija prebcujemo na tok  nizom jednosmernih letova
        //tok i observabli se misli na isto, nije bas isto
        //i onda se posle negde  subscribujemo na taj tok
        share()
    );
    dolazniLetoviFetch$.subscribe((p) => p);

    const jednosmerniLet$ = odlazniLetoviFetch$.pipe(
        filter(() => !povratnaKartaInput.checked),
        //odlazniLetoviFetch je vec mergovano izmedju pretragaRequest i ucitaj jos Request, i prebacimo se na taj tok
        map((p) => <Let[]>p) //zbog polimorfizma da bude tipa Let da bi mogli da ga ukombinujemo sa povratnim letom
    );

    const pretragaPovratniLet$ = pretragaRequest$.pipe(
        filter(() => povratnaKartaInput.checked),
        switchMap(() => zip(odlazniLetoviFetch$, dolazniLetoviFetch$)) //zip ceka obe vrednosti da stignu
    );
    //!povratni let ponasanje se razlikuje kada je pretraga dugmei  ucitaj jos dugme
    // kada je pretraga mi zipujemo ova 2 vec napravljena toka sa odlaznim i dolaznim letovima
    const ucitajVisePovratniLet$ = ucitajJosRequest$.pipe(
        //ideja je da se ucita jos jedan(hardkoidrano) odlazni a da se za njega ispitaju svi dolazni letovi da li neki odgovara
        filter(() => povratnaKartaInput.checked),
        switchMap(() => odlazniLetoviFetch$), //odlazni nam stignu na svako kliktanje ucitaj jos,a dolazni samo na pretraga
        withLatestFrom(dolazniLetoviFetch$) //stize nam jedan(jer je hardkoirano trenutno) odlazni let i njega ukombinujermo sa poslednjom emitovanim vrednostima
        //a to je nama niz letova
        //!ovde ne koristimo zip jer on salje 2 fetca svaki put i ceka oba
        //a mi ovde hocemo da ucitamo odlazne letove nove a da koristimo vrednost koju vec imamo za dolazne, da ne bi slali opet fetch i cekali odgovor
        //a odgovor vec imamo, withlastestfrom kopira ono sto je poslednje emitovali dolazni letovi fetch(tj ono pribavljeno iz pretraga)a ne salje nov zahtev
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
        .pipe(concatMap((p) => from(p))) //concat map ceka da se zavrsi tok(da se emituju svi letovi) pa tek onda krece na sledece
        //from od niza pravi tok vrednosti, znaci emituje prvi element pa drugi, pa treci...
        .subscribe((p) => p.draw(listaLetovaElement));
    //na svaki let pojedinacno reagujemo iscrtavanjem

    function formatDate(dateString: string) {
        const [year, month, day] = dateString.split("-");
        return new Date(Number(year), Number(month) - 1, Number(day)); // Meseci u JavaScriptu krecu od 0 (januar = 0, februar = 1, ...), pa se oduzima 1.
    }
});
