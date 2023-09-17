import { fromEvent } from "rxjs";
import { Kapaciteti } from "./Kapaciteti";
import { Let } from "./Let";
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

    public override draw(parent: HTMLElement): void {
        const liElement = document.createElement("li");
        liElement.classList.add("let-jednosmerni");
        liElement.innerHTML =
            this.jednosmerniLetToHTML() +
            this.dodaciToHTML(
                "dugmeRezervisiJednosmerni",
                "dugmeDetaljiJednosmernogLeta"
            );
        parent.appendChild(liElement);
        const tipKlaseInput = document.getElementById(
            "tipKlase"
        ) as HTMLInputElement;

        const brojOsobaInput = document.getElementById(
            "brojOsoba"
        ) as HTMLInputElement;
        const dugmeRezervisi: HTMLButtonElement = liElement.querySelector(
            ".dugmeRezervisiJednosmerni"
        );
        const prozorDetaljiJednosmernogLeta = document.getElementById(
            "prozorDetaljiJednosmernogLeta"
        );
        const dugmeDetaljiLeta: HTMLButtonElement = liElement.querySelector(
            ".dugmeDetaljiJednosmernogLeta"
        );
        const dugmeZatvoriProzor = document.getElementById(
            "dugmeZatvoriProzorJednosmernogLeta"
        );
        this.rezervisanje(
            tipKlaseInput,
            brojOsobaInput,
            liElement,
            dugmeRezervisi
        );

        fromEvent(dugmeDetaljiLeta, "click").subscribe(() => {
            this.prikaziDetaljeLeta(prozorDetaljiJednosmernogLeta);
        });

        fromEvent(dugmeZatvoriProzor, "click").subscribe(() => {
            this.zatvoriProzor(prozorDetaljiJednosmernogLeta);
        });
    }

    public azurirajPodatkeOLetu(brojOsoba: number, tipKlase: string) {
        const avionId = this.id;
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
        <strong>Vreme polaska:</strong> <span> ${this.vremePolaska} </span><br>
        <strong>Vreme dolaska:</strong> <span> ${this.vremeDolaska} </span><br>
        <strong>Kapacitet:</strong> <span> ${
            this.kapacitetEkonomskeKlase +
            this.kapacitetPremijumEkonomskeKlase +
            this.kapacitetBiznisKlase +
            this.kapacitetPrveKlase
        } </span>
        </div>
        `;
    }

    public izracunajUkupnuCenuLeta(
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
        const detaljiVremePolaska = document.getElementById(
            "detaljiVremePolaskaJednosmernogLeta"
        );
        const detaljiVremeDolaska = document.getElementById(
            "detaljiVremeDolaskaJednosmernogLeta"
        );
        detaljiBrojLeta.textContent = this.id.toString();
        detaljiDatumPolaska.textContent = this.datumPolaska
            .toLocaleDateString()
            .toString();
        this.prikaziProzor(prozorDetaljiLeta);
        detaljiVremePolaska.textContent = this.vremePolaska;
        detaljiVremeDolaska.textContent = this.vremeDolaska;
    }
    public prikaziProzor(prozorDetaljiLeta: HTMLElement) {
        return super.prikaziProzor(prozorDetaljiLeta);
    }
    public zatvoriProzor(prozorDetaljiLeta: HTMLElement): void {
        return super.zatvoriProzor(prozorDetaljiLeta);
    }
}
