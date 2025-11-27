import { skills, stats } from "../globals"
import { handleRadCheckbox } from "../radiation/radiation"
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

    // base info
    const archetypeCmp = _sheet.find("arch_val") as Component<string>
    _sheet.archetype = signal(archetypeCmp.value())
    archetypeCmp.on("update", updateHandler<string>(_sheet.archetype))

    const ageCmp = _sheet.find("age_val") as Component<number>
    _sheet.age = signal(ageCmp.value())
    ageCmp.on("update", updateHandler<number>(_sheet.age))

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

    const tempRadDetail = [] as Signal<boolean>[]
    const perm_rad_cmp = _sheet.find("rad_perm_val") as Component<number>
    if(perm_rad_cmp.value() === undefined) {
        perm_rad_cmp.value(0)
    }
    const perm_rad = signal(perm_rad_cmp.value())

    for(let i=1;i<=10;i++) {
        const temp_rad_cmp = _sheet.find("rad_" + i) as Component<boolean>
        const sig = signal(temp_rad_cmp.value())
        tempRadDetail.push(sig)
    }
    _sheet.radiation = {
        "temp": {
            "detail": tempRadDetail,
            "total": computed(function() {
                let total = 0
                for(let i=0; i<tempRadDetail.length;i++) {
                    total += tempRadDetail[i]() ? 1 : 0
                }
                return total
            }, tempRadDetail)
        },
        "perm": perm_rad
    }
    perm_rad_cmp.on("update", updateHandler(_sheet.radiation.perm))

    for(let i=1;i<=10;i++) {
        handleRadCheckbox(_sheet, i)
    }



    const conso_eau_cmp = _sheet.find("conso_eau_val") as Component<number>
    const conso_nourr_cmp = _sheet.find("conso_nourr_val") as Component<number>
    const conso_energie_cmp = _sheet.find("conso_energie_val") as Component<number>
    const conso_filtre_cmp = _sheet.find("conso_filtre_val") as Component<number>
    if(conso_eau_cmp.value() === undefined) {
        conso_eau_cmp.value(0)
    }
    if(conso_nourr_cmp.value() === undefined) {
        conso_nourr_cmp.value(0)
    }
    if(conso_energie_cmp.value() === undefined) {
        conso_energie_cmp.value(0)
    }
    if(conso_filtre_cmp.value() === undefined) {
        conso_filtre_cmp.value(0)
    }

    _sheet.consommables = {
        "eau": signal(conso_eau_cmp.value()),
        "nourriture": signal(conso_nourr_cmp.value()),
        "energie": signal(conso_energie_cmp.value()),
        "filtre": signal(conso_filtre_cmp.value())
    }
    conso_eau_cmp.on("update", updateHandler(_sheet.consommables.eau))
    conso_nourr_cmp.on("update", updateHandler(_sheet.consommables.nourriture))
    conso_energie_cmp.on("update", updateHandler(_sheet.consommables.energie))
    conso_filtre_cmp.on("update", updateHandler(_sheet.consommables.filtre))

    // objets
    const objets = _sheet.find("objets") as Component<Record<string, Item>>
    if(objets.value() === undefined) {
        objets.value({})
    }
    _sheet.objets = signal(objets.value())

    // armes
    const weapons = _sheet.find("weapons") as Component<Record<string, Weapon>>
    if(weapons.value() === undefined) {
        weapons.value({})
    }
    _sheet.armes = signal(weapons.value())

    // protections
    const protections = _sheet.find("protections") as Component<Record<string, Protection>>
    if(protections.value() === undefined) {
        protections.value()
    }
    _sheet.protections = signal(protections.value())

    // talents
    const talents = _sheet.find("talents") as Component<Record<string, Talent>>
    if(talents.value() === undefined) {
        talents.value({})
    }
    _sheet.talents = signal(talents.value())

    // encombrement
    _sheet.encombrement = computed(function() {
        return 0 // TODO
    }, [
        _sheet.consommables.eau,
        _sheet.consommables.nourriture,
        _sheet.consommables.energie,
        _sheet.consommables.filtre,
        _sheet.objets,
        _sheet.armes,
        _sheet.protections
    ])
    _sheet.max_encombrement = computed(function() {
        return 0 // TODO
    }, [
        _sheet.stats.vig.max
    ])

    // protection
    _sheet.protection_total = computed(function() {
        return 0 // TODO
    }, [
        _sheet.protections
    ])

    // custom roll modifier
    const customRollModifier_cmp = _sheet.find("modif_val") as Component<number>
    _sheet.customRollModifier = signal(customRollModifier_cmp.value())
    customRollModifier_cmp.on("update", updateHandler(_sheet.customRollModifier))

    return _sheet
}