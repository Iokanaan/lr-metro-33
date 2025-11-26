import { buildRoll } from "../../roll/roll"
import { skills, skillStatMap, stats } from "../globals"
import { effect } from "../utils/utils"

export const setupStats = function(sheet: PcSheet) {

    for(let i=0; i<stats.length; i++) {
        setupStat(sheet, stats[i])
    }

    for(let i=0; i<skills.length; i++) {
        setupSkill(sheet, skills[i])
    }
}

const setupSkill = function(sheet: PcSheet, skill: Skill) {
    const skillCmp = sheet.find(skill + "_val") as Component<number>
    const skillStat = skillStatMap[skill]

    skillCmp.on("click", function() {
        new RollBuilder(sheet)
            .title(skillCmp.text())
            .expression(buildRoll(sheet.stats[skillStat].curr() + sheet.skills[skill]() + sheet.customRollModifier(), sheet.stress(), false))
            .roll()

        sheet.find("roll_modifier").value(0)
    })
}




const setupStat = function(sheet: PcSheet, stat: Stat) {
    const statCurrCmp = sheet.find(stat + "_curr") as Component<number>
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
        if(sheet.stats[stat].curr() == sheet.stats[stat].max()) {
            statCurrCmp.removeClass("bg-danger")
            statPlusCmp.hide()
        } else {
            statCurrCmp.addClass("bg-danger")
            statPlusCmp.show()
        }
        if(sheet.stats[stat].curr() == 0) {
            statMinCmp.hide()
        }
    }, [sheet.stats[stat].curr, sheet.stats[stat].max])

    const rollStatCmp = sheet.find(stat + "_label") as Component<string>

    rollStatCmp.on("click", function(cmp) {
        new RollBuilder(sheet)
            .title(cmp.text())
            .expression(buildRoll(sheet.stats[stat].curr(), sheet.stress(), false))
            .roll()

        sheet.find("roll_modifier").value(0)
    })
}
