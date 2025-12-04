import { skills, skillStatMap, stats } from "../globals"
import { forceRollHandler } from "../roll/actions"
import { buildRoll } from "../roll/builder"
import { initModifyPrompt, initModifySkillPrompt } from "../roll/prompts"
import { stressSuccessHandler } from "../roll/sheetActions"
import { effect } from "../utils/utils"



export const setupStats = function(sheet: PcSheet) {

    sheet.find("edit_stats").on("click", function(cmp) {
        sheet.editMode.set(true)
        cmp.hide()
        sheet.find("close_edit_stats").show()
    })

    sheet.find("close_edit_stats").on("click", function(cmp) {
        sheet.editMode.set(false)
        cmp.hide()
        sheet.find("edit_stats").show()
    })


    for(let i=0; i<stats.length; i++) {
        setupStat(sheet, stats[i])
    }

    for(let i=0; i<skills.length; i++) {
        setupSkill(sheet, skills[i])
    }
}

const setupSkill = function(sheet: PcSheet, skill: Skill) {
    const skillCmp = sheet.find(skill + "_label") as Component<number>
    skillCmp.on("click", function() {
        sheet.raw().prompt("Modificateurs", "ModifyPopin", function(promptInfo) {
            new RollBuilder(sheet.raw())
                .title(skillCmp.text())
                .expression(buildRoll(sheet.stats[promptInfo.modify_stat as Stat].curr() + sheet.skills[skill]() + promptInfo.modify_roll, sheet.stress.total(), 0, 0, 0, false))
                .onRoll(stressSuccessHandler(sheet))
                .addAction("Forcer", forceRollHandler(sheet, skillCmp.text(), promptInfo.modify_stat, 0, true))
                .visibility(sheet.find("roll_visibility").value())
                .roll()
        }, initModifySkillPrompt(sheet, skill))
    })
}

export const setupBaseInfo = function(sheet: PcSheet) {
    const archetypeValCmp = sheet.find("arch_val") as Component<string>
    const archetypeLabelCmp = sheet.find("arch_label") as Component<string>
    const ageValCmp = sheet.find("age_val") as Component<string>
    const ageLabelCmp = sheet.find("age_label") as Component<string>

    effect(function() {
        if(sheet.editMode()) {
            archetypeValCmp.show()
            archetypeLabelCmp.hide()
            ageValCmp.show()
            ageLabelCmp.hide()
        } else {
            archetypeValCmp.hide()
            archetypeLabelCmp.show()
            ageValCmp.hide()
            ageLabelCmp.show()
        }
    }, [sheet.editMode])

    effect(function() {
        archetypeLabelCmp.text(Tables.get("roles").get(sheet.archetype()).name)
    }, [sheet.archetype])

    effect(function() {
        ageLabelCmp.text(sheet.age().toString())
    }, [sheet.age])
}




const setupStat = function(sheet: PcSheet, stat: Stat) {
    const statCurrCmp = sheet.find(stat + "_curr") as Component<number>
    const statMaxCmp = sheet.find(stat + "_val") as Component<number>
    const statMinCmp = sheet.find("min_" + stat) as Component<void>
    const statPlusCmp = sheet.find("plus_" + stat) as Component<void>

    statMinCmp.on("click", function() {
        if(statCurrCmp.value() > 0) {
            statCurrCmp.value(statCurrCmp.value() - 1)
        }
    })

    statPlusCmp.on("click", function() {
        if(statCurrCmp.value() < sheet.stats[stat].max()) {
            statCurrCmp.value(statCurrCmp.value() + 1)
        }
    })

    effect(function() {
        if(sheet.editMode()) {
            statMaxCmp.show()
            statCurrCmp.hide()
            statPlusCmp.addClass("opacity-0")
            statMinCmp.addClass("opacity-0")
        } else {
            statMaxCmp.hide()
            statCurrCmp.show()
            if(sheet.stats[stat].curr() == sheet.stats[stat].max()) {
                statCurrCmp.removeClass("bg-danger")
                statPlusCmp.addClass("opacity-0")
            } else {
                statCurrCmp.addClass("bg-danger")
                statPlusCmp.removeClass("opacity-0")
            }
            if(sheet.stats[stat].curr() == 0) {
                statMinCmp.addClass("opacity-0")
            } else {
                statMinCmp.removeClass("opacity-0")
            }
        }
    }, [sheet.stats[stat].curr, sheet.stats[stat].max, sheet.editMode])

    effect(function() {
        if(sheet.stats[stat].curr() > sheet.stats[stat].max()) {
            statCurrCmp.value(sheet.stats[stat].max())
        }
    }, [sheet.stats[stat].curr, sheet.stats[stat].max])

    const rollStatCmp = sheet.find(stat + "_label") as Component<string>

    rollStatCmp.on("click", function(cmp) {
        sheet.raw().prompt("Modificateurs", "ModifyPopin", function(promptInfo) {
            new RollBuilder(sheet.raw())
                .title(cmp.text())
                .expression(buildRoll(sheet.stats[stat].curr() + promptInfo.modify_roll, sheet.stress.total(), 0, 0, 0, false))
                .onRoll(stressSuccessHandler(sheet))
                .addAction("Forcer", forceRollHandler(sheet, cmp.text(), stat, 0, true))
                .roll()
        }, initModifyPrompt())
    })
}

