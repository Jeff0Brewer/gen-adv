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
            <label className="label">{role}</label>
            <p>{content}</p>
        </div>
    )
}

export default ChatView
