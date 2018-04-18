import { equalsIgnoreCase } from "./CommonUtils";
import { StringBuilder } from "./StringBuilder";
import { TimeUnit } from "./TimeUnit";
import { TimeUtils } from "./TimeUtils";

export class LongDuration {
    /*private*/
    time: number = 0;

    /*private*/
    unit: TimeUnit = null;

    defaultErrorHandler: (p1: Error) => void = (e) => {
        throw e;
    };

    valueOf():number {
        return this.time * this.unit.valueOf();
    }

    public constructor(text?: any, consumer?: any) {
        if (((typeof text === 'string') || !text) && ((typeof consumer === 'function' && (<any>consumer).length == 1) || !consumer)) {
            this.parseLongDuration(text, <any>(consumer));
        } else if (((typeof text === 'number') || !text) && ((typeof consumer === 'number') || !consumer)) {
            this.time = text;
            this.unit = new TimeUnit(consumer);
        } else if ((typeof text === 'number') && (consumer instanceof TimeUnit)) {
            this.time = text;
            this.unit = consumer;
        } else this.invalidFormat(text, this.defaultErrorHandler);
    }

    parseLongDuration(string: string, consumer?: any) {
        let strings: string[] = string.split(new RegExp(",| and ", 'ig'));
        let total: LongDuration = new LongDuration(0, TimeUnit.MILLISECONDS);
        for (let index = 0; index < strings.length; index++) {
            let value = strings[index];
            {
                let part: LongDuration = new LongDuration(0, TimeUnit.MILLISECONDS);
                let trimedValue: string = value.trim();

                let number: StringBuilder = new StringBuilder();
                let unit: StringBuilder = new StringBuilder();

                let i: number = 0;
                for (; i < trimedValue.length; i++) {
                    let c: string = trimedValue.charAt(i);
                    if (/* isDigit *//\d/.test(c[0]) || i === 0 && (c => c.charCodeAt == null ? <any>c : c.charCodeAt(0))(c) == '-'.charCodeAt(0)) {
                        number.append(c);
                    } else {
                        break;
                    }
                }

                if (number.length === 0) {
                    this.invalidFormat(trimedValue, this.defaultErrorHandler);
                    return;
                }

                for (; i < trimedValue.length; i++) {
                    let c: string = trimedValue.charAt(i);
                    if (/* isLetter *//[a-zA-Z ]/.test(c[0])) {
                        unit.append(c);
                    } else {
                        this.invalidFormat(trimedValue, this.defaultErrorHandler);
                        return;
                    }
                }

                part.time = parseInt(number.toString());
                part.unit = this.parseUnit(unit.toString().trim(), this.defaultErrorHandler);
                if (part.unit == null) {
                    part.unit = TimeUnit.MILLISECONDS;
                }
                total = total.add(part);
            }
        }
        this.time = total.time;
        this.unit = total.unit;
    }

    public getTime(unit: TimeUnit): number {
        return unit.convert(this.time, this.unit);
    }

    /**
     *
     * @param {*} o
     * @return {boolean}
     */
    public equals(o: any): boolean {
        if (this === o) {
            return true;
        }
        if (o == null || (<any>this.constructor) !== (<any>o.constructor)) {
            return false;
        }
        let that: LongDuration = <LongDuration>o;
        let n: LongDuration.Normalize = new LongDuration.Normalize(this, that);
        return n.a === n.b;
    }

    /**
     *
     * @return {number}
     */
    public hashCode(): number {
        let result: number = (<number>(this.time ^ (this.time >>> 32)) | 0);
        result = 31 * result + this.unit.ordinal;
        return result;
    }

    public add(that: LongDuration): LongDuration {
        let n: LongDuration.Normalize = new LongDuration.Normalize(this, that);
        return new LongDuration(n.a + n.b, n.base);
    }

    public subtract(that: LongDuration): LongDuration {
        let n: LongDuration.Normalize = new LongDuration.Normalize(this, that);
        return new LongDuration(n.a - n.b, n.base);
    }

    invalidFormat(text: string, errorHandler: (p1: Error) => void) {
        (target => (typeof target === 'function') ? target(Object.defineProperty(new Error("Illegal duration format: \'" + text + "\'.  Valid examples are \'10s\' or \'10 seconds\'."), '__classes', {
            configurable: true,
            value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception']
        })) : (<any>target).accept(Object.defineProperty(new Error("Illegal duration format: \'" + text + "\'.  Valid examples are \'10s\' or \'10 seconds\'."), '__classes', {
            configurable: true,
            value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception']
        })))(errorHandler);
    }

