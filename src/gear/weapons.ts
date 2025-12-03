import { globalSheets } from "../globals"
import { buildRoll, forceRollHandler, initModifyPrompt, stressSuccessHandler } from "../roll/roll"
import { basicUpdateHandler, effect, signal } from "../utils/utils"

export const onWeaponEdit = function(entry: Component<Weapon>) {
    if(entry.value().weapon_bonus_val === undefined) {
        entry.find("weapon_bonus_val").value(1)
    }
    if(entry.value().weapon_fiabilite_val === undefined) {
        entry.find("weapon_fiabilite_val").value(0)
    }
    if(entry.value().weapon_degats_val === undefined) {
        entry.find("weapon_degats_val").value(1)
    }

    const sig_weapon_type_val = signal(entry.find("weapon_type_val").value())

    entry.find("weapon_type_val").on("update", basicUpdateHandler(sig_weapon_type_val))

    effect(function() {
        if(sig_weapon_type_val() === "cac") {
            entry.find("portee_bloc").hide()
            entry.find("explosif_bloc").value("false")
            entry.find("explosif_bloc").hide()
        } else {
            entry.find("portee_bloc").show()
            entry.find("explosif_bloc").show()
        }
    }, [sig_weapon_type_val])
}

export const onWeaponDisplay = function(entry: Component<Weapon>) {
    const sheet = globalSheets[entry.sheet().getSheetId()] as PcSheet
    let weapons = sheet.weapons()
    const curr_weapon = entry.value()
    weapons[entry.id()] = curr_weapon
    sheet.weapons.set(weapons)
    const minus = entry.find("min_weapon_bonus")
    const plus = entry.find("plus_weapon_bonus")
    const curr = entry.find("weapon_curr_bonus")

    minus.on("click", function() {
        if(curr.value() > 0) {
            curr.value(curr.value() - 1)
        }
    })
    const curr_bonus_sig = signal(curr_weapon.weapon_curr_bonus)
    curr.on("update", function(cmp) {
        curr_weapon.weapon_curr_bonus = cmp.value()
        weapons[entry.id()] = curr_weapon
        sheet.weapons.set(weapons)
        curr_bonus_sig.set(cmp.value())
    })

    plus.on("click", function() {
        if(curr.value() < curr_weapon.weapon_bonus_val) {
            curr.value(curr.value() + 1)
        }
    })
    effect(function() {
        if(curr_bonus_sig() > curr_weapon.weapon_bonus_val) {
            curr.value(curr_weapon.weapon_bonus_val)
        } else {
            if(curr_bonus_sig() == curr_weapon.weapon_bonus_val) {
                curr.removeClass("bg-danger")
                plus.addClass("opacity-0")
            } else {
                curr.addClass("bg-danger")
                plus.removeClass("opacity-0")
            }
            if(curr_bonus_sig() == 0) {
                minus.addClass("opacity-0")
            } else {
                minus.removeClass("opacity-0")
            }
        }
    }, [curr_bonus_sig])
    if(curr_weapon.weapon_explosif_val) {
        entry.find("explosion_bonus").show()
    }

    entry.find("poids_label").value(Tables.get("poids").get(curr_weapon.weapon_poids_val).name)

    if(curr_weapon.weapon_fiabilite_val > 0) {
        entry.find("roll_fiabilite").show()
    } else {
        entry.find("roll_fiabilite").hide()
    }

    if(curr_weapon.weapon_prise_val === '0_5') {
        entry.find("switch_prise").show()
        if(entry.find("curr_prise_val").value() === undefined) {
            entry.find("curr_prise_val").value("2")
        }
        entry.find("weapon_prise_label").value(Tables.get("prises").get(entry.find("curr_prise_val").value()).name)
    } else {
        entry.find("switch_prise").hide()
        entry.find("curr_prise_val").value(curr_weapon.weapon_prise_val)
        entry.find("weapon_prise_label").value(Tables.get("prises").get(entry.find("curr_prise_val").value()).name)
        log(Tables.get("prises").get(entry.find("curr_prise_val").value()).name)
    }

    entry.find("switch_prise").on("click", function() {
        if(entry.find("curr_prise_val").value() == "2") {
            entry.find("curr_prise_val").value("1")
        } else {
            entry.find("curr_prise_val").value("2")
        }
        entry.find("weapon_prise_label").value(Tables.get("prises").get(entry.find("curr_prise_val").value()).name)
    })


    if(curr_weapon.weapon_name_val === undefined) {
        curr_weapon.weapon_name_val = ""
    }
    if(curr_weapon.weapon_type_val === "cac") {
        entry.find("portee_label").value("Au Contact")
        entry.find("weapon_label").value(":ga_fire-axe: " + curr_weapon.weapon_name_val)
    } else {
        entry.find("portee_label").value(Tables.get("ranges").get(curr_weapon.weapon_portee_val).name)
        entry.find("weapon_label").value(curr_weapon.weapon_name_val)
        entry.find("weapon_label").value(":ga_pistol-gun: " + curr_weapon.weapon_name_val)
    }

    if(curr_weapon.weapon_curr_bonus === undefined || curr_weapon.weapon_curr_bonus > curr_weapon.weapon_bonus_val) {
        curr.value(curr_weapon.weapon_bonus_val)
    }

    entry.find("weapon_label").on("click", function() {
        let skill = (sheet.find("cac_val") as Component<number>).value() + (sheet.find("vig_val") as Component<number>).value()
        let statName: Stat = "vig"

        if(curr_weapon.weapon_type_val !== "cac") {
            skill = (sheet.find("tir_val") as Component<number>).value() + (sheet.find("agi_val") as Component<number>).value()
            statName = "agi"
        }
        sheet.raw().prompt("Modificateurs", "ModifyPopin", function(promptInfo) {
            const roll_expression = buildRoll(
                skill + curr_weapon.weapon_curr_bonus + promptInfo.modify_roll,
                sheet.stress.total(),
                0,
                false
            )
            new RollBuilder(sheet.raw())
                .title(curr_weapon.weapon_name_val)
                .expression(roll_expression)
                .onRoll(stressSuccessHandler(sheet))
                .addAction("Forcer", forceRollHandler(sheet, curr_weapon.weapon_name_val, statName, 0, true))
                .visibility(sheet.find("roll_visibility").value())
                .roll()
        }, initModifyPrompt(sheet))
    })
}

export const onWeaponDelete = function(sheet: PcSheet) {
    return function(entryId: string) {
        const weapons = sheet.weapons()
        delete weapons[entryId]
        sheet.weapons.set(weapons)
    }
}