import type { ReactElement } from 'react'
import { useCallback, useRef } from 'react'
import { FaPlay } from 'react-icons/fa'
import { useGameContext } from '../hooks/game-context'
import { getLatestStory } from '../lib/openai'
import styles from '../styles/app.module.css'

function App(): ReactElement {
    const {
        genre,
        status,
        inventory,
        story
    } = useGameContext()

    return (
        <main className={styles.app}>
            <section className={styles.info}>
                <InfoItem label="genre" content={genre} />
                <InfoItem label="status" content={status} />
                <InfoItem label="inventory" content={inventory} />
            </section>
            <section className={styles.story}>
                {story && getLatestStory(story)
                    .split('\n')
                    .map((line, i) => <p key={i}>{line}</p>)}
            </section>
            <GameInput />
        </main>
    )
}

function GameInput(): ReactElement {
    const { setUserMessage } = useGameContext()
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const sendMessage = useCallback(() => {
        if (!inputRef.current) {
            throw new Error('No reference to input element.')
        }
        const content = inputRef.current.value
        if (content.length > 0) {
            setUserMessage(content)
            inputRef.current.value = ''
        }
    }, [setUserMessage])

    return (
        <div className={styles.input}>
            <textarea ref={inputRef}></textarea>
            <button onClick={sendMessage}>
                <FaPlay />
            </button>
        </div>
    )
}

interface InfoItemProps {
    label: string
    content: string | string[] | null
}

function InfoItem(
    { label, content }: InfoItemProps
): ReactElement {
    return (
        <div className={`${styles.infoItem} ${content === null && styles.hidden}`}>
            <p className={styles.infoLabel}>
                {label}
            </p>
            { typeof content === 'string' && (
                <p>{content}</p>
            ) }
            { Array.isArray(content) && content.map((item, i) =>
                <p key={i}>{item}</p>) }
        </div>
    )
}

export default App
