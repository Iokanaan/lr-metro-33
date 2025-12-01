import { globalSheets } from "./globals"
import { pcSheet } from "./sheets/pcSheet"
import { setupNav } from "./nav/nav"
import { setupBaseInfo, setupEncombrement, setupProtection, setupStats } from "./skills/skills"
import { setupRadiation } from "./radiation/radiation"
import { setupRepeater } from "./utils/repeaters"
import { onProtectionDelete, onProtectionDisplay, onProtectionEdit } from "./gear/protection"
import { onItemDelete, onItemDisplay, onItemEdit } from "./gear/item"
import { onWeaponDelete, onWeaponDisplay, onWeaponEdit } from "./gear/weapons"
import { buildRoll, standardCallback } from "./roll/roll"

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
    }
}

initRoll = function (result, callback) {
    if(result.allTags.includes("rad")) {
        callback("RollRadDisplay", function (sheet: Sheet) {
            if(result.allTags.includes("detox")) {
                if(result.children[0].total < 1) {
                    sheet.get("success").hide()
                    sheet.get("failure").show()
                    sheet.get("nb_failures").hide()
                } else {
                    sheet.get("success").show()
                    sheet.get("failure").hide()
                    sheet.get("nb_failures").hide()
                }
            } else {
                if(result.children[0].failure >= 1) {
                    sheet.get("success").hide()
                    sheet.get("failure").show()
                    sheet.get("nb_failures").value(result.children[0].failure)
                    sheet.get("nb_failures").show()
                } else {
                    sheet.get("success").show()
                    sheet.get("failure").hide()
                    sheet.get("nb_failures").hide()
                }
            }
        })
    } else {
        callback("RollDisplay", standardCallback(result))
    }
};