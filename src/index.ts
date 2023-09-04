import { format } from "date-fns";
import { JednosmerniLet } from "./Jednosmerni let";
import { Rezervacija } from "./Rezervacija";
import { fromFetch } from "rxjs/fetch";
import { switchMap, from, map, tap, fromEvent, of, filter, merge } from "rxjs";
import { PovratniLet } from "./Povratni let";
import { Let } from "./Let";
import { Kapaciteti } from "./Kapaciteti";

let listaSvihLetova: JednosmerniLet[] = [];
//const listaOdgovarajucihRezervacija: Rezervacija[] = [];
let listaOdgovarajucihJednosmernihLetova: JednosmerniLet[] = [];
let listaOdgovarajucihPovratnihLetova: PovratniLet[] = [];

let listaLetovaZaPrikaz: Let[] = [];

const domContentLoadedObservable = fromEvent(document, "DOMContentLoaded");
domContentLoadedObservable.subscribe(() => {
    const polazisteInput = document.getElementById(
        "polaziste"
    ) as HTMLInputElement; //!observable nad ovim elementom, stavljam operator debounce time na 500, on sluzi da se ne opterecuje server
    //saljem fetch pravilno na adresu http://localhost:3000/gradovi?name_like=${event.target.value} i onda se otvara padajuci meni koji se
    //popunjava sa podacima koji su  stigli
    //! dugme pretrazi u drugi div, i dugme detalji leta
    //! cena karata
    //

    const odredisteInput = document.getElementById(
        "odrediste"
    ) as HTMLInputElement;

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
                listaLetovaZaPrikaz = r.getPovratnaKarta()
                    ? PovratniLet.odgovarajuciPovratniLetovi(r, listaSvihLetova)
                    : JednosmerniLet.odgovarajuciJednosmerniLetovi(
                          r,
                          listaSvihLetova
                      );
                Let.prikaziLetove(listaLetovaZaPrikaz);
            })
        )
        .subscribe((trazenaRezervacija) => {
            if (trazenaRezervacija.getPovratnaKarta() == false) {
                dugmadRezervisi = Array.from(
                    document.querySelectorAll(".dugmeRezervisiJednosmerni")
                ) as HTMLButtonElement[];
                console.log(dugmadRezervisi);
                dugmadRezervisi.forEach((dugme) => {
                    dugme.addEventListener("click", function (event) {
                        event.preventDefault();
                        console.log(dugme);
                        azurirajPodatkeOJednosmernomLetu(
                            trazenaRezervacija,
                            dugme
                        );
                    });
                });
            } else {
                dugmadRezervisi = Array.from(
                    document.querySelectorAll(".dugmeRezervisiPovratni")
                ) as HTMLButtonElement[];
                console.log(dugmadRezervisi);
                dugmadRezervisi.forEach((dugme) => {
                    dugme.addEventListener("click", function (event) {
                        event.preventDefault();
                        console.log(dugme);
                        azurirajPodatkeOPovratnomLetu(
                            trazenaRezervacija,
                            dugme
                        );
                    });
                });
            }
        });
    function azurirajPodatkeOJednosmernomLetu(
        trazenaRezervacija: Rezervacija,
        dugme: HTMLButtonElement
    ) {
        const avionId = dugme.getAttribute("data-id");
        let kapaciteti = new Kapaciteti();
        kapaciteti.kapacitetEkonomskeKlase = parseInt(
            dugme.getAttribute("data-kapacitet-ekonomske")
        );

        kapaciteti.kapacitetPremijumEkonomskeKlase = parseInt(
            dugme.getAttribute("data-kapacitet-premijum-ekonomske")
        );
        kapaciteti.kapacitetBiznisKlase = parseInt(
            dugme.getAttribute("data-kapacitet-biznis")
        );
        kapaciteti.kapacitetPrveKlase = parseInt(
            dugme.getAttribute("data-kapacitet-prve")
        );

        kapaciteti = izracunajNoviKapacitet(trazenaRezervacija, kapaciteti);
        azurirajLetJson(avionId, kapaciteti);
    }
    function azurirajPodatkeOPovratnomLetu(
        trazenaRezervacija: Rezervacija,
        dugme: HTMLButtonElement
    ) {
        const avionIdPolazak = dugme.getAttribute("data-id-polazak");
        const avionIdPovratak = dugme.getAttribute("data-id-povratak");
        let kapaciteti = new Kapaciteti();
        kapaciteti.kapacitetEkonomskeKlase = parseInt(
            dugme.getAttribute("data-kapacitet-ekonomske-polazak")
        );

        kapaciteti.kapacitetPremijumEkonomskeKlase = parseInt(
            dugme.getAttribute("data-kapacitet-premijum-ekonomske-polazak")
        );
        kapaciteti.kapacitetBiznisKlase = parseInt(
            dugme.getAttribute("data-kapacitet-biznis-polazak")
        );
        kapaciteti.kapacitetPrveKlase = parseInt(
            dugme.getAttribute("data-kapacitet-prve-polazak")
        );

        kapaciteti = izracunajNoviKapacitet(trazenaRezervacija, kapaciteti);
        azurirajLetJson(avionIdPolazak, kapaciteti);
        kapaciteti.kapacitetEkonomskeKlase = parseInt(
            dugme.getAttribute("data-kapacitet-ekonomske-povratak")
        );

        kapaciteti.kapacitetPremijumEkonomskeKlase = parseInt(
            dugme.getAttribute("data-kapacitet-premijum-ekonomske-povratak")
        );
        kapaciteti.kapacitetBiznisKlase = parseInt(
            dugme.getAttribute("data-kapacitet-biznis-povratak")
        );
        kapaciteti.kapacitetPrveKlase = parseInt(
            dugme.getAttribute("data-kapacitet-prve-povratak")
        );
        izracunajNoviKapacitet(trazenaRezervacija, kapaciteti);
        azurirajLetJson(avionIdPovratak, kapaciteti);
    }
    function azurirajLetJson(avionId: string, kapaciteti: Kapaciteti) {
        try {
            fromFetch(`http://localhost:3000/sviLetovi/${avionId}`)
                .pipe(
                    switchMap((response) => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error("Failed to fetch level");
                        }
                    }),
                    switchMap((data: Let) => {
                        const url = `http://localhost:3000/sviLetovi/${avionId}`;
                        return fetch(url, {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                kapacitetEkonomskeKlase:
                                    kapaciteti.kapacitetEkonomskeKlase,
                                kapacitetBiznisKlase:
                                    kapaciteti.kapacitetBiznisKlase,
                                kapacitetPremijumEkonomskeKlase:
                                    kapaciteti.kapacitetPremijumEkonomskeKlase,
                                kapacitetPrveKlase:
                                    kapaciteti.kapacitetPrveKlase,
                            }),
                        });
                    })
                )
                .subscribe(
                    (response) => {
                        if (response.ok) {
                            alert("Uspješno ažurirano");
                        } else {
                            throw new Error("Neuspješno ažuriranje kapaciteta");
                        }
                    },
                    (error) => {
                        console.log(error);
                    }
                );
        } catch (er) {
            console.log(er);
        }
    }

    function izracunajNoviKapacitet(
        trazenaRezervacija: Rezervacija,
        kapaciteti: Kapaciteti
    ): Kapaciteti {
        switch (trazenaRezervacija.getTipKlase()) {
            case "ekonomska":
                kapaciteti.kapacitetEkonomskeKlase -=
                    trazenaRezervacija.getBrojOsoba();
                break;
            case "premijum ekonomska":
                kapaciteti.kapacitetPremijumEkonomskeKlase -=
                    trazenaRezervacija.getBrojOsoba();

                break;
            case "biznis":
                kapaciteti.kapacitetBiznisKlase -=
                    trazenaRezervacija.getBrojOsoba();

                break;
            case "prva klasa":
                kapaciteti.kapacitetPrveKlase -=
                    trazenaRezervacija.getBrojOsoba();
                break;
            default:
                break;
        }
        return kapaciteti;
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
                    switch (trazenaRezervacija.getTipKlase()) {
                        case "ekonomska":
                            kapacitetEkonomskeKlase -=
                                trazenaRezervacija.getBrojOsoba();
                            break;
                        case "premijum ekonomska":
                            kapacitetPremijumEkonomskeKlase -=
                                trazenaRezervacija.getBrojOsoba();
                            break;
                        case "biznis":
                            kapacitetBiznisKlase -=
                                trazenaRezervacija.getBrojOsoba();
                            break;
                        case "prva klasa":
                            kapacitetPrveKlase -=
                                trazenaRezervacija.getBrojOsoba();
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
                    switch (trazenaRezervacija.getTipKlase()) {
                        case "ekonomska":
                            kapacitetEkonomskeKlase -=
                                trazenaRezervacija.getBrojOsoba();
                            break;
                        case "premijum ekonomska":
                            kapacitetPremijumEkonomskeKlase -=
                                trazenaRezervacija.getBrojOsoba();
                            break;
                        case "biznis":
                            kapacitetBiznisKlase -=
                                trazenaRezervacija.getBrojOsoba();
                            break;
                        case "prva klasa":
                            kapacitetPrveKlase -=
                                trazenaRezervacija.getBrojOsoba();
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

    function formatDate(dateString: string) {
        const [year, month, day] = dateString.split("-");
        return new Date(Number(year), Number(month) - 1, Number(day)); // Meseci u JavaScriptu krecu od 0 (januar = 0, februar = 1, ...), pa se oduzima 1.
    }
});
