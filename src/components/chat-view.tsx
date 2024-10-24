import type { ChatMessage, ChatMessageSource } from '@/lib/messages'
import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { MdInfo } from 'react-icons/md'
import styles from '@/styles/chat-view.module.css'

interface ChatViewProps {
    chat: ChatMessage[]
}

function ChatView(
    { chat }: ChatViewProps
): ReactElement {
    return (
        <section className={styles.chat}>
            {chat.map((msg, i) =>
                <MessageView message={msg} key={i} />)}
        </section>
    )
}

interface MessageViewProps {
    message: ChatMessage
}

function MessageView(
    { message }: MessageViewProps
): ReactElement {
    const { role, content, source } = message
    return (
        <div className={styles.message} data-role={role}>
            <label>{role}</label>
            <div>
                <p>{content}</p>
                <MessageInfoView source={source} />
            </div>
        </div>
    )
}

interface MessageInfoViewProps {
    source: ChatMessageSource
}

function MessageInfoView(
    { source }: MessageInfoViewProps
): ReactElement {
    const [expanded, setExpanded] = useState<boolean>(false)
    const [reasoningIndex, setReasoningIndex] = useState<number | null>(null)

    const { description, reasoning } = source

    // Update reasoning index on message change.
    useEffect(() => {
        // Don't need index if no reasoning.
        if (!reasoning) {
            setReasoningIndex(null)
            return
        }

        // Default to last attempt.
        setReasoningIndex(reasoning.length - 1)
    }, [reasoning])

    return (
        <div className={styles.info} data-expanded={expanded}>
            <button className={styles.infoToggle} onClick={() => setExpanded(!expanded)}>
                <MdInfo />
            </button>
            {expanded && (
                <div className={styles.infoList}>
                    <p>{description}</p>
                    {reasoning && reasoningIndex !== null && (
                        <div>
                            <p>Generation Attempts</p>
                            <div className={styles.indexSelect}>
                                {reasoning.map((_, i) => (
                                    <button key={i} onClick={() => setReasoningIndex(i)} data-active={reasoningIndex === i}>
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <div className={styles.chatWindow}>
                                <ChatView chat={reasoning[reasoningIndex]} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default ChatView
