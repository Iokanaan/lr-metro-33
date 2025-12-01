import { globalSheets } from "../globals"

export const onItemEdit = function(entry: Component<Item>) {
    if(entry.value().quantity === undefined) {
        entry.find("quantity").value(1)
    }
}

export const onItemDisplay = function(entry: Component<Item>) {
    const sheet = globalSheets[entry.sheet().getSheetId()] as PcSheet
    let items = sheet.items()
    const curr_item = entry.value()
    items[entry.id()] = curr_item
    sheet.items.set(items)
}

export const onItemDelete = function(sheet: PcSheet) {
    return function(entryId: string) {
        const items = sheet.items()
        delete items[entryId]
        sheet.items.set(items)
    }
}