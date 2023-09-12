import { fromEvent } from "rxjs";
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
            ${this.dodaciToHTML(
                "dugmeRezervisiPovratni",
                "dugmeDetaljiPovratnogLeta"
            )}
            </div>
        `;
        // dodajem li element u listu elemenata
        parent.appendChild(liElement);
        const tipKlaseInput = document.getElementById(
            "tipKlase"
        ) as HTMLInputElement;

        const brojOsobaInput = document.getElementById(
            "brojOsoba"
        ) as HTMLInputElement;
        const dugmeRezervisi: HTMLButtonElement = liElement.querySelector(
            ".dugmeRezervisiPovratni"
        );
        this.rezervisiLet(
            tipKlaseInput,
            brojOsobaInput,
            liElement,
            dugmeRezervisi
        );

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
    public azurirajPodatkeOLetu(brojOsoba: number, tipKlase: string) {
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

    public izracunajUkupnuCenuLeta(
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
    public prikaziDetaljeLeta(prozorDetaljiLeta: HTMLElement) {
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
    public prikaziProzor(prozorDetaljiLeta: HTMLElement) {
        return super.prikaziProzor(prozorDetaljiLeta);
    }
    public zatvoriProzor(prozorDetaljiLeta: HTMLElement): void {
        return super.zatvoriProzor(prozorDetaljiLeta);
    }
}
