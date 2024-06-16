import { getCompletion, getItemizedCompletion } from '../lib/openai'

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

async function initStatus (genre: string): Promise<string> {
    return getCompletion([
        {
            role: 'system',
            content:
                'You are responsible for realistically assigning the condition of the player in an adventure game. ' +
                `This game's genre is ${genre}. ` +
                'Only respond with descriptions of the player\'s current health and any persistent effects they may be experiencing. ' +
                'Do not use full sentences. Do not directly mention the player or user in your description.'
        }, {
            role: 'user',
            content: 'I want to start a new game, describe the initial condition of my player.'
        }
    ])
}

async function initInventory (genre: string): Promise<string[]> {
    return getItemizedCompletion([
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
}

export {
    genGenre,
    initStatus,
    initInventory
}
