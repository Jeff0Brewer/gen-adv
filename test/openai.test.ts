import { expect, test } from 'vitest'
import { isValidMessage, itemsFromNumberedList } from '../src/lib/openai'

test('itemsFromNumberedList only returns numbered items', () => {
    expect(
        itemsFromNumberedList(
            [
                'Header to exclude',
                '1. cats',
                'Unnumbered item to exclude',
                '2. dogs',
                '3. fish',
                'Description to exclude'
            ].join('\n')
        )
    ).toEqual(
        ['cats', 'dogs', 'fish']
    )
})

test('itemsFromNumberedList throws when no numbered items present', () => {
    expect(() => {
        itemsFromNumberedList(
            [
                'This is not a numbered list. Confusion is upon us.',
                'We must throw an error!'
            ].join('\n')
        )
    }).toThrow()
})

test('isValidMessage returns true on assistant message with valid content', () => {
    expect(
        isValidMessage({
            role: 'assistant',
            content: 'Hello.'
        })
    ).toBe(true)
})

test('isValidMessage returns false on user message with empty content', () => {
    expect(
        isValidMessage({
            role: 'user',
            content: ''
        })
    ).toBe(false)
})

test('isValidMessage returns false on message with invalid role', () => {
    expect(
        isValidMessage({
            role: 'phil',
            content: 'Phil has arrived.'
        })
    ).toBe(false)
})

test('isValidMessage returns false on message missing role field', () => {
    expect(
        isValidMessage({
            content: 'Help me.'
        })
    ).toBe(false)
})

test('isValidMessage returns false on message missing content field', () => {
    expect(
        isValidMessage({
            role: 'user'
        })
    ).toBe(false)
})
