import type { ReactElement } from 'react'
import { FaPlay } from 'react-icons/fa'
import { useGameContext } from '../hooks/game-context'
import styles from '../styles/app.module.css'

function App(): ReactElement {
    const { genre, status, inventory } = useGameContext()

    return (
        <main className={styles.app}>
            <section className={styles.info}>
                <InfoItem label="genre" content={genre} />
                <InfoItem label="status" content={status} />
                <InfoItem label="inventory" content={inventory} />
            </section>
            <section className={styles.main}>
                <GameInput />
            </section>
        </main>
    )
}

function GameInput(): ReactElement {
    return (
        <div className={styles.input}>
            <textarea></textarea>
            <button>
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
        <div>
            <p className={styles.infoLabel}>
                {label}
            </p>
            { typeof content === 'string'
            && <p>{content}</p> }
            { Array.isArray(content) && content.map((item, i) =>
                <p key={i}>{item}</p>) }
        </div>
    )
}

export default App
