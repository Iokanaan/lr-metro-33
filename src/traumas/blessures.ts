import { globalSheets } from "../globals"

export const onWoundEdit = function(entry: Component<Wound>) {

}

export const onWoundDisplay = function(entry: Component<Wound>) {
    const sheet = globalSheets[entry.sheet().getSheetId()] as PcSheet
    let wounds = sheet.wounds()
    const curr_wound = entry.value()
    wounds[entry.id()] = curr_wound
    sheet.wounds.set(wounds)

}

export const onWoundDelete = function(sheet: PcSheet) {
    return function(entryId: string) {
        const wounds = sheet.wounds()
        delete wounds[entryId]
        sheet.wounds.set(wounds)
    }
}