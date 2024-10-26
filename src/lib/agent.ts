import type { Message } from './messages'
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { getCompletion } from './generation'

interface FormatOptions {
    useFormatted: boolean
    alwaysFormat: boolean
}

interface ContentFormatter {
    format: (c: string) => string
    description: string
}

class Agent {
    name: string
    prompt: Message
    formatOptions: FormatOptions
    formatter?: ContentFormatter

    constructor(
        name: string,
        instruction: string,
        formatOptions: FormatOptions,
        formatter?: ContentFormatter
    ) {
        this.name = name
        this.prompt = {
            agent: 'system',
            content: instruction,
            source: { description: 'Agent instruction prompt.' }
        }
        this.formatOptions = formatOptions
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
        let messages = [this.prompt, ...chat]

        if (this.formatOptions.useFormatted) {
            messages = messages.map(
                message => message?.formatted ? message.formatted : message
            )
        }

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

        if (!this.formatter) {
            return completion
        }

        // This will throw errors a lot.
        // TODO: Add auto retries here.
        const formattedContent = this.formatter.format(completion.content)
        completion.formatted = {
            agent: this.name,
            content: formattedContent,
            source: {
                description: this.formatter.description,
                reasoning: completion.source.reasoning
            }
        }

        return this.formatOptions.alwaysFormat
            ? completion.formatted
            : completion
    }
}

export default Agent
