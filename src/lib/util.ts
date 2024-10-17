function randomChoice<T>(options: T[]): T {
    const index = Math.floor(Math.random() * options.length)
    return options[index]
}

export {
    randomChoice
}
