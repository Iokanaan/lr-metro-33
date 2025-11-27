import { effect } from "../utils/utils"

export const setupRadiation = function(sheet: PcSheet) {

    const radPermCmp = sheet.find("rad_perm_val") as Component<number>
    const radMinCmp = sheet.find("min_rad_perm") as Component<void>
    const radPlusCmp = sheet.find("plus_rad_perm") as Component<void>

    radMinCmp.on("click", function() {
        if(sheet.radiation.perm() > 0) {
            radPermCmp.value(sheet.radiation.perm() - 1)
        }
    })

    radPlusCmp.on("click", function() {
        if(sheet.radiation.perm() < 10) {
            radPermCmp.value(sheet.radiation.perm() + 1)
        }
    })

    effect(function() {
        if(sheet.radiation.perm() >= sheet.radiation.temp.total()) {
            radPlusCmp.addClass("opacity-0")
        } else {
            radPlusCmp.removeClass("opacity-0")
        }
        if(sheet.radiation.perm() <= 0) {
            radMinCmp.addClass("opacity-0")
        } else {
            radMinCmp.removeClass("opacity-0")
        }
    }, [sheet.radiation.perm, sheet.radiation.temp.total])
}

export const handleRadCheckbox = function(_sheet: PcSheet, i: number) {
        (_sheet.find("rad_" + i) as Component<boolean>).on("update", function(cmp) {
            if(cmp.value() === false && _sheet.radiation.perm() >= _sheet.radiation.temp.total()) {
                cmp.value(true)
            } else {
                if(cmp.value() === false) {
                    _sheet.radiation.temp.detail[i-1].set(cmp.value())
                    new RollBuilder(_sheet.raw())
                            .title("Détoxification")
                            .expression("(1d6 > 1)[detox]")
                            .roll()
                } else {
                    if(cmp.value() !== _sheet.radiation.temp.detail[i-1]()) {
                        _sheet.radiation.temp.detail[i-1].set(cmp.value())
                        new RollBuilder(_sheet.raw())
                            .title("Exposition aux radiations")
                            .expression("(" + _sheet.radiation.temp.total() + "d6 > 1)[rad]")
                            .roll()
                    }
                }
            }
     })
}