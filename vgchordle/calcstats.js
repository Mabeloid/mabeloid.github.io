const ONE_DAY = 1000 * 60 * 60 * 24

/**
 * @param {Record<ChordleDate, {correctSong:boolean, correctGame:boolean, userLost:boolean, madeGuesses:SongID[]}>} gameHistorysubString
 * @returns {{maxStreak:number, currentStreak:number, histogram:{0:number, 1:number, 2:number, 3:number, 4:number, 5:number, 6:number, "X":number}}}
 */
export function countGameHistory(gameHistory){
    let maxStreak = 0
    let currentStreak = 0
    let prevDate = new Date("1970-01-01")
    const histogram = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, "X": 0 }
    for (const [dateStr, dateInfo] of Object.entries(gameHistory)) {
        const currDate = new Date(dateStr)
        if (currDate - prevDate != ONE_DAY) currentStreak = 0
        if (dateInfo["correctGame"]) {
            currentStreak++;
            maxStreak = Math.max(currentStreak, maxStreak);
            histogram[dateInfo["madeGuesses"].length]++
        }
        if (dateInfo["userLost"]) { histogram["X"]++; currentStreak = 0; }
        prevDate = currDate
    }
    return {
        maxStreak: maxStreak,
        currentStreak: currentStreak,
        histogram: histogram
    }
}

/**
 * @param {{maxStreak:number, currentStreak:number, histogram: {
 * 0:number, 1:number, 2:number, 3:number, 4:number, 5:number, 6:number, "X":number
 * }}} countedGameHistory
 * @returns {string}
 */
export function getBoxInnerHTML(countedGameHistory) {
    const histogramHTML = Object.entries(countedGameHistory.histogram).map(
        ([i, count]) => `<p>${i}: ${count}</p>`).join("\n")
    return `<h5>STATS</h5>
    <p>Current streak: ${countedGameHistory.currentStreak}</p>
    <p>Longest streak: ${countedGameHistory.maxStreak}</p>
    <p>Score histogram: ${histogramHTML}</p>
    `
}

/** 
 * @param {{
 * year:      {val:0|1|2, emoji:"➡️"|"✅"|"⬅️"|"❔", str:string},
 * platforms: {val:0|1|2, emoji:"❌"|"🟨"|"✅",       str:string},
 * series:    {val:0|1|2, emoji:"❌"|"🟨"|"✅",       str:string},
 * genres:    {val:0|1|2, emoji:"❌"|"🟨"|"✅",       str:string},
 * }[]} guessesDisplay
 * @returns {string}
*/
export function getEmojisHTML(guessesDisplay) {
    const emojis = []
    for (const fields of guessesDisplay) {
        let row = ["year", "platforms", "series", "genres"].map(f => fields[f]["emoji"]).join("")
        emojis.push(row)
    }
    const emojiHTML = emojis.map(row => `<p>${row}</p>`).join("\n")
    return emojiHTML
}

/** 
 * @param {{
 * year:      {val:0|1|2, emoji:"➡️"|"✅"|"⬅️"|"❔", str:string},
 * platforms: {val:0|1|2, emoji:"❌"|"🟨"|"✅",       str:string},
 * series:    {val:0|1|2, emoji:"❌"|"🟨"|"✅",       str:string},
 * genres:    {val:0|1|2, emoji:"❌"|"🟨"|"✅",       str:string},
 * }[]} guessesDisplay
 * @param {{no:number, song:string}} schedToday
 * @param {{maxStreak:number, currentStreak:number, histogram: {
 * 0:number, 1:number, 2:number, 3:number, 4:number, 5:number, 6:number, "X":number
 * }}} countedGameHistory
 * @returns {string}
*/
export function getCopyText(guessesDisplay, todayStr, schedToday, countedGameHistory) {
    const header = `VG Chordle ${todayStr} #${schedToday.no} 🔥${countedGameHistory.currentStreak}`
    const emojis = []
    for (const fields of guessesDisplay) {
        let row = ["year", "platforms", "series", "genres"].map(f => fields[f]["emoji"]).join("")
        emojis.push(row)
    }
    const emojisStr = [header, ...emojis].join("\n")
    return emojisStr
}