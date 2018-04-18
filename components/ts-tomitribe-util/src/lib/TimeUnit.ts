export type ITimeUnit = "NANOSECONDS" | "MICROSECONDS" | "MILLISECONDS" | "SECONDS" | "MINUTES" | "HOURS" | "DAYS";

export enum TimeUnitEnum {
    NANOSECONDS,
    MICROSECONDS,
    MILLISECONDS,
    SECONDS,
    MINUTES,
    HOURS,
    DAYS
}

export enum TimeUnitValue {
    NANOSECONDS = 1,
    MICROSECONDS = TimeUnitValue.NANOSECONDS * 1000,
    MILLISECONDS = TimeUnitValue.MICROSECONDS * 1000,
    SECONDS = TimeUnitValue.MILLISECONDS * 1000,
    MINUTES = TimeUnitValue.SECONDS * 60,
    HOURS = TimeUnitValue.MINUTES * 60,
    DAYS = TimeUnitValue.HOURS * 24
}

export class TimeUnit {
    public constructor(timeOrdinal) {
        if (TimeUnit.ordinals().indexOf(timeOrdinal) > -1) {
            this.timeOrdinal = <number> timeOrdinal;
            this.timeUnit = <ITimeUnit> TimeUnitEnum[timeOrdinal];
        } else if (TimeUnit.values().indexOf(timeOrdinal) > -1) {
            this.timeOrdinal = <number> TimeUnit.values().indexOf(timeOrdinal);
            this.timeUnit = <ITimeUnit> timeOrdinal;
        } else {
            // wrong TimeUnit constructor call
        }
    }

    public timeUnit: ITimeUnit;
    public timeOrdinal: number;

    static NANOSECONDS: TimeUnit = new TimeUnit(TimeUnitEnum.NANOSECONDS);
    static MICROSECONDS: TimeUnit = new TimeUnit(TimeUnitEnum.MICROSECONDS);
    static MILLISECONDS: TimeUnit = new TimeUnit(TimeUnitEnum.MILLISECONDS);
    static SECONDS: TimeUnit = new TimeUnit(TimeUnitEnum.SECONDS);
    static MINUTES: TimeUnit = new TimeUnit(TimeUnitEnum.MINUTES);
    static HOURS: TimeUnit = new TimeUnit(TimeUnitEnum.HOURS);
    static DAYS: TimeUnit = new TimeUnit(TimeUnitEnum.DAYS);

    public name(): ITimeUnit {
        return <ITimeUnit> this.timeUnit;
    }

    get ordinal(): number {
        return <number> this.timeOrdinal;
    }

    static ordinals(): number[] {
        return <any> Object.keys(TimeUnitEnum).filter(function (i) {
            return (typeof TimeUnitEnum[i] === "string") && isFinite(+i);
        }).map(i => parseInt(i));
    }

    static values(): TimeUnit[] {
        return this.ordinals().map(function (i) {
            return new TimeUnit(i);
        });
    }

    public valueOf(): number {
        return <number> TimeUnitValue[this.timeUnit];
    }

    public toNanos(duration: number): number {
        // another alternative would have been
        // return Math.trunc((duration * this.toNumber()) / TimeUnitValue.NANOSECONDS);
        return TimeUnit.NANOSECONDS.convert(duration, this);
    }

    public toMicros(duration: number): number {
        return TimeUnit.MICROSECONDS.convert(duration, this);
    }

    public toMillis(duration: number): number {
        return TimeUnit.MILLISECONDS.convert(duration, this);
    }

    public toSeconds(duration: number): number {
        return TimeUnit.SECONDS.convert(duration, this);
    }

    public toMinutes(duration: number): number {
        return TimeUnit.MINUTES.convert(duration, this);
    }

    public toHours(duration: number): number {
        return TimeUnit.HOURS.convert(duration, this);
    }

    public toDays(duration: number): number {
        return TimeUnit.DAYS.convert(duration, this);
    }

    public convert(duration: number, sourceUnit: TimeUnit): number {
        return Math.trunc((duration * sourceUnit.valueOf()) / this.valueOf());
    }
}
