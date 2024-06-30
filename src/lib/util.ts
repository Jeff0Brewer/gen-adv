function randomChoice<T>(options: T[]): T {
    return options[Math.floor(Math.random() * options.length)]
}

function ensureArray<T>(value: T | T[]): T[] {
    return Array.isArray(value) ? value : [value]
}

export {
    randomChoice,
    ensureArray
}
