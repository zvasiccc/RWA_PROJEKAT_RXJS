import {
    combineLatest,
    fromEvent,
    lastValueFrom,
    map,
    startWith,
    tap,
    withLatestFrom,
} from "rxjs";
import { Kapaciteti } from "./Kapaciteti";
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
        private avioKompanija: string,
        private _cenaKarteEkonomskeKlase: number,
        private _cenaKartePremijumEkonomskeKlase: number,
        private _cenaKarteBiznisKlase: number,
        private _cenaKartePrveKlase: number,
        private kapacitetEkonomskeKlase: number,
        private kapacitetPremijumEkonomskeKlase: number,
        private kapacitetBiznisKlase: number,
        private kapacitetPrveKlase: number
    ) {
        super();
    }
    public get cenaKarteEkonomskeKlase(): number {
        return this._cenaKarteEkonomskeKlase;
    }
    public get cenaKartePremijumEkonomskeKlase(): number {
        return this._cenaKartePremijumEkonomskeKlase;
    }
    public get cenaKarteBiznisKlase(): number {
        return this._cenaKarteBiznisKlase;
    }
    public get cenaKartePrveKlase(): number {
        return this._cenaKartePrveKlase;
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
            divCenaKarte.innerHTML = this.izracunajUkupnuCenuJednosmernogLeta(
                p[0],
                +p[1]
            ).toString();
        });

        const dugmeRezervisi: HTMLButtonElement = liElement.querySelector(
            ".dugmeRezervisiJednosmerni"
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
                this.azurirajPodatkeOJednosmernomLetu(p.brojOsoba, p.tipKlase);
            });
    }

    public azurirajPodatkeOJednosmernomLetu(
        brojOsoba: number,
        tipKlase: string
    ) {
        const avionId = this.getId();
        let kapaciteti = new Kapaciteti();
        kapaciteti.kapacitetEkonomskeKlase = this.kapacitetEkonomskeKlase;

        kapaciteti.kapacitetPremijumEkonomskeKlase =
            this.kapacitetPremijumEkonomskeKlase;
        kapaciteti.kapacitetBiznisKlase = this.kapacitetBiznisKlase;
        kapaciteti.kapacitetPrveKlase = this.kapacitetPrveKlase;

        kapaciteti = Let.izracunajNoveKapaciteteLeta(
            brojOsoba,
            tipKlase,
            kapaciteti
        );
        Let.azurirajLetJson(avionId.toString(), kapaciteti);
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
         <button type="submit" class="dugmeRezervisiJednosmerni"
        data-id="${this.getId()}"
        data-polaziste="${this.getPolaziste()}"
        data-odrediste="${this.getOdrediste()}"
        data-datum-polaska="${this.getDatumPolaska()}"
        data-kapacitet-ekonomske="${this.getKapacitetEkonomskeKlase()}"
        data-kapacitet-premijum-ekonomske="${this.getKapacitetPremijumEkonomskeKlase()}"
        data-kapacitet-biznis="${this.getKapacitetBiznisKlase()}"
        data-kapacitet-prve="${this.getKapacitetPrveKlase()}"
        > Rezervisi </button>
        <button type=submit" class="dugmeDetaljiLeta">Detalji</button>
        <div class="cenaKarte">
        0.0
        <div>
        </div>`;
    }
    public izracunajUkupnuCenuJednosmernogLeta(
        tipKlase: string,
        brojOsoba: number
    ): number {
        let ukupnaCena: number = 0;
        console.log(this);
        switch (tipKlase) {
            case "ekonomska":
                ukupnaCena = brojOsoba * this.cenaKarteEkonomskeKlase;
                break;
            case "premijum ekonomska":
                ukupnaCena = brojOsoba * this.cenaKartePremijumEkonomskeKlase;
                break;
            case "biznis":
                ukupnaCena = brojOsoba * this.cenaKarteBiznisKlase;
                break;
            case "prva klasa":
                ukupnaCena = brojOsoba * this.cenaKartePrveKlase;
                break;
        }
        return ukupnaCena;
    }
}
