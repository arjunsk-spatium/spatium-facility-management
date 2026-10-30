import { vi } from 'vitest';

if (typeof globalThis.requestAnimationFrame === 'undefined') {
    globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
        return setTimeout(cb, 0) as unknown as number;
    };
}
if (typeof globalThis.cancelAnimationFrame === 'undefined') {
    globalThis.cancelAnimationFrame = (id: number) => {
        clearTimeout(id);
    };
}
