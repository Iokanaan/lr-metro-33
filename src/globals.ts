export const globalSheets: Record<number, PcSheet> = {}

export const tabs = [ 'personnage', 'talent', 'materiel', 'journal', 'trauma' ]
export const skills: Skill[] = ["furti", "rea", "tir", "brico", "cac", "endu", "ana", "mani", "soin", "com", "obs", "survie"]
export const stats: Stat[] = ["agi", "empathie", "vig", "esprit"]
export const skillStatMap: Record<Skill, Stat> = {
    "furti": "agi",
    "rea": "agi",
    "tir": "agi",
    "brico": "vig",
    "cac": "vig",
    "endu": "vig",
    "ana": "esprit",
    "mani": "esprit",
    "soin": "esprit",
    "com": "empathie",
    "obs": "empathie",
    "survie": "empathie"
}