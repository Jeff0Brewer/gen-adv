import type { ReactElement } from 'react'
import { useCallback, useRef } from 'react'
import { FaPlay } from 'react-icons/fa'
import GameProvider from '../components/game-provider'
import { useGameContext } from '../hooks/game-context'
import styles from '../styles/app.module.css'

function App(): ReactElement {
    return (
        <GameProvider>
            <main className={styles.app}>
                <InfoDisplay />
                <StoryDisplay />
                <UserInput />
            </main>
        </GameProvider>
    )
}

function InfoDisplay(): ReactElement {
    const {
        genre,
        status,
        inventory
    } = useGameContext()

    return (
        <section className={styles.info}>
            <InfoItem label="genre" content={genre} />
            <InfoItem label="status" content={status} />
            <InfoItem label="inventory" content={inventory} />
        </section>
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

function StoryDisplay(): ReactElement {
    const { story } = useGameContext()

    return (
        <section className={styles.story}>
            {story.split('\n').map((line, i) => <p key={i}>{line}</p>)}
        </section>
    )
}

function UserInput(): ReactElement {
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

export default App
