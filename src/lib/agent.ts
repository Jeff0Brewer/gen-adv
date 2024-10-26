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

    async getCompletion(chat: Message[], retries = 3, reasoning: Message[][] = []): Promise<Message> {
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
        reasoning.push([...messages, { ...completion }])

        if (!this.formatter) {
            completion.source.reasoning = reasoning
            return completion
        }

        // This will throw errors a lot.
        // TODO: Add auto retries here.
        let formattedContent = 'FORMAT ERROR'
        try {
            formattedContent = this.formatter.format(completion.content)
        }
        catch (e) {
            console.error(e)
            if (retries > 0) {
                console.log(`Retrying generation for agent '${this.name}'`)
                return this.getCompletion(chat, retries - 1, reasoning)
            }
        }

        completion.source.reasoning = reasoning
        completion.formatted = {
            agent: this.name,
            content: formattedContent,
            source: {
                description: this.formatter.description,
                reasoning: reasoning
            }
        }

        return this.formatOptions.alwaysFormat
            ? completion.formatted
            : completion
    }
}

export default Agent
