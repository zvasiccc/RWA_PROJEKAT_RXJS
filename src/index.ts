import { format } from "date-fns";
import { Let } from "./Let";
import { Rezervacija } from "./Rezervacija";
import { fromFetch } from "rxjs/fetch";
import { switchMap, from, map, tap } from "rxjs";

let listaSvihLetova: Let[] = [];
//const listaOdgovarajucihRezervacija: Rezervacija[] = [];
let listaOdgovarajucihLetova: Let[] = [];
document.addEventListener("DOMContentLoaded", () => {
    const polazisteInput = document.getElementById(
        "polaziste"
    ) as HTMLInputElement;

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
    const dugmeZameniPolazisteIOdrediste = document.getElementById(
        "zameniPolazisteIOdrediste"
    );
    let dugmadRezervisi: HTMLButtonElement[];
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
                    new Let(
                        l.id,
                        l.polaziste,
                        l.odrediste,
                        new Date(l.datumPolaska),
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

    const dugmePretragaLetova = document.getElementById("dugmePretragaLetova");
    povratnaKartaInput.addEventListener("change", function () {
        if (povratnaKartaInput.checked) {
            datumPovratkaInput.disabled = false;
        } else {
            datumPovratkaInput.disabled = true;
            datumPolaskaInput.value = "";
        }
    });
    dugmeZameniPolazisteIOdrediste.addEventListener("click", function () {
        const trenutnoPolaziste = polazisteInput.value;
        const trenutnoOdrediste = odredisteInput.value;
        polazisteInput.value = trenutnoOdrediste;
        odredisteInput.value = trenutnoPolaziste;
    });

    dugmePretragaLetova.addEventListener("click", function (event) {
        event.preventDefault();
        const trazenaRezervacija = new Rezervacija(
            polazisteInput.value,
            odredisteInput.value,
            new Date(formatDate(datumPolaskaInput.value)),
            new Date(formatDate(datumPovratkaInput.value)),
            parseInt(brojOsobaInput.value),
            tipKlaseInput.value,
            povratnaKartaInput.checked
        );
        listaOdgovarajucihLetova.splice(0, listaOdgovarajucihLetova.length);
        if (trazenaRezervacija.getPovratnaKarta() == false) {
            listaOdgovarajucihLetova = Let.odgovarajuciJednosmerniLetovi(
                trazenaRezervacija,
                listaSvihLetova
            );
            console.log(listaOdgovarajucihLetova);
        }
        if (listaOdgovarajucihLetova.length > 0) {
            Let.prikaziJednosmerneLetove(listaOdgovarajucihLetova);
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
        } else {
            console.log("ne postoji nijedan let");
        }
    });
    function formatDate(dateString: string) {
        const [year, month, day] = dateString.split("-");
        return new Date(Number(year), Number(month) - 1, Number(day)); // Meseci u JavaScriptu kreću od 0 (januar = 0, februar = 1, ...), pa se oduzima 1.
    }
});
