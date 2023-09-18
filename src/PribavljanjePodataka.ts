import { Observable, concatMap, map, tap } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { JednosmerniLet } from "./Jednosmerni let";
import { Rezervacija } from "./Rezervacija";
import { tipKlase } from "./TipKlaseEnum";
import { formatDateUString } from "./FormatiranjeDatuma";

export function predloziGradova(uneseniTekst: String) {
    return fromFetch(
        `http://localhost:3000/gradovi?name_like=${uneseniTekst}`
    ).pipe(
        concatMap((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Neuspješan fetch predloga gradova");
            }
        }),
        map((data) => <{ name: string }[]>data)
    );
}
export function odgovarajuciLetovi(url: string) {
    return fromFetch(url).pipe(
        concatMap((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw Error("Neuspesan fetch odgovarajucih letova");
            }
        }),
        map((data) => <any[]>data),
        map((p) =>
            p.map(
                (l) =>
                    new JednosmerniLet(
                        l.id,
                        l.polaziste,
                        l.odrediste,
                        new Date(l.datumPolaska),
                        l.vremePolaska,
                        l.vremeDolaska,
                        l.cenaKarteEkonomskeKlase,
                        l.cenaKartePremijumEkonomskeKlase,
                        l.cenaKarteBiznisKlase,
                        l.cenaKartePrveKlase,
                        l.kapacitetEkonomskeKlase,
                        l.kapacitetPremijumEkonomskeKlase,
                        l.kapacitetBiznisKlase,
                        l.kapacitetPrveKlase
                    )
            )
        ),
        tap((p) => console.log(p))
    );
}
export function pribaviNekeLetove(
    rezervacija: Rezervacija,
    brojLetovaPoStranici: number = undefined,
    pageIndex: number = undefined
): Observable<JednosmerniLet[]> {
    let trazeniTipKlase = "";
    switch (rezervacija.tipKlase) {
        case tipKlase.EKONOMSKA_KLASA:
            trazeniTipKlase = "kapacitetEkonomskeKlase";
            break;
        case tipKlase.PREMIJUM_EKONOMSKA_KLASA:
            trazeniTipKlase = "kapacitetPremijumEkonomskeKlase";
            break;
        case tipKlase.BIZNIS_KLASA:
            trazeniTipKlase = "kapacitetBiznisKlase";
            break;
        case tipKlase.PRVA_KLASA:
            trazeniTipKlase = "kapacitetPrveKlase";
            break;
    }
    let url = `http://localhost:3000/sviLetovi?polaziste=${
        rezervacija.polaziste
    }&odrediste=${
        rezervacija.odrediste
    }&${trazeniTipKlase}_gte=${rezervacija.brojOsoba.toString()}&datumPolaska=${formatDateUString(
        rezervacija.datumPolaska
    )}`;
    //TODO ubaciti proveru za datum,
    //TODO i za datum povratka da ne moze da izabere manji od datum odlaska
    if (brojLetovaPoStranici !== undefined && pageIndex !== undefined)
        //ako je jednosmerni onda +ovo
        url += `&_limit=${brojLetovaPoStranici}&_page=${pageIndex}`;
    return odgovarajuciLetovi(url);
}
