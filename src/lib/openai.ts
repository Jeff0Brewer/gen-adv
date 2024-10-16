type ChatRole = 'user' | 'assistant' | 'system' | 'tool'

interface ChatMessage {
    role: ChatRole
    content: string
}

export type {
    ChatRole,
    ChatMessage
}
