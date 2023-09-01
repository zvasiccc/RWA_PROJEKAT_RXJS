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
                    const noviPovratniLet = new PovratniLet(polazak, povratak);
                    listaOdgovarajucihPovratnihLetova.push(noviPovratniLet);
                }
            });
        });
        return listaOdgovarajucihPovratnihLetova;
    }
}
