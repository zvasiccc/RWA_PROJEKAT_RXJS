import { Observable, combineLatest, fromEvent, map, startWith } from "rxjs";

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
    static nadgledajPromenuCene(tipKlaseInput: HTMLInputElement) {
        return fromEvent(tipKlaseInput, "change").pipe(
            map(
                (
                    p: InputEvent //p kad stigne je neki event ne znamo koji, specifiiramo odmah blize da je InputEvent
                ) => (<HTMLInputElement>p.target).value
            ),
            // tap((p) => console.log(p)),
            startWith(tipKlaseInput.value) //kad se napravi tok tipoviKlase$ da se izemituje tipKlaseInput.value
        );
    }
    static ukombinuj(
        tipKlaseInput: HTMLInputElement,
        brojOsobaInput: HTMLInputElement
    ) {
        return combineLatest(
            this.nadgledajPromenuCene(tipKlaseInput),
            this.nadgledajPromenuCene(brojOsobaInput)
        );
    }
}
