export const displayHeader = function(rollSheet: Sheet, result: DiceResult, forced: boolean) {
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

export const groupDice = function(result: DiceResult, groupSize: number) {

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

export const groupBasicDice = function(result: DiceResult, groupSize: number) {
    return buildMatrix(result.all, groupSize,  { "min": 0, "max": result.all.length }, { "min": 0, "max": 0 })
}

export const groupKeeps = function(result: DiceResult, groupSize: number) {
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

export const displayStressDice = function(line: Component<RollData>, diceResult: number, diceIdx: number) {
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

export const displayStandardDice = function(line: Component<RollData>, diceResult: number, diceIdx: number, forced: boolean) {
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
