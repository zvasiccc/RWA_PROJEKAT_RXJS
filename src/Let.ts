import { Rezervacija } from "./Rezervacija";

export class Let {
    constructor(
        private polaziste: string,
        private odrediste: string,
        private datumPolaska: Date,
        private kapacitetEkonomskeKlase: number,
        private kapacitetBiznisKlase: number,
        private kapacitetPremijumEkonomskeKlase: number,
        private kapacitetPrveKlase: number
    ) {}
    public getPolaziste(): string {
        return this.polaziste;
    }

    public getOdrediste(): string {
        return this.odrediste;
    }

    public getDatumPolaska(): Date {
        return this.datumPolaska;
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
        listaSvihLetova: Let[]
    ): Let[] {
        const listaOdgovarajucihLetova: Let[] = [];
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
                default:
                    dovoljnoMesta =
                        trazenaRezervacija.getBrojOsoba() <=
                        Math.max(
                            l.getKapacitetBiznisKlase(),
                            l.getKapacitetEkonomskeKlase(),
                            l.getKapacitetPremijumEkonomskeKlase(),
                            l.getKapacitetPrveKlase()
                        );
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
    odgovarajuciPovratniLetovi() {}
    static prikaziJednosmerneLetove(lista: Let[]) {
        const listaLetovaElement = document.getElementById("listaLetova");
        listaLetovaElement.innerHTML = "";
        lista.forEach((l) => {
            const liElement = document.createElement("li");
            // Postavite sadržaj li elementa
            liElement.innerHTML = `
        <strong>Polazište:</strong> <span> ${l.getPolaziste()} </span><br>
        <strong>Odredište:</strong> <span> ${l.getOdrediste()} </span><br>
        <strong>Datum polaska:</strong> <span> ${
            l.getDatumPolaska()
            // ? l.getDatumPolaska().toLocaleDateString()
            // : " N/A"
        } </span><br>
        <strong>Kapacitet:</strong> <span> ${
            l.getKapacitetBiznisKlase() + l.getKapacitetEkonomskeKlase()
        } </span>
        <button type="submit" class="dugmeRezervisi"
        data-polaziste="${l.getPolaziste()}"
        data-odrediste="${l.getOdrediste()}"
        data-datum-polaska="${l.getDatumPolaska()}"> Rezervisi </button>
        `;
            listaLetovaElement.appendChild(liElement);
        });
    }
}
