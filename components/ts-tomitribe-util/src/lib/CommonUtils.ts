export function equalsIgnoreCase(a: string, b: string): boolean {
    return !!a && !!b && a.toUpperCase() === b.toUpperCase();
}