export const setupEncombrement = function(sheet: PcSheet) {
    effect(function() {
        if(sheet.find("enc_txt").value() !== sheet.encombrement() + " / " + sheet.max_encombrement()) {
            sheet.find("enc_txt").value(sheet.encombrement() + " / " + sheet.max_encombrement())
        }
        if(sheet.max_encombrement() < sheet.encombrement() && 4 * sheet.max_encombrement() >= sheet.encombrement()) {
            sheet.find("enc_txt").addClass("text-danger")
        } else {
            sheet.find("enc_txt").removeClass("text-danger")
        }
        if(4 * sheet.max_encombrement() < sheet.encombrement()) {
            sheet.find("enc_container").addClass("bg-danger")
            sheet.find("enc_container").removeClass("highlight-1")
        } else {
            sheet.find("enc_container").removeClass("bg-danger")
            sheet.find("enc_container").addClass("highlight-1")
        }
    }, [sheet.encombrement, sheet.max_encombrement])
}

export const setupProtection = function(sheet: PcSheet) {
    effect(function() {
        sheet.find("prot_txt").value(sheet.protection_total())
    }, [sheet.protection_total])
}

export const setupProtectionRoll = function(sheet: PcSheet) {
    const protCmp = sheet.find("prot_label") as Component<string>
        protCmp.on("click", function(cmp) {
            sheet.raw().prompt("Modificateurs", "ModifyPopin", function(promptInfo) {
            new RollBuilder(sheet.raw())
                .title(cmp.text())
                .expression("(" + (sheet.protection_total() + promptInfo.modify_roll) + "d6)[prot]")
                .visibility(sheet.find("roll_visibility").value())
                .roll()
        }, initModifyPrompt())
    })
}

export const setupSangFroid = function(sheet: PcSheet) {
    effect(function() {
        for(let i=6; i<=7; i++) {
            if(sheet.sangfroid.max() < i) {
                sheet.find("sangfroid_" + i).hide()
                if(sheet.find("sangfroid_" + i).value() === true) {
                    sheet.find("sangfroid_" + i).value(false)
                }
            } else {
                sheet.find("sangfroid_" + i).show()
            }
        }
    }, [sheet.sangfroid.max])
}

export const setupConso = function(sheet: PcSheet) {
    const consoKeys = Object.keys(sheet.consommables) as Consommable[]
    for(let i=0;i<consoKeys.length;i++) {
        consoRoll(sheet, consoKeys[i])
    }
}

const consoRoll = function(sheet: PcSheet, key: Consommable) {
    const consoCmp = sheet.find("conso_" +key + "_label") as Component<string>
    consoCmp.on("click", function(cmp) {
        if(sheet.consommables[key]() > 0) {
            new RollBuilder(sheet.raw())
                .title(cmp.text())
                .expression(Math.min(sheet.consommables[key](), 5) + "d6[conso," + key + "]")
                .visibility(sheet.find("roll_visibility").value())
                .onRoll(function(result) {
                    let nbConso = 0;
                    for(let i=0;i<result.all.length;i++) {
                        if(result.all[i].value === 1) {
                            nbConso += 1
                        }
                    }
                    sheet.find("conso_" + key + "_val").value(Math.max(sheet.find("conso_" + key + "_val").value() as number - nbConso, 0))
                })
                .roll()
        }
    })
}