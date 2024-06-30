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
                'Be highly creative and descriptive but remain concise.',
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
                'If the player\'s health unchanged, repeat the original description.',
                'Be as concise as possible. Do not use full sentences or explain yourself.'
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

    const [userAction, currStory] = history.slice(-2).map(msg => msg.content)

    const newInventory = await getItemizedCompletion([
        {
            role: 'system',
            content: [
                'You are responsible for tracking items in an adventure game.',
                'You will receive a list of items in the player\'s inventory and a step in the story of the game.',
                'From the details of the story, edit the list of items to reflect what happened in the story.',
                'Only change items explicitly mentioned in the story.',
                'Do not remove items that can be used multiple times.',
                'Item names should be as short as possible',
                'Respond with a numbered list, do not explain or use full sentences.'
            ].join(' ')
        }, {
            role: 'system',
            content: [
                'The player\'s inventory contains these items:',
                itemsToNumberedList(inventory)
            ].join('\n')
        }, {
            role: 'system',
            content: [
                'The player chose this action:',
                userAction
            ].join('\n')
        }, {
            role: 'system',
            content: [
                'The result of the player\'s chosen action is as follows:',
                currStory
            ].join('\n')
        }, {
            role: 'user',
            content: 'List the items in my player\'s inventory after the last turn.'
        }
    ], 1)

    return newInventory
}

export {
    updateStory,
    updateStatus,
    updateInventory
}
