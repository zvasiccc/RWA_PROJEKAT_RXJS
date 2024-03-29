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
        liElement.classList.add("let-povratni");
        liElement.innerHTML = `
            <div class="let-povratni">
                ${this.polazak.jednosmerniLetToHTML()}
                <br>
                ${this.povratak.jednosmerniLetToHTML()}
                <br>
            </div>
        `;
    }
    protected override getProzorDetaljiLeta(): HTMLElement {
        return document.getElementById("prozorDetaljiPovratnogLeta");
    }
    protected override getDugmeZatvoriProzor(): HTMLElement {
        return document.getElementById("prozorDetaljiPovratnogLeta");
    }

    public override izracunajUkupnuCenuLeta(
        tipKlaseParam: string,
        brojOsoba: number
    ): number {
        const ukupnaCena =
            (this.polazak.izracunajUkupnuCenuLeta(tipKlaseParam, brojOsoba) +
                this.povratak.izracunajUkupnuCenuLeta(
                    tipKlaseParam,
                    brojOsoba
                )) *
            0.8;
        return parseFloat(ukupnaCena.toFixed(2));
    }

    public override azurirajPodatkeOLetu(brojOsoba: number, tipKlase: string) {
        this.polazak.azurirajPodatkeOLetu(brojOsoba, tipKlase);
        this.povratak.azurirajPodatkeOLetu(brojOsoba, tipKlase);
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
        const detaljiBrojDolaznogLeta = document.getElementById(
            "detaljiBrojDolaznogLeta"
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
        detaljiBrojDolaznogLeta.textContent = this.povratak.id.toString();
        vremePolaskaDolaznogLeta.textContent = this.polazak.vremePolaska;
        vremeDolaskaDolaznogLeta.textContent = this.polazak.vremeDolaska;
        this.prikaziProzor(prozorDetaljiLeta);
    }
}
