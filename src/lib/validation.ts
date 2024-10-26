function isStringArray(obj: unknown): obj is string[] {
    const typed = obj as string[]
    return (
        Array.isArray(typed)
        && typed.reduce(
            (p, c) => p && typeof c === 'string',
            true
        )
    )
}

interface GenreOptions {
    genres: string[]
}

function isGenreOptions(obj: unknown): obj is GenreOptions {
    const typed = obj as GenreOptions

    return !!typed?.genres && isStringArray(typed.genres)
}

interface ItemsList {
    items: string[]
}

function isItemsList(obj: unknown): obj is ItemsList {
    const typed = obj as ItemsList

    return !!typed?.items && isStringArray(typed.items)
}

interface HealthValue {
    health: number
}

function isHealthValue(obj: unknown): obj is HealthValue {
    const typed = obj as HealthValue

    return (
        !!typed?.health
        && typeof typed.health === 'number'
        && Number.isInteger(typed.health)
        && typed.health >= 0
        && typed.health <= 10
    )
}

export {
    isGenreOptions,
    isItemsList,
    isHealthValue
}
