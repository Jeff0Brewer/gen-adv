const ROLES = [
    'function',
    'system',
    'user',
    'assistant',
    'tool'
] as const
type MessageRole = (typeof ROLES)[number]

interface Message {
    role: MessageRole
    content: string
}

function isValidMessage(obj: unknown): obj is Message {
    const { role, content } = obj as Message
    return (
        typeof content === 'string'
        && content.length > 0
        && ROLES.includes(role)
    )
}

function lastRole(history: Message[]): MessageRole {
    return history[history.length - 1].role
}

function itemsFromNumberedList(content: string): string[] {
    const lines = content.split('\n')

    // Exclude non-numbered lines to prevent gibberish from headers / descriptions.
    const numberedLines = lines.filter(l => l.match(/^\d*\./))

    const items = numberedLines.map(l => l.replace(/^\d*\./, '').trim())
    if (items.length === 0) {
        throw new Error(`Expected numbered list, no numbered items found:\n${content}`)
    }
    return items
}

function itemsToNumberedList(items: string[]): string {
    return items
        .map((item, i) => `${i + 1}. ${item}`)
        .join('\n')
}

export type { Message }
export {
    isValidMessage,
    lastRole,
    itemsFromNumberedList,
    itemsToNumberedList
}
