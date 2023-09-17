import { JednosmerniLet } from "./Jednosmerni let";
import { Kapaciteti } from "./Kapaciteti";
import { Let } from "./Let";

export class PovratniLet extends Let {
    constructor(
        private polazak: JednosmerniLet,
        private povratak: JednosmerniLet
    ) {
        super();
    }

    protected override getHTML(liElement: HTMLElement): void {
        liElement.classList.add("let-jednosmerni");
        liElement.innerHTML = `
            <div class="let-povratni">
                ${this.polazak.jednosmerniLetToHTML()}
                <br>
                ${this.povratak.jednosmerniLetToHTML()}
                <br>
            </div>
        `;
    }

    public override izracunajUkupnuCenuLeta(
        tipKlaseParam: string,
        brojOsoba: number
    ): number {
        return (
            (this.polazak.izracunajUkupnuCenuLeta(tipKlaseParam, brojOsoba) +
                this.povratak.izracunajUkupnuCenuLeta(
                    tipKlaseParam,
                    brojOsoba
                )) *
            0.8
        );
    }

    protected override prikaziDetaljeLeta(prozorDetaljiLeta: HTMLElement) {
        const detaljiBrojPolaznogLeta = document.getElementById(
            "detaljiBrojPolaznogLeta"
        );
        const detaljiDatumPolaska = document.getElementById(
            "detaljiDatumPolaskaPovratnogLeta"
        );
        const vremePolaskaOdlaznogLeta = document.getElementById(
            "detaljiVremePolaskaOdlaznogPovratnogLeta"
        );
        const vremeDolaskaOdlaznogLeta = document.getElementById(
            "detaljiVremeDolaskaOdlaznogPovratnogLeta"
        );
        const vremePolaskaDolaznogLeta = document.getElementById(
            "detaljiVremePolaskaDolaznogPovratnogLeta"
        );
        const vremeDolaskaDolaznogLeta = document.getElementById(
            "detaljiVremeDolaskaDolaznogPovratnogLeta"
        );
        const detaljiDatumPovratka = document.getElementById(
            "detaljiDatumPovratkaPovratnogLeta"
        );
        detaljiBrojPolaznogLeta.textContent = this.polazak.id.toString();
        detaljiDatumPolaska.textContent = this.polazak.datumPolaska
            .toLocaleDateString()
            .toString();
        detaljiDatumPovratka.textContent = this.povratak.datumPolaska
            .toLocaleDateString()
            .toString();
        vremePolaskaOdlaznogLeta.textContent = this.polazak.vremePolaska;
        vremeDolaskaOdlaznogLeta.textContent = this.polazak.vremeDolaska;
        vremePolaskaDolaznogLeta.textContent = this.polazak.vremePolaska;
        vremeDolaskaDolaznogLeta.textContent = this.polazak.vremeDolaska;
        //TODO pozovi 2 fje za 2 povratna leta, ovde se ne crta
        this.prikaziProzor(prozorDetaljiLeta);
    }

    protected override azurirajPodatkeOLetu(
        brojOsoba: number,
        tipKlase: string
    ) {
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

        kapaciteti = Let.izracunajNoveKapaciteteLeta(
            brojOsoba,
            tipKlase,
            kapaciteti
        );
        Let.azurirajLetJson(avionIdPovratak.toString(), kapaciteti);
    }
}
