export const buildRoll(val: number, stress: number, forced: boolean): string {
    if(forced) {
        let expression = "(" + val + "d6 = 6)[roll,forced] " + "(" + stress + "d6 = 1)[stress] = 1"
        return expression
    } else {
        let expression = "(" + val + "d6 = 6)[roll] " + "(" + stress + "d6 = 1)[stress] = 1"
        return expression
    }
}