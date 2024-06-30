import type { MutableRefObject, RefObject } from 'react'

function getRef<T>(ref: RefObject<T> | MutableRefObject<T>): T {
    const value = ref.current

    if (value === null) {
        throw new Error('Tried to use null ref value.')
    }

    return value
}

export {
    getRef
}
