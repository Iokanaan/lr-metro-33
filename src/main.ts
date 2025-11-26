import { globalSheets } from "./globals"
import { pcSheet } from "./sheets/pcSheet"
import { setupNav } from "./nav/nav"
import { setupStats } from "./skills/skills"
import { setupStressArray } from "./state/state"

init = function(sheet: Sheet) {
    if(sheet.id() === "main") {
        const s = pcSheet(sheet)
        globalSheets[sheet.getSheetId()] = s
        try {
            setupNav(s)
        } catch(e) {
            log("[CRITICAL]: Failed setting up navigation for " + sheet.getSheetId())
        }
        try {
            s.find("char_name").value(sheet.properName())
            setupStats(s)
            setupStressArray(s)
        } catch(e) {
            log("[ERROR]: Failed setting stats / AR for " + sheet.getSheetId())
        }
    }
}
