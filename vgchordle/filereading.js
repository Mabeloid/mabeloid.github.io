export async function readJson(filePath) {
    try { let response = await fetch(`jsondata/${filePath}`); return response.json() }
    catch (error) { console.error(`Error reading json (${filePath}): ${error}`) }
}