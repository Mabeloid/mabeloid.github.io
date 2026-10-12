const buttonThatClearsLocalStorage = document.getElementById('buttonthatclearslocalstorage');
buttonThatClearsLocalStorage.addEventListener("click", function () {
    localStorage.clear(); alert("FRET nOT ! LOCAL STOERAGE HAS BEEN VLEARED !\nIt's all going to be okay. <3")
    location.reload()
});
if (!true)
    buttonThatClearsLocalStorage.style = "visibility: hidden"

import { searchGames, searchSongs } from "./searchfunc.js";
import { compareSongs } from "./songcomp.js";
import { countGameHistory, getBoxInnerHTML, getEmojisHTML, getCopyText } from "./calcstats.js"
import { readJson } from "./filereading.js"

if (!localStorage.getItem("userPrefs")) localStorage.setItem("userPrefs", "{}")
if (!localStorage.getItem("gameHistory")) localStorage.setItem("gameHistory", "{}")
if (!localStorage.getItem("unlockedLogos")) localStorage.setItem("unlockedLogos", '[]')

/**
 * @typedef {string} GameName
 * @typedef {string} SongID
 * @typedef {string} ChordleDate
 */

/** @type {Record<GameName, {year:Number, platforms:string[], genres:string[], series:string[]}>} */
const gameData = await readJson("gamedata.json");

/** @type {Record<SongID, {game:string, title:string, numbers:string, fullname?:string}>} */
const songData = await readJson("songdata.json");
Object.values(songData).forEach(song => song.fullname = song.game + " - " + song.title)

/** @type {Record<ChordleDate, {no:number, song:string}>} */
const schedule = await readJson("schedule.json");

/** @type {string[]} */
const eligibleLogos = await readJson("eligiblelogos.json");

const todayStr = new Date().toISOString().split('T')[0]
const schedToday = schedule[todayStr]
const todaysID = schedToday.song
const todaysSong = songData[todaysID]
const todaysGame = gameData[todaysSong.game]

// variables for user preferences
/** @type {string} */
let emojiStyle
/** @type {string} */
let logoStyle
/** @type {{emojiStyle:"smw"|"twemoji", logoStyle:"default"|string}} */
const userPrefs = JSON.parse(localStorage.getItem("userPrefs"))
/** @type {Record<ChordleDate, {correctSong:boolean, correctGame:boolean, userLost:boolean, madeGuesses:SongID[]}>} */
const gameHistory = JSON.parse(localStorage.getItem("gameHistory"))
/** @type {string[]} */
const unlockedLogos = JSON.parse(localStorage.getItem("unlockedLogos"))

function loadUserPrefs() {
    function singleUserPref(fieldName, defaultVal) {
        if (!userPrefs[fieldName]) userPrefs[fieldName] = defaultVal
        return userPrefs[fieldName]
    }
    emojiStyle = singleUserPref("emojiStyle", "twemoji")
    logoStyle = singleUserPref("logoStyle", "default")
    saveUserPrefs()
}

function saveUserPrefs() {
    userPrefs.emojiStyle = emojiStyle
    userPrefs.logoStyle = logoStyle
    localStorage.setItem("userPrefs", JSON.stringify(userPrefs))
}
loadUserPrefs()

