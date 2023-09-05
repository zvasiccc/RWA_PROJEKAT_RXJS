export class Rezervacija {
    constructor(
        private _polaziste: string,
        private _odrediste: string,
        private _datumPolaska: Date,
        private _datumPovratka: Date,
        private _brojOsoba: number,
        private _tipKlase: string = "ekonomska",
        private _povratnaKarta: boolean = false
    ) {}
    public get polaziste(): string {
        return this._polaziste;
    }

    public get odrediste(): string {
        return this._odrediste;
    }

    public get datumPolaska(): Date {
        return this._datumPolaska;
    }

    public get datumPovratka(): Date {
        return this._datumPovratka;
    }

    public get brojOsoba(): number {
        return this._brojOsoba;
    }

    public get tipKlase(): string {
        return this._tipKlase;
    }

    public get povratnaKarta(): boolean {
        return this._povratnaKarta;
    }
    // polaziste: string {
    //     return this.polaziste;
    // }

    // odrediste: string {
    //     return this.odrediste;
    // }

    // getDatumPolaska(): Date {
    //     return this.datumPolaska;
    // }

    // getDatumPovratka(): Date {
    //     return this.datumPovratka;
    // }

    // brojOsoba: number {
    //     return this.brojOsoba;
    // }
    // tipKlase: string {
    //     return this.tipKlase;
    // }
    // getPovratnaKarta(): boolean {
    //     return this.povratnaKarta;
    // }
}
