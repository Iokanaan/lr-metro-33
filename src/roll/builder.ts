export const buildRoll = function(val: number, stress: number, autoSuccess: number, autoFailures: number, autoStressFailures: number, forced: boolean): string {
    let expression = ""
    if(forced) {
        expression = "((" + val + "d6 = 6) + " + autoSuccess + ")[roll,forced] + ((" + stress + "d6 = 1) + " + autoStressFailures + ")[stress] + " + autoFailures + "[autofailure]"
    } else {
        expression = "((" + val + "d6 = 6) + " + autoSuccess + ")[roll] + ((" + stress + "d6 = 1) + " + autoStressFailures + ")[stress] + " + autoFailures + "[autofailure]"
    }
    log("[INFO] " + expression)
    return expression
}