// header elements
const VGCLogo = document.getElementById("vgclogo");
VGCLogo.innerHTML = `<img src="logo/${logoStyle}.png">`;
const navLogoStyle = document.getElementById('navlogostyle');
const navSettings = document.getElementById('navsettings');
const navStats = document.getElementById('navstats');
const navInfo = document.getElementById('navinfo');
// mid-page elements
const divEmojis = document.getElementById("emojis");
const gameTB = document.getElementById("searchgame");
const gameContainer = document.getElementById("gamecontainer");
const songTB = document.getElementById("searchsong");
const songContainer = document.getElementById("songcontainer");
// footer elements
// const playButton = document.getElementById('playButton');
const audioPlayer = document.getElementById('audioPlayer');
// const volumeSlider = document.getElementById('volumeSlider');
// volumeSlider.value = 0.5;
// settings elements
const settingsBox = document.getElementById('settingsbox');
const sBoxFileInput = document.createElement('input')
sBoxFileInput.type = "file"
sBoxFileInput.accept = ".json"
sBoxFileInput.style = "display: none;"
sBoxFileInput.id = 'sboxfileimport'
const sBoxImport = document.createElement('button')
sBoxImport.id = 'sboximport'
sBoxImport.textContent = "📥 Import save"
const sBoxExport = document.createElement('button')
sBoxExport.id = 'sboxexport'
sBoxExport.textContent = "📤 Export save"
// customization elements
const logoStyleBox = document.getElementById('logostylebox');
// stats elements
const statsBox = document.getElementById('statsbox');
const copyEmojisButton = document.createElement('button')
copyEmojisButton.className = "copyemojisbutton";
copyEmojisButton.textContent = "Copy emojis to clipboard";
// info elements
const infoBox = document.getElementById('infobox');

// randomly choose a background
const BGCount = 19;
const random_i = Math.floor(Math.random() * BGCount)
document.body.style.backgroundImage = `url('bg/${String(random_i).padStart(4, "0")}.png')`;

let loadedSongID = undefined;
let activeNavBox = undefined;

function switchNavBox(navBox) {
    if (activeNavBox == navBox) {
        // same one was clicked; hide it
        activeNavBox.style.display = "none";
        activeNavBox = undefined;
    } else {
        // hide box that was showing before
        if (activeNavBox !== undefined) {
            activeNavBox.style.display = "none";
        }
        navBox.style.display = "grid";
        activeNavBox = navBox;
    }
    return activeNavBox == navBox
}

navLogoStyle.onclick = () => {
    if (switchNavBox(logoStyleBox)) {
        logoStyleBox.innerHTML = ""

        const label = document.createElement("h5");
        label.textContent = "CUSTOMIZATION"

        const selectEmojiStyle = document.createElement("select");
        const placeholderOption = document.createElement("option");
        placeholderOption.value = "";
        placeholderOption.text = `Emoji style (currently ${emojiStyle})`;
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        selectEmojiStyle.appendChild(placeholderOption)


        selectEmojiStyle.addEventListener('change', (event) => {
            emojiStyle = event.target.value
            updateEmojis()
            saveUserPrefs()
        })
        for (const styleName of ["SMW", "Twemoji"]) {
            const option = document.createElement("option")
            option.value = styleName.toLowerCase()
            option.textContent = styleName
            selectEmojiStyle.appendChild(option)
        }

        const logoGrid = document.createElement("div")
        logoGrid.classList.add("logogrid")

        logoStyleBox.appendChild(label)
        logoStyleBox.appendChild(selectEmojiStyle)
        logoStyleBox.appendChild(logoGrid)

        const showLogos = ["default", ...unlockedLogos]
        showLogos.forEach(logoStyles => {
            const logoSelecter = document.createElement("img");
            logoSelecter.src = `logo/${logoStyles}.png`
            logoSelecter.style = "cursor: pointer"
            logoSelecter.className = "logoSelecter"
            logoSelecter.addEventListener("click", function () {
                logoStyle = logoStyles
                VGCLogo.innerHTML = `<img src="logo/${logoStyle}.png">`;
                saveUserPrefs()
            })
            logoGrid.appendChild(logoSelecter)
        })
    }
}
navSettings.onclick = () => {
    console.log("debug! clicked navSettings")
    if (switchNavBox(settingsBox)) {
        settingsBox.innerHTML = ""

        const label = document.createElement("h5");
        label.textContent = "SETTINGS"
        const p_import = document.createElement("p");
        const p_export = document.createElement("p");
        p_import.appendChild(sBoxImport)
        p_export.appendChild(sBoxExport)

        settingsBox.appendChild(label)
        settingsBox.appendChild(sBoxFileInput)
        settingsBox.appendChild(p_import)
        settingsBox.appendChild(p_export)
    }
}
navStats.onclick = () => {
    if (switchNavBox(statsBox)) {
        statsBox.innerHTML = ""
        const countedGameHistory = countGameHistory(gameHistory)
        statsBox.innerHTML = getBoxInnerHTML(countedGameHistory)
    }
};
navInfo.onclick = () => {
    if (switchNavBox(infoBox)) {
        infoBox.innerHTML = ""

        const label = document.createElement("h5");
        label.textContent = "INFO"
        const text = document.createElement("p");
        const lines = [
            "Hi! Welcome to VG Chordle!",
            "It's a daily 'dle where every day there's a chords-only piano rendition of a video game song.",
            "Using your brain's pattern recognition (and hot-or-cold hints), you're set to determine what the game is.",
            "There's also an extra reward if you guess the right song from the game!",
            "",
            "Big thanks to Frep for helping me with the website, as well as the supporters of the original Mario Chordle.",
        ]
        if (gameOver()) lines.push("", "(this is where the trascription gets credited but that's not implemented yet)")
        else lines.push("", "(this is where the trascription gets credited but you have guesses left and also it's not implemented yet)")
        text.innerHTML = lines.join("<br>")

        infoBox.appendChild(label)
        infoBox.appendChild(text)
    }
}

