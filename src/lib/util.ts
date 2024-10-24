function randomChoice<T>(options: T[]): T {
    const index = Math.floor(Math.random() * options.length)
    return options[index]
}

function isResolved<T>(list: (T | Promise<T>)[]): list is T[] {
    for (const item of list) {
        if (item instanceof Promise) {
            return false
        }
    }
    return true
}

export {
    randomChoice,
    isResolved
}
