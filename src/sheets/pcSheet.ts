import { skills, stats } from "../globals"
import { computed, signal } from "../utils/utils"

const updateHandler = function<T>(signal: Signal<T>) {
    return function(c: Component<T>) {
        log("Update " + c.value())
        signal.set(c.value())
    }
}

export const pcSheet = function(sheet: Sheet): PcSheet {
    log("[INFO] Start INIT for : " + sheet.properName())
    const _sheet = {} as PcSheet
    _sheet.raw = function() { return sheet }
    _sheet.find = sheet.get
    _sheet.entryStates = {}

    // edit mode
    _sheet.editMode = signal(false)

    // skills
    log("[INFO] Recording skills for : " + sheet.properName())
    _sheet.skills = {} as any
    for(let i=0; i<skills.length; i++) {
        const skill_val = _sheet.find(skills[i] + "_val") as Component<number>
        _sheet.skills[skills[i]] = signal(skill_val.value())
        skill_val.on("update", updateHandler<number>(_sheet.skills[skills[i]]))
    }

    // stats
    log("[INFO] Recording stats for : " + sheet.properName())
    _sheet.stats = {} as any
    for(let i=0; i<stats.length; i++) {
        const stats_val = _sheet.find(stats[i] + "_val") as Component<number>
        const stats_curr = _sheet.find(stats[i] + "_curr") as Component<number>
        _sheet.stats[stats[i]] = {
            "max": signal(stats_val.value()),
            "curr": signal(stats_curr.value())
        }
        stats_curr.on("update", updateHandler<number>(_sheet.stats[stats[i]].curr))
        stats_val.on("update", updateHandler<number>(_sheet.stats[stats[i]].max))
    }

    // stress
    const stressDetail = [] as Signal<boolean>[] 

    for(let i=1;i<=5;i++) {
        const stress_cmp = _sheet.find("stress_" + i) as Component<boolean>
        const sig = signal(stress_cmp.value())
        stressDetail.push(sig)
        stress_cmp.on("update", updateHandler(sig))
    }
    _sheet.stress = { 
        "detail": stressDetail,
        "total": computed(function() {
            let total = 0
            for(let i=0; i<stressDetail.length;i++) {
                total += stressDetail[i]() ? 1 : 0
            }
            return total
        }, stressDetail)
    }

 /*   // sangfroid
    const sangfroid_curr = _sheet.find("sangfroid_curr") as Component<number>
    const sangfroid_max = _sheet.find("sangfroid_max") as Component<number>
    if(sangfroid_max.value() === undefined) {
        sangfroid_max.value(5)
    }
    _sheet.sangfroid = {
        "max": signal(sangfroid_max.value()),
        "curr": signal(sangfroid_curr.value())
    }
    sangfroid_curr.on("update", updateHandler(_sheet.sangfroid.curr))
    sangfroid_max.on("update", updateHandler(_sheet.sangfroid.max))
*/
    // custom roll modifier
    const customRollModifier_cmp = _sheet.find("modif_val") as Component<number>
    _sheet.customRollModifier = signal(customRollModifier_cmp.value())
    customRollModifier_cmp.on("update", updateHandler(_sheet.customRollModifier))

    return _sheet
}