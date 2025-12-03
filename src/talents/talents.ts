import { globalSheets } from "../globals"
import { basicUpdateHandler, effect, signal } from "../utils/utils";

export const onTalentEdit = function(sheet: PcSheet) {
    return function(entry: Component<Talent>) {
        effect(function() {
            const choices: Record<string, string> = {};
            (Tables.get("talents") as Table<TalentEntity>).each(function(e: TalentEntity) {
                const archs = e.archetype.split(',')
                if(archs.indexOf(sheet.archetype()) !== -1 || archs.indexOf("general") !== -1) {
                    choices[e.id] = e.name
                }
            });
            (entry.find("talent_title_val") as ChoiceComponent<Record<string, string>>).setChoices(choices)
        }, [sheet.archetype])
        const talentSuperieur = signal(entry.find("talent_superieur").value())
        entry.find("talent_superieur").on("update", basicUpdateHandler(talentSuperieur))
        const talentChoice = signal(entry.find("talent_title_val").value())
        entry.find("talent_title_val").on("update", basicUpdateHandler(talentChoice))
        const customization = signal(entry.find("customization").value())
        entry.find("customization").on("update", basicUpdateHandler(customization))
        effect(function() {
            log("Update customization " + talentChoice().customizable)
            if((Tables.get("talents") as Table<TalentEntity>).get(talentChoice()).customizable === "1") {
                entry.find("customization").value("")
                entry.find("customization").show()
            } else {
                entry.find("customization").value("")
                entry.find("customization").hide()
            }
        }, [talentChoice])
        effect(function() {
            const talent = (Tables.get("talents") as Table<TalentEntity>).get(talentChoice())
            if(talent.upgradable === "1") {
                entry.find("talent_superieur_col").show()
            } else {
                entry.find("talent_superieur_col").hide()
                if(entry.find("talent_superieur").value() === true) {
                    entry.find("talent_superieur").value(false)
                }
            }
            let customLabel = "........"
            if(customization() !== undefined && customization() !== "") {
                customLabel = customization()
            }
            if(talentSuperieur()) {
                entry.find("talent_desc").value(talent.description_alt.replace('%custom%', customLabel))
            } else {
                entry.find("talent_desc").value(talent.description.replace('%custom%', customLabel))
            }
        }, [talentChoice, talentSuperieur, customization])
    }
}

export const onTalentDisplay = function(entry: Component<Talent>) {
    const sheet = globalSheets[entry.sheet().getSheetId()] as PcSheet
    let talents = sheet.talents()
    const curr_talent = entry.value()
    talents[entry.id()] = curr_talent
    sheet.talents.set(talents)

    const talent = (Tables.get("talents") as Table<TalentEntity>).get(curr_talent.talent_title_val)
    entry.find("talent_title_label").value(talent.name)
    if(entry.value().talent_superieur === true) {
        entry.find("talent_lvl_2").show()
    } else {
        entry.find("talent_lvl_2").hide()
    }

}

export const onTalentDelete = function(sheet: PcSheet) {
    return function(entryId: string) {
        const talents = sheet.talents()
        delete talents[entryId]
        sheet.talents.set(talents)
    }
}