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

    type PcSheet = {
        age: Signal<number>,
        archetype: Signal<string>,
        stats: Record<Stat, { "max": Signal<number>, "curr": Signal<number> }>,
        skills: Record<Skill, Signal<number>>,
        stress: { "detail": Signal<boolean>[], "total": Computed<number> },
        sangfroid: { "max": Signal<number>, "curr": Signal<number> },
        radiation: { "temp": { "detail": Signal<boolean>[], "total": Computed<number> }, "perm": Signal<number> },
        customRollModifier: Signal<number>
        editMode: Signal<boolean>,
        protection_total: Computed<number>,
        encombrement: Computed<number>
        max_encombrement: Computed<number>
    } & ExtendedSheet
}

export {}
