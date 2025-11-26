import { skills, stats } from "../globals"
import { signal } from "../utils/utils"

const updateHandler = function<T>(signal: Signal<T>) {
    return function(c: Component<T>) {
        signal.set(c.value())
    }
}

const stringToIntegerUpdateHandler = function<T>(signal: Signal<number>) {
    return function(c: Component<string>) {
        signal.set(parseInt(c.value()))
    }
}

export const pcSheet = function(sheet: Sheet): PcSheet {
    log("[INFO] Start INIT for : " + sheet.properName())
    const _sheet = {} as PcSheet
    _sheet.raw = function() { return sheet }
    _sheet.find = sheet.get
    _sheet.entryStates = {}

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
    const stress_cmp = _sheet.find("stress_val") as Component<number>
    _sheet.stress = signal(stress_cmp.value() as number)
    stress_cmp.on("update", updateHandler(_sheet.stress))

    // sangfroid
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

    // custom roll modifier
    const customRollModifier_cmp = _sheet.find("custom_roll_modifier") as Component<number>
    _sheet.customRollModifier = signal(customRollModifier_cmp.value())
    customRollModifier_cmp.on("update", updateHandler(_sheet.customRollModifier))

    return _sheet
}