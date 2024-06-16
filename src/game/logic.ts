import { getCompletion, itemsFromNumberedList } from '../lib/openai'

async function genGenre (retries: number = 3): Promise<string> {
    const { content } = await getCompletion([
        {
            role: 'system',
            content:
                'Write your response as a numbered list, do not explain or respond in full sentences. ' +
                'Be highly creative and generate only unique answers.'
        },
        {
            role: 'user',
            content: 'Can you provide 10 interesting genres for my RPG adventure game?'
        }
    ])

    try {
        // Choose random option from list of choices to increase variability of genres.
        const options = itemsFromNumberedList(content)
        return options[Math.floor(Math.random() * options.length)]
    } catch {
        if (retries > 0) {
            return genGenre(retries - 1)
        }
        throw new Error('Genre generation exceeded retry limit.')
    }
}

async function genInventory (genre: string, retries: number = 1): Promise<string[]> {
    const { content } = await getCompletion([
        {
            role: 'system',
            content:
                'You are responsible for realistically allocating resources in an adventure game. ' +
                `This game's genre is ${genre}. ` +
                'Resource names should be short and only contain vital information. ' +
                'Write your response as a numbered list, do not explain or respond in full sentences.'
        }, {
            role: 'user',
            content: 'Assign my player some items for the start of the game.'
        }
    ])

    try {
        return itemsFromNumberedList(content)
    } catch {
        if (retries > 0) {
            return genInventory(genre, retries - 1)
        }
        throw new Error('Inventory generation exceeded retry limit.')
    }
}

export {
    genGenre,
    genInventory
}
