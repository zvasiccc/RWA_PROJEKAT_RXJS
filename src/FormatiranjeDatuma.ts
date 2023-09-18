export function formatDateUString(datum: Date): string {
    const godina = datum.getFullYear();
    const mesec = String(datum.getMonth() + 1).padStart(2, "0"); // dodajemo +1 jer meseci krecu od 0
    const dan = String(datum.getDate()).padStart(2, "0");
    const konvertovaniDatum = `${godina}-${mesec}-${dan}`;
    return konvertovaniDatum;
}
export function formatStringUDate(dateString: string) {
    const [year, month, day] = dateString.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day)); // sada oduzimamo -1 jer meseci krecu od 0
}
