import { getItemizedCompletion } from '../lib/openai'

async function genGenre (): Promise<string> {
    const options = await getItemizedCompletion([
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
    ], 3)

    // Choose random option from list of choices to increase variability of genres.
    return options[Math.floor(Math.random() * options.length)]
}

async function initInventory (genre: string): Promise<string[]> {
    const items = await getItemizedCompletion([
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
    ], 1)

    return items
}

export {
    genGenre,
    initInventory
}
