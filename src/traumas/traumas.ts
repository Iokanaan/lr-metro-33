import { globalSheets } from "../globals"

export const onTraumaEdit = function(entry: Component<Trauma>) {

}

export const onTraumaDisplay = function(entry: Component<Trauma>) {
    const sheet = globalSheets[entry.sheet().getSheetId()] as PcSheet
    let traumas = sheet.traumas()
    const curr_trauma = entry.value()
    traumas[entry.id()] = curr_trauma
    sheet.traumas.set(traumas)

}

export const onTraumaDelete = function(sheet: PcSheet) {
    return function(entryId: string) {
        const traumas = sheet.traumas()
        delete traumas[entryId]
        sheet.traumas.set(traumas)
    }
}