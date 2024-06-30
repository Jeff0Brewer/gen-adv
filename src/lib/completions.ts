import type { Message } from '../lib/openai'
import { isValidMessage, itemsFromNumberedList } from '../lib/openai'

async function getCompletion(messages: Message[]): Promise<string> {
    const res = await fetch('/api/completion', {
        method: 'POST',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
    })

    if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`)
    }

    const message = await res.json() as unknown

    if (!isValidMessage(message)) {
        throw new Error('Invalid completion format.')
    }

    return message.content
}

async function getItemizedCompletion(messages: Message[], retries = 0): Promise<string[]> {
    const completion = await getCompletion(messages)

    try {
        return itemsFromNumberedList(completion)
    }
    catch {
        // Retry if completion not formatted as expected.
        if (retries > 0) {
            console.log(`Retrying itemized completion. (${retries - 1} remaining)`)
            return getItemizedCompletion(messages, retries - 1)
        }

        // Error if retry limit exceeded.
        throw new Error(
            'Itemized completion exceeded retry limit, ensure prompt requires numbered output.'
        )
    }
}

export type { Message }
export {
    getCompletion,
    getItemizedCompletion
}
