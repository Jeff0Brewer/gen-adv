interface Message {
    agent: string
    content: string
    source: MessageSource
    formatted?: Message
}

interface MessageSource {
    description: string
    reasoning?: Message[][]
}

function isMessageList(obj: unknown): obj is Message[] {
    const typed = obj as Message[]
    return (
        Array.isArray(typed)
        && typed.reduce(
            (allValid, message) => allValid && isMessage(message),
            true
        )
    )
}

function isMessage(obj: unknown): obj is Message {
    const typed = obj as Message
    return (
        typeof typed?.agent === 'string'
        && typeof typed?.content === 'string'
        && isMessageSource(typed?.source)
    )
}

function isMessageSource(obj: unknown): obj is MessageSource {
    const typed = obj as MessageSource
    if (typeof typed?.description !== 'string') {
        return false
    }

    if (!typed?.reasoning) {
        return true
    }

    // Ensure reasoning is 2d list of messages.
    return (
        Array.isArray(typed.reasoning)
        && typed.reasoning.reduce(
            (allValid, attempt) =>
                allValid && attempt.reduce(
                    (allValid, message) => allValid && isMessage(message),
                    true
                )
            ,
            true
        )
    )
}

export {
    isMessage,
    isMessageList
}

export type {
    Message,
    MessageSource
}
