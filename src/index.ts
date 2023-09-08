import { format } from "date-fns";
import { JednosmerniLet } from "./Jednosmerni let";
import { Rezervacija } from "./Rezervacija";
import { fromFetch } from "rxjs/fetch";
import {
    switchMap,
    from,
    map,
    tap,
    fromEvent,
    of,
    filter,
    merge,
    debounceTime,
    concatMap,
    concat,
    combineLatest,
} from "rxjs";
import { PovratniLet } from "./Povratni let";
import { Let } from "./Let";
import { Kapaciteti } from "./Kapaciteti";
import { tipKlase } from "./TipKlaseEnum";
let listaSvihLetova: JednosmerniLet[] = [];

let listaLetovaZaPrikaz: Let[] = [];

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
    let brojacStranice = 0;
    const brojLetovaPoStranici = 1; // Broj letova po stranici
    const dugmeUCitajVise = document.getElementById("dugmeUcitajViseLetova");
    function pribaviNekeLetove(
        rezervacija: Rezervacija,
        brojLetovaPoStranici: number,
        pageIndex: number
    ) {
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
                    tap(() => (listaSvihLetova = [])), //tap nista ne radi sa tokom, sta udje to i izadje
                    //i zato njega koristimo da ispraznimo listu, a moramo da koristimo neki operator u pipeu
                    map((data) => <any[]>data), //prvo kazemo da je niz any objekata, nije niz LEt objekata zbog new Date koje koristimo, on dobija string onako
                    switchMap((data) => from(data)), //from od niza pravi tok elemenata
                    map(
                        //sad l predstavlja any trenutno, i sad cemo da napravimo nase Let objekte
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
            //pretplatimo se na tok objekata nasih LEt
            // .subscribe((l) => {
            //     listaSvihLetova.push(l);
            // })
        );
    }
    // pribaviNekeLetove();

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
    // const rezervacije$ = dugmePretragaLetovaObservable
    //     .pipe(
    //         tap((event) => event.preventDefault()),
    //         map(
    //             () =>
    //                 new Rezervacija(
    //                     polazisteInput.value,
    //                     odredisteInput.value,
    //                     new Date(formatDate(datumPolaskaInput.value)),
    //                     new Date(formatDate(datumPovratkaInput.value)),
    //                     parseInt(brojOsobaInput.value),
    //                     tipKlaseInput.value,
    //                     povratnaKartaInput.checked
    //                 )
    //         ),
    //         map((r) => {
    //             const listaLetovaElement =
    //                 document.getElementById("listaLetova");
    //             listaLetovaElement.innerHTML = "";
    //             return listaLetovaElement;
    //             // listaLetovaZaPrikaz = r.povratnaKarta
    //             //     ? PovratniLet.odgovarajuciPovratniLetovi(r, listaSvihLetova)
    //             //     : JednosmerniLet.odgovarajuciJednosmerniLetovi(
    //             //           r,
    //             //           listaSvihLetova
    //             //       );
    //             // console.log("svi letovi su", listaSvihLetova);
    //             // Let.prikaziLetove(listaLetovaZaPrikaz);
    //         }),
    //         switchMap((listaLetovaElement) =>
    //             pribaviNekeLetove(1, 1).pipe(
    //                 map((jedanLet) => ({
    //                     listaLetovaElement: listaLetovaElement,
    //                     jedanLet: jedanLet,
    //                 }))
    //             )
    //         )
    //     )
    //     .subscribe(({ listaLetovaElement, jedanLet }) => {
    //         jedanLet.draw(listaLetovaElement);
    //         //console.log(trazenaRezervacija);
    //         //pribaviNekeLetove(1, 1);
    //     });

    let indeksStranice: number = 1;
    const listaLetovaElement = document.getElementById("listaLetova");

    const pretragaRequest$ = dugmePretragaLetovaObservable.pipe(
        tap((event) => event.preventDefault()),
        tap(() => {
            indeksStranice = 1;
            listaLetovaElement.innerHTML = "";
        })
    );

    const ucitajJosRequest$ = fromEvent(dugmeUCitajVise, "click").pipe(
        tap(() => indeksStranice++)
    );

    const x = merge(pretragaRequest$, ucitajJosRequest$);

    const jednosmerniLetovi = x.pipe(filter(() => !povratnaKartaInput.checked));
    const povratniLetovi = x.pipe(filter(() => povratnaKartaInput.checked));

    jednosmerniLetovi
        .pipe(
            concatMap((listaLetovaElement) => {
                //brojacStranice++;
                const rez = new Rezervacija(
                    polazisteInput.value,
                    odredisteInput.value,
                    new Date(formatDate(datumPolaskaInput.value)),
                    new Date(formatDate(datumPovratkaInput.value)),
                    +brojOsobaInput.value,
                    tipKlaseInput.value,
                    povratnaKartaInput.checked
                );
                return pribaviNekeLetove(rez, 1, indeksStranice);

                //TODO napravim jos jednu rezeravaciju sa kontra mestima i datuma pa pozovem fju s tu rez kao parametar
            })
        )
        .subscribe((jedanLet) => {
            jedanLet.draw(listaLetovaElement);
        });

    const rezOriginal = new Rezervacija(
        polazisteInput.value,
        odredisteInput.value,
        new Date(formatDate(datumPolaskaInput.value)),
        new Date(formatDate(datumPovratkaInput.value)),
        +brojOsobaInput.value,
        tipKlaseInput.value,
        povratnaKartaInput.checked
    );

    // Kreirate kopiju rezervacije sa obrnutim polazištem i odredištem
    const rezObrnuto = new Rezervacija(
        odredisteInput.value,
        polazisteInput.value, // Obrnuto polazište i odredište
        new Date(formatDate(datumPovratkaInput.value)),
        new Date(formatDate(datumPolaskaInput.value)), // Obrnuti datumi
        +brojOsobaInput.value,
        tipKlaseInput.value,
        povratnaKartaInput.checked
    );

    // Filtriranje letova u jednosmernim letoovima za oba seta rezervacija;;
    const jednosmerniLetoviOriginal = pribaviNekeLetove(
        rezOriginal,
        4,
        indeksStranice
    );
    const jednosmerniLetoviObrnuto = pribaviNekeLetove(
        rezObrnuto,
        4,
        indeksStranice
    ); // });
    // povratniLetovi.pipe( combineLatest(
    //     jednosmerniLetoviOriginal,
    //     jednosmerniLetoviObrnuto
    // );)
    // const kombinovaniLetovi$ = combineLatest(
    //     jednosmerniLetoviOriginal,
    //     jednosmerniLetoviObrnuto
    // );

    // kombinovaniLetovi$.subscribe(([polazniLet, povratniLet]) => {
    //     // Ovde možete raditi šta god želite sa polaznim i povratnim letovima
    //     console.log("Polazni let:", polazniLet);
    //     console.log("Povratni let:", povratniLet);
    //     // Obrada rezultata
    // });
    //   kombinovaniLetovi$.subscribe((jedanLet) => {
    //     jedanLet.draw(listaLetovaElement);
    //   });

    // const rezOriginal = new Rezervacija(
    //     polazisteInput.value,
    //     odredisteInput.value,
    //     new Date(formatDate(datumPolaskaInput.value)),
    //     new Date(formatDate(datumPovratkaInput.value)),
    //     +brojOsobaInput.value,
    //     tipKlaseInput.value,
    //     povratnaKartaInput.checked
    // );

    // // Kreirate kopiju rezervacije sa obrnutim polazištem i odredištem
    // const rezObrnuto = new Rezervacija(
    //     odredisteInput.value,
    //     polazisteInput.value, // Obrnuto polazište i odredište
    //     new Date(formatDate(datumPovratkaInput.value)),
    //     new Date(formatDate(datumPolaskaInput.value)), // Obrnuti datumi
    //     +brojOsobaInput.value,
    //     tipKlaseInput.value,
    //     povratnaKartaInput.checked
    // );

    // // Filtriranje letova u jednosmernim letoovima za oba seta rezervacija
    // const jednosmerniLetoviOriginal = x.pipe(
    //     filter(() => !rezOriginal.povratnaKarta)
    // );
    // const jednosmerniLetoviObrnuto = x.pipe(
    //     filter(() => !rezObrnuto.povratnaKarta)
    // );

    // // Spajanje svakog leta iz oba seta jednosmernih letoova
    // const kombinovaniLetovi$ = concat(
    //     jednosmerniLetoviOriginal.pipe(
    //         concatMap((polazniLet) => {
    //             return jednosmerniLetoviObrnuto.pipe(
    //                 concatMap((povratniLet) => {
    //                     return pribaviNekeLetove(
    //                         rezOriginal,
    //                         1,
    //                         indeksStranice
    //                     );
    //                 })
    //             );
    //         })
    //     ),
    //     jednosmerniLetoviObrnuto.pipe(
    //         concatMap((polazniLet) => {
    //             return jednosmerniLetoviOriginal.pipe(
    //                 concatMap((povratniLet) => {
    //                     return pribaviNekeLetove(rezObrnuto, 1, indeksStranice);
    //                 })
    //             );
    //         })
    //     )
    // );

    // kombinovaniLetovi$.subscribe((jedanLet) => {
    //     jedanLet.draw(listaLetovaElement);
    //TODO: za poovratne 2 puta odraditi pribaviNekeLetove fju i  rezultate svaki sa svakim koji se preklapaju i od toga napraviti povratni let nad time odraditi crtanje u subscirbe
    function formatDate(dateString: string) {
        const [year, month, day] = dateString.split("-");
        return new Date(Number(year), Number(month) - 1, Number(day)); // Meseci u JavaScriptu krecu od 0 (januar = 0, februar = 1, ...), pa se oduzima 1.
    }
});
