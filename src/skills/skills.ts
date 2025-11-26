import { stats } from "../globals"
import { effect } from "../utils/utils"

export const setupStats = function(sheet: PcSheet) {

    for(let i=0; i<stats.length; i++) {
        setModfiers(sheet, stats[i])
    }
}

const setModfiers = function(sheet: PcSheet, stat: Stat) {
    sheet.find("min_" + stat).on("click", function(cmp) {
        const statCurrCmp = sheet.find(stat + "_curr") as Component<string>
        if(parseInt(statCurrCmp.value()) > 0) {
            statCurrCmp.value((parseInt(statCurrCmp.value()) - 1).toString())
        } 
        
    })
    sheet.find("plus_" + stat).on("click", function(cmp) {
        const statCurrCmp = sheet.find(stat + "_curr") as Component<string>
        if(parseInt(statCurrCmp.value()) < sheet.stats[stat].max()) {
            statCurrCmp.value((parseInt(statCurrCmp.value()) - 1).toString())
        } 
    })

    effect(function() {
        if(sheet.stats[stat].curr() == sheet.stats[stat].max()) {
            statCurrCmp.removeClass("bg-danger")
        } else {
            statCurrCmp.addClass("bg-danger")
        }
    }, [sheet.stats[stat].curr, sheet.stats[stat].max])
}
