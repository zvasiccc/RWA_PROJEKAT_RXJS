import { concatMap, map } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { JednosmerniLet } from "./Jednosmerni let";

export class PribavljanjePodataka {
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
    static predloziGradova(
        uneseniTekst: String,
        listaPredlogaZaPolje: HTMLElement
    ) {
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
        // .subscribe((gradovi) => {
        //     listaPredlogaZaPolje.innerHTML = "";
        //     gradovi.forEach((grad) => {
        //         const listItem = document.createElement("li");
        //         listItem.textContent = grad.name;
        //         listaPredlogaZaPolje.appendChild(listItem);
        //     });
        //     listaPredlogaZaPolje.style.display = "block";
        // });
    }
    static odgovarajuciLetovi(url: string) {
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
}
