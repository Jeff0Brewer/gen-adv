const ROLES = [
    'function',
    'system',
    'user',
    'assistant',
    'tool'
] as const

interface Message {
    role: (typeof ROLES)[number]
    content: string
}

function isValidMessage(obj: unknown): obj is Message {
    const { role, content } = obj as Message
    return ROLES.includes(role) && typeof content === 'string'
}

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
        // Parse items from numbered list, excluding lines not in numbered item.
        return completion
            .split('\n')
            .filter(line => line.match(/^\d*\./))
            .map(line => line.replace(/^\d*\./, '').trim())
    }
    catch {
        console.error(`Expected numbered list, recieved: \n${completion}`)

        // Retry if completion not formatted as expected.
        if (retries > 0) {
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
