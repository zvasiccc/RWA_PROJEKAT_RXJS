import { Observable, concatMap, map } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { JednosmerniLet } from "./Jednosmerni let";
import { Rezervacija } from "./Rezervacija";
import { tipKlase } from "./TipKlaseEnum";

// static async predloziGradova(
//     uneseniTekst: String,
//     listaPredlogaZaPolje: HTMLElement
// ) {
//     const response = await fromFetch(
//         `http://localhost:3000/gradovi?name_like=${uneseniTekst}`
//     ).toPromise();

//     if (response.ok) {
//         const data: { name: string }[] = await response.json();

//         console.log(data);

//         if (data.length > 0) {
//             listaPredlogaZaPolje.innerHTML = "";
//             data.forEach((grad) => {
//                 const listItem = document.createElement("li");
//                 listItem.textContent = grad.name;
//                 listaPredlogaZaPolje.appendChild(listItem);
//             });
//             listaPredlogaZaPolje.style.display = "block";
//         } else {
//             listaPredlogaZaPolje.style.display = "none";
//         }
//     } else {
//         throw new Error("failed to fetch");
//     }
// }
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
    return (
        fromFetch(url)
            // pravi observable od fetcha, tj pravimo tok na koji mozemo da se pretplatimo
            .pipe(
                concatMap((response) => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw Error("Neuspesan fetch odgovarajucih letova");
                    }
                    //sa toka responsova se prebacujemo na tok objekta nekih, odnosno ne koristimo vise ceo response
                    //nego samo nas json iz responsa, tj body responsa
                }),
                map((data) => <any[]>data), //prvo kazemo da je niz any objekata, nije niz LEt objekata zbog new Date koje koristimo, on dobija string onako
                //                    switchMap((data) => from(data)), //from od niza pravi tok elemenata
                map(
                    //sad l predstavlja any trenutno, i sad cemo da napravimo nase Let objekte
                    (p) =>
                        p.map(
                            (l) =>
                                new JednosmerniLet(
                                    l.id,
                                    l.polaziste,
                                    l.odrediste,
                                    new Date(l.datumPolaska),
                                    l.vremePolaska,
                                    l.vremeDolaska,
                                    l.avioKompanija,
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
                )
            )
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
    }&${trazeniTipKlase}_gte=${rezervacija.brojOsoba.toString()}`;
    //TODO ubaciti proveru za datum,
    //TODO i za datum povratka da ne moze da izabere manji od datum odlaska
    if (brojLetovaPoStranici !== undefined && pageIndex !== undefined)
        //ako je jednosmerni onda +ovo
        url += `&_limit=${brojLetovaPoStranici}&_page=${pageIndex}`;
    return odgovarajuciLetovi(url);
}
