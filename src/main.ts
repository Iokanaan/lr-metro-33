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

init = function(sheet: Sheet) {
    if(sheet.id() === "main") {
        const s = pcSheet(sheet)
        globalSheets[sheet.getSheetId()] = s
            setupNav(s)

            s.find("char_name").value(sheet.properName())
            setupStats(s)
            setupBaseInfo(s)
            setupRadiation(s)
            setupProtection(s)
            setupEncombrement(s)
            setupSangFroid(s)
            setupConso(s)
            setupRepeater(s, "protections", onProtectionEdit, onProtectionDisplay, onProtectionDelete(s))
            setupRepeater(s, "objets_divers", onItemEdit, onItemDisplay, onItemDelete(s))
            setupRepeater(s, "weapons", onWeaponEdit, onWeaponDisplay, onWeaponDelete(s))

            setupRepeater(s, "talents", onTalentEdit(s), onTalentDisplay, onTalentDelete(s))
        setupProtectionRoll(s)
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