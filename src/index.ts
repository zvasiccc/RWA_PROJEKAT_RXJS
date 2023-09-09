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

const domContentLoadedObservable = fromEvent(document, "DOMContentLoaded");
domContentLoadedObservable.subscribe(() => {
    const polazisteInput = document.getElementById(
        "polaziste"
    ) as HTMLInputElement;

    const polazisteInputObservable = fromEvent(polazisteInput, "input").pipe(
        debounceTime(500)
    );
    const predloziListaPolaziste = document.getElementById(
        "predloziListaPolaziste"
    );
    const predloziListaPolazisteObservable = fromEvent(
        predloziListaPolaziste,
        "click"
    );
    const odredisteInput = document.getElementById(
        "odrediste"
    ) as HTMLInputElement;
    const odredisteInputObservable = fromEvent(odredisteInput, "input").pipe(
        debounceTime(500)
    );
    const predloziListaOdrediste = document.getElementById(
        "predloziListaOdrediste"
    );
    const predloziListaOdredisteObservable = fromEvent(
        predloziListaOdrediste,
        "click"
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

    const povratnaKartaInputObservable = fromEvent(
        povratnaKartaInput,
        "change"
    );
    const dugmeZameniPolazisteIOdrediste = document.getElementById(
        "zameniPolazisteIOdrediste"
    );
    const dugmeZameniPolazisteIOdredisteObservable = fromEvent(
        dugmeZameniPolazisteIOdrediste,
        "click"
    );
    let dugmadRezervisi: HTMLButtonElement[];
    const dugmePretragaLetova = document.getElementById("dugmePretragaLetova");
    const dugmePretragaLetovaObservable = fromEvent(
        dugmePretragaLetova,
        "click"
    );
    //let brojacStranice = 0;
    //const brojLetovaPoStranici = 1; // Broj letova po stranici
    const dugmeUCitajVise = document.getElementById("dugmeUcitajViseLetova");
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
                                        l.kapacitetBiznisKlase,
                                        l.kapacitetPremijumEkonomskeKlase,
                                        l.kapacitetPrveKlase
                                    )
                            )
                    )
                )
        );
    }

    povratnaKartaInputObservable.subscribe((event) => {
        if (povratnaKartaInput.checked) {
            datumPovratkaInput.disabled = false;
        } else {
            datumPovratkaInput.disabled = true;
            datumPovratkaInput.value = "";
        }
    });
    dugmeZameniPolazisteIOdredisteObservable.subscribe((event) => {
        const trenutnoPolaziste = polazisteInput.value;
        const trenutnoOdrediste = odredisteInput.value;
        polazisteInput.value = trenutnoOdrediste;
        odredisteInput.value = trenutnoPolaziste;
    });
    polazisteInputObservable.subscribe((event) => {
        try {
            fromFetch("http://localhost:3000/gradovi")
                .pipe(
                    switchMap((response) => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error("Failed to fetch level");
                        }
                    })
                )
                .subscribe(
                    (data: { name: string }[]) => {
                        // kazemo da su pribavljeni podaci sa fetcha tipa niz imena
                        console.log(data);
                        const uneseniTekst = polazisteInput.value;
                        const imenaSvihGradova = data.map((grad) => grad.name);
                        const predlozeniGradovi = imenaSvihGradova.filter(
                            (grad) =>
                                grad
                                    .toLowerCase()
                                    .startsWith(uneseniTekst.toLowerCase())
                        );
                        if (predlozeniGradovi.length > 0) {
                            predloziListaPolaziste.innerHTML = "";
                            predlozeniGradovi.forEach((grad) => {
                                const listItem = document.createElement("li");
                                listItem.textContent = grad;
                                predloziListaPolaziste.appendChild(listItem);
                            });
                            predloziListaPolaziste.style.display = "block";
                        } else {
                            predloziListaPolaziste.style.display = "none";
                        }
                    },
                    (error) => {
                        console.log(error);
                    }
                );
        } catch (err) {
            console.log(err);
        }
    });
    predloziListaPolazisteObservable.subscribe((event) => {
        if (event.target instanceof HTMLElement) {
            // Dohvatimo tekst iz kliknutog elementa
            const izabraniGrad = event.target.textContent;

            polazisteInput.value = izabraniGrad;

            predloziListaPolaziste.style.display = "none";
        }
    });
    odredisteInputObservable.subscribe((event) => {
        try {
            fromFetch("http://localhost:3000/gradovi")
                .pipe(
                    switchMap((response) => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error("Failed to fetch level");
                        }
                    })
                )
                .subscribe(
                    (data: { name: string }[]) => {
                        // kazemo da su pribavljeni podaci sa fetcha tipa niz imena
                        console.log(data);
                        const uneseniTekst = odredisteInput.value;
                        const imenaSvihGradova = data.map((grad) => grad.name);
                        const predlozeniGradovi = imenaSvihGradova.filter(
                            (grad) =>
                                grad
                                    .toLowerCase()
                                    .startsWith(uneseniTekst.toLowerCase())
                        );
                        if (predlozeniGradovi.length > 0) {
                            predloziListaOdrediste.innerHTML = "";
                            predlozeniGradovi.forEach((grad) => {
                                const listItem = document.createElement("li");
                                listItem.textContent = grad;
                                predloziListaOdrediste.appendChild(listItem);
                            });
                            predloziListaOdrediste.style.display = "block";
                        } else {
                            predloziListaOdrediste.style.display = "none";
                        }
                    },
                    (error) => {
                        console.log(error);
                    }
                );
        } catch (err) {
            console.log(err);
        }
    });
    predloziListaOdredisteObservable.subscribe((event) => {
        if (event.target instanceof HTMLElement) {
            // Dohvatimo tekst iz kliknutog elementa
            const izabraniGrad = event.target.textContent;

            odredisteInput.value = izabraniGrad;

            predloziListaOdrediste.style.display = "none";
        }
    });
    document.addEventListener("click", (e) => {
        if (
            e.target !== polazisteInput &&
            e.target !== predloziListaPolaziste &&
            e.target !== odredisteInput &&
            e.target !== predloziListaOdrediste
        ) {
            predloziListaPolaziste.style.display = "none";
            predloziListaOdrediste.style.display = "none";
        }
    });

    let indeksStranice: number = 1;
    const listaLetovaElement = document.getElementById("listaLetova");

    const pretragaRequest$ = dugmePretragaLetovaObservable.pipe(
        //svaki put kad se kline na dumge se desi ovo ispod
        tap((event) => {
            event.preventDefault();
            indeksStranice = 1;
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

    odlazniLetoviFetch$.subscribe((p) => p);

    //!odlazni letovi uvek trebaju i kad je cekiran povratna i kad nije, a dolazni samo kad je cekirano
    const dolazniLetoviFetch$ = pretragaRequest$.pipe(
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
        switchMap(() => odlazniLetoviFetch$),
        map((p) => <Let[]>p) //zbog polimorfizma da bude tipa Let da bi mogli da ga ukombinujemo sa povratnim letom
    );

    const pretragaPovratniLet$ = pretragaRequest$.pipe(
        filter(() => povratnaKartaInput.checked),
        switchMap(() => zip(odlazniLetoviFetch$, dolazniLetoviFetch$))
    );

    const ucitajVisePovratniLet$ = ucitajJosRequest$.pipe(
        //ideja je da se ucita jos jedan(hardkoidrano) odlazni a da se za njega ispitaju svi dolazni letovi da li neki odgovara
        filter(() => povratnaKartaInput.checked),
        switchMap(() => odlazniLetoviFetch$),
        withLatestFrom(dolazniLetoviFetch$) //stize nam jedan(jer je hardkoirano trenutno) odlazni let i njega ukombinujermo sa poslednjom emitovanim vrednostima
        //a to je nama niz letova
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
        //from od niza pravi tok vrednosti, znaci emituje prvi element pa drugi, pa treci...
        .subscribe((p) => p.draw(listaLetovaElement));
    //na svaki let pojedinacno reagujemo iscrtavanjem

    function formatDate(dateString: string) {
        const [year, month, day] = dateString.split("-");
        return new Date(Number(year), Number(month) - 1, Number(day)); // Meseci u JavaScriptu krecu od 0 (januar = 0, februar = 1, ...), pa se oduzima 1.
    }
});
