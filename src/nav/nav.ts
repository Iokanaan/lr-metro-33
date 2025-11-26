import { tabs } from "../globals"

export const setupNav = function(sheet: PcSheet) {
    for(let i=0; i<tabs.length; i++) {
        log("[INFO] Setup navigation for " + tabs[i] + " : " + sheet.raw().properName())
        sheet.find(tabs[i] + "_nav").on("click", function(cmp) {
            for(let j=0; j<tabs.length; j++) {
                sheet.find(tabs[j] + "_tab").hide()
                sheet.find(tabs[j] + "_txt").removeClass("active")
                sheet.find(tabs[j] + "_txt").removeClass("text-light")
                sheet.find(tabs[j] + "_txt").addClass("text-muted")
            }
            sheet.find(cmp.id().slice(0, -4)  + "_tab").show()
            sheet.find(cmp.id().slice(0, -4)  + "_txt").addClass("active")
            sheet.find(cmp.id().slice(0, -4)  + "_txt").addClass("text-light")
            sheet.find(cmp.id().slice(0, -4)  + "_txt").removeClass("text-muted")
        })
    }
}
