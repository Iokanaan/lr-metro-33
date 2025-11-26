declare global {

    class RollBuilder {
        constructor(sheet: Sheet<any>)
        expression: (s: string) => RollBuilder
        visibility: (s: Visibility) => RollBuilder
        title: (s: string) => RollBuilder
        roll: () => void
        onRoll: (callback: (res: DiceResult) => void) => RollBuilder
    }
    
    class Dice {
        static create: (s: string) => Dice
        tag: (s: string) => Dice
        static roll: (sheet: Sheet<any>, d: Dice, s: string) => void
    
    }
    
    declare var getReferences: (sheet: Sheet<any>) => Record<string, string | number>
    declare var init: (sheet: Sheet<any>) => void
    declare var drop: (from: Sheet<any>, to: Sheet<any>) => void
    declare var initRoll: (result: DiceResult, callback: DiceResultCallback) => void
    declare const wait: (ms: number, callback: () => void) => void
    declare var getCriticalHits: (result: DiceResult) => Record<string, Record<string, number[]>>
    declare const log: (s: any) => void;
    declare const each: <T>(c: Record<string, T>, f: (i: T, eid: string) => void) => void;
    declare var getBarAttributes: (sheet: Sheet<any>) => Record<string, [string, string | number]> | void;
    declare var dropDice: (result: DiceResult, to: Sheet) => void;

    declare const Tables: Tables;
    interface Tables {
        get(id: string): Table
    }
    
    declare const Bindings: Bindings
    interface Bindings {
        add(name: string, cmpId: string, viewId: string, data: () => Object)
        send(sheet: Sheet<CharData>, name: string)
    }
    
    interface Table<T> {
        each(f:(a: T) => void);
        get(s: string): T;
        random(callback: (val: T) => void)
    }
    
    
    export interface Component<T = unkown> {
        id(): string
        show():void
        hide(): void
        value():T,
        value(val: T): void
        find(elem: string): Component,
        on(type: string, handler: (cmp: Component<T>) => void)
        on(type: string, delegate: string, handler: (cmp: Component) => void)
        index(): string
        addClass(cl: string)
        removeClass(cl: string)
        text(): string
        text(txt: string)
        sheet(): Sheet<unknown>
        visible(): boolean
        virtualValue(): T
        virtualValue(val: T)
        rawValue(): T
    }
    
    interface ChoiceComponent<T = unknown> extends Component<T> {
        setChoices(data: Record<string, string>)
    }
    
    type SheetData = Record<string, number | string | Record<string, string | number>>

    interface Sheet {
        id(): string
        getSheetId(): number
        get(s:string): Component | ChoiceComponent;
        setData(data: SheetData)
        getData(): SheetData;
        prompt(title: string, sheetId: string, callback: (result: componentData) => void, callbackInit?: (sheet: Sheet) => void),
        name(): string,
        properName(): string
    }
    
    type DiceResult = {
        tags: string[]
        allTags: string[]
        all: DiceResult[]
        containsTag(tag: string): boolean
        success: number
        value: number
        title: string
        expression: string,
        total: number,
        discarded: boolean,
        children: DiceResult[],
        dimension: number,
        size: number | null,
        values: number[],
        type: "number" | "dice" | "comparison"
    }



    type DiceResultCallback = (e: string, callback: (sheet: Sheet<unknown>) => void) => void;

    declare const _: (s: string) => string

}

export {}