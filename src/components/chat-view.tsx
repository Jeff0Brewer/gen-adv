import type { ChatMessage } from '@/lib/messages'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useState } from 'react'
import styles from '@/styles/chat-view.module.css'

interface ChatViewProps {
    chat: ChatMessage[]
}

function ChatView(
    { chat }: ChatViewProps
): ReactElement {
    return (
        <section className={styles.chat}>
            {chat.map((msg, i) => <MessageView message={msg} key={i} />)}
        </section>
    )
}

interface MessageViewProps {
    message: ChatMessage
}

function MessageView(
    { message }: MessageViewProps
): ReactElement {
    const [expanded, setExpanded] = useState<boolean>(false)
    const [reasoningIndex, setReasoningIndex] = useState<number | null>(null)

    // Update reasoning index on message change.
    useEffect(() => {
        // Don't need index if no reasoning.
        if (!message.source?.reasoning) {
            setReasoningIndex(null)
            return
        }

        // Default to last attempt.
        setReasoningIndex(message.source.reasoning.length - 1)
    }, [message])

    const incReasoningIndex = useCallback(() => {
        if (reasoningIndex === null || !message.source?.reasoning) {
            return
        }
        setReasoningIndex((reasoningIndex + 1) % message.source.reasoning.length)
    }, [reasoningIndex, message])

    const decReasoningIndex = useCallback(() => {
        if (reasoningIndex === null || !message.source?.reasoning) {
            return
        }
        const numAttempts = message.source.reasoning.length
        setReasoningIndex((reasoningIndex - 1 + numAttempts) % numAttempts)
    }, [reasoningIndex, message])

    const { role, content, source } = message

    return (
        <div className={styles.message} data-role={role}>
            <div className={styles.labelBar}>
                <label className="label">{role}</label>
                <button className={`label ${styles.infoButton}`} onClick={() => setExpanded(!expanded)}>
                    {expanded ? '- ' : '+ '}
                    info
                </button>
            </div>
            {expanded && (
                <div className={styles.info}>
                    <div className={styles.infoBox}>
                        <label className="label">description</label>
                        <p>{source.description}</p>
                    </div>
                    {source?.reasoning && reasoningIndex !== null && (
                        <div className={styles.infoBox}>
                            <label className="label">reasoning</label>
                            <div>
                                <button onClick={decReasoningIndex}>{'<'}</button>
                                <p>
                                    attempt #
                                    {reasoningIndex + 1}
                                </p>
                                <button onClick={incReasoningIndex}>{'>'}</button>
                            </div>
                            <ChatView chat={source.reasoning[reasoningIndex]} />
                        </div>
                    )}
                </div>
            )}
            <p>{content}</p>
        </div>
    )
}

export default ChatView
