import { combineLatest, fromEvent, map, switchMap } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { Kapaciteti } from "./Kapaciteti";
import { nadgledajDugmeRezervisi, nadgledajPromenuCene } from "./Nadgledanje";
import { tipKlase } from "./TipKlaseEnum";

export abstract class Let {
    public draw(parent: HTMLElement) {
        const liElement = document.createElement("li");
        this.getHTML(liElement);
        const prozorDetaljiLeta = this.getProzorDetaljiLeta();
        const dugmeZatvoriProzor = this.getProzorDetaljiLeta();
        liElement.innerHTML += `
            <div>
                ${this.dodaciToHTML()}
            </div>
        `;
        parent.appendChild(liElement);
        const tipKlaseInput = document.getElementById(
            "tipKlase"
        ) as HTMLInputElement;

        const brojOsobaInput = document.getElementById(
            "brojOsoba"
        ) as HTMLInputElement;
        const dugmeRezervisi: HTMLButtonElement =
            liElement.querySelector(".dugme-rezervisi");
        const dugmeDetaljiLeta: HTMLButtonElement =
            liElement.querySelector(".dugme-detalji");
        // const prozorDetaljiJednosmernogLeta = document.getElementById(
        //     "prozorDetaljiJednosmernogLeta"
        // );
        // const dugmeZatvoriProzor = document.getElementById(
        //     "dugmeZatvoriProzorJednosmernogLeta"
        // );
        this.rezervisanje(
            tipKlaseInput,
            brojOsobaInput,
            liElement,
            dugmeRezervisi
        );

        fromEvent(dugmeDetaljiLeta, "click").subscribe(() => {
            this.prikaziDetaljeLeta(prozorDetaljiLeta);
        });

        fromEvent(dugmeZatvoriProzor, "click").subscribe(() => {
            this.zatvoriProzor(prozorDetaljiLeta);
        });
    }

    private dodaciToHTML(): string {
        return `<div class="dodaci">
             <button type="submit" class="dugme-rezervisi"
            > Rezervisi </button>
            <button type=submit" class="dugme-detalji">Detalji</button>
            <div class="cenaKarte">
            0.0
            <div>
            </div>`;
    }

    protected abstract getHTML(liElement: HTMLElement): void;
    protected abstract getProzorDetaljiLeta(): HTMLElement;
    protected abstract getDugmeZatvoriProzor(): HTMLElement;
    public abstract izracunajUkupnuCenuLeta(
        tipKlaseParam: string,
        brojOsoba: number
    ): number;

    protected abstract prikaziDetaljeLeta(prozorDetaljiLeta: HTMLElement): void;

    protected abstract azurirajPodatkeOLetu(
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

    protected prikaziProzor(prozorDetaljiLeta: HTMLElement) {
        if (prozorDetaljiLeta) {
            prozorDetaljiLeta.classList.add("prikazi");
        }
    }

    protected zatvoriProzor(prozorDetaljiLeta: HTMLElement) {
        if (prozorDetaljiLeta) {
            prozorDetaljiLeta.classList.remove("prikazi");
        }
    }
}
