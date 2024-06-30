import type { Message } from '../lib/openai'
import { getCompletion } from '../lib/completions'
import { itemsToNumberedList, lastRoleIs } from '../lib/openai'

async function updateStory(
    genre: string,
    status: string,
    inventory: string[],
    story: Message[]
): Promise<Message[]> {
    if (!lastRoleIs(story, 'user')) {
        throw new Error('Story update requested without user message.')
    }

    const nextStep = await getCompletion([
        {
            role: 'system',
            content: [
                'Act as narrator for an open-ended adventure game.',
                `This game's genre is ${genre}.`,
                'Be highly creative but remain concise.'
            ].join(' ')
        }, ...story, {
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
        ...story,
        { role: 'assistant', content: nextStep }
    ]
}

async function updateStatus(
    status: string,
    story: Message[]
): Promise<string> {
    if (!lastRoleIs(story, 'assistant')) {
        throw new Error('Status update requested without assistant message.')
    }

    const currStory = story[story.length - 1].content

    const newStatus = await getCompletion([
        {
            role: 'system',
            content: [
                'You are responsible for realistically managing the health of a player in an adventure game.',
                'Given a description of the player\'s health and a set of events, update the health description based on what happened in the events.',
                'If the player\'s health is the same after the events, do not edit the original description.',
                'Be as concise as possible. Do not use full sentences.'
            ].join(' ')
        }, {
            role: 'user',
            content: [
                'In the game, this just happened:',
                currStory,
                'Before that happened, this was my player\'s health:',
                status,
                'Please update the description on my player\'s health based on what happened.'
            ].join('\n')
        }
    ])

    return newStatus
}

export {
    updateStory,
    updateStatus
}
