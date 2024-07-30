import type { Message } from '../lib/openai'
import { getCompletion, getItemizedCompletion } from '../lib/completions'
import { itemsToNumberedList, lastRoleIs } from '../lib/openai'

async function evaluateAction(
    genre: string,
    status: string,
    inventory: string[],
    history: Message[],
    retries = 0
): Promise<boolean> {
    if (!lastRoleIs(history, 'user')) {
        throw new Error('Action evaluation requested without user message.')
    }

    const [story, action] = history.slice(-2).map(msg => msg.content)

    const evaluation = await getCompletion([
        {
            role: 'system',
            content: [
                'The player\'s health is in the following condition:',
                status,
                'The player\'s inventory contains the following items:',
                itemsToNumberedList(inventory)
            ].join('\n')
        }, {
            role: 'system',
            content: [
                'This turn of the game starts here:',
                story
            ].join('\n')
        }, {
            role: 'system',
            content: [
                'The player decided to take this action:',
                action
            ].join('\n')
        }, {
            role: 'system',
            content: [
                'You are the ruthless and decisive judge of an open ended adventure game.',
                `The genre of this game is ${genre}.`,
                'Given a turn in the game and the player\'s chosen action for this turn, you will judge how realistic their chosen action is.',
                'Respond only with the words \'SUCCEED\' or \'FAIL\'',
                'If the player\'s action is realistic and would succeed, respond with: SUCCEED',
                'If the player\'s action is unrealistic and would fail, respond with: FAIL'
            ].join(' ')
        }, {
            role: 'user',
            content: 'What is the most realistic outcome of the player\'s chosen action?'
        }
    ])

    console.log(action, evaluation)

    switch (evaluation) {
        case 'SUCCEED':
            return true
        case 'FAIL':
            return false
        default:
            if (retries > 0) {
                console.log('Retrying action evaluation, expected \'SUCCEED\' or \'FAIL\' recieved:', evaluation)
                return evaluateAction(genre, status, inventory, history, retries - 1)
            }

            throw new Error(
                'evaluateAction exceeded retry limit, ensure prompt requires \'SUCCEED\' or \'FAIL\' response only.'
            )
    }
}

async function updateStory(
    genre: string,
    status: string,
    inventory: string[],
    history: Message[],
    actionSucceeded: boolean
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
                status,
                actionSucceeded
                    ? 'The player successfully performs their chosen action.'
                    : 'The player failed to perform their chosen action.'
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
    updateInventory,
    evaluateAction
}
