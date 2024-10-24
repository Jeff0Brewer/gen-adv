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

function staticPromptMessage(role: ChatRole, content: string): ChatMessage {
    return createMessage(
        role,
        content,
        { description: 'Static prompt.' }
    )
}

function staticSystemPrompt(content: string): ChatMessage {
    return staticPromptMessage('system', content)
}

function staticUserPrompt(content: string): ChatMessage {
    return staticPromptMessage('user', content)
}

export {
    createMessage,
    staticUserPrompt,
    staticSystemPrompt
}

export type {
    ChatRole,
    ChatMessage,
    ChatMessageSource
}
