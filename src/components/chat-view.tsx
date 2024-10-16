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
            {chat.map(({ role, content }, i) => (
                <div className={styles.message} data-role={role} key={i}>
                    <label className="label">{role}</label>
                    <p>{content}</p>
                </div>
            ))}
        </section>
    )
}

export default ChatView
