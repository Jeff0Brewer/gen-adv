import { getCompletion, itemsFromNumberedList } from '../lib/openai'

const DEPTH_LIMIT = 3

async function getGenre (depth: number = 0): Promise<string> {
    const { content } = await getCompletion([
        {
            role: 'system',
            content: 'Do not explain or respond in full sentences. Be highly creative and generate only unique answers.'
        },
        {
            role: 'user',
            content: 'Can you provide a numbered list of 10 interesting genres for my RPG adventure game?'
        }
    ])

    try {
        // Choose random option from list of choices to increase variability of genres.
        const options = itemsFromNumberedList(content)
        return options[Math.floor(Math.random() * options.length)]
    } catch {
        // Retry generation if received content cannot be parsed.
        if (depth < DEPTH_LIMIT) {
            return getGenre(depth + 1)
        }
        // Error if retry limit exceeded.
        throw new Error('Genre generation exceeded retry limit.')
    }
}

export {
    getGenre
}
