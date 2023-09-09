import { combineLatest, fromEvent, map, startWith, withLatestFrom } from "rxjs";
import { JednosmerniLet } from "./Jednosmerni let";
import { Kapaciteti } from "./Kapaciteti";
import { Let } from "./Let";
import { Rezervacija } from "./Rezervacija";
import { tipKlase } from "./TipKlaseEnum";

export class PovratniLet extends Let {
    constructor(
        private polazak: JednosmerniLet,
        private povratak: JednosmerniLet
    ) {
        super();
    }
    // static odgovarajuciPovratniLetovi(
    //     trazenaRezervacija: Rezervacija,
    //     listaSvihLetova: JednosmerniLet[]
    // ): PovratniLet[] {
    //     const listaOdgovarajucihPovratnihLetova: PovratniLet[] = [];
    //     listaSvihLetova.forEach((polazak) => {
    //         listaSvihLetova.forEach((povratak) => {
    //             if (polazak != povratak) {
    //             }
    //             //da ne proveravamo iste letove
    //             let dovoljnoMesta = false;

    //             switch (trazenaRezervacija.tipKlase) {
    //                 case tipKlase.EKONOMSKA_KLASA:
    //                     dovoljnoMesta =
    //                         trazenaRezervacija.brojOsoba <=
    //                             polazak.kapacitetEkonomskeKlase &&
    //                         trazenaRezervacija.brojOsoba <=
    //                             povratak.kapacitetEkonomskeKlase;
    //                     break;
    //                 case tipKlase.BIZNIS_KLASA:
    //                     dovoljnoMesta =
    //                         trazenaRezervacija.brojOsoba <=
    //                             polazak.kapacitetBiznisKlase &&
    //                         trazenaRezervacija.brojOsoba <=
    //                             povratak.kapacitetBiznisKlase;
    //                     break;
    //                 case tipKlase.PREMIJUM_EKONOMSKA_KLASA:
    //                     dovoljnoMesta =
    //                         trazenaRezervacija.brojOsoba <=
    //                             polazak.kapacitetPremijumEkonomskeKlase &&
    //                         trazenaRezervacija.brojOsoba <=
    //                             povratak.kapacitetPremijumEkonomskeKlase;
    //                     break;
    //                 case tipKlase.PRVA_KLASA:
    //                     dovoljnoMesta =
    //                         trazenaRezervacija.brojOsoba <=
    //                             polazak.kapacitetPrveKlase &&
    //                         trazenaRezervacija.brojOsoba <=
    //                             povratak.kapacitetPrveKlase;
    //                     break;
    //             }
    //             if (
    //                 trazenaRezervacija.datumPolaska.getDate() ===
    //                     polazak.datumPolaska.getDate() &&
    //                 trazenaRezervacija.polaziste === polazak.polaziste &&
    //                 trazenaRezervacija.odrediste === polazak.odrediste &&
    //                 trazenaRezervacija.datumPovratka.getDate() ===
    //                     povratak.datumPolaska.getDate() &&
    //                 trazenaRezervacija.odrediste === povratak.polaziste && //jer se krece sa kontra strane sad
    //                 trazenaRezervacija.polaziste === povratak.odrediste &&
    //                 dovoljnoMesta
    //             ) {
    //                 console.log("ispunjava");
    //                 const noviPovratniLet = new PovratniLet(polazak, povratak);
    //                 listaOdgovarajucihPovratnihLetova.push(noviPovratniLet);
    //             } else {
    //                 console.log("ene ispunjava uslov");
    //             }
    //         });
    //     });
    //     return listaOdgovarajucihPovratnihLetova;
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
        const tipKlaseInput = document.getElementById(
            "tipKlase"
        ) as HTMLInputElement;

