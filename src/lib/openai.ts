type Message = {
    role: 'function' | 'system' | 'user' | 'assistant' | 'tool',
    content: string
}

async function getCompletion (messages: Array<Message>): Promise<Message> {
    const res = await fetch('/api/completion', {
        method: 'POST',
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

export type { Message }
export {
    getCompletion
}
