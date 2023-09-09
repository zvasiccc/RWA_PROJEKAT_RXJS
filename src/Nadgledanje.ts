import { fromEvent } from "rxjs";

export class Nadgledanje {
    static nadgledajPovratnaKartaCheck(
        povratnaKartaInput: HTMLInputElement,
        datumPovratkaInput: HTMLInputElement
    ) {
        fromEvent(povratnaKartaInput, "change").subscribe((event) => {
            if (povratnaKartaInput.checked) {
                datumPovratkaInput.disabled = false;
            } else {
                datumPovratkaInput.disabled = true;
                datumPovratkaInput.value = "";
            }
        });
    }
    static nadgledajdugmeZameniPolazisteIOdrediste(
        dugmeZameniPolazisteIOdrediste: HTMLElement,
        polazisteInput: HTMLInputElement,
        odredisteInput: HTMLInputElement
    ) {
        {
            fromEvent(dugmeZameniPolazisteIOdrediste, "click").subscribe(
                (event) => {
                    const trenutnoPolaziste = polazisteInput.value;
                    const trenutnoOdrediste = odredisteInput.value;
                    polazisteInput.value = trenutnoOdrediste;
                    odredisteInput.value = trenutnoPolaziste;
                }
            );
        }
    }
}