        const tipoviKlase$ = fromEvent(tipKlaseInput, "change").pipe(
            map(
                (
                    p: InputEvent //p kad stigne je neki event ne znamo koji, specifiiramo odmah blize da je InputEvent
                ) => (<HTMLInputElement>p.target).value
            ),
            // tap((p) => console.log(p)),
            startWith(tipKlaseInput.value) //kad se napravi tok tipoviKlase$ da se izemituje tipKlaseInput.value
        );
        //TODO tipovi klase moze jedna fja, broj osoba isto, a onda ovde da ih pozivam
        //ili jedna funkcija kojo prosledim parametar input a ona vrati obserbable u zavisnosti od parametra
        const brojOsobaInput = document.getElementById(
            "brojOsoba"
        ) as HTMLInputElement;
        const brojOsoba$ = fromEvent(brojOsobaInput, "change").pipe(
            map((p: InputEvent) => +(<HTMLInputElement>p.target).value),
            // tap((p) => console.log(p)),
            startWith(+brojOsobaInput.value)
        );
        let divCenaKarte = liElement.querySelector(".cenaKarte") as HTMLElement;
        combineLatest(tipoviKlase$, brojOsoba$).subscribe((p) => {
            //ceka jedan od ova 2 dogadjaja da se desi i onda se okida
            divCenaKarte.innerHTML = this.izracunajUkupnuCenuPovratnogLeta(
                p[0],
                +p[1]
            ).toString();
        });

