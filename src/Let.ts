import { switchMap } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { Kapaciteti } from "./Kapaciteti";
import { Rezervacija } from "./Rezervacija";
import { tipKlase } from "./TipKlaseEnum";

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
            alert("azuriram avion" + avionId + " a kapaciteti su" + kapaciteti);
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
                            console.log("uspesno azurirano");
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
        brojOsoba: number,
        tipKlaseParam: string,
        kapaciteti: Kapaciteti
    ): Kapaciteti {
        switch (tipKlaseParam) {
            case tipKlase.EKONOMSKA_KLASA:
                kapaciteti.kapacitetEkonomskeKlase -= brojOsoba;
                break;
            case tipKlase.PREMIJUM_EKONOMSKA_KLASA:
                kapaciteti.kapacitetPremijumEkonomskeKlase -= brojOsoba;
                break;
            case tipKlase.BIZNIS_KLASA:
                kapaciteti.kapacitetBiznisKlase -= brojOsoba;
                break;
            case tipKlase.PRVA_KLASA:
                kapaciteti.kapacitetPrveKlase -= brojOsoba;
                break;
            default:
                break;
        }
        return kapaciteti;
    }
}
