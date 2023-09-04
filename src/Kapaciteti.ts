export class Kapaciteti {
    private _kapacitetEkonomskeKlase: number = 0;
    private _kapacitetPremijumEkonomskeKlase: number = 0;
    private _kapacitetBiznisKlase: number = 0;
    private _kapacitetPrveKlase: number = 0;

    get kapacitetEkonomskeKlase(): number {
        return this._kapacitetEkonomskeKlase;
    }

    set kapacitetEkonomskeKlase(value: number) {
        this._kapacitetEkonomskeKlase = value;
    }

    get kapacitetPremijumEkonomskeKlase(): number {
        return this._kapacitetPremijumEkonomskeKlase;
    }

    set kapacitetPremijumEkonomskeKlase(value: number) {
        this._kapacitetPremijumEkonomskeKlase = value;
    }

    get kapacitetBiznisKlase(): number {
        return this._kapacitetBiznisKlase;
    }

    set kapacitetBiznisKlase(value: number) {
        this._kapacitetBiznisKlase = value;
    }

    get kapacitetPrveKlase(): number {
        return this._kapacitetPrveKlase;
    }

    set kapacitetPrveKlase(value: number) {
        this._kapacitetPrveKlase = value;
    }

    constructor() {}
}
