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
    if(curr_item.name !== undefined) {
        entry.find("item_label").value(curr_item.name);
    } else {
        entry.find("item_label").value("Objet inconnu");
    }
    if(curr_item.weight === undefined || curr_item.weight === "0") {
        entry.find("poids_label").value("0")
    } else {
        entry.find("poids_label").value(Tables.get("poids").get(curr_item.weight).name)
    }
}

export const onItemDelete = function(sheet: PcSheet) {
    return function(entryId: string) {
        const items = sheet.items()
        delete items[entryId]
        sheet.items.set(items)
    }
}