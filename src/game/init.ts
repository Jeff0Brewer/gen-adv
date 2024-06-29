import { getCompletion, getItemizedCompletion } from '../lib/completions'
import { randomChoice } from '../lib/util'

async function genGenre(): Promise<string> {
    const options = await getItemizedCompletion([
        {
            role: 'system',
            content: [
                'Write your response as a numbered list, do not explain or use full sentences.',
                'Be highly creative and generate only unique answers.'
            ].join(' ')
        },
        {
            role: 'user',
            content: 'Can you provide 10 interesting genres for my RPG adventure game?'
        }
    ], 3)

    // Choose random option from list of choices to increase variability of genres.
    return randomChoice(options)
}

interface PlayerState {
    status: string
    inventory: string[]
}

async function initPlayerState(genre: string): Promise<PlayerState> {
    // Generate base truth description of player character to extract player inventory and current status from.
    // This prevents misalignment of inventory and player status.
    const description = await getCompletion([
        {
            role: 'system',
            content: [
                'You are responsible for assigning the starting condition of a player in an adventure game.',
                `This game's genre is ${genre}.`,
                'Only describe who the player is, an accounting of all items they have, and a detailed description of their overall health.'
            ].join(' ')
        }, {
            role: 'user',
            content: 'I want to start a new game, describe my player but don\'t give them a name.'
        }
    ])

    // Extract player status from description.
    const statusPromise = getCompletion([
        {
            role: 'system',
            content: [
                'Given a description of a character in an adventure game, you will respond with only the details concerning their health.',
                'Respond with the most concise answer possible.'
            ].join(' ')
        }, {
            role: 'user',
            content: description
        }
    ])

    // Extract player inventory from description.
    const inventoryPromise = getItemizedCompletion([
        {
            role: 'system',
            content: [
                'Given a description of a character in an adventure game, you will respond with a list of items in their inventory.',
                'Item names should be as short as possible.',
                'Respond with a numbered list, do not explain or use full sentences.'
            ].join(' ')
        }, {
            role: 'user',
            content: description
        }
    ], 1)

    const [status, inventory] = await Promise.all([statusPromise, inventoryPromise])
    return { status, inventory }
}

export {
    genGenre,
    initPlayerState
}
