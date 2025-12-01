

export const buildRoll = function(val: number, stress: number, forced: boolean): string {
    let expression = ""
    if(forced) {
        expression = val + "d6[roll,forced] + " + stress + "d6[stress]"
    } else {
        expression = val + "d6[roll] + " + stress + "d6[stress]"
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
        for(let i=0; i<standardDice.length; i++) {
            if(standardDice[i].value === 6) {
                nbSuccess++
            } else if (standardDice[i].value === 1 && forced === true) {
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
        rollSheet.get("nb_success").value(nbSuccess + " succès")
        if(nbSuccess > 0) {
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
    const nbLines = Math.ceil(result.all.length / groupSize);
    const standardDice = result.children[0].all
    const stressDice = result.children[1].all
    const rollRange = {
        "min": 0,
        "max" : standardDice.length
    }
    const stressRange = {
        "min": standardDice.length,
        "max" : standardDice.length + stressDice.length
    }
    for(let i=0; i<nbLines; i++) {
        diceMatrix["l" + i] = {
            "diceResult": [],
            "diceTag": []
        }
        for(let j=i*groupSize; j<result.all.length && j < (i+1)*groupSize; j++) {
            if(j >= rollRange.min && j< rollRange.max) {
                diceMatrix["l" + i].diceTag.push("roll")
            }
            if(j >= stressRange.min && j< stressRange.max) {
                diceMatrix["l" + i].diceTag.push("stress")
            }
            result.all[j].tags
            diceMatrix["l" + i].diceResult.push(result.all[j])
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

export const forceRollHandler = function(sheet: PcSheet, title: string) {
    return function(result: DiceResult) {
        let stressSuccess = 0
        const standardDice = result.children[0].all
        const stressDice = result.children[1].all
        for(let i=0; i<stressDice.length; i++) {
            if(stressDice[i].value === 6) {
                stressSuccess++
            }
        }
        new RollBuilder(sheet.raw())
            .title(title + " - Forcé")
            .expression(buildRoll(standardDice.length, stressDice.length - stressSuccess, true))
            .onRoll(stressSuccessHandler(sheet))
            .visibility(sheet.find("roll_visibility").value())
            .roll()
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
        for(let i=0; i<result.all.length; i++) {
            log("Die " + i + " value: " + result.all[i].value)
            if(result.all[i].value === 6) {
                nbSuccess++
            }
        }
        sheet.get("nb_success").value(nbSuccess)
        if(nbSuccess >= 1) {
            sheet.get("success").show()
            sheet.get("failure").hide()
        } else {
            sheet.get("success").hide()
            sheet.get("failure").show()
        }
    }
}