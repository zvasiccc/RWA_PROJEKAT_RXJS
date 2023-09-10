import { debounceTime, fromEvent, switchMap } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import { PribavljanjePodataka } from "./PribavljanjePodataka";
import { Nadgledanje } from "./Nadgledanje";
import { NadgledanjeAutocomplete } from "./NadgledanjeAutocomplete";

export class Autocomplete {
    static napraviAutocompletePolja(
        poljeInput: HTMLInputElement,
        listaPredlogaZaPolje: HTMLElement
    ) {
        NadgledanjeAutocomplete.nadgledajUnosGrada(
            poljeInput,
            listaPredlogaZaPolje
        );
        NadgledanjeAutocomplete.nadgledajListuPredlogaGradova(
            poljeInput,
            listaPredlogaZaPolje
        );

        NadgledanjeAutocomplete.nadgledajKlikVanListePredloga(
            poljeInput,
            listaPredlogaZaPolje
        );
    }
}
