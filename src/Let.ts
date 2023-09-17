import { combineLatest, map, switchMap } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { Kapaciteti } from "./Kapaciteti";
import { nadgledajDugmeRezervisi, nadgledajPromenuCene } from "./Nadgledanje";
import { tipKlase } from "./TipKlaseEnum";

export abstract class Let {
    public abstract draw(parent: HTMLElement): void;
    protected abstract izracunajUkupnuCenuLeta(
        tipKlaseParam: string,
        brojOsoba: number
    ): number;
    public abstract azurirajPodatkeOLetu(
        brojOsoba: number,
        tipKlase: string
    ): void;
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
                                kapacitetPremijumEkonomskeKlase:
                                    kapaciteti.kapacitetPremijumEkonomskeKlase,
                                kapacitetBiznisKlase:
                                    kapaciteti.kapacitetBiznisKlase,
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
    protected dodaciToHTML(
        imeDugmeRezervisi: string,
        imeDugmeDetalji: string
    ): string {
        return `<div class="dodaci">
             <button type="submit" class=${imeDugmeRezervisi}
            > Rezervisi </button>
            <button type=submit" class=${imeDugmeDetalji}>Detalji</button>
            <div class="cenaKarte">
            0.0
            <div>
            </div>`;
    }
    public rezervisanje(
        tipKlaseInput: HTMLInputElement,
        brojOsobaInput: HTMLInputElement,
        liElement: HTMLLIElement,
        dugmeRezervisi: HTMLButtonElement
    ) {
        const tipoviKlase$ = nadgledajPromenuCene(tipKlaseInput);
        const brojOsoba$ = nadgledajPromenuCene(brojOsobaInput).pipe(
            map((value: string) => +value)
        );
        let divCenaKarte = liElement.querySelector(".cenaKarte") as HTMLElement;
        combineLatest(tipoviKlase$, brojOsoba$).subscribe((p) => {
            //kad se jedan promeni odmah se okida i koristi staru vrednost drugog, zip npr ceka oba da se promene
            //a merge bi pomesalo i ne bi mogli da kopristimo p[0]i p[1]
            divCenaKarte.innerHTML =
                this.izracunajUkupnuCenuLeta(p[0], +p[1]).toString() + " €";
        });
        nadgledajDugmeRezervisi(
            tipoviKlase$,
            brojOsoba$,
            dugmeRezervisi
        ).subscribe((p) => {
            this.azurirajPodatkeOLetu(p.brojOsoba, p.tipKlase);
        });
    }

    public prikaziProzor(prozorDetaljiLeta: HTMLElement) {
        if (prozorDetaljiLeta) {
            prozorDetaljiLeta.classList.add("prikazi");
        }
    }
    public zatvoriProzor(prozorDetaljiLeta: HTMLElement) {
        if (prozorDetaljiLeta) {
            prozorDetaljiLeta.classList.remove("prikazi");
        }
    }
}
