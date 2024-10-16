type ChatRole = 'user' | 'assistant' | 'system' | 'tool'

interface ChatMessageSource {
    description: string
    reasoning?: ChatMessage[][]
}

interface ChatMessage {
    role: ChatRole
    content: string
    source: ChatMessageSource
}

function promptMessage(role: ChatRole, content: string): ChatMessage {
    return {
        role,
        content,
        source: { description: 'Static prompt.' }
    }
}

function systemPrompt(content: string): ChatMessage {
    return promptMessage('system', content)
}

function userPrompt(content: string): ChatMessage {
    return promptMessage('user', content)
}

export {
    userPrompt,
    systemPrompt
}

export type {
    ChatRole,
    ChatMessage
}
