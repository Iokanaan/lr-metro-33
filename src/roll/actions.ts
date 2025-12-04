import { buildRoll } from "./builder"
import { stressSuccessHandler } from "./sheetActions"

export const stressForceRollHandler = function(sheet: PcSheet, title: string, stat: Stat) {
    return function(result: DiceResult) {
        for(let i=1; i<=5; i++) {
            if(sheet.find("stress_" + i).value() === false) {
                sheet.find("stress_" + i).value(true)
                break
            }
        }
        forceRollHandler(sheet, title, stat, 1, false)(result)
    }
}

const talentLvl1ForceRollHandler = function(sheet: PcSheet, title: string) {
    return function(result: DiceResult) {
        let stressSuccess = 0
        let nbSuccess = 0
        let nbFailures = 0
        let nbStressFailures = 0
        const standardDice = result.children[0].children[0].all
        const stressDice = result.children[0].children[1].all
        for(let i=0; i<standardDice.length; i++) {
            if(standardDice[i].value === 6) {
                nbSuccess++
            }
        }
        for(let i=0; i<standardDice.length; i++) {
            if(standardDice[i].value === 1) {
                nbFailures++
            }
        }
        for(let i=0; i<stressDice.length; i++) {
            if(stressDice[i].value === 6) {
                stressSuccess++
            }
        }
        for(let i=0; i<stressDice.length; i++) {
            if(stressDice[i].value === 1) {
                nbStressFailures++
            }
        }
        let rb = new RollBuilder(sheet.raw())
            .title(title + " - Forcé")
            .expression(buildRoll(
                standardDice.length - nbSuccess - nbFailures,
                stressDice.length - stressSuccess - nbStressFailures,
                nbSuccess,
                nbFailures,
                nbStressFailures,
                true
            ))
            .onRoll(stressSuccessHandler(sheet))
            .visibility(sheet.find("roll_visibility").value())
        rb.roll()
    }
}


const addTalentRerollAction = function(rb: RollBuilder, sheet: PcSheet, stat: Stat, title: string): RollBuilder {
    const talents = Object.values(sheet.talents())
    for(let i=0;i<talents.length; i++) {
        if(talents[i].talent_title_val === "compassion" && stat === "empathie") {
            if(talents[i].talent_superieur === true) {
                return rb.addAction("Compassion", forceRollHandler(sheet, title, stat, 0, false))
            } else {
                return rb.addAction("Compassion", talentLvl1ForceRollHandler(sheet, title))
            }
        }

        if(talents[i].talent_title_val === "temeraire" && stat === "agi") {
            if(talents[i].talent_superieur === true) {
                return rb.addAction("Téméraire", forceRollHandler(sheet, title, stat, 0, false))
            } else {
                return rb.addAction("Téméraire", talentLvl1ForceRollHandler(sheet, title))
            }
        }

        if(talents[i].talent_title_val === "tenace" && stat === "vig") {
            if(talents[i].talent_superieur === true) {
                return rb.addAction("Tenace", forceRollHandler(sheet, title, stat, 0, false))
            } else {
                return rb.addAction("Tenace", talentLvl1ForceRollHandler(sheet, title))
            }
        }

        if(talents[i].talent_title_val === "inquisiteur" && stat === "esprit") {
            if(talents[i].talent_superieur === true) {
                return rb.addAction("Inquisiteur", forceRollHandler(sheet, title, stat, 0, false))
            } else {
                return rb.addAction("Inquisiteur", talentLvl1ForceRollHandler(sheet, title))
            }
        }
    }
    return rb
}

export const forceRollHandler = function(sheet: PcSheet, title: string, stat: Stat, extraStress: number, repeatable: boolean) {
    return function(result: DiceResult) {
        let stressSuccess = 0
        let nbSuccess = result.children[0].children[0].children[0].children[1].total
        let nbNewSuccess = 0
        let nbFailures = result.children[1].total
        let nbStressFailures = result.children[0].children[1].children[0].children[1].total
        const standardDice = result.children[0].children[0].all
        const stressDice = result.children[0].children[1].all
        for(let i=0; i<standardDice.length; i++) {
            if(standardDice[i].value === 6) {
                nbSuccess++
                nbNewSuccess++
            }
        }
        for(let i=0; i<standardDice.length; i++) {
            if(standardDice[i].value === 1) {
                nbFailures++
            }
        }
        for(let i=0; i<stressDice.length; i++) {
            if(stressDice[i].value === 6) {
                stressSuccess++
            }
            if(stressDice[i].value === 1) {
                nbStressFailures++
            }
        }
        let rb = new RollBuilder(sheet.raw())
            .title(title + " - Forcé")
            .expression(buildRoll(standardDice.length - nbNewSuccess, stressDice.length - stressSuccess + extraStress, nbSuccess, 0, 0, true))
            .onRoll(stressSuccessHandler(sheet))
            .visibility(sheet.find("roll_visibility").value())
        if(repeatable) {
            rb = rb.addAction("Forcer (+1 stress)", stressForceRollHandler(sheet, title, stat))
            rb = addTalentRerollAction(rb, sheet, stat, title)
        }
        rb.roll()
    }
}

