import { globalSheets } from "./globals"
import { pcSheet } from "./sheets/pcSheet"
import { setupNav } from "./nav/nav"
import { setupBaseInfo, setupEncombrement, setupProtection, setupProtectionRoll, setupStats } from "./skills/skills"
import { setupRadiation } from "./radiation/radiation"
import { setupRepeater } from "./utils/repeaters"
import { onProtectionDelete, onProtectionDisplay, onProtectionEdit } from "./gear/protection"
import { onItemDelete, onItemDisplay, onItemEdit } from "./gear/item"
import { onWeaponDelete, onWeaponDisplay, onWeaponEdit } from "./gear/weapons"
import { buildRoll, protectionCallback, radiationCallback, standardCallback } from "./roll/roll"

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
            setupBaseInfo(s)
            setupRadiation(s)
            setupProtection(s)
            setupEncombrement(s)
        } catch(e) {
            log("[ERROR]: Failed setting stats / AR for " + sheet.getSheetId())
        }
        try {
            setupRepeater(s, "protections", onProtectionEdit, onProtectionDisplay, onProtectionDelete(s))
        } catch(e) {
            log("[ERROR]: Failed setting up armors repeater for " + sheet.getSheetId())
        }
        try {
            setupRepeater(s, "objets_divers", onItemEdit, onItemDisplay, onItemDelete(s))
        } catch(e) {
            log("[ERROR]: Failed setting up items repeater for " + sheet.getSheetId())
        }
        try {
            setupRepeater(s, "weapons", onWeaponEdit, onWeaponDisplay, onWeaponDelete(s))
        } catch(e) {
            log("[ERROR]: Failed setting up weapons repeater for " + sheet.getSheetId())
        }
        setupProtectionRoll(s)
    }
}

initRoll = function (result, callback) {
    if(result.allTags.includes("rad")) {
        callback("RollRadDisplay", radiationCallback(result))
    } else if(result.allTags.includes("prot")) {
        callback("RollProtDisplay", protectionCallback(result))
    } else {
        callback("RollDisplay", standardCallback(result, result.allTags.includes("forced")))
    }
};