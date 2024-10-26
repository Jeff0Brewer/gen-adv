import type { Message } from './messages'
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { getCompletion } from './generation'

interface ContentFormatter {
    format: (c: string) => string
    description: string
}

const DEFAULT_FORMATTER: ContentFormatter = {
    format: c => c,
    description: 'Unchanged completion output.'
}

class Agent {
    name: string
    prompt: Message
    formatter: ContentFormatter

    constructor(
        name: string,
        instruction: string,
        formatter: ContentFormatter = DEFAULT_FORMATTER
    ) {
        this.name = name
        this.prompt = {
            agent: 'system',
            content: instruction,
            source: { description: 'Agent instruction prompt.' }
        }
        this.formatter = formatter
    }

    // TODO: make readable.
    toPerspective(chat: Message[]): ChatCompletionMessageParam[] {
        return chat.map(
            ({ agent, content }) => {
                const role
                    = agent === 'user'
                        ? 'user'
                        : agent === this.name
                            ? 'assistant'
                            : 'system'
                return { role, content }
            }
        )
    }

    async getCompletion(chat: Message[]): Promise<Message> {
        const messages = [this.prompt, ...chat]

        const { content } = await getCompletion(this.toPerspective(messages))
        if (typeof content !== 'string') {
            throw new Error(`Completion failed for agent '${this.name}'`)
        }

        const completion: Message = {
            agent: this.name,
            content,
            source: {
                description: `Completion from agent '${this.name}'`
            }
        }

        // Wierd copy to keep completion output in source history.
        // Reevaluate later.
        completion.source.reasoning = [[...messages, { ...completion }]]

        // This will throw errors a lot.
        // TODO: Add auto retries here.
        const formatted = this.formatter.format(completion.content)

        return {
            agent: this.name,
            content: formatted,
            source: {
                description: this.formatter.description,
                reasoning: completion.source.reasoning
            }
        }
    }
}

export default Agent
