import { skillStatMap, statNames } from "../globals"


export const buildRoll = function(val: number, stress: number, autoSuccess: number, autoFailures: number, autoStressFailures: number, forced: boolean): string {
    let expression = ""
    if(forced) {
        expression = "((" + val + "d6 = 6) + " + autoSuccess + ")[roll,forced] + ((" + stress + "d6 = 1) + " + autoStressFailures + ")[stress] + " + autoFailures + "[autofailure]"
    } else {
        expression = "((" + val + "d6 = 6) + " + autoSuccess + ")[roll] + ((" + stress + "d6 = 1) + " + autoStressFailures + ")[stress] + " + autoFailures + "[autofailure]"
    }
    log("[INFO] " + expression)
    return expression
}

export const standardCallback = function(result: DiceResult): (sheet: Sheet) => void {
    return function(rollSheet: Sheet) {
        const rollsReapeater = rollSheet.get("rolls") as Component<Record<string, RollData>>

        log("[DEBUG] Group dice")
        rollsReapeater.value(groupDice(result, 5))
        log(rollsReapeater.value())

        displayHeader(rollSheet, result, false)

        each(rollsReapeater.value(), function(rollData: RollData, key: string) {
            const line = rollsReapeater.find(key) as Component<RollData>
            for(let i=0; i<rollData.diceResult.length; i++) {
                line.find("dice_" + i).show()
                if(rollData.diceTag[i] == "stress") {
                    displayStressDice(line, rollData.diceResult[i], i)
                } else {
                    displayStandardDice(line, rollData.diceResult[i], i, false)
                }
            }
        })
    }
}

export const basicCallback = function(result: DiceResult): (sheet: Sheet) => void {
    return function(rollSheet: Sheet) {
        rollSheet.get("result").value(result.total)
    }
}

export const forcedCallback = function(result: DiceResult): (sheet: Sheet) => void {
    return function(rollSheet: Sheet) {

        const keepsReapeater = rollSheet.get("keeps") as Component<Record<string, RollData>>
        keepsReapeater.value(groupKeeps(result, 5))
        each(keepsReapeater.value(), function(rollData: RollData, key: string) {
            const line = keepsReapeater.find(key) as Component<RollData>
            for(let i=0; i<rollData.diceResult.length; i++) {
                line.find("dice_" + i).show()
                if(rollData.diceTag[i] == "stress") {
                    displayStressDice(line, rollData.diceResult[i], i)
                } else {
                    displayStandardDice(line, rollData.diceResult[i], i, true)
                }
            }
        })

        const rollsReapeater = rollSheet.get("rolls") as Component<Record<string, RollData>>
        log("[DEBUG] Group dice")
        rollsReapeater.value(groupDice(result, 5))
        log(rollsReapeater.value())

        displayHeader(rollSheet, result, true)

        each(rollsReapeater.value(), function(rollData: RollData, key: string) {
            const line = rollsReapeater.find(key) as Component<RollData>
            for(let i=0; i<rollData.diceResult.length; i++) {
                line.find("dice_" + i).show()
                if(rollData.diceTag[i] == "stress") {
                    displayStressDice(line, rollData.diceResult[i], i)
                } else {
                    displayStandardDice(line, rollData.diceResult[i], i, true)
                }
            }
        })
    }
}

const displayHeader = function(rollSheet: Sheet, result: DiceResult, forced: boolean) {
        const standardDice = result.children[0].children[0].all
        const stressDice = result.children[0].children[1].all
        let nbFailures = 0
        let nbStressSuccess = 0
        for(let i=0; i<standardDice.length; i++) {
            if(standardDice[i].value === 1 && forced) {
                nbFailures++
            }
        }
        for(let i=0; i<stressDice.length; i++) {
            if(stressDice[i].value === 6) {
                nbStressSuccess++
            }
            if(stressDice[i].value === 1) {
                nbFailures++
            }
        }
        rollSheet.get("nb_success").value(result.children[0].children[0].total)
        if(nbFailures > 0) {
            rollSheet.get("failure").show()
            rollSheet.get("nb_failures").value(nbFailures)
        } else {
            rollSheet.get("failure").hide()
        }
        if(nbStressSuccess > 0) {
            rollSheet.get("stress_success").show()
            rollSheet.get("nb_stress_success").value("-" + nbStressSuccess)
        } else {
            rollSheet.get("stress_success").hide()
        }
}

