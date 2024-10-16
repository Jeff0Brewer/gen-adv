import type { ChatMessage } from '@/lib/messages'
import type { ReactElement } from 'react'
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
    const { role, content } = message

    return (
        <div className={styles.message} data-role={role}>
            <div className={styles.labelBar}>
                <label className="label">{role}</label>
                <button className={`label ${styles.infoButton}`}>+ info</button>
            </div>
            <p>{content}</p>
        </div>
    )
}

export default ChatView
