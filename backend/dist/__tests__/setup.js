"use strict";
process.env['NODE_ENV'] = 'test';
process.env.TZ = 'Asia/Tokyo';
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
});
afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
});
afterAll(() => {
    jest.clearAllTimers();
});
//# sourceMappingURL=setup.js.map