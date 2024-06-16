type Message = {
    role: 'function' | 'system' | 'user' | 'assistant' | 'tool',
    content: string
}

async function getCompletion (messages: Message[]): Promise<string> {
    const res = await fetch('/api/completion', {
        method: 'POST',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
    })

    if (!res.ok) {
        throw new Error(`Completion failed: ${res.statusText}`)
    }

    const data = await res.json()

    if (!data?.message) {
        throw new Error(`Incomplete response: ${data}`)
    }

    return data.message.content
}

async function getItemizedCompletion (messages: Message[], retries: number = 0): Promise<string[]> {
    const completion = await getCompletion(messages)
    try {
        // Parse items from numbered list, excluding lines not in numbered item.
        return completion
            .split('\n')
            .filter(line => line.match(/^\d*\./))
            .map(line => line.replace(/^\d*\./, '').trim())
    } catch {
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
