export class Rezervacija {
    constructor(
        private polaziste: string,
        private odrediste: string,
        private datumPolaska: Date,
        private datumPovratka: Date,
        private brojOsoba: number,
        private tipKlase: string = "ekonomska",
        private povratnaKarta: boolean = false
    ) {}
    getPolaziste(): string {
        return this.polaziste;
    }

    getOdrediste(): string {
        return this.odrediste;
    }

    getDatumPolaska(): Date {
        return this.datumPolaska;
    }

    getDatumPovratka(): Date {
        return this.datumPovratka;
    }

    getBrojOsoba(): number {
        return this.brojOsoba;
    }
    getTipKlase(): string {
        return this.tipKlase;
    }
    getPovratnaKarta(): boolean {
        return this.povratnaKarta;
    }
}
