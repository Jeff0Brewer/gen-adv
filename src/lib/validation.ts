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

    return typed?.genres && isStringArray(typed.genres)
}

interface ItemsList {
    items: string[]
}

function isItemsList(obj: unknown): obj is ItemsList {
    const typed = obj as ItemsList

    return typed?.items && isStringArray(typed.items)
}

export {
    isGenreOptions,
    isItemsList
}