    /**
     *
     * @return {string}
     */
    public toString(): string {
        let sb: StringBuilder = new StringBuilder();
        sb.append(<any>this.time);
        if (this.unit != null) {
            sb.append(<any>" ");
            sb.append(<any>this.unit);
        }
        return sb.toString();
    }

    /**
     * Converts time to a human readable format within the specified range
     *
     * @param {TimeUnit} max      the highest time unit of interest
     * @return {string}
     */
    public formatHighest(max: TimeUnit = TimeUtils.max()): string {
        return TimeUtils.format(this.time, this.unit, TimeUnit.MILLISECONDS, max);
    }

    parseUnit(u: string, errorHandler: (p1: Error) => void): TimeUnit {
        if (u.length === 0) {
            return null;
        }
        if (equalsIgnoreCase("NANOSECONDS", u)) return TimeUnit.NANOSECONDS;
        if (equalsIgnoreCase("NANOSECOND", u)) return TimeUnit.NANOSECONDS;
        if (equalsIgnoreCase("NANOS", u)) return TimeUnit.NANOSECONDS;
        if (equalsIgnoreCase("NANO", u)) return TimeUnit.NANOSECONDS;
        if (equalsIgnoreCase("NS", u)) return TimeUnit.NANOSECONDS;
        if (equalsIgnoreCase("MICROSECONDS", u)) return TimeUnit.MICROSECONDS;
        if (equalsIgnoreCase("MICROSECOND", u)) return TimeUnit.MICROSECONDS;
        if (equalsIgnoreCase("MICROS", u)) return TimeUnit.MICROSECONDS;
        if (equalsIgnoreCase("MICRO", u)) return TimeUnit.MICROSECONDS;
        if (equalsIgnoreCase("MILLISECONDS", u)) return TimeUnit.MILLISECONDS;
        if (equalsIgnoreCase("MILLISECOND", u)) return TimeUnit.MILLISECONDS;
        if (equalsIgnoreCase("MILLIS", u)) return TimeUnit.MILLISECONDS;
        if (equalsIgnoreCase("MILLI", u)) return TimeUnit.MILLISECONDS;
        if (equalsIgnoreCase("MS", u)) return TimeUnit.MILLISECONDS;
        if (equalsIgnoreCase("SECONDS", u)) return TimeUnit.SECONDS;
        if (equalsIgnoreCase("SECOND", u)) return TimeUnit.SECONDS;
        if (equalsIgnoreCase("SEC", u)) return TimeUnit.SECONDS;
        if (equalsIgnoreCase("S", u)) return TimeUnit.SECONDS;
        if (equalsIgnoreCase("MINUTES", u)) return TimeUnit.MINUTES;
        if (equalsIgnoreCase("MINUTE", u)) return TimeUnit.MINUTES;
        if (equalsIgnoreCase("MIN", u)) return TimeUnit.MINUTES;
        if (equalsIgnoreCase("M", u)) return TimeUnit.MINUTES;
        if (equalsIgnoreCase("HOURS", u)) return TimeUnit.HOURS;
        if (equalsIgnoreCase("HOUR", u)) return TimeUnit.HOURS;
        if (equalsIgnoreCase("HRS", u)) return TimeUnit.HOURS;
        if (equalsIgnoreCase("HR", u)) return TimeUnit.HOURS;
        if (equalsIgnoreCase("H", u)) return TimeUnit.HOURS;
        if (equalsIgnoreCase("DAYS", u)) return TimeUnit.DAYS;
        if (equalsIgnoreCase("DAY", u)) return TimeUnit.DAYS;
        if (equalsIgnoreCase("D", u)) return TimeUnit.DAYS;

        this.invalidFormat(u, errorHandler);
        return null;
    }
}

export namespace LongDuration {

    export class Normalize {
        a: number = 0;

        b: number = 0;

        base: TimeUnit = null;

        constructor(a: LongDuration, b: LongDuration) {
            this.base = Normalize.lowest(a, b);
            this.a = a.unit == null ? a.time : this.base.convert(a.time, a.unit);
            this.b = b.unit == null ? b.time : this.base.convert(b.time, b.unit);
        }

        static lowest(a: LongDuration, b: LongDuration): TimeUnit {
            if (a.time === 0 || a.unit == null) return b.unit;
            if (b.time === 0 || b.unit == null) return a.unit;
            return TimeUnit.values()[Math.min(a.unit.ordinal, b.unit.ordinal)];
        }
    }
}
