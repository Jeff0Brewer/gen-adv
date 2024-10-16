import type { ChatMessage } from '@/lib/messages'
import type { ReactElement } from 'react'
import { useState } from 'react'
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
                </div>
            )}
            <p>{content}</p>
        </div>
    )
}

export default ChatView
