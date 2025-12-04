import { skillStatMap, statNames } from "../globals"

export const initModifySkillPrompt = function(sheet: PcSheet, skill: Skill) {
    return function(promptView: Sheet) {
        const options = getOptions(Object.values(sheet.talents()), skill);
        (promptView.get("modify_stat") as ChoiceComponent<Record<string, string>>).setChoices(options)
        if(Object.keys(options).length === 1) {
            promptView.get("modify_stat").hide()
        } else {
            promptView.get("modify_stat").show()
        }
        promptView.get("modify_stat").value(Object.keys(options)[0])
        initModifyPrompt()(promptView)
    }
}

export const initModifyPrompt = function() {
    return function(promptView: Sheet) {
        promptView.get("modify_roll").value(0)
        promptView.get("modify_min").on("click", function() {
            promptView.get("modify_roll").value(promptView.get("modify_roll").value() - 1)
        })
        promptView.get("modify_plus").on("click", function() {
            promptView.get("modify_roll").value(promptView.get("modify_roll").value() + 1)
        })
    }
}

const getOptions = function(talents: Talent[], skill: Skill): Record<string, string> {
    const defaultStat = skillStatMap[skill]
    let options: Record<string, string> = {}
    options[defaultStat] = statNames[defaultStat];
    for(let i=0;i<talents.length; i++) {
        if(talents[i].talent_title_val === "sens_danger" && skill === "obs") {
            options["empathie"] = statNames["empathie"]
            return options
        }
        if(talents[i].talent_title_val === "esquive" && skill === "cac") {
            options["agi"] = statNames["agi"]
            return options
        }
        if(talents[i].talent_title_val === "menacant" && skill === "mani") {
            options["vig"] = statNames["vig"]
            return options
        }
        if(talents[i].talent_title_val === "psycho" && skill === "mani") {
            options["esprit"] = statNames["esprit"]
            return options
        }
    };
    return options
}