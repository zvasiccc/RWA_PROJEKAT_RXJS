export function formatDateUString(datum: Date): string {
    const godina = datum.getFullYear();
    const mesec = String(datum.getMonth() + 1).padStart(2, "0"); // Dodajemo +1 jer meseci kreću od 0
    const dan = String(datum.getDate()).padStart(2, "0");
    const konvertovaniDatum = `${godina}-${mesec}-${dan}`;
    console.log(konvertovaniDatum); // "2023-09-22"
    return konvertovaniDatum;
}
export function formatStringUDate(dateString: string) {
    const [year, month, day] = dateString.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day)); // Meseci u JavaScriptu krecu od 0 (januar = 0, februar = 1, ...), pa se oduzima 1.
}
