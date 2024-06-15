import type { ReactElement } from 'react'
import Head from 'next/head'

function Home (): ReactElement {
    return (
        <>
            <Head>
                <title>gen adventure</title>
                <meta name="description" content="Adventure game powered by generative ai" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
        </>
    )
}

export default Home
