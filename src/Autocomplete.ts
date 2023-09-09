import { debounceTime, fromEvent, switchMap } from "rxjs";
import { fromFetch } from "rxjs/fetch";

export class Autocomplete {
    static napraviAutocompletePolja(
        poljeInput: HTMLInputElement,
        listaPredlogaZaPolje: HTMLElement
    ) {
        fromEvent(poljeInput, "input")
            .pipe(debounceTime(500))
            .subscribe((event) => {
                try {
                    fromFetch("http://localhost:3000/gradovi")
                        .pipe(
                            switchMap((response) => {
                                if (response.ok) {
                                    return response.json();
                                } else {
                                    throw new Error("Failed to fetch level");
                                }
                            })
                        )
                        .subscribe(
                            (data: { name: string }[]) => {
                                // kazemo da su pribavljeni podaci sa fetcha tipa niz imena
                                console.log(data);
                                const uneseniTekst = poljeInput.value;
                                const imenaSvihGradova = data.map(
                                    (grad) => grad.name
                                );
                                const predlozeniGradovi =
                                    imenaSvihGradova.filter((grad) =>
                                        grad
                                            .toLowerCase()
                                            .startsWith(
                                                uneseniTekst.toLowerCase()
                                            )
                                    );
                                if (predlozeniGradovi.length > 0) {
                                    listaPredlogaZaPolje.innerHTML = "";
                                    predlozeniGradovi.forEach((grad) => {
                                        const listItem =
                                            document.createElement("li");
                                        listItem.textContent = grad;
                                        listaPredlogaZaPolje.appendChild(
                                            listItem
                                        );
                                    });
                                    listaPredlogaZaPolje.style.display =
                                        "block";
                                } else {
                                    listaPredlogaZaPolje.style.display = "none";
                                }
                            },
                            (error) => {
                                console.log(error);
                            }
                        );
                } catch (err) {
                    console.log(err);
                }
            });

        fromEvent(listaPredlogaZaPolje, "click").subscribe((event) => {
            if (event.target instanceof HTMLElement) {
                // dodajemo click listener na listu predloga
                const izabraniGrad = event.target.textContent;
                poljeInput.value = izabraniGrad;
                listaPredlogaZaPolje.style.display = "none";
            }
        });

        document.addEventListener("click", (e) => {
            if (e.target !== poljeInput && e.target !== listaPredlogaZaPolje) {
                listaPredlogaZaPolje.style.display = "none";
            }
        });
    }
}
