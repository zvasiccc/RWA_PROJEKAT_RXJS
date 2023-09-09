import { JednosmerniLet } from "./Jednosmerni let";
import { Rezervacija } from "./Rezervacija";
import { fromFetch } from "rxjs/fetch";
import {
    switchMap,
    from,
    map,
    tap,
    fromEvent,
    filter,
    merge,
    debounceTime,
    concatMap,
    Observable,
    zip,
    share,
    withLatestFrom,
} from "rxjs";
import { PovratniLet } from "./Povratni let";
import { Let } from "./Let";
import { tipKlase } from "./TipKlaseEnum";
import { Autocomplete } from "./Autocomplete";
import { Nadgledanje } from "./Nadgledanje";
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

    const dugmeUCitajVise = document.getElementById("dugmeUcitajViseLetova");
    let indeksStranice: number = 1;
    const listaLetovaElement = document.getElementById("listaLetova");
    function pribaviNekeLetove(
        rezervacija: Rezervacija,
        brojLetovaPoStranici: number,
        pageIndex: number
    ): Observable<JednosmerniLet[]> {
        let trazeniTipKlase = "";
        switch (rezervacija.tipKlase) {
            case tipKlase.EKONOMSKA_KLASA:
                trazeniTipKlase = "kapacitetEkonomskeKlase";
                break;
            case tipKlase.PREMIJUM_EKONOMSKA_KLASA:
                trazeniTipKlase = "kapacitetPremijumEkonomskeKlase";
                break;
            case tipKlase.BIZNIS_KLASA:
                trazeniTipKlase = "kapacitetBiznisKlase";
                break;
            case tipKlase.PRVA_KLASA:
                trazeniTipKlase = "kapacitetPrveKlase";
                break;
        }
        const url = `http://localhost:3000/sviLetovi?polaziste=${
            rezervacija.polaziste
        }&odrediste=${
            rezervacija.odrediste
        }&${trazeniTipKlase}_gte=${rezervacija.brojOsoba.toString()}&_limit=${brojLetovaPoStranici}&_page=${pageIndex}`;
        return (
            fromFetch(url)
                // pravi observable od fetcha, tj pravimo tok na koji mozemo da se pretplatimo
                .pipe(
                    //u pipe se ubacuju operatori
                    concatMap((response) => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw Error("Failed to fetch level");
                        }
                        //sa toka responsova se prebacujemo na tok objekta nekih, odnosno ne koristimo vise ceo response
                        //nego samo nas json iz responsa, tj body responsa
                    }),
                    map((data) => <any[]>data), //prvo kazemo da je niz any objekata, nije niz LEt objekata zbog new Date koje koristimo, on dobija string onako
                    //                    switchMap((data) => from(data)), //from od niza pravi tok elemenata
                    map(
                        //sad l predstavlja any trenutno, i sad cemo da napravimo nase Let objekte
                        (p) =>
                            p.map(
                                (l) =>
                                    new JednosmerniLet(
                                        l.id,
                                        l.polaziste,
                                        l.odrediste,
                                        new Date(l.datumPolaska),
                                        l.vremePolaska,
                                        l.vremeDolaska,
                                        l.avioKompanija,
                                        l.cenaKarteEkonomskeKlase,
                                        l.cenaKartePremijumEkonomskeKlase,
                                        l.cenaKarteBiznisKlase,
                                        l.cenaKartePrveKlase,
                                        l.kapacitetEkonomskeKlase,
                                        l.kapacitetPremijumEkonomskeKlase,
                                        l.kapacitetBiznisKlase,
                                        l.kapacitetPrveKlase
                                    )
                            )
                    )
                )
        );
    }
    Autocomplete.napraviAutocompletePolja(
        polazisteInput,
        predloziListaPolaziste
    );
    Autocomplete.napraviAutocompletePolja(
        odredisteInput,
        predloziListaOdrediste
    );
    Nadgledanje.nadgledajPovratnaKartaCheck(
        povratnaKartaInput,
        datumPovratkaInput
    );
    Nadgledanje.nadgledajdugmeZameniPolazisteIOdrediste(
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
        share() //ako se vise puta pretplatyim na tok, bez share bi emitovao vise puta, i onda jedan subscribe bi reagovao vise puta
        //na dogadjaj na koji je vec reagovao, ovako sa share reaguje samo jednom, posto se vise puta subsribeujemo na pretragaRequest
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
        //merge map kako koji tok dodje on ih mesa
        //concat map saceka da se zavrsi prvi tok i onda krece sa drugim tokom, znaci ovde ceka da se svi letovi izemituju pa onda krece na sledeci tok
        //nekad kad se sledeci put klikne
        //switch map ako krene jedan a naidje drugi, on prekdia prvi i nastavlja drugi
        //exhaust map ako je prvi u toku, drugi iskulira samo

        share()
    );
    odlazniLetoviFetch$.subscribe((p) => p); //ne emituje bez ovoga
    const dolazniLetoviFetch$ = pretragaRequest$.pipe(
        //zato sto za dolazne letove nemamo stranicenje, nego sve pribavljamo odmah kada se klikne pretraga
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
        concatMap((rez) => pribaviNekeLetove(rez, 1, indeksStranice)),
        //da je obican map dobili bi observable od observable od jednosmerni let a sad je samo obresvale od jednosmerni
        //pretragaRequest$ je emitovalo klikovi misa, mi smo to izmapirali na rezervaciju, znaci svaki put kad se klikne pretraaga se pravi nova rezervacija
        // a sa concat map se od toka rezervacija prebcujemo na tok  nizom jednosmernih letova
        //tok i observabli se misli na isto, nije bas isto
        //i onda se posle negde  subscribujemo na taj tok
        share()
    );

    dolazniLetoviFetch$.subscribe((p) => p);

    const jednosmerniLet$ = pretragaRequest$.pipe(
        filter(() => !povratnaKartaInput.checked),
        switchMap(() => odlazniLetoviFetch$), //odlazniLetoviFetch je vec mergovano izmedju pretragaRequest i ucitaj jos Request, i prebacimo se na taj tok
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
