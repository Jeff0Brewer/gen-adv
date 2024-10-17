import type { ChatMessage } from '@/lib/messages'
import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import { createMessage } from '@/lib/messages'

const MODEL = 'gpt-3.5-turbo'

const ai = new OpenAI({
    apiKey: process.env.OPENAI_KEY
})

// This is garbage.
async function getCompletion(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const completion = await ai.chat.completions.create({
        model: MODEL,
        // TODO: fix type
        /* eslint-disable-next-line */
        messages: req.body.messages
    })

    // TODO: improve validation for completion responses.
    // Just send first choice for now.
    const { role, content } = completion.choices[0].message
    if (!role || !content) {
        res.status(500).json({ message: 'Completion failed.' })
        return
    }

    const message: ChatMessage = createMessage(
        role,
        content,
        { description: `Completion from ${MODEL}.` }
    )

    res.status(200).json(message)
}

export default getCompletion
