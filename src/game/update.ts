import type { Message } from '../lib/openai'
import { getCompletion } from '../lib/completions'
import { itemsToNumberedList, lastRole } from '../lib/openai'

async function updateStory(
    genre: string,
    status: string,
    inventory: string[],
    story: Message[]
): Promise<Message[]> {
    if (lastRole(story) !== 'user') {
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

export {
    updateStory
}
