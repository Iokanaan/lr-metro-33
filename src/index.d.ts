//@ts-check

declare global {

    interface Signal<T> {
        (): T;
        set(t:T)
        subscribe(t:Handler<T>): () => void;
    }

    interface Computed<T> {
        (): T;
        subscribe(t:Handler<T>): () => void;
    }

    type Handler<T> = (t: T) => void

    type RepeaterState = 'EDIT' | 'VIEW'

    interface ExtendedSheet {
        raw(): Sheet,
        find(id: string): Component<unknown> | ChoiceComponent<unknown>,
        stringId(): string,
        entryStates: Record<string, Record<string, RepeaterState | undefined>>
    }

    type Stat = 'agi' | 'vig' | 'empathie' | 'esprit'
    type Skill = 'furti' | 'rea' | 'tir' | 'brico' | 'cac' | 'endu' | 'ana' | 'mani' | 'soin' | 'com' | 'obs' | 'survie'
    type Consommable = 'filtre' | 'nourriture' | 'eau' | 'energie'

    type Item = {
        name: string,
        quantity: number,
        weight: string
    }

    type Weapon = {
        weapon_name_val: string,
        weapon_bonus_val: number,
        weapon_degats_val: number,
        weapon_type_val: string,
        weapon_fiabilite_val: number,
        weapon_portee_val: string,
        weapon_prise_val: string,
        weapon_explosif_val: boolean,
        weapon_poids_val: string,
        weapon_notes_val: string,
        weapon_curr_bonus: number,
        curr_prise_val: string
    }

    type DieResult = {
        result: number
        tags: string[]
    }

    type Protection = {
        protection_name: string,
        max_protection_bonus: number,
        curr_protection_bonus: number,
        protection_poids: string
    }

    type Talent = {
        talent_title_val: string,
        talent_desc: string,
        talent_superieur: boolean
    }

    type TalentEntity = {
        id: string,
        name: string,
        description: string
        upgradable: string
        customizable: string
        description_alt: string
        archetype: string
    }

    type RollData = {
        diceResult: number[]
        diceTag: string[]
    }

    type PcSheet = {
        age: Signal<number>,
        archetype: Signal<string>,
        stats: Record<Stat, { "max": Signal<number>, "curr": Signal<number> }>,
        skills: Record<Skill, Signal<number>>,
        stress: { "detail": Signal<boolean>[], "total": Computed<number> },
        sangfroid: { "max": Computed<number>, "detail": Signal<boolean>[], "curr": Computed<number> },
        radiation: { "temp": { "detail": Signal<boolean>[], "total": Computed<number> }, "perm": Signal<number> },
        editMode: Signal<boolean>,
        protection_total: Computed<number>,
        encombrement: Computed<number>
        max_encombrement: Computed<number>,
        items: Signal<Record<string, Item>>,
        weapons: Signal<Record<string, Weapon>>,
        protections: Signal<Record<string, Protection>>,
        consommables: Record<Consommable, Signal<number>>,
        talents: Signal<Record<string, Talent>>
    } & ExtendedSheet
}

export {}