const groupDice = function(result: DiceResult, groupSize: number) {

    const standardDice = result.children[0].children[0].all
    const stressDice = result.children[0].children[1].all

    const rollRange = {
        "min": 0,
        "max" : standardDice.length
    }
    const stressRange = {
        "min": standardDice.length,
        "max" : standardDice.length + stressDice.length
    }
    log("Build")
    return buildMatrix(result.all, groupSize, rollRange, stressRange)
}

const groupBasicDice = function(result: DiceResult, groupSize: number) {
    return buildMatrix(result.all, groupSize,  { "min": 0, "max": result.all.length }, { "min": 0, "max": 0 })
}

const groupKeeps = function(result: DiceResult, groupSize: number) {
    const nbAutoSuccess = result.children[0].children[0].children[0].children[1].total
    const nbAutoStressFailures = result.children[0].children[1].children[0].children[1].total
    const autoFailures = result.children[1].total
    const dice = Array(nbAutoSuccess).fill({ value: 6 })
        .concat(Array(autoFailures).fill({ value: 1 }))
        .concat(Array(nbAutoStressFailures).fill({ value: 1 }))
    const rollRange = {
        "min": 0,
        "max" : nbAutoSuccess + autoFailures
    }
    const stressRange = {
        "min": nbAutoSuccess + autoFailures,
        "max" : nbAutoSuccess + autoFailures + nbAutoStressFailures
    }
    return buildMatrix(dice, groupSize, rollRange, stressRange)
}

const buildMatrix = function(rolls: { "value": number }[], groupSize: number, rollRange: { "min": number, "max": number}, stressRange: { "min": number, "max": number}): Record<string, RollData> {
    const diceMatrix: Record<string, RollData> = {}
    const nbLines = Math.ceil(rolls.length / groupSize);
    for(let i=0; i<nbLines; i++) {
        diceMatrix["l" + i] = {
            "diceResult": [],
            "diceTag": []
        }
        for(let j=i*groupSize; j<rolls.length && j < (i+1)*groupSize; j++) {
            if(j >= rollRange.min && j< rollRange.max) {
                diceMatrix["l" + i].diceTag.push("roll")
            }
            if(j >= stressRange.min && j< stressRange.max) {
                diceMatrix["l" + i].diceTag.push("stress")
            }
            diceMatrix["l" + i].diceResult.push(rolls[j].value)
        }
    }
    return diceMatrix
}

const displayStressDice = function(line: Component<RollData>, diceResult: number, diceIdx: number) {
    line.find("dice_" + diceIdx).addClass("text-warning")
    if(diceResult !== 1 && diceResult !== 6) {
        line.find("dice_" + diceIdx).addClass("opacity-50")
        line.find("result" + diceIdx).addClass("opacity-50")
    }
    if(diceResult === 1) {
        line.find("result" + diceIdx).value(":spider:")
    } else if (diceResult === 6) {
        line.find("result" + diceIdx).value(":crosshairs:")
    } else {
        line.find("result" + diceIdx).value(diceResult)
    }
}

const displayStandardDice = function(line: Component<RollData>, diceResult: number, diceIdx: number, forced: boolean) {
    if(diceResult !== 6 && (diceResult !== 1 || forced === false)) {
        line.find("dice_" + diceIdx).addClass("opacity-50")
        line.find("result" + diceIdx).addClass("opacity-50")
    }
    if (diceResult === 6) {
        line.find("result" + diceIdx).value(":crosshairs:")
    } else if (diceResult === 1 && forced) {
        line.find("result" + diceIdx).value(":spider:")
    } else {
        line.find("result" + diceIdx).value(diceResult)
    }
}

