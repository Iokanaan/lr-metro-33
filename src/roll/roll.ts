export const buildRoll = function(val: number, stress: number, forced: boolean): string {
    let expression = ""
    if(forced) {
        expression = "(" + val + "d6 = 6)[roll,forced] + " + "(" + stress + "d6 = 1)[stress]"
    } else {
        expression = "(" + val + "d6 = 6)[roll] + " + "(" + stress + "d6 = 1)[stress]"
    }
    log("Roll " + expression)
    return expression
}