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
        weight: number
    }

    type Weapon = {
        name: string,
        damage: string,
        type: string,
        rof: string,
        range: string,
        ap: string,
        special: string
    }

    type Protection = {
        name: string,
        ar: number,
        location: string,
        special: string
    }

    type Talent = {
        name: string,
        level: number
    }

    type PcSheet = {
        age: Signal<number>,
        archetype: Signal<string>,
        stats: Record<Stat, { "max": Signal<number>, "curr": Signal<number> }>,
        skills: Record<Skill, Signal<number>>,
        stress: { "detail": Signal<boolean>[], "total": Computed<number> },
        sangfroid: { "max": Signal<number>, "detail": Signal<boolean>[], "curr": Signal<number> },
        radiation: { "temp": { "detail": Signal<boolean>[], "total": Computed<number> }, "perm": Signal<number> },
        customRollModifier: Signal<number>
        editMode: Signal<boolean>,
        protection_total: Computed<number>,
        encombrement: Computed<number>
        max_encombrement: Computed<number>,
        objets: Signal<Record<string, Item>>,
        armes: Signal<Record<string, Weapon>>,
        protections: Signal<Record<string, Protection>>,
        consommables: Record<Consommable, Signal<number>>,
        talents: Signal<Record<string, Talend>>

    } & ExtendedSheet
}

export {}
