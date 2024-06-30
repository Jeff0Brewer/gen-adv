import type { ReactElement } from 'react'
import { useGameContext } from '../hooks/game-context'
import styles from '../styles/info-display.module.css'

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
        <div className={`${styles.item} ${content === null && styles.hidden}`}>
            <p className={styles.label}>
                {label}
            </p>
            { typeof content === 'string' && <p>{content}</p> }
            { Array.isArray(content) && content.map((item, i) =>
                <p key={i}>{item}</p>) }
        </div>
    )
}

export default InfoDisplay
