import { Let } from "./Let";
import { Rezervacija } from "./Rezervacija";

export class PovratniLet {
    constructor(private polazak: Let, private povratak: Let) {}
    static odgovarajuciPovratniLetovi(
        trazenaRezervacija: Rezervacija,
        listaSvihLetova: Let[]
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
    static prikaziPovratneLetove(lista: PovratniLet[]) {
        const listaLetovaElement = document.getElementById("listaLetova");
        listaLetovaElement.innerHTML = "";
        lista.forEach((l) => {
            const liElement = document.createElement("li");
            // Postavite sadržaj li elementa
            liElement.innerHTML = `
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
            <strong>OPA</strong> <span>${l.povratak.getOdrediste()}</span><br>`;
            // Dodajte li element u listu
            listaLetovaElement.appendChild(liElement);
        });
    }
}
