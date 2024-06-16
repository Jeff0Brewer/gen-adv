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

type PlayerState = {
    status: string,
    inventory: string[]
}

async function initPlayerState (genre: string): Promise<PlayerState> {
    // Generate base truth description of player character to extract
    // player inventory and current status from.
    // Prevents misalignment of items with current player state.
    const description = await getCompletion([
        {
            role: 'system',
            content:
                'You are responsible for assigning the starting condition of a player in an adventure game. ' +
                `This game's genre is ${genre}. ` +
                'Only describe who the player is, an accounting of all items they have, and a detailed description of their overall health.'
        }, {
            role: 'user',
            content: 'I want to start a new game, describe my player but don\'t give them a name.'
        }
    ])

    // Extract player status from description.
    const statusPromise = getCompletion([
        {
            role: 'system',
            content:
                'You are responsible for describing the condition of the player in an adventure game. ' +
                `This game's genre is ${genre}. ` +
                'Given a description of a character, you will respond with only the details concerning their health.' +
                'Respond with the most concise answer possible.'
        }, {
            role: 'user',
            content: description
        }
    ])

    // Extract player inventory from description.
    const inventoryPromise = getItemizedCompletion([
        {
            role: 'system',
            content:
                'You are responsible for tracking the items a player has in an advendure game. ' +
                `This game's genre is ${genre}. ` +
                'Given a description of a character, you will respond with only a list of the items they have. ' +
                'Item names should be as short as possible. ' +
                'Only respond with a numbered list, do not explain or respond in full sentences.'
        }, {
            role: 'user',
            content: description
        }
    ])

    const [status, inventory] = await Promise.all([statusPromise, inventoryPromise])
    return { status, inventory }
}

export {
    genGenre,
    initPlayerState
}
