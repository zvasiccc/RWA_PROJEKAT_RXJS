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
} from "rxjs";
import { PovratniLet } from "./Povratni let";
import { Let } from "./Let";
import { Kapaciteti } from "./Kapaciteti";
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
    function pribaviSveLetove() {
        fromFetch("http://localhost:3000/sviLetovi")
            // pravi observable od fetcha, tj pravimo tok na koji mozemo da se pretplatimo
            .pipe(
                //u pipe se ubacuju operatori
                switchMap((response) => {
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
            .subscribe((l) => {
                listaSvihLetova.push(l);
            });
    }
    pribaviSveLetove();

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
    const rezervacije$ = dugmePretragaLetovaObservable
        .pipe(
            tap((event) => event.preventDefault()),
            map(
                () =>
                    new Rezervacija(
                        polazisteInput.value,
                        odredisteInput.value,
                        new Date(formatDate(datumPolaskaInput.value)),
                        new Date(formatDate(datumPovratkaInput.value)),
                        parseInt(brojOsobaInput.value),
                        tipKlaseInput.value,
                        povratnaKartaInput.checked
                    )
            ),
            tap((r) => {
                listaLetovaZaPrikaz = r.povratnaKarta
                    ? PovratniLet.odgovarajuciPovratniLetovi(r, listaSvihLetova)
                    : JednosmerniLet.odgovarajuciJednosmerniLetovi(
                          r,
                          listaSvihLetova
                      );
                Let.prikaziLetove(listaLetovaZaPrikaz);
            })
        )
        .subscribe((trazenaRezervacija) => {
            console.log(trazenaRezervacija);
        });

    function formatDate(dateString: string) {
        const [year, month, day] = dateString.split("-");
        return new Date(Number(year), Number(month) - 1, Number(day)); // Meseci u JavaScriptu krecu od 0 (januar = 0, februar = 1, ...), pa se oduzima 1.
    }
    /*
    const jednosmerniLetovi$ = rezervacije$
        .pipe(
            filter((r) => r.getPovratnaKarta() == false),
            tap((r) => {
                listaOdgovarajucihJednosmernihLetova =
                    JednosmerniLet.odgovarajuciJednosmerniLetovi(
                        r,
                        listaSvihLetova
                    );
                console.log(listaOdgovarajucihJednosmernihLetova);
            }),
            filter(() => listaOdgovarajucihJednosmernihLetova.length > 0)
        )
        .subscribe((trazenaRezervacija) => {
            dugmadRezervisi = Array.from(
                document.querySelectorAll(".dugmeRezervisi")
            ) as HTMLButtonElement[];
            console.log(dugmadRezervisi);
            dugmadRezervisi.forEach((dugme) => {
                dugme.addEventListener("click", function (event) {
                    event.preventDefault();
                    console.log(dugme);
                    const avionId = dugme.getAttribute("data-id");
                    const polaziste = dugme.getAttribute("data-polaziste");
                    const odrediste = dugme.getAttribute("data-odrediste");
                    const datumPolaska =
                        dugme.getAttribute("data-datum-polaska");
                    let kapacitetEkonomskeKlase: number = parseInt(
                        dugme.getAttribute("data-kapacitet-ekonomske")
                    );

                    let kapacitetPremijumEkonomskeKlase: number = parseInt(
                        dugme.getAttribute("data-kapacitet-premijum-ekonomske")
                    );
                    let kapacitetBiznisKlase: number = parseInt(
                        dugme.getAttribute("data-kapacitet-biznis")
                    );
                    let kapacitetPrveKlase: number = parseInt(
                        dugme.getAttribute("data-kapacitet-prve")
                    );
                    switch (trazenaRezervacija.tipKlase) {
                        case tipKlase.EKONOMSKA_KLASA:
                            kapacitetEkonomskeKlase -=
                                trazenaRezervacija.brojOsoba;
                            break;
                        case tipKlase.PREMIJUM_EKONOMSKA_KLASA:
                            kapacitetPremijumEkonomskeKlase -=
                                trazenaRezervacija.brojOsoba;
                            break;
                        case tipKlase.BIZNIS_KLASA
                            kapacitetBiznisKlase -=
                                trazenaRezervacija.brojOsoba;
                            break;
                        case tipKlase.PRVA_KLASA:
                            kapacitetPrveKlase -=
                                trazenaRezervacija.brojOsoba;
                            break;
                        default:
                            break;
                    }
                    try {
                        fetch(`http://localhost:3000/sviLetovi/${avionId}`, {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                kapacitetEkonomskeKlase:
                                    kapacitetEkonomskeKlase,
                                kapacitetBiznisKlase: kapacitetBiznisKlase,
                                kapacitetPremijumEkonomskeKlase:
                                    kapacitetPremijumEkonomskeKlase,
                                kapacitetPrveKlase: kapacitetPrveKlase,
                            }),
                        }).then((response) => {
                            if (!response.ok) {
                                throw Error("neuspesno azuriranje kapaciteta");
                            }
                            console.log("uspesno ste azurirali podatke");
                            pribaviSveLetove();
                            JednosmerniLet.prikaziJednosmerneLetove(
                                listaSvihLetova
                            );
                        });
                    } catch (er) {
                        console.log(er);
                    }
                    console.log("Kliknuto dugme za rezervaciju leta:");
                    console.log("id: " + avionId);
                    console.log("Polazište: " + polaziste);
                    console.log("Odredište: " + odrediste);
                    console.log("Datum polaska: " + datumPolaska);
                    console.log(
                        "stari kap ekonomske" + kapacitetEkonomskeKlase
                    );
                });
            });
        });

    const povratniLetovi$ = rezervacije$
        .pipe(
            filter((r) => r.getPovratnaKarta() == true),
            tap((r) => {
                listaOdgovarajucihPovratnihLetova =
                    PovratniLet.odgovarajuciPovratniLetovi(r, listaSvihLetova);
                console.log(listaSvihLetova);
                console.log(listaOdgovarajucihPovratnihLetova);
            }),
            filter(() => listaOdgovarajucihPovratnihLetova.length > 0)
        )
        .subscribe((trazenaRezervacija) => {
            PovratniLet.prikaziPovratneLetove(
                listaOdgovarajucihPovratnihLetova
            );
        });
        */

    /*
    dugmePretragaLetovaObservable.subscribe((event) => {
        event.preventDefault();
        //subscribe smo se na svaki klik dugmeta
        const trazenaRezervacija = new Rezervacija( //!napravimo tok observable od rezervacija
            polazisteInput.value,
            odredisteInput.value,
            new Date(formatDate(datumPolaskaInput.value)),
            new Date(formatDate(datumPovratkaInput.value)),
            parseInt(brojOsobaInput.value),
            tipKlaseInput.value,
            povratnaKartaInput.checked
        );
        listaOdgovarajucihJednosmernihLetova.splice(
            0,
            listaOdgovarajucihJednosmernihLetova.length
        ); //!stavi u tap
        if (trazenaRezervacija.getPovratnaKarta() == false) {
            listaOdgovarajucihJednosmernihLetova =
                Let.odgovarajuciJednosmerniLetovi(
                    trazenaRezervacija,
                    listaSvihLetova
                );
            console.log(listaOdgovarajucihJednosmernihLetova);
        } else {
            listaOdgovarajucihPovratnihLetova =
                PovratniLet.odgovarajuciPovratniLetovi(
                    trazenaRezervacija,
                    listaSvihLetova
                );
            console.log(listaSvihLetova);
            console.log(listaOdgovarajucihPovratnihLetova);
        }
        if (listaOdgovarajucihJednosmernihLetova.length > 0) {
            Let.prikaziJednosmerneLetove(listaOdgovarajucihJednosmernihLetova);
            dugmadRezervisi = Array.from(
                document.querySelectorAll(".dugmeRezervisi")
            ) as HTMLButtonElement[];
            console.log(dugmadRezervisi);
            dugmadRezervisi.forEach((dugme) => {
                dugme.addEventListener("click", function (event) {
                    event.preventDefault();
                    console.log(dugme);
                    const avionId = dugme.getAttribute("data-id");
                    const polaziste = dugme.getAttribute("data-polaziste");
                    const odrediste = dugme.getAttribute("data-odrediste");
                    const datumPolaska =
                        dugme.getAttribute("data-datum-polaska");
                    let kapacitetEkonomskeKlase: number = parseInt(
                        dugme.getAttribute("data-kapacitet-ekonomske")
                    );

                    let kapacitetPremijumEkonomskeKlase: number = parseInt(
                        dugme.getAttribute("data-kapacitet-premijum-ekonomske")
                    );
                    let kapacitetBiznisKlase: number = parseInt(
                        dugme.getAttribute("data-kapacitet-biznis")
                    );
                    let kapacitetPrveKlase: number = parseInt(
                        dugme.getAttribute("data-kapacitet-prve")
                    );
                    switch (trazenaRezervacija.tipKlase) {
                        case tipKlase.EKONOMSKA_KLASA:
                            kapacitetEkonomskeKlase -=
                                trazenaRezervacija.brojOsoba;
                            break;
                        case tipKlase.PREMIJUM_EKONOMSKA_KLASA:
                            kapacitetPremijumEkonomskeKlase -=
                                trazenaRezervacija.brojOsoba;
                            break;
                        case tipKlase.BIZNIS_KLASA
                            kapacitetBiznisKlase -=
                                trazenaRezervacija.brojOsoba;
                            break;
                        case tipKlase.PRVA_KLASA:
                            kapacitetPrveKlase -=
                                trazenaRezervacija.brojOsoba;
                            break;
                        default:
                            break;
                    }
                    try {
                        fetch(`http://localhost:3000/sviLetovi/${avionId}`, {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                kapacitetEkonomskeKlase:
                                    kapacitetEkonomskeKlase,
                                kapacitetBiznisKlase: kapacitetBiznisKlase,
                                kapacitetPremijumEkonomskeKlase:
                                    kapacitetPremijumEkonomskeKlase,
                                kapacitetPrveKlase: kapacitetPrveKlase,
                            }),
                        }).then((response) => {
                            if (!response.ok) {
                                throw Error("neuspesno azuriranje kapaciteta");
                            }
                            console.log("uspesno ste azurirali podatke");
                            pribaviSveLetove();
                            Let.prikaziJednosmerneLetove(listaSvihLetova);
                        });
                    } catch (er) {
                        console.log(er);
                    }
                    console.log("Kliknuto dugme za rezervaciju leta:");
                    console.log("id: " + avionId);
                    console.log("Polazište: " + polaziste);
                    console.log("Odredište: " + odrediste);
                    console.log("Datum polaska: " + datumPolaska);
                    console.log(
                        "stari kap ekonomske" + kapacitetEkonomskeKlase
                    );
                });
            });
        }
        if (listaOdgovarajucihPovratnihLetova.length > 0) {
            PovratniLet.prikaziPovratneLetove(
                listaOdgovarajucihPovratnihLetova
            );
        }
    });
    */
});
