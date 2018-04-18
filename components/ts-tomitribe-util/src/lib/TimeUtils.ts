import { StringBuilder } from "./StringBuilder";
import { TimeUnit } from "./TimeUnit";

export class TimeUtils {
    public static formatNanos(duration: number, min: TimeUnit = TimeUtils.min(), max: TimeUnit = TimeUtils.max()): string {
        return TimeUtils.format(duration, TimeUnit.NANOSECONDS, min, max);
    }

    public static formatMillis(duration: number, min: TimeUnit = TimeUtils.min(), max: TimeUnit = TimeUtils.max()): string {
        return TimeUtils.format(duration, TimeUnit.MILLISECONDS, min, max);
    }

    public static format(duration: number, sourceUnit: TimeUnit, min: TimeUnit = TimeUtils.min(), max: TimeUnit = TimeUtils.max()): string {
        let res: StringBuilder = new StringBuilder();

        let suffix: string = "";
        if (duration < 0) {
            duration = duration * -1;
            suffix = " ago";
        }

        let current: TimeUnit = max;

        while (duration > 0) {
            const temp: number = current.convert(duration, sourceUnit);

            if (temp > 0) {

                duration -= sourceUnit.convert(temp, current);
                res.append(temp.toString()).append(" ").append(current.name().toLowerCase());

                if (temp < 2) {
                    res.deleteCharAt(res.length - 1);
                }

                res.append(", ");
            }

            if (current.ordinal === min.ordinal) {
                break;
            }

            current = TimeUnit.values()[current.ordinal - 1];
        }

        // we never got a hit, the time is lower than we care about
        if (res.lastIndexOf(", ") < 0) {
            return "0 " + min.name().toLowerCase();
        }

        // yank trailing  ", "
        res.deleteCharAt(res.length - 1);
        res.deleteCharAt(res.length - 1);

        //  convert last ", " to " and"
        let i: number = res.lastIndexOf(", ");
        if (i > 0) {
            res.deleteCharAt(i);
            res.insert(i, " and");
        }

        res.append(suffix);

        return res.toString();
    }

    public static formatHighest(duration: number, max: TimeUnit, min: TimeUnit = this.min()): string {
        const units: TimeUnit[] = TimeUnit.values();
        let res: StringBuilder = new StringBuilder();

        let current: TimeUnit = max;

        while (duration > 0) {
            const temp: number = current.convert(duration, TimeUnit.MILLISECONDS);

            if (temp > 0) {

                duration -= current.toMillis(temp);

                res.append(temp.toString()).append(" ").append(current.name().toLowerCase());

                if (temp < 2) {
                    res.deleteCharAt(res.length - 1);
                }

                break;
            }

            if (current.ordinal === min.ordinal) {
                break;
            }

            current = units[(current.ordinal - 1)];
        }

        // we never got a hit, the time is lower than we care about
        return res.toString();
    }

    public static max() {
        let values: TimeUnit[] = TimeUnit.values();
        return values[values.length - 1];
    }

    public static min() {
        let values: TimeUnit[] = TimeUnit.values();
        return values[0];
    }

    private static abbreviateString(time: string): string {
        time = time.replace(new RegExp(" days?", 'ig'), "d");
        time = time.replace(new RegExp(" hours?", 'ig'), "hr");
        time = time.replace(new RegExp(" minutes?", 'ig'), "m");
        time = time.replace(new RegExp(" seconds?", 'ig'), "s");
        time = time.replace(new RegExp(" milliseconds?", 'ig'), "ms");
        return time;
    }

    public static abbreviate(duration: string | number, sourceUnit?: TimeUnit, min: TimeUnit = TimeUtils.min(), max: TimeUnit = TimeUtils.max()): string {
        if (sourceUnit && typeof duration === "number") {
            let format: string = TimeUtils.format(<number> duration, sourceUnit, min, max);
            return TimeUtils.abbreviateString(format);
        } else if (typeof duration === "string") {
            return TimeUtils.abbreviateString(<string> duration);
        } else {
            // error wrong abbreviate usage
        }
    }
}
