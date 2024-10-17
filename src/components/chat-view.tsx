import type { ChatMessage, ChatMessageSource } from '@/lib/messages'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa'
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

    // Update reasoning index on message change.
    useEffect(() => {
        // Don't need index if no reasoning.
        if (!source?.reasoning) {
            setReasoningIndex(null)
            return
        }

        // Default to last attempt.
        setReasoningIndex(source.reasoning.length - 1)
    }, [source])

    const incReasoningIndex = useCallback(() => {
        if (reasoningIndex === null || !source?.reasoning) {
            return
        }
        setReasoningIndex((reasoningIndex + 1) % source.reasoning.length)
    }, [reasoningIndex, source])

    const decReasoningIndex = useCallback(() => {
        if (reasoningIndex === null || !source?.reasoning) {
            return
        }
        const numAttempts = source.reasoning.length
        setReasoningIndex((reasoningIndex - 1 + numAttempts) % numAttempts)
    }, [reasoningIndex, source])

    return (
        <div className={styles.info} data-expanded={expanded}>
            <button className={styles.infoToggle} onClick={() => setExpanded(!expanded)}>
                <MdInfo />
            </button>
            {expanded && (
                <div className={styles.infoList}>
                    <p>{source.description}</p>
                    {source.reasoning && reasoningIndex !== null && (
                        <div>
                            <div className={styles.reasoningSelect}>
                                <button onClick={decReasoningIndex}>
                                    <FaCaretLeft />
                                </button>
                                <p>
                                    generation attempt #
                                    {reasoningIndex + 1}
                                </p>
                                <button onClick={incReasoningIndex}>
                                    <FaCaretRight />
                                </button>
                            </div>
                            <div className={styles.chatWindow}>
                                <ChatView chat={source.reasoning[reasoningIndex]} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default ChatView