copyEmojisButton.addEventListener("click", async function () {
    const countedGameHistory = countGameHistory(gameHistory);
    const copyEmojisStr = getCopyText(guessesDisplay, todayStr, schedToday, countedGameHistory);
    await navigator.clipboard.writeText(copyEmojisStr);
    alert("emojis have been copied to clipboard!")
})

sBoxImport.addEventListener("click", function () {
    console.log("clicked sBoxImport"); sBoxFileInput.click()
})
sBoxFileInput.addEventListener("change", function (e) {
    console.log("changed sBoxFileImport");
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const saveData = JSON.parse(e.target.result);
        localStorage.setItem("gameHistory", saveData.gameHistory)
        localStorage.setItem("userPrefs", saveData.userPrefs)
        localStorage.setItem("unlockedLogos", saveData.unlockedLogos)
        location.reload()
    };
    reader.readAsText(file);
})

sBoxExport.addEventListener("click", function () {
    const jsonString = JSON.stringify(localStorage, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = "VGChordle.json";
    a.click();

    URL.revokeObjectURL(url);
})

copyEmojisButton.addEventListener("click", async function () {
    await navigator.clipboard.writeText(copyEmojisStr);
    alert("emojis have been copied to clipboard!")
})

// volumeSlider.addEventListener("input", function (event) {
//     audioPlayer.volume = event.target.value;
// })

// variables for specific day
let correctSong = false
let correctGame = false
let userLost = false
/** 
 * @type {{
 * year:      {val:0|1|2, emoji:"➡️"|"✅"|"⬅️"|"❔", str:string},
 * platforms: {val:0|1|2, emoji:"❌"|"🟨"|"✅",       str:string},
 * series:    {val:0|1|2, emoji:"❌"|"🟨"|"✅",       str:string},
 * genres:    {val:0|1|2, emoji:"❌"|"🟨"|"✅",       str:string},
 * }[]}
*/
const guessesDisplay = []
/** @type {SongID[]} */
const madeGuesses = []

// since EventListener doesn't provide inputs to functions, filteredGames is global
/** @type {[string, number[]][]} */
let filteredGames = []


function loadTodayProgress() {
    if (!gameHistory[todayStr]) saveTodayProgress()
    const todayObj = JSON.parse(localStorage.getItem("gameHistory"))[todayStr]

    correctSong = todayObj.correctSong
    correctGame = todayObj.correctGame
    userLost = todayObj.userLost
    for (let guessedID of todayObj.madeGuesses) guessSong(guessedID)
}

function saveTodayProgress() {
    gameHistory[todayStr] = {
        "correctSong": correctSong,
        "correctGame": correctGame,
        "userLost": userLost,
        "madeGuesses": madeGuesses
    }
    localStorage.setItem("gameHistory", JSON.stringify(gameHistory))
    localStorage.setItem("unlockedLogos", JSON.stringify(unlockedLogos))
}

// textbox.addEventListener("focus", function () { console.log("Textbox focused"); });
// textbox.addEventListener("blur", function () { console.log("Textbox lost focus"); });

function updateSearchGame() {
    filteredGames = searchGames(gameTB.value, gameData)
    displayGameSuggestions(filteredGames)
    updateSearchSong()
}
gameTB.addEventListener("input", updateSearchGame)

function displayGameSuggestions(filteredGames) {
    if (!filteredGames.length || correctGame || userLost) { gameContainer.innerHTML = ""; return }
    const html = filteredGames.map(([title, indices]) => {
        const formatted = [...title]
        for (let i of indices) { formatted[i] = `<mark>${formatted[i]}</mark>` }
        return `<div class="gamesuggestion">${formatted.join("")}</div>`
    }).join("")
    gameContainer.innerHTML = html
}

function clickGameSugg(e) {
    if (!e.target.classList.contains("gamesuggestion")) return
    gameTB.value = e.target.textContent;
    gameContainer.innerHTML = "";

    filteredGames = [[gameTB.value, [-1]]] // [-1] is dummy value
    updateSearchSong()
}
gameContainer.addEventListener("click", clickGameSugg);

function updateSearchSong() {
    loadedSongID = undefined;
    let foundSongs = searchSongs(filteredGames, songTB.value, songData)
    displaySongSuggestions(foundSongs);
}

songTB.addEventListener("input", updateSearchSong)
songTB.addEventListener("keydown", function (e) {
    if (e.key === "Enter"){
        if (songContainer.childNodes.length == 1)
            loadedSongID = songContainer.childNodes[0].id
        guessSong(loadedSongID)
    }
});

function displaySongSuggestions(foundSongs) {
    if (!foundSongs.length || correctGame || userLost) { songContainer.innerHTML = ""; return }
    const html = foundSongs.map(([songID, indices]) => {
        const formatted = [...songData[songID].fullname]
        for (let i of indices) formatted[i] = `<mark>${formatted[i]}</mark>`
        return `<div id="${songID}" class="songsuggestion">${formatted.join("")}</div>`
    }).join("")
    songContainer.innerHTML = html;
}

function clickSongSugg(e) {
    if (!e.target.classList.contains("songsuggestion")) return
    updateSearchSong()
    loadedSongID = e.target.id
    songTB.value = e.target.textContent
    // guessSong(e.target.id)
}

songContainer.addEventListener("click", clickSongSugg);

function guessSong(guessedID) {
    if (guessedID === undefined) return;
    madeGuesses.push(guessedID)
    const guessedSong = songData[guessedID]
    const guessedGame = gameData[guessedSong.game]
    const fields = compareSongs(todaysGame, guessedGame)
    correctSong ||= todaysID == guessedID
    correctGame ||= todaysSong.game == guessedSong.game
    userLost ||= guessesDisplay.length == 6
    console.log("guessesDisplay.length", guessesDisplay.length)
    console.log("userLost", userLost)

    if (correctSong) {
        const gameSeries = todaysGame.series.length ? todaysGame.series : [todaysSong.game]
        const unlockedSeries = gameSeries.filter(series => eligibleLogos.includes(series) && !unlockedLogos.includes(series))
        unlockedSeries.forEach(series => {
            unlockedLogos.push(series);
            unlockedLogos.sort();
            alert(`Unlocked new customizable logo style! ${series}`);
        })
    }
    guessesDisplay.push(fields)
    gameTB.value = ""
    songTB.value = ""

    updateEmojis()
    updateSearchGame()
    updateSearchSong()
    updateAudio()

    saveTodayProgress()
}

function getEmojiPath(base) {
    const imgtype = emojiStyle == "twemoji" ? "svg" : "png"
    return `emojis/${emojiStyle}/${base}.${imgtype}`
}

function getEmojiImgHTML(emoji) {
    if (emojiStyle == "text") return emoji
    const char = { "➡️": "d", "✅": "o", "⬅️": "a", "❌": "x", "❔": "q", "🟨": "-", "⬜": "_" }[emoji]
    return `<img src="${getEmojiPath(char)}"></img>`

}

function updateEmojis() {
    divEmojis.innerHTML = ""
    for (let i = 0; i <= 6; i++) {
        const row = document.createElement("div")
        const rowFieldName = document.createElement("div")
        const rowFieldYear = document.createElement("div")
        const rowFieldPlatforms = document.createElement("div")
        const rowFieldSeries = document.createElement("div")
        const rowFieldGenres = document.createElement("div")
        const rowFields = [rowFieldYear, rowFieldPlatforms, rowFieldSeries, rowFieldGenres]

        const fieldnames = ["year", "platforms", "series", "genres"];
        fieldnames.forEach(function (f, j) {
            const rowField = rowFields[j]
            rowField.className = "oneemoji"
            rowField.id = f
            if (i >= guessesDisplay.length)
                return rowField.innerHTML = getEmojiImgHTML("⬜");

            rowFieldName.textContent = songData[madeGuesses[i]].fullname;
            const fields = guessesDisplay[i];
            rowField.innerHTML = getEmojiImgHTML(fields[f].emoji)
            const emojiHover = document.createElement("span")
            emojiHover.className = "emojihover"
            emojiHover.textContent = fields[f].str
            rowField.appendChild(emojiHover)
        })

        row.appendChild(rowFieldName)
        rowFields.forEach(node => row.appendChild(node))
        divEmojis.appendChild(row)
    }
    if (gameOver()) {
        divEmojis.appendChild(copyEmojisButton)
    }

    emojiOnMobile()
}

function emojiOnMobile() {
    const manyEmojis = document.getElementsByClassName('oneemoji')
    if (!manyEmojis) return console.warn("no emojis")
    for (let trigger of manyEmojis) {
        trigger.addEventListener('touchstart', (e) => {
            //TODO: `iirc you can use CSS to make text unselectable without having to use a JS event listener`
            e.preventDefault(); // Prevent text selection on mobile
            trigger.toggle('active');

            // Close other open tooltips
            tooltipContainers.forEach(otherContainer => {
                if (otherContainer == emojiBox) return
                otherContainer.classList.remove('active')
            }
            )
        })
    }
    // Close tooltip when tapping outside
    document.addEventListener('touchstart', (e) => {
        if (!emojiBox.contains(e.target)) emojiBox.classList.remove('active')
    })
}

// function startAudio() {
//     audioPlayer.currentTime = 0
//     audioPlayer.play()
//     playButton.textContent = "■";
// }
// function stopAudio() {
//     audioPlayer.pause()
//     audioPlayer.currentTime = 0
//     playButton.textContent = "▷";
// }
// audioPlayer.addEventListener("ended", stopAudio)
// playButton.addEventListener('click', function () {
//     const isStopped = playButton.textContent == "▷"
//     isStopped ? startAudio() : stopAudio()
// })
function updateAudio() {
    // stopAudio()
    const filenum = gameOver() ? "m" : todaysSong.numbers[guessesDisplay.length]
    audioPlayer.src = `audio/${todaysID} ${filenum}.mp3`
    // audioPlayer.volume = volumeSlider.value
}
function gameOver() { return guessesDisplay.length > 6 || correctGame || userLost }

async function main() {
    loadTodayProgress()
    updateSearchGame()
    updateEmojis()
    updateAudio()
    console.log("todaysSong =", todaysSong)
}

main()
