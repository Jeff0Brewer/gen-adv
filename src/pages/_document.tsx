import type { ReactElement } from 'react'
import { Head, Html, Main, NextScript } from 'next/document'

export default function Document (): ReactElement {
    return (
        <Html lang="en">
            <Head />
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
