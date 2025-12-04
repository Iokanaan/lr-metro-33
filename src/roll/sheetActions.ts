export const stressSuccessHandler = function(sheet: PcSheet) {
    return function(result: DiceResult) {
        const stressDice = result.children[0].children[1].all
        for(let i=0; i<stressDice.length; i++) {
            // Uncheck last stress box on 6
            if(stressDice[i].value === 6) {
                for(let j=5; j>=0; j--) {
                    if(sheet.find("stress_" + j).value() === true) {
                        sheet.find("stress_" + j).value(false)
                        break;
                    }
                }
            }
        }
    }
}