        const dugmeRezervisi: HTMLButtonElement = liElement.querySelector(
            ".dugmeRezervisiPovratni"
        );
        fromEvent(dugmeRezervisi, "click")
            .pipe(
                withLatestFrom(brojOsoba$), //pravi niz, prvi element je event a drugi je ta poslednja emitovana vrednost
                withLatestFrom(tipoviKlase$),
                //tok this.dugmeRezervisi se okida kada kliknemo to dugme i nama kada kliknemo dugme treba broj osoba i tip klase
                // i sa ove dve withLatestFrom ubacujemo zadnje vrednosti od to u ovaj tok
                //dodaje u objekat toka poslednju vrednost koja se emituje iz dogadjaja broj osoba i dog tipoviKlase
                map((p) => ({
                    brojOsoba: p[0][1],
                    tipKlase: p[1], //da se lakse snadjemo izmapiramo
                }))
            )
            .subscribe((p) => {
                this.azurirajPodatkeOPovratnomLetu(p.brojOsoba, p.tipKlase);
            });
        const prozorDetaljiPovratnogLeta = document.getElementById(
            "prozorDetaljiPovratnogLeta"
        );
        const dugmeDetaljiLeta: HTMLButtonElement = liElement.querySelector(
            ".dugmeDetaljiPovratnogLeta"
        );
        fromEvent(dugmeDetaljiLeta, "click").subscribe(() => {
            this.prikaziDetaljeLeta(prozorDetaljiPovratnogLeta);
        });
        const dugmeZatvoriProzor = document.getElementById(
            "dugmeZatvoriProzorPovratnogLeta"
        );
        fromEvent(dugmeZatvoriProzor, "click").subscribe(() => {
            this.zatvoriProzor(prozorDetaljiPovratnogLeta);
        });
    }
    public azurirajPodatkeOPovratnomLetu(brojOsoba: number, tipKlase: string) {
        const avionIdPolazak = this.polazak.id;
        const avionIdPovratak = this.povratak.id;
        //const avionIdPovratak = dugme.getAttribute("data-id-povratak");
        let kapaciteti = new Kapaciteti();
        kapaciteti.kapacitetEkonomskeKlase =
            this.polazak.kapacitetEkonomskeKlase;

        kapaciteti.kapacitetPremijumEkonomskeKlase =
            this.polazak.kapacitetPremijumEkonomskeKlase;

        kapaciteti.kapacitetBiznisKlase = this.polazak.kapacitetBiznisKlase;
        kapaciteti.kapacitetPrveKlase = this.polazak.kapacitetPrveKlase;

        kapaciteti = Let.izracunajNoveKapaciteteLeta(
            brojOsoba,
            tipKlase,
            kapaciteti
        );
        Let.azurirajLetJson(avionIdPolazak.toString(), kapaciteti);
        kapaciteti.kapacitetEkonomskeKlase =
            this.povratak.kapacitetEkonomskeKlase;

        kapaciteti.kapacitetPremijumEkonomskeKlase =
            this.povratak.kapacitetPremijumEkonomskeKlase;

        kapaciteti.kapacitetBiznisKlase = this.povratak.kapacitetBiznisKlase;
        kapaciteti.kapacitetPrveKlase = this.povratak.kapacitetPrveKlase;

        Let.izracunajNoveKapaciteteLeta(brojOsoba, tipKlase, kapaciteti);
        Let.azurirajLetJson(avionIdPovratak.toString(), kapaciteti);
    }
    public dodaciToHTML() {
        return `<div class="dodaci">
         <button type="submit" class="dugmeRezervisiPovratni"
        data-id-polazak="${this.polazak.id}"
        data-id-povratak="${this.povratak.id}"
        data-polaziste="${this.polazak.polaziste}"
        data-odrediste="${this.polazak.odrediste}"
        data-datum-polaska="${this.polazak.datumPolaska}"
        data-datum-povratka="${this.povratak.datumPolaska}"
        data-kapacitet-ekonomske-polazak="${this.polazak.kapacitetEkonomskeKlase}"
        data-kapacitet-premijum-ekonomske-polazak="${this.polazak.kapacitetPremijumEkonomskeKlase}"
        data-kapacitet-biznis-polazak="${this.polazak.kapacitetBiznisKlase}"
        data-kapacitet-prve-polazak="${this.polazak.kapacitetPrveKlase}"
        data-kapacitet-ekonomske-povratak="${this.povratak.kapacitetEkonomskeKlase}"
        data-kapacitet-premijum-ekonomske-povratak="${this.povratak.kapacitetPremijumEkonomskeKlase}"
        data-kapacitet-biznis-povratak="${this.povratak.kapacitetBiznisKlase}"
        data-kapacitet-prve-povratak="${this.povratak.kapacitetPrveKlase}"
        > Rezervisi </button>
        <button type=submit" class="dugmeDetaljiPovratnogLeta">Detalji</button>
        <div class="cenaKarte">
        0.0
        <div>
        </div>`;
    }
    public izracunajUkupnuCenuPovratnogLeta(
        //TODO napravi abstract u let
        tipKlaseParam: string,
        brojOsoba: number
    ): number {
        let ukupnaCena: number = 0;
        console.log(this);
        switch (tipKlaseParam) {
            case tipKlase.EKONOMSKA_KLASA:
                ukupnaCena =
                    (brojOsoba * this.polazak.cenaKarteEkonomskeKlase +
                        brojOsoba * this.povratak.cenaKarteEkonomskeKlase) *
                    0.9;
                break;
            case tipKlase.PREMIJUM_EKONOMSKA_KLASA:
                ukupnaCena =
                    (brojOsoba * this.polazak.cenaKartePremijumEkonomskeKlase +
                        brojOsoba *
                            this.povratak.cenaKartePremijumEkonomskeKlase) *
                    0.9;
                break;
            case tipKlase.BIZNIS_KLASA:
                ukupnaCena =
                    (brojOsoba * this.polazak.cenaKarteBiznisKlase +
                        brojOsoba * this.povratak.cenaKarteBiznisKlase) *
                    0.9;
                break;
            case tipKlase.PRVA_KLASA:
                ukupnaCena =
                    (brojOsoba * this.polazak.cenaKartePrveKlase +
                        brojOsoba * this.povratak.cenaKartePrveKlase) *
                    0.9;
                break;
        }
        return ukupnaCena;
    }
    public prikaziDetaljeLeta(prozorDetaljiLeta: HTMLElement) {
        const detaljiBrojPolaznogLeta = document.getElementById(
            "detaljiBrojPolaznogLeta"
        );
        const detaljiDatumPolaska = document.getElementById(
            "detaljiDatumPolaskaPovratnogLeta"
        );
        const detaljiDatumPovratka = document.getElementById(
            "detaljiDatumPovratkaPovratnogLeta"
        );
        detaljiBrojPolaznogLeta.textContent = this.polazak.id.toString();
        detaljiDatumPolaska.textContent = this.polazak.datumPolaska.toString();
        detaljiDatumPovratka.textContent =
            this.povratak.datumPolaska.toString();
        //TODO pozovi 2 fje za 2 povratna leta, ovde se ne crta
        this.prikaziProzor(prozorDetaljiLeta);
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
