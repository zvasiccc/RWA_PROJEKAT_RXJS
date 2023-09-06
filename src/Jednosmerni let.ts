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
import { tipKlase } from "./TipKlaseEnum";

export class JednosmerniLet extends Let {
    constructor(
        private _id: number,
        private _polaziste: string,
        private _odrediste: string,
        private _datumPolaska: Date,
        private _vremePolaska: string,
        private _vremeDolaska: string,
        private _avioKompanija: string,
        private _cenaKarteEkonomskeKlase: number,
        private _cenaKartePremijumEkonomskeKlase: number,
        private _cenaKarteBiznisKlase: number,
        private _cenaKartePrveKlase: number,
        private _kapacitetEkonomskeKlase: number,
        private _kapacitetPremijumEkonomskeKlase: number,
        private _kapacitetBiznisKlase: number,
        private _kapacitetPrveKlase: number
    ) {
        super();
    }
    public get id(): number {
        return this._id;
    }

    public get polaziste(): string {
        return this._polaziste;
    }

    public get odrediste(): string {
        return this._odrediste;
    }

    public get datumPolaska(): Date {
        return this._datumPolaska;
    }

    public get vremePolaska(): string {
        return this._vremePolaska;
    }

    public get vremeDolaska(): string {
        return this._vremeDolaska;
    }

    public get avioKompanija(): string {
        return this._avioKompanija;
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
    public get kapacitetEkonomskeKlase(): number {
        return this._kapacitetEkonomskeKlase;
    }

    public set kapacitetEkonomskeKlase(value: number) {
        this._kapacitetEkonomskeKlase = value;
    }

    public get kapacitetPremijumEkonomskeKlase(): number {
        return this._kapacitetPremijumEkonomskeKlase;
    }

    public set kapacitetPremijumEkonomskeKlase(value: number) {
        this._kapacitetPremijumEkonomskeKlase = value;
    }

    public get kapacitetBiznisKlase(): number {
        return this._kapacitetBiznisKlase;
    }

    public set kapacitetBiznisKlase(value: number) {
        this._kapacitetBiznisKlase = value;
    }

    public get kapacitetPrveKlase(): number {
        return this._kapacitetPrveKlase;
    }

    public set kapacitetPrveKlase(value: number) {
        this._kapacitetPrveKlase = value;
    }
    static odgovarajuciJednosmerniLetovi(
        trazenaRezervacija: Rezervacija,
        listaSvihLetova: JednosmerniLet[]
    ): JednosmerniLet[] {
        console.log(trazenaRezervacija);
        console.log("tip karte je " + trazenaRezervacija.tipKlase);
        const listaOdgovarajucihLetova: JednosmerniLet[] = [];
        let dovoljnoMesta: boolean = false;
        listaSvihLetova.forEach((l) => {
            switch (trazenaRezervacija.tipKlase) {
                case tipKlase.EKONOMSKA_KLASA:
                    dovoljnoMesta =
                        trazenaRezervacija.brojOsoba <=
                        l.kapacitetEkonomskeKlase;
                    break;
                case tipKlase.PREMIJUM_EKONOMSKA_KLASA:
                    dovoljnoMesta =
                        trazenaRezervacija.brojOsoba <=
                        l.kapacitetPremijumEkonomskeKlase;
                    break;
                case tipKlase.BIZNIS_KLASA:
                    dovoljnoMesta =
                        trazenaRezervacija.brojOsoba <= l.kapacitetBiznisKlase;
                    break;
                case tipKlase.PRVA_KLASA:
                    dovoljnoMesta =
                        trazenaRezervacija.brojOsoba <= l.kapacitetPrveKlase;
                    break;
            }
            if (
                trazenaRezervacija.datumPolaska.getDate() ===
                    l.datumPolaska.getDate() &&
                trazenaRezervacija.polaziste === l.polaziste &&
                trazenaRezervacija.odrediste === l.odrediste &&
                dovoljnoMesta
            ) {
                listaOdgovarajucihLetova.push(l);
            }
        });
        console.log(listaOdgovarajucihLetova);
        return listaOdgovarajucihLetova;
    }
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
        const prozorDetaljiJednosmernogLeta = document.getElementById(
            "prozorDetaljiJednosmernogLeta"
        );
        const dugmeDetaljiLeta: HTMLButtonElement = liElement.querySelector(
            ".dugmeDetaljiJednosmernogLeta"
        );
        fromEvent(dugmeDetaljiLeta, "click").subscribe(() => {
            this.prikaziDetaljeLeta(prozorDetaljiJednosmernogLeta);
        });
        const dugmeZatvoriProzor = document.getElementById(
            "dugmeZatvoriProzorJednosmernogLeta"
        );
        fromEvent(dugmeZatvoriProzor, "click").subscribe(() => {
            this.zatvoriProzor(prozorDetaljiJednosmernogLeta);
        });
    }

