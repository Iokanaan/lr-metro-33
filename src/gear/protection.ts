import { globalSheets } from "../globals"
import { effect, signal } from "../utils/utils"

export const onProtectionEdit = function(entry: Component<Protection>) {
    if(entry.value().max_protection_bonus === undefined) {
        entry.find("max_protection_bonus").value(1)
    }
}

export const onProtectionDisplay = function(entry: Component<Protection>) {
    const sheet = globalSheets[entry.sheet().getSheetId()] as PcSheet
    let protections = sheet.protections()
    const curr_armor = entry.value()
    protections[entry.id()] = curr_armor
    sheet.protections.set(protections)

    const minus = entry.find("min_protection_bonus")
    const plus = entry.find("plus_protection_bonus")
    const curr = entry.find("curr_protection_bonus")

    minus.on("click", function() {
        if(curr.value() > 0) {
            curr.value(curr.value() - 1)
        }
    })

    plus.on("click", function() {
        if(curr.value() < curr_armor.max_protection_bonus) {
            curr.value(curr.value() + 1)
        }
    })

    const curr_prot_sig = signal(curr_armor.curr_protection_bonus)
    curr.on("update", function(cmp) {
        curr_armor.curr_protection_bonus = cmp.value()
        protections[entry.id()] = curr_armor
        sheet.protections.set(protections)
        curr_prot_sig.set(cmp.value())
    })

    effect(function() {
        if(curr_prot_sig() > curr_armor.max_protection_bonus) {
            curr.value(curr_armor.max_protection_bonus)
        } else {
            if(curr_prot_sig() == curr_armor.max_protection_bonus) {
                curr.removeClass("bg-danger")
                plus.addClass("opacity-0")
            } else {
                curr.addClass("bg-danger")
                plus.removeClass("opacity-0")
            }
            if(curr_prot_sig() == 0) {
                minus.addClass("opacity-0")
            } else {
                minus.removeClass("opacity-0")
            }
        }
    }, [curr_prot_sig])

    if(curr_armor.curr_protection_bonus === undefined || curr_armor.curr_protection_bonus > curr_armor.max_protection_bonus) {
        curr.value(curr_armor.max_protection_bonus)
    }

    if(curr_armor.protection_name !== undefined) {
        entry.find("protection_label").value(curr_armor.protection_name);
    } else {
        entry.find("protection_label").value("Protection inconnue");
    }

    if(curr_armor.protection_poids === undefined || curr_armor.protection_poids === "0") {
        entry.find("protection_poids_label").value("0")
    } else {
        entry.find("protection_poids_label").value(Tables.get("poids").get(curr_armor.protection_poids).name)
    }
}

export const onProtectionDelete = function(sheet: PcSheet) {
    return function(entryId: string) {
        const protections = sheet.protections()
        delete protections[entryId]
        sheet.protections.set(protections)
    }
}