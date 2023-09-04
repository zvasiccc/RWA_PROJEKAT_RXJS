import { JednosmerniLet } from "./Jednosmerni let";
import { Kapaciteti } from "./Kapaciteti";
import { Let } from "./Let";
import { Rezervacija } from "./Rezervacija";

export class PovratniLet extends Let {
    constructor(
        private polazak: JednosmerniLet,
        private povratak: JednosmerniLet
    ) {
        super();
    }
    static odgovarajuciPovratniLetovi(
        trazenaRezervacija: Rezervacija,
        listaSvihLetova: JednosmerniLet[]
    ): PovratniLet[] {
        const listaOdgovarajucihPovratnihLetova: PovratniLet[] = [];
        listaSvihLetova.forEach((polazak) => {
            listaSvihLetova.forEach((povratak) => {
                if (polazak != povratak) {
                }
                //da ne proveravamo iste letove
                let dovoljnoMesta = false;

                switch (trazenaRezervacija.getTipKlase()) {
                    case "ekonomska":
                        dovoljnoMesta =
                            trazenaRezervacija.getBrojOsoba() <=
                                polazak.getKapacitetEkonomskeKlase() &&
                            trazenaRezervacija.getBrojOsoba() <=
                                povratak.getKapacitetEkonomskeKlase();
                        break;
                    case "biznis":
                        dovoljnoMesta =
                            trazenaRezervacija.getBrojOsoba() <=
                                polazak.getKapacitetBiznisKlase() &&
                            trazenaRezervacija.getBrojOsoba() <=
                                povratak.getKapacitetBiznisKlase();
                        break;
                    case "premijum ekonomska":
                        dovoljnoMesta =
                            trazenaRezervacija.getBrojOsoba() <=
                                polazak.getKapacitetPremijumEkonomskeKlase() &&
                            trazenaRezervacija.getBrojOsoba() <=
                                povratak.getKapacitetPremijumEkonomskeKlase();
                        break;
                    case "prva klasa":
                        dovoljnoMesta =
                            trazenaRezervacija.getBrojOsoba() <=
                                polazak.getKapacitetPrveKlase() &&
                            trazenaRezervacija.getBrojOsoba() <=
                                povratak.getKapacitetPrveKlase();
                        break;
                }
                if (
                    trazenaRezervacija.getDatumPolaska().getDate() ===
                        polazak.getDatumPolaska().getDate() &&
                    trazenaRezervacija.getPolaziste() ===
                        polazak.getPolaziste() &&
                    trazenaRezervacija.getOdrediste() ===
                        polazak.getOdrediste() &&
                    trazenaRezervacija.getDatumPovratka().getDate() ===
                        povratak.getDatumPolaska().getDate() &&
                    trazenaRezervacija.getOdrediste() ===
                        povratak.getPolaziste() && //jer se krece sa kontra strane sad
                    trazenaRezervacija.getPolaziste() ===
                        povratak.getOdrediste() &&
                    dovoljnoMesta
                ) {
                    console.log("ispunjava");
                    const noviPovratniLet = new PovratniLet(polazak, povratak);
                    listaOdgovarajucihPovratnihLetova.push(noviPovratniLet);
                } else {
                    console.log("ene ispunjava uslov");
                }
            });
        });
        return listaOdgovarajucihPovratnihLetova;
    }
    // static prikaziPovratneLetove(lista: PovratniLet[]) {
    //     const listaLetovaElement = document.getElementById("listaLetova");
    //     listaLetovaElement.innerHTML = "";
    //     lista.forEach((l) => {
    //         l.draw(listaLetovaElement);
    //     });
    // }

    public override draw(parent: HTMLElement): void {
        const liElement = document.createElement("li");
        liElement.classList.add("let-povratni");
        liElement.innerHTML = `
            <div class="let-povratni">
            ${this.polazak.jednosmerniLetToHTML()}
            <br>
            ${this.povratak.jednosmerniLetToHTML()}
            <br>
            </div>
            <div>
            ${this.dodaciToHTML()}
            </div>
        `;
        // Dodajte li element u listu
        parent.appendChild(liElement);
    }
    public dodaciToHTML() {
        return `<div class="dodaci">
         <button type="submit" class="dugmeRezervisiPovratni"
        data-id-polazak="${this.polazak.getId()}"
        data-id-povratak="${this.povratak.getId()}"
        data-polaziste="${this.polazak.getPolaziste()}"
        data-odrediste="${this.polazak.getOdrediste()}"
        data-datum-polaska="${this.polazak.getDatumPolaska()}"
        data-datum-povratka="${this.povratak.getDatumPolaska()}"
        data-kapacitet-ekonomske-polazak="${this.polazak.getKapacitetEkonomskeKlase()}"
        data-kapacitet-premijum-ekonomske-polazak="${this.polazak.getKapacitetPremijumEkonomskeKlase()}"
        data-kapacitet-biznis-polazak="${this.polazak.getKapacitetBiznisKlase()}"
        data-kapacitet-prve-polazak="${this.polazak.getKapacitetPrveKlase()}"
        data-kapacitet-ekonomske-povratak="${this.povratak.getKapacitetEkonomskeKlase()}"
        data-kapacitet-premijum-ekonomske-povratak="${this.povratak.getKapacitetPremijumEkonomskeKlase()}"
        data-kapacitet-biznis-povratak="${this.povratak.getKapacitetBiznisKlase()}"
        data-kapacitet-prve-povratak="${this.povratak.getKapacitetPrveKlase()}"
        > Rezervisi </button>
        <button type=submit" class="dugmeDetaljiLeta">Detalji</button>
        </div>`;
    }
    public static azurirajPodatkeOPovratnomLetu(
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

        kapaciteti = Let.izracunajNoveKapaciteteLeta(
            trazenaRezervacija,
            kapaciteti
        );
        Let.azurirajLetJson(avionIdPolazak, kapaciteti);
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
        Let.izracunajNoveKapaciteteLeta(trazenaRezervacija, kapaciteti);
        Let.azurirajLetJson(avionIdPovratak, kapaciteti);
    }
}
/*
            liElement.innerHTML = `<div class="let-povratni">
        <strong>Polazište:</strong> <span>${l.polazak.getPolaziste()}</span><br>
        <strong>Odredište:</strong> <span>${l.polazak.getOdrediste()}</span><br>
        <strong>Datum polaska:</strong> <span>${l.polazak
            .getDatumPolaska()
            .toLocaleDateString()}</span><br>
            <strong>Vreme polaska:</strong> <span>${l.polazak.getVremePolaska()}</span><br>
            <strong>Vreme dolaska:</strong> <span>${l.polazak.getVremeDolaska()}</span><br>
            <br>
            <br>
            <strong>Datum povratka:</strong> <span>${l.povratak
                .getDatumPolaska()
                .toLocaleDateString()}</span><br>
            <strong>OP</strong> <span>${l.povratak.getPolaziste()}</span><br>
            <strong>OPA</strong> <span>${l.povratak.getOdrediste()}</span><br>
            </div>`;
*/
