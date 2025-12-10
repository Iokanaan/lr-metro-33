import { globalSheets } from "./globals"
import { pcSheet } from "./sheets/pcSheet"
import { setupNav } from "./nav/nav"
import { setupBaseInfo, setupConso, setupEncombrement, setupProtection, setupProtectionRoll, setupSangFroid, setupStats } from "./skills/skills"
import { setupRadiation } from "./radiation/radiation"
import { setupRepeater } from "./utils/repeaters"
import { onProtectionDelete, onProtectionDisplay, onProtectionEdit } from "./gear/protection"
import { onItemDelete, onItemDisplay, onItemEdit } from "./gear/item"
import { onWeaponDelete, onWeaponDisplay, onWeaponEdit } from "./gear/weapons"
import { onTalentDelete, onTalentDisplay, onTalentEdit } from "./talents/talents"
import { basicCallback, consoCallback, forcedCallback, protectionCallback, radiationCallback, standardCallback } from "./roll/callbacks"
import { onWoundDelete, onWoundDisplay, onWoundEdit } from "./traumas/blessures"
import { onTraumaDelete, onTraumaDisplay, onTraumaEdit } from "./traumas/traumas"

init = function(sheet: Sheet) {
    if(sheet.id() === "main") {
        const s = pcSheet(sheet)
        globalSheets[sheet.getSheetId()] = s
        s.find("char_name").value(sheet.properName())
        try {
            setupNav(s)
        } catch(e) {
            log("[ERROR] Setting up nav")
        }
        try {
            setupStats(s)
        } catch(e) {
            log("[ERROR] Setting up nav")
        }
        try {
            setupBaseInfo(s)
        } catch(e) {
            log("[ERROR] Setting up nav")
        }
        try {
            setupRadiation(s)
        } catch(e) {
            log("[ERROR] Setting up nav")
        }
        try {
            setupProtection(s)
        } catch(e) {
            log("[ERROR] Setting up nav")
        }
        try {
            setupEncombrement(s)
        } catch(e) {
            log("[ERROR] Setting up nav")
        }
        try {
            setupSangFroid(s)
        } catch(e) {
            log("[ERROR] Setting up nav")
        }
        try {
            setupConso(s)
        } catch(e) {
            log("[ERROR] Setting up nav")
        }
        try {
            setupRepeater(s, "protections", onProtectionEdit, onProtectionDisplay, onProtectionDelete(s))
        } catch(e) {
            log("[ERROR] Setting up nav")
        }
        try {
            setupRepeater(s, "objets_divers", onItemEdit, onItemDisplay, onItemDelete(s))
        } catch(e) {
            log("[ERROR] Setting up nav")
        }
        try {
            setupRepeater(s, "weapons", onWeaponEdit, onWeaponDisplay, onWeaponDelete(s))
        } catch(e) {
            log("[ERROR] Setting up nav")
        }
        try {
            setupRepeater(s, "talents", onTalentEdit(s), onTalentDisplay, onTalentDelete(s))
        } catch(e) {
            log("[ERROR] Setting up nav")
        }
        try {
            setupProtectionRoll(s)
        } catch(e) {
            log("[ERROR] Setting up nav")
        }
        try {
            setupRepeater(s, "wounds", onWoundEdit, onWoundDisplay, onWoundDelete(s))
        } catch(e) {
            log("[ERROR] Setting up nav")
        }
        try {
            setupRepeater(s, "traumas", onTraumaEdit, onTraumaDisplay, onTraumaDelete(s))
        } catch(e) {
            log("[ERROR] Setting up nav")
        }
    }
}

initRoll = function (result, callback) {
    if(result.allTags.includes("rad")) {
        callback("RollRadDisplay", radiationCallback(result))
    } else if(result.allTags.includes("prot")) {
        callback("RollProtDisplay", protectionCallback(result))
    } else if(result.allTags.includes("conso")) {
        callback("RollConsoDisplay", consoCallback(result))
    } else if(result.allTags.includes("forced")) {
        callback("RollForceDisplay", forcedCallback(result))
    } else if(result.allTags.includes("roll")) {
        callback("RollDisplay", standardCallback(result))
    } else {
        callback("RollBasicDisplay", basicCallback(result))
    }
};