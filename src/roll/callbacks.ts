import { displayHeader, displayStandardDice, displayStressDice, groupDice, groupKeeps } from "./rollDisplayUtils"

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
