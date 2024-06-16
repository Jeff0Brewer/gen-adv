import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { getGenre } from '../game/logic'
import styles from '../styles/app.module.css'

function App (): ReactElement {
    const [genre, setGenre] = useState<string | null>(null)

    useEffect(() => {
        getGenre().then(genre => setGenre(genre))
    }, [])

    return (
        <main className={styles.app}>
            <section className={styles.info}>
                <InfoItem label={'genre'} content={genre} />
            </section>
        </main>
    )
}

type InfoItemProps = {
    label: string,
    content: string | string[] | null
}

function InfoItem (
    { label, content }: InfoItemProps
): ReactElement {
    return (
        <div>
            <p className={styles.infoLabel}>
                {label}
            </p>
            { typeof content === 'string' &&
                <p>{content}</p> }
            { Array.isArray(content) && content.map((item, i) =>
                <p key={i}>{item}</p>) }
        </div>
    )
}

export default App
