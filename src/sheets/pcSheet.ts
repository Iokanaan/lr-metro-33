import { skills, stats } from "../globals"
import { handleRadCheckbox } from "../radiation/radiation"
import { computed, signal, weightConverter } from "../utils/utils"

const updateHandler = function<T>(signal: Signal<T>) {
    return function(c: Component<T>) {
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
    const conso_nourr_cmp = _sheet.find("conso_nourriture_val") as Component<number>
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
    const objets = _sheet.find("objets_divers") as Component<Record<string, Item>>
    if(objets.value() === undefined) {
        objets.value({})
    }
    _sheet.items = signal(objets.value())

    // armes
    const weapons = _sheet.find("weapons") as Component<Record<string, Weapon>>
    if(weapons.value() === undefined) {
        weapons.value({})
    }
    _sheet.weapons = signal(weapons.value())

    // protections
    const protections = _sheet.find("protections") as Component<Record<string, Protection>>
    if(protections.value() === undefined) {
        protections.value({})
    }
    _sheet.protections = signal(protections.value())

    // talents
    const talents = _sheet.find("talents") as Component<Record<string, Talent>>
    if(talents.value() === undefined) {
        talents.value({})
    }
    _sheet.talents = signal(talents.value())

    // blessures
    const wounds = _sheet.find("wounds") as Component<Record<string, Wound>>
    if(wounds.value() === undefined) {
        wounds.value({})
    }
    _sheet.wounds = signal(wounds.value())

    // blessures
    const traumas = _sheet.find("traumas") as Component<Record<string, Trauma>>
    if(traumas.value() === undefined) {
        traumas.value({})
    }
    _sheet.traumas = signal(traumas.value())

    // encombrement
    _sheet.encombrement = computed(function() {
        let enc = 0
        if(_sheet.consommables.eau() >= 7) {
            enc+=3
        } else if(_sheet.consommables.eau() >= 5) {
            enc+=2
        } else if(_sheet.consommables.eau() >= 1) {
            enc+=1
        }
        if(_sheet.consommables.nourriture() >= 7) {
            enc+=3
        } else if(_sheet.consommables.nourriture() >= 5) {
            enc+=2
        } else if(_sheet.consommables.nourriture() >= 1) {
            enc+=1
        }
        if(_sheet.consommables.filtre() >= 9) {
            enc+=3
        } else if(_sheet.consommables.filtre() >= 6) {
            enc+=2
        } else if(_sheet.consommables.filtre() >= 4) {
            enc+=1
        }
        if(_sheet.consommables.energie() >= 9) {
            enc+=3
        } else if(_sheet.consommables.energie() >= 6) {
            enc+=2
        } else if(_sheet.consommables.energie() >= 4) {
            enc+=1
        }
        const items = Object.values(_sheet.items()) as Item[]
        for(let i=0; i<items.length; i++) {
            enc += weightConverter(items[i].weight)
        }
        const weapons = Object.values(_sheet.weapons()) as Weapon[]
        for(let i=0; i<weapons.length; i++) {
            enc += weightConverter(weapons[i].weapon_poids_val)
        }
        const protections = Object.values(_sheet.protections()) as Protection[]
        for(let i=0; i<protections.length; i++) {
            enc += weightConverter(protections[i].protection_poids)
        }
        return enc // TODO
    }, [
        _sheet.consommables.eau,
        _sheet.consommables.nourriture,
        _sheet.consommables.energie,
        _sheet.consommables.filtre,
        _sheet.items,
        _sheet.weapons,
        _sheet.protections
    ])
    _sheet.max_encombrement = computed(function() {
        const talents = Object.values(_sheet.talents())
        let maxEnc = _sheet.stats.vig.max() * 2
        for(let i=0; i<talents.length; i++) {
            talents[i]
            if(talents[i].talent_title_val === "bete_somme") {
                maxEnc = maxEnc * 2
                break
            }
        }
        return maxEnc
    }, [
        _sheet.stats.vig.max,
        _sheet.talents
    ])

    // protection
    _sheet.protection_total = computed(function() {
        if(_sheet.protections() === undefined) {
            return 0
        }
        const values = Object.values(_sheet.protections())
        let prot_total = 0
        for(let i=0; i<values.length; i++) {
            prot_total += values[i].curr_protection_bonus
        }
        return prot_total
    }, [
        _sheet.protections
    ])

    // sangfroid
    const sangfroidDetail = [] as Signal<boolean>[]

    for(let i=1;i<=5;i++) {
        const sangfroid_cmp = _sheet.find("sangfroid_" + i) as Component<boolean>
        const sig = signal(sangfroid_cmp.value())
        sangfroidDetail.push(sig)
        sangfroid_cmp.on("update", updateHandler(sig))
    }
    _sheet.sangfroid = {
        "detail": sangfroidDetail,
        "curr": computed(function() {
            let total = 0
            for(let i=0; i<sangfroidDetail.length;i++) {
                total += sangfroidDetail[i]() ? 1 : 0
            }
            return total
        }, sangfroidDetail),
        "max": computed(function() {
            let max = 5
            const talents = Object.values(_sheet.talents())
            for(let i=0; i<talents.length; i++) {
                if(talents[i].talent_title_val === "maitrise_soi") {
                    max++
                    if(talents[i].talent_superieur === true) {
                        max++
                    }
                    break
                }
            }
            return max
        }, [_sheet.talents])
    }

    return _sheet
}