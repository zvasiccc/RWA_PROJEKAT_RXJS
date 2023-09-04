import { switchMap } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { Kapaciteti } from "./Kapaciteti";
import { Rezervacija } from "./Rezervacija";

export abstract class Let {
    public abstract draw(parent: HTMLElement): void;

    public static prikaziLetove(listaLetova: Let[]): void {
        const listaLetovaElement = document.getElementById("listaLetova");
        listaLetovaElement.innerHTML = "";
        listaLetova.forEach((l) => {
            l.draw(listaLetovaElement);
        });
        //! da svaki let psotane tok i da se na svaki let reaguje iscrtavanjem
    }
    public static azurirajLetJson(avionId: string, kapaciteti: Kapaciteti) {
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
    public static izracunajNoveKapaciteteLeta(
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
}
