import type { Message } from '../lib/openai'
import { getCompletion, getItemizedCompletion } from '../lib/completions'
import { itemsToNumberedList, lastRoleIs } from '../lib/openai'

async function updateStory(
    genre: string,
    status: string,
    inventory: string[],
    history: Message[]
): Promise<Message[]> {
    if (!lastRoleIs(history, 'user')) {
        throw new Error('Story update requested without user message.')
    }

    const storyUpdate = await getCompletion([
        {
            role: 'system',
            content: [
                'Act as narrator for an open-ended adventure game.',
                `This game's genre is ${genre}.`,
                'Be highly creative but remain concise.',
                'Do not make decisions for the player, only evaluate their decisions and describe the outcome.'
            ].join(' ')
        }, ...history, {
            role: 'system',
            content: [
                'The player\'s inventory contains the following items:',
                itemsToNumberedList(inventory),
                'The player\'s current condition is as follows:',
                status
            ].join('\n')
        }
    ])

    return [
        ...history,
        { role: 'assistant', content: storyUpdate }
    ]
}

async function updateStatus(
    status: string,
    history: Message[]
): Promise<string> {
    if (!lastRoleIs(history, 'assistant')) {
        throw new Error('Status update requested without assistant message.')
    }

    const currStory = history[history.length - 1].content

    const newStatus = await getCompletion([
        {
            role: 'system',
            content: [
                'You are responsible for realistically managing the health of a player in an adventure game.',
                'Given a description of the player\'s health and a set of events, update the health description based on what happened in the events.',
                'If the player\'s health is the same after the events, repeat the original description.',
                'Be as concise as possible. Do not use full sentences.'
            ].join(' ')
        }, {
            role: 'user',
            content: [
                'In the game, this just happened:',
                currStory,
                'Before that happened, this was the player\'s health:',
                status,
                'Please update the description of the player\'s health based on what happened.'
            ].join('\n')
        }
    ])

    return newStatus
}

async function updateInventory(
    inventory: string[],
    history: Message[]
): Promise<string[]> {
    if (!lastRoleIs(history, 'assistant')) {
        throw new Error('Inventory update requested without assistant message.')
    }

    const currStory = history[history.length - 1].content

    const newInventory = await getItemizedCompletion([
        {
            role: 'system',
            content: [
                'You are responsible for tracking items in an adventure game.',
                'Given a list of items in the player\'s inventory and a set of events from the game, update the list of items to reflect what happened in the game.',
                'Assume that items not mentioned in the game have not changed.',
                'Respond with the updated numbered list, do not explain or use full sentences.'
            ].join(' ')
        }, {
            role: 'user',
            content: [
                'In the game, this just happened:',
                currStory,
                'Before that happened, the player had these items:',
                itemsToNumberedList(inventory),
                'Please update the list of items based on what happened.'
            ].join('\n')
        }
    ], 1)

    return newInventory
}

export {
    updateStory,
    updateStatus,
    updateInventory
}
