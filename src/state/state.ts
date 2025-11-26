export const setupStressArray = function(sheet: PcSheet) {
    for(let i=1; i<=5; i++) {
        setupStress(sheet, i)
    }
}

const setupStress = function(sheet: PcSheet, checkbox_idx: number) {
    sheet.find("stress_" + checkbox_idx).on("click", function() {
        for(let i=1;i<=5;i++) {
            if(i < checkbox_idx && (sheet.find("stress_" + i).value() === undefined || sheet.find("stress_" + i).value() === false)) {
                sheet.find("stress_" + i ).value(true)
            }
            if(i > checkbox_idx && (sheet.find("stress_" + i).value() === undefined || sheet.find("stress_" + i).value() === true)) {
                sheet.find("stress_" + i ).value(false)
            }
        }
    })
}