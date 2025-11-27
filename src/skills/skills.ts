import { buildRoll } from "../roll/roll"
import { skills, skillStatMap, stats } from "../globals"
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
    const skillStat = skillStatMap[skill]

    skillCmp.on("click", function() {
        new RollBuilder(sheet.raw())
            .title(skillCmp.text())
            .expression(buildRoll(sheet.stats[skillStat].curr() + sheet.skills[skill]() + sheet.customRollModifier(), sheet.stress.total(), false))
            .roll()

        sheet.find("modif_val").value(0)
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
        new RollBuilder(sheet.raw())
            .title(cmp.text())
            .expression(buildRoll(sheet.stats[stat].curr() + sheet.customRollModifier(), sheet.stress.total(), false))
            .roll()

        sheet.find("modif_val").value(0)
    })
}

export const setupEncombrement = function(sheet: PcSheet) {
    effect(function() {
        sheet.find("enc_txt").value(sheet.encombrement() + " / " + sheet.max_encombrement())
    }, [sheet.encombrement, sheet.max_encombrement])
}

export const setupProtection = function(sheet: PcSheet) {
    effect(function() {
        sheet.find("prot_txt").value(sheet.protection_total())
    }, [sheet.protection_total])
}