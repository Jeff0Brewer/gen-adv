type Message = {
    role: 'function' | 'system' | 'user' | 'assistant' | 'tool',
    content: string
}

async function getCompletion (messages: Message[]): Promise<Message> {
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

    return data.message
}

function itemsFromNumberedList (content: string): string[] {
    try {
        return content
            .replace(/\d*\./g, '')
            .split('\n')
            .map(item => item.trim())
    } catch {
        throw new Error(`Expected numbered list, received:\n${content}`)
    }
}

export type { Message }
export {
    getCompletion,
    itemsFromNumberedList
}