export const stressSuccessHandler = function(sheet: PcSheet) {
    return function(result: DiceResult) {
        const stressDice = result.children[0].children[1].all
        for(let i=0; i<stressDice.length; i++) {
            // Uncheck last stress box on 6
            if(stressDice[i].value === 6) {
                for(let j=5; j>=0; j--) {
                    if(sheet.find("stress_" + j).value() === true) {
                        sheet.find("stress_" + j).value(false)
                        break;
                    }
                }
            }
        }
    }
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
        }
        for(let i=0; i<stressDice.length; i++) {
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

export const radiationCallback = function(result: DiceResult): (sheet: Sheet) => void {
    return function (sheet: Sheet) {
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
    }
}

export const protectionCallback = function(result: DiceResult): (sheet: Sheet) => void {
    return function (sheet: Sheet) {
        let nbSuccess = 0
        let nbBroken = 0
        for(let i=0; i<result.all.length; i++) {
            if(result.all[i].value === 6) {
                nbSuccess++
            }
            if(result.all[i].value === 1) {
                nbBroken++
            }
        }
        sheet.get("nb_broken").value(nbBroken)
        sheet.get("nb_success").value(nbSuccess)
    }
}

export const initModifySkillPrompt = function(sheet: PcSheet, skill: Skill) {
    return function(promptView: Sheet) {
        const talents = Object.values(sheet.talents())
        const defaultStat = skillStatMap[skill]
        let options: Record<string, string> = {}
        options[defaultStat] = statNames[defaultStat];
        for(let i=0;i<talents.length; i++) {
            if(talents[i].talent_title_val === "sens_danger" && skill === "obs") {
                options["empathie"] = statNames["empathie"]
                break
            }
            if(talents[i].talent_title_val === "esquive" && skill === "cac") {
                options["agi"] = statNames["agi"]
                break
            }
            if(talents[i].talent_title_val === "menacant" && skill === "mani") {
                options["vig"] = statNames["vig"]
                break
            }
            if(talents[i].talent_title_val === "psycho" && skill === "mani") {
                options["esprit"] = statNames["esprit"]
                break
            }
        };
        (promptView.get("modify_stat") as ChoiceComponent<Record<string, string>>).setChoices(options)
        if(Object.keys(options).length === 1) {
            promptView.get("modify_stat").hide()
        };
        promptView.get("modify_stat").show()
        promptView.get("modify_stat").value(Object.keys(options)[0])
        initModifyPrompt(sheet)(promptView)
    }
}

export const initModifyPrompt = function(sheet: PcSheet) {
    return function(promptView: Sheet) {
        promptView.get("modify_roll").value(0)
        promptView.get("modify_min").on("click", function() {
            promptView.get("modify_roll").value(promptView.get("modify_roll").value() - 1)
        })
        promptView.get("modify_plus").on("click", function() {
            promptView.get("modify_roll").value(promptView.get("modify_roll").value() + 1)
        })
    }
}

export const consoCallback = function(result: DiceResult): (sheet: Sheet) => void {
    return function (sheet: Sheet) {
        let nbFailures = 0
        for(let i=0; i<result.all.length; i++) {
            if(result.all[i].value === 1) {
                nbFailures++
            }
        }
        if(nbFailures > 0) {
            sheet.get("nb_failures").value("-" + nbFailures)
            sheet.get("nb_failures").removeClass("text-success")
        }
        const consoKeys = ["eau", "nourriture", "energie", "filtre"]
        for(let i=0;i<consoKeys.length;i++) {
            if(result.allTags.includes(consoKeys[i])) {
                sheet.get(consoKeys[i] + "_icon").show()
            } else {
                sheet.get(consoKeys[i] + "_icon").hide()
            }
        }
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