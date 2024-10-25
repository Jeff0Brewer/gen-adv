import type { Message } from '@/lib/messages'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { ChatCompletionMessageParam } from 'openai/src/resources/index.js'
import OpenAI from 'openai'
import { isMessageList } from '@/lib/messages'

const MODEL = 'gpt-3.5-turbo'

const ai = new OpenAI({
    apiKey: process.env.OPENAI_KEY
})

interface CompletionNextApiRequest extends NextApiRequest {
    body: {
        agent: string
        messages: Message[]
    }
}

function toCompletionFormat(chat: Message[], completionAgent: string): ChatCompletionMessageParam[] {
    return chat.map(
        ({ agent, content }) => {
            const role = agent === 'user'
                ? 'user'
                : agent === completionAgent
                    ? 'assistant'
                    : 'system'
            return { role, content }
        }
    )
}

// This is garbage.
async function getCompletion(req: CompletionNextApiRequest, res: NextApiResponse): Promise<void> {
    if (!isMessageList(req.body?.messages)) {
        throw new Error('Invalid `messages` field.')
    }

    if (typeof req.body?.agent !== 'string') {
        throw new Error('Invalid `agent` field.')
    }

    const messages = toCompletionFormat(req.body.messages, req.body.agent)

    const completion = await ai.chat.completions.create({
        model: MODEL,
        messages
    })

    // TODO: improve validation for completion responses.
    // Just send first choice for now.
    const { role, content } = completion.choices[0].message
    if (!role || !content) {
        res.status(500).json({ message: 'Completion failed.' })
        return
    }

    const message: Message = {
        agent: req.body.agent,
        content,
        source: { description: `Completion from ${MODEL}.` }
    }

    res.status(200).json(message)
}

export default getCompletion
