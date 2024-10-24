import type { ChatMessage, ChatMessageSource } from '@/lib/messages'
import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { MdInfo } from 'react-icons/md'
import styles from '@/styles/chat-view.module.css'

// Debug view for full chat history.
interface ChatViewProps {
    chat: ChatMessage[]
}

function ChatView(
    { chat }: ChatViewProps
): ReactElement {
    return (
        <section className={styles.chat}>
            {chat.map(({ role, content, source }, i) => (
                <div className={styles.message} data-role={role} key={i}>
                    <label>{role}</label>
                    <div>
                        <p>{content}</p>
                        <SourceView source={source} />
                    </div>
                </div>
            ))}
        </section>
    )
}

// Displays information about source of messages to debug generation.
// Includes full context of message rationale + generation attempt history.
interface SourceViewProps {
    source: ChatMessageSource
}

function SourceView(
    { source }: SourceViewProps
): ReactElement {
    const [expanded, setExpanded] = useState<boolean>(false)
    const { description, reasoning } = source

    return (
        <div className={styles.info} data-expanded={expanded}>
            <button className={styles.infoToggle} onClick={() => setExpanded(!expanded)}>
                <MdInfo />
            </button>
            {expanded && (
                <div className={styles.infoList}>
                    <p>{description}</p>
                    <ReasoningView reasoning={reasoning} />
                </div>
            )}
        </div>
    )
}

// Displays full chat history for intermediate generation steps used to construct message.
// Recursively uses `ChatView` component to display as many layers of generation as needed.
interface ReasoningViewProps {
    reasoning?: ChatMessage[][]
}

function ReasoningView(
    { reasoning }: ReasoningViewProps
): ReactElement {
    const [reasoningIndex, setReasoningIndex] = useState<number | null>(null)

    // Update reasoning index on message change.
    useEffect(() => {
        if (!reasoning || reasoning.length === 0) {
            setReasoningIndex(null)
        }
        else {
            // Default to final reasoning attempt.
            setReasoningIndex(reasoning.length - 1)
        }
    }, [reasoning])

    // Do not render anything if no reasoning present.
    if (!reasoning?.length || reasoningIndex === null) {
        return <></>
    }

    return (
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
    )
}

export default ChatView
