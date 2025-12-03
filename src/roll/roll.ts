import { skillStatMap, statNames } from "../globals"


export const buildRoll = function(val: number, stress: number, autoSuccess: number, forced: boolean): string {
    let expression = ""
    if(forced) {
        expression = "((" + val + "d6 = 6) + " + autoSuccess + ")[roll,forced] + " + stress + "d6[stress]"
    } else {
        expression = "((" + val + "d6 = 6) + " + autoSuccess + ")[roll] + " + stress + "d6[stress]"
    }
    log("Roll " + expression)
    return expression
}

export const standardCallback = function(result: DiceResult, forced: boolean): (sheet: Sheet) => void {
    return function(rollSheet: Sheet) {
        const rollsReapeater = rollSheet.get("rolls") as Component<Record<string, RollData>>
        const standardDice = result.children[0].all
        const stressDice = result.children[1].all
        rollsReapeater.value(groupDice(result, 5))
        let nbSuccess = 0
        let nbFailures = 0
        let nbStressSuccess = 0
        log(standardDice)
        for(let i=0; i<standardDice.length; i++) {
            if(standardDice[i].value === 1 && forced === true) {
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
        rollSheet.get("nb_success").value(result.children[0].total + " succès")
        if(result.children[0].total > 0) {
            rollSheet.get("nb_success").addClass("bg-success")
        } else {
            rollSheet.get("nb_success").addClass("bg-danger")
        }
        if(nbFailures > 0) {
            rollSheet.get("failure").show()
            rollSheet.get("nb_failures").value(nbFailures + " affliction(s)")
        } else {
            rollSheet.get("failure").hide()
        }
        if(nbStressSuccess > 0) {
            rollSheet.get("stress_success").show()
            rollSheet.get("nb_stress_success").value(nbStressSuccess + " stress éliminé(s)")
        } else {
            rollSheet.get("stress_success").hide()
        }

        each(rollsReapeater.value(), function(rollData: RollData, key: string) {
            const line = rollsReapeater.find(key) as Component<RollData>
            for(let i=0; i<rollData.diceResult.length; i++) {
                line.find("dice_" + i).show()
                if(rollData.diceTag[i] == "stress") {
                    displayStressDice(line, rollData.diceResult[i], i)
                } else {
                    displayStandardDice(line, rollData.diceResult[i], i, forced)
                }
            }
        })
    }
}

const groupDice = function(result: DiceResult, groupSize: number) {
    const diceMatrix: Record<string, RollData> = {}

    const standardDice = result.children[0].all
    const stressDice = result.children[1].all
    const nbAutoSuccess = result.children[0].children[0].children[1].total
    const rollsWithAuto = Array(nbAutoSuccess).fill({ "value": 6 }).concat(result.all)
    const nbLines = Math.ceil(rollsWithAuto.length / groupSize);
    const rollRange = {
        "min": 0,
        "max" : standardDice.length + nbAutoSuccess
    }
    const stressRange = {
        "min": standardDice.length + nbAutoSuccess,
        "max" : standardDice.length + nbAutoSuccess + stressDice.length
    }
    for(let i=0; i<nbLines; i++) {
        diceMatrix["l" + i] = {
            "diceResult": [],
            "diceTag": []
        }
        for(let j=i*groupSize; j<rollsWithAuto.length && j < (i+1)*groupSize; j++) {
            if(j >= rollRange.min && j< rollRange.max) {
                diceMatrix["l" + i].diceTag.push("roll")
            }
            if(j >= stressRange.min && j< stressRange.max) {
                diceMatrix["l" + i].diceTag.push("stress")
            }
            diceMatrix["l" + i].diceResult.push(rollsWithAuto[j])
        }
    }
    return diceMatrix
}

const displayStressDice = function(line: Component<RollData>, diceResult: DiceResult, diceIdx: number) {
    line.find("dice_" + diceIdx).addClass("text-warning")
    if(diceResult.value !== 1 && diceResult.value !== 6) {
        line.find("dice_" + diceIdx).addClass("opacity-50")
        line.find("result" + diceIdx).addClass("opacity-50")
    }
    if(diceResult.value === 1) {
        line.find("result" + diceIdx).value(":spider:")
    } else if (diceResult.value === 6) {
        line.find("result" + diceIdx).value(":crosshairs:")
    } else {
        line.find("result" + diceIdx).value(diceResult.value)
    }
}

const displayStandardDice = function(line: Component<RollData>, diceResult: DiceResult, diceIdx: number, forced: boolean) {
    if(diceResult.value !== 6 && (diceResult.value !== 1 || forced === false)) {
        line.find("dice_" + diceIdx).addClass("opacity-50")
        line.find("result" + diceIdx).addClass("opacity-50")
    }
    if (diceResult.value === 6) {
        line.find("result" + diceIdx).value(":crosshairs:")
    } else if (diceResult.value === 1 && forced) {
        line.find("result" + diceIdx).value(":spider:")
    } else {
        line.find("result" + diceIdx).value(diceResult.value)
    }
}

export const stressSuccessHandler = function(sheet: PcSheet) {
    return function(result: DiceResult) {
        const stressDice = result.children[1].all
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

export const forceRollHandler = function(sheet: PcSheet, title: string, extraStress: number, repeatable: boolean) {
    return function(result: DiceResult) {
        let stressSuccess = 0
        let nbSuccess = 0
        const standardDice = result.children[0].all
        const stressDice = result.children[1].all
        for(let i=0; i<standardDice.length; i++) {
            if(standardDice[i].value === 6) {
                nbSuccess++
            }
        }
        for(let i=0; i<stressDice.length; i++) {
            if(stressDice[i].value === 6) {
                stressSuccess++
            }
        }
        let rb = new RollBuilder(sheet.raw())
            .title(title + " - Forcé")
            .expression(buildRoll(standardDice.length - nbSuccess, stressDice.length - stressSuccess + extraStress, nbSuccess, true))
            .onRoll(stressSuccessHandler(sheet))
            .visibility(sheet.find("roll_visibility").value())
        if(repeatable) {
            rb = rb.addAction("Forcer (+1 stress)", stressForceRollHandler(sheet, title))
        }
        rb.roll()
    }
}

export const stressForceRollHandler = function(sheet: PcSheet, title: string) {
    return function(result: DiceResult) {
        for(let i=1; i<=5; i++) {
            log("loop stress " + sheet.find("stress_" + 1).value())
            if(sheet.find("stress_" + i).value() === false) {
                log("add stress")
                sheet.find("stress_" + i).value(true)
                break
            }
        }
        forceRollHandler(sheet, title, 1, false)(result)
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
            log("Die " + i + " value: " + result.all[i].value)
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
        if(Object.keys(options).length === 1) {
            promptView.get("modify_stat").hide()
        } else {
            (promptView.get("modify_stat") as ChoiceComponent<Record<string, string>>).setChoices(options)
            promptView.get("modify_stat").show()
            promptView.get("modify_stat").value(Object.keys(options)[0])
        }
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
            log("Die " + i + " value: " + result.all[i].value)
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