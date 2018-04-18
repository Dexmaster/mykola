export class StringBuilder {
    str: string = "";

    get length() {
        return this.str.length;
    }

    public toString(): string {
        return this.str;
    }

    public toNumber(): number {
        return +this.str;
    }

    public lastIndexOf(str: string): number {
        return this.str.lastIndexOf(str);
    }

    public append(str: any): StringBuilder {
        if (!!str && str.toString) this.str = this.str.concat(str.toString());
        return this;
    }

    public deleteCharAt(i: number): StringBuilder {
        this.str = this.str.slice(0, i) + this.str.slice(i + 1, this.str.length);
        return this;
    }

    public insert(i: number, str: string): StringBuilder {
        this.str = this.str.slice(0, i) + str + this.str.slice(i, this.str.length);
        return this
    }
}
