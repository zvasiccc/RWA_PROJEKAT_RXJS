import { combineLatest, fromEvent, map, switchMap, withLatestFrom } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { Kapaciteti } from "./Kapaciteti";
import { tipKlase } from "./TipKlaseEnum";
import { JednosmerniLet } from "./Jednosmerni let";
import { Nadgledanje } from "./Nadgledanje";

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
    protected abstract dodaciToHTML(): string;
    protected abstract izracunajUkupnuCenuLeta(
        tipKlaseParam: string,
        brojOsoba: number
    ): number;
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
    public abstract azurirajPodatkeOLetu(
        brojOsoba: number,
        tipKlase: string
    ): void;
    public rezervisiLet(
        tipKlaseInput: HTMLInputElement,
        brojOsobaInput: HTMLInputElement,
        liElement: HTMLLIElement,
        dugmeRezervisi: HTMLButtonElement
    ) {
        const tipoviKlase$ = Nadgledanje.nadgledajPromenuCene(tipKlaseInput);

        const brojOsoba$ = Nadgledanje.nadgledajPromenuCene(
            brojOsobaInput
        ).pipe(map((value: string) => +value));

        let divCenaKarte = liElement.querySelector(".cenaKarte") as HTMLElement;

        combineLatest(tipoviKlase$, brojOsoba$).subscribe((p) => {
            //ceka jedan od ova 2 dogadjaja da se desi i onda se okida
            divCenaKarte.innerHTML = this.izracunajUkupnuCenuLeta(
                p[0],
                +p[1]
            ).toString();
        });
        Nadgledanje.nadgledajDugmeRezervisi(
            tipoviKlase$,
            brojOsoba$,
            dugmeRezervisi
        ).subscribe((p) => {
            this.azurirajPodatkeOLetu(p.brojOsoba, p.tipKlase);
        });
    }
}