    public azurirajPodatkeOJednosmernomLetu(
        brojOsoba: number,
        tipKlase: string
    ) {
        const avionId = this.id;
        alert("id aviona je " + avionId);
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
        <strong>Polazište:</strong> <span> ${this.polaziste} </span><br>
        <strong>Odredište:</strong> <span> ${this.odrediste} </span><br>
        <strong>Datum polaska:</strong> <span> ${
            this.datumPolaska
            // ? l.datumPolaska.toLocaleDateString()
            // : " N/A"
        } </span><br>
        <strong>Kapacitet:</strong> <span> ${
            this.kapacitetEkonomskeKlase +
            this.kapacitetPremijumEkonomskeKlase +
            this.kapacitetBiznisKlase +
            this.kapacitetPrveKlase
        } </span>
        </div>
        `;
    }
    public dodaciToHTML() {
        return `<div class="dodaci">
         <button type="submit" class="dugmeRezervisiJednosmerni"
        data-id="${this.id}"
        data-polaziste="${this.polaziste}"
        data-odrediste="${this.odrediste}"
        data-datum-polaska="${this.datumPolaska}"
        data-kapacitet-ekonomske="${this.kapacitetEkonomskeKlase}"
        data-kapacitet-premijum-ekonomske="${this.kapacitetPremijumEkonomskeKlase}"
        data-kapacitet-biznis="${this.kapacitetBiznisKlase}"
        data-kapacitet-prve="${this.kapacitetPrveKlase}"
        > Rezervisi </button>
        <button type=submit" class="dugmeDetaljiJednosmernogLeta">Detalji</button>
        <div class="cenaKarte">
        0.0
        <div>
        </div>`;
    }
    public izracunajUkupnuCenuJednosmernogLeta(
        tipKlaseParam: string,
        brojOsoba: number
    ): number {
        let ukupnaCena: number = 0;
        console.log(this);
        switch (tipKlaseParam) {
            case tipKlase.EKONOMSKA_KLASA:
                ukupnaCena = brojOsoba * this.cenaKarteEkonomskeKlase;
                break;
            case tipKlase.PREMIJUM_EKONOMSKA_KLASA:
                ukupnaCena = brojOsoba * this.cenaKartePremijumEkonomskeKlase;
                break;
            case tipKlase.BIZNIS_KLASA:
                ukupnaCena = brojOsoba * this.cenaKarteBiznisKlase;
                break;
            case tipKlase.PRVA_KLASA:
                ukupnaCena = brojOsoba * this.cenaKartePrveKlase;
                break;
        }
        return ukupnaCena;
    }
    public prikaziDetaljeLeta(prozorDetaljiLeta: HTMLElement) {
        const detaljiBrojLeta = document.getElementById("detaljiBrojLeta");
        const detaljiDatumPolaska = document.getElementById(
            "detaljiDatumPolaskaJednosmernogLeta"
        );
        detaljiBrojLeta.textContent = this.id.toString();
        detaljiDatumPolaska.textContent = this.datumPolaska.toString();
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
