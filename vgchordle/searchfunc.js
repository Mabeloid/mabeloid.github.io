/**
 * @param {string} subString
 * @param {string} fullString
 * @returns {number[]}
 */
function findSubStr(subString, fullString) {
    // findSubStr("Rage", "Orange") = [1, 2, 4, 5]
    // findSubStr("Ragee", "Orange") = []
    let indices = []
    let j = 0
    for (let i = 0; i < subString.length; i++) {
        let d_j = fullString.slice(j).indexOf(subString[i]) + 1
        if (d_j == 0) return []
        j += d_j
        indices.push(j - 1)
    }
    return indices
}

/**
 * @param {string} searchStr 
 * @param {Record<GameName, {year:Number, platforms:string[], genres:string[], series:string[]}>} gameData
 * @returns {[string, number[]][]}
 */
export function searchGames(searchStr, gameData) {
    if (!searchStr) return Object.keys(gameData).map(title => [title, []])
    let found = Object.keys(gameData).map((title) =>
        [title, findSubStr(searchStr.toLowerCase(), title.toLowerCase())])
    found = found.filter(([title, indices]) => indices.length != 0)
    return found
}

/**
 * @param {[string, number[]][]} filteredGames 
 * @param {string} searchStr 
 * @param {Record<SongID, {game:string, title:string, numbers:string, fullname?:string}>} songData
 * @returns {[string, number[]][]}
 */
export function searchSongs(filteredGames, searchStr, songData) {
    const filteredGameTitles = filteredGames.map(([title, indices]) => title) // list[str]
    const filteredSongs = Object.entries(songData).filter(
        ([songID, song]) => filteredGameTitles.includes(song["game"]))
    const foundSongs = filteredSongs.map(([songID, song]) =>
        [songID, findSubStr(searchStr.toLowerCase(), song["fullname"].toLowerCase())]);
    if (!searchStr) return foundSongs //empty search field match all songs instead of no songs
    return foundSongs.filter(([songID, indices]) => indices.length != 0)
}