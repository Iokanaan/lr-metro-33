

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

export const standardCallback = function(result: DiceResult): (sheet: Sheet) => void {
    return function(rollSheet: Sheet) {
        const rollsReapeater = rollSheet.get("rolls") as Component<Record<string, RollData>>
        const standardDice = result.children[0].all
        const stressDice = result.children[1].all
        rollsReapeater.value(groupDice(result, 5))
        each(rollsReapeater.value(), function(rollData: RollData, key: string) {
            const line = rollsReapeater.find(key) as Component<RollData>
            for(let i=0; i<rollData.diceResult.length; i++) {
                line.find("dice_" + i).show()
                if(rollData.diceTag[i] == "stress") {
                    displayStressDice(line, rollData.diceResult[i], i)
                } else {
                    displayStandardDice(line, rollData.diceResult[i], i)
                }
            } 
        })
    }
}

const groupDice = function(result: DiceResult, groupSize: number) {
    const diceMatrix: Record<string, RollData> = {}
    const nbLines = Math.ceil(result.all.length / groupSize);
    const rollRange = {
        "min": 0,
        "max" : result.children[0].all.length
    } 
    const stressRange = {
        "min": result.children[0].all.length,
        "max" : result.children[0].all.length + result.children[1].all.length
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

const displayStandardDice = function(line: Component<RollData>, diceResult: DiceResult, diceIdx: number) {
    if(diceResult.value !== 6) {
        line.find("dice_" + diceIdx).addClass("opacity-50")
        line.find("result" + diceIdx).addClass("opacity-50")
    }
    if (diceResult.value === 6) {
        line.find("result" + diceIdx).value(":crosshairs:")
    } else {
        line.find("result" + diceIdx).value(diceResult.value)
    }
}

export const stressSuccessHandler = function(sheet: PcSheet) {
    return function(result: DiceResult) {
        for(let i=0; i<result.children[1].all.length; i++) {
            if(result.children[1].values[i] === 6) {
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
        for(let i=0; i<result.children[1].all.length; i++) {
            if(result.children[1].all[i].value === 6) {
                stressSuccess++
            }
        }
        new RollBuilder(sheet.raw())
            .title(title + " - Forcé")
            .expression(buildRoll(result.children[0].all.length, result.children[1].all.length - stressSuccess, true))
            .onRoll(stressSuccessHandler(sheet))
            .roll()
    }
}