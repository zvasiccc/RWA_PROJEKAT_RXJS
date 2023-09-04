import { Let } from "./Let";
import { Rezervacija } from "./Rezervacija";

export class JednosmerniLet extends Let {
    constructor(
        private id: number,
        private polaziste: string,
        private odrediste: string,
        private datumPolaska: Date,
        private vremePolaska: string,
        private vremeDolaska: string,
        private kapacitetEkonomskeKlase: number,
        private kapacitetBiznisKlase: number,
        private kapacitetPremijumEkonomskeKlase: number,
        private kapacitetPrveKlase: number
    ) {
        super();
    }

    public getId(): number {
        return this.id;
    }
    public getPolaziste(): string {
        return this.polaziste;
    }

    public getOdrediste(): string {
        return this.odrediste;
    }

    public getDatumPolaska(): Date {
        return this.datumPolaska;
    }
    public getVremePolaska(): string {
        return this.vremePolaska;
    }
    public getVremeDolaska(): string {
        return this.vremeDolaska;
    }
    public getKapacitetEkonomskeKlase(): number {
        return this.kapacitetEkonomskeKlase;
    }
    public getKapacitetBiznisKlase(): number {
        return this.kapacitetBiznisKlase;
    }
    public getKapacitetPremijumEkonomskeKlase(): number {
        return this.kapacitetPremijumEkonomskeKlase;
    }
    public getKapacitetPrveKlase(): number {
        return this.kapacitetPrveKlase;
    }
    static odgovarajuciJednosmerniLetovi(
        trazenaRezervacija: Rezervacija,
        listaSvihLetova: JednosmerniLet[]
    ): JednosmerniLet[] {
        const listaOdgovarajucihLetova: JednosmerniLet[] = [];
        let dovoljnoMesta: boolean = false;
        listaSvihLetova.forEach((l) => {
            switch (trazenaRezervacija.getTipKlase()) {
                case "ekonomska":
                    dovoljnoMesta =
                        trazenaRezervacija.getBrojOsoba() <=
                        l.getKapacitetEkonomskeKlase();
                    break;
                case "biznis":
                    dovoljnoMesta =
                        trazenaRezervacija.getBrojOsoba() <=
                        l.getKapacitetBiznisKlase();
                    break;
                case "premijum ekonomska":
                    dovoljnoMesta =
                        trazenaRezervacija.getBrojOsoba() <=
                        l.getKapacitetPremijumEkonomskeKlase();
                    break;
                case "prva klasa":
                    dovoljnoMesta =
                        trazenaRezervacija.getBrojOsoba() <=
                        l.getKapacitetPrveKlase();
                    break;
            }
            if (
                trazenaRezervacija.getDatumPolaska().getDate() ===
                    l.datumPolaska.getDate() &&
                trazenaRezervacija.getPolaziste() === l.polaziste &&
                trazenaRezervacija.getOdrediste() === l.odrediste &&
                dovoljnoMesta
            ) {
                listaOdgovarajucihLetova.push(l);
            }
        });
        console.log(listaOdgovarajucihLetova);
        return listaOdgovarajucihLetova;
    }
    // static prikaziJednosmerneLetove(lista: JednosmerniLet[]) {
    //     const listaLetovaElement = document.getElementById("listaLetova");
    //     listaLetovaElement.innerHTML = "";
    //     lista.forEach((l) => {
    //         l.draw(listaLetovaElement);
    //     });
    // }

    public override draw(parent: HTMLElement): void {
        const liElement = document.createElement("li");
        liElement.classList.add("let-jednosmerni");
        liElement.innerHTML = this.jednosmerniLetToHTML() + this.dodaciToHTML();
        parent.appendChild(liElement);
    }

    public jednosmerniLetToHTML(): string {
        return `
        <div class="let-jednosmerni">
        <strong>Polazište:</strong> <span> ${this.getPolaziste()} </span><br>
        <strong>Odredište:</strong> <span> ${this.getOdrediste()} </span><br>
        <strong>Datum polaska:</strong> <span> ${
            this.getDatumPolaska()
            // ? l.getDatumPolaska().toLocaleDateString()
            // : " N/A"
        } </span><br>
        <strong>Kapacitet:</strong> <span> ${
            this.getKapacitetBiznisKlase() +
            this.getKapacitetEkonomskeKlase() +
            this.getKapacitetPremijumEkonomskeKlase() +
            this.getKapacitetBiznisKlase()
        } </span>
        </div>
        `;
    }
    public dodaciToHTML() {
        return `<div class="dodaci">
         <button type="submit" class="dugmeRezervisi"
        data-id="${this.getId()}"
        data-polaziste="${this.getPolaziste()}"
        data-odrediste="${this.getOdrediste()}"
        data-datum-polaska="${this.getDatumPolaska()}"
        data-kapacitet-ekonomske="${this.getKapacitetEkonomskeKlase()}"
        data-kapacitet-premijum-ekonomske="${this.getKapacitetPremijumEkonomskeKlase()}"
        data-kapacitet-biznis="${this.getKapacitetBiznisKlase()}"
        data-kapacitet-prve="${this.getKapacitetPrveKlase()}"
        > Rezervisi </button>
        </div>`;
    }
}
