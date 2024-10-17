type ChatRole = 'user' | 'assistant' | 'system' | 'tool'

interface ChatMessageSource {
    description: string
    reasoning?: ChatMessage[][]
}

interface ChatMessage {
    id: string
    role: ChatRole
    content: string
    source: ChatMessageSource
}

function createMessage(role: ChatRole, content: string, source: ChatMessageSource): ChatMessage {
    const id = crypto.randomUUID()
    return { id, role, content, source }
}

function promptMessage(role: ChatRole, content: string): ChatMessage {
    return createMessage(
        role,
        content,
        { description: 'Static prompt.' }
    )
}

function systemPrompt(content: string): ChatMessage {
    return promptMessage('system', content)
}

function userPrompt(content: string): ChatMessage {
    return promptMessage('user', content)
}

export {
    createMessage,
    userPrompt,
    systemPrompt
}

export type {
    ChatRole,
    ChatMessage,
    ChatMessageSource
}
