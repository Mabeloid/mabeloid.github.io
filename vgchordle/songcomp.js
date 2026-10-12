function oxfordCommaList(strArr) {
    //[A, B] -> "A and B"
    //[A, B, C, D] -> "A, B, C, and D"
    strArr = strArr.length ? strArr : ["N/A"]
    if (strArr.length <= 2) return strArr.join(" and ");
    return [...strArr.slice(0, -1), `and ${strArr.slice(-1)}`].join(", ");
}

export function compareSongs(todaysGame, guessedGame) {
    const fields = {}

    let year_val
    if (todaysGame["year"] == 9999 || guessedGame["year"] == 9999) year_val = 3
    else {
        const year_diff = todaysGame["year"] - guessedGame["year"]
        if (year_diff > 0) year_val = 0
        else if (year_diff == 0) year_val = 1
        else year_val = 2
    }
    const year_str = [
        `Newer than ${guessedGame["year"]}...`,
        `${guessedGame["year"]} is correct!`,
        `Older than ${guessedGame["year"]}...`,
        "Unknown release year..."
    ][year_val]
    fields["year"] = { val: year_val, emoji: ["➡️", "✅", "⬅️", "❔"][year_val], str: year_str }

    for (const f of ["platforms", "series", "genres"]) {
        const intersection = todaysGame[f].filter(item => guessedGame[f].includes(item))
        const interStr = oxfordCommaList(intersection)
        let val
        if (intersection.length == todaysGame[f].length) val = 2
        else if (intersection.length < todaysGame[f].length) val = 1
        else val = 0 // (intersection.length == 0)

        const capitalized = f[0].toUpperCase() + f.slice(1)
        const str = [
            `${capitalized}: None in common...`,
            `${capitalized}: ${interStr} is partially correct!`,
            `${capitalized}: ${interStr} is correct!`,
        ][val]
        fields[f] = { val: val, emoji: ["❌", "🟨", "✅"][val], str: str }
    }

    return fields
}