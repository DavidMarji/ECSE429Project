const { test } = require('uvu');
const assert = require('uvu/assert');
const request = require('supertest');
const baseUrl = 'http://localhost:4567';
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');
const os = require('os');
const osu = require('node-os-utils');

const cpu = osu.cpu;

const checkServer = async () => {
    try {
        await request(baseUrl).get('/todos');
        return true;
    } catch (error) {
        throw new Error('Backend is not running. Please start the server.');
    }
};

const deleteAllTodos = async () => {
    try {
        const allTodos = (await request(baseUrl).get('/todos')).body.todos;
        for (const todo of allTodos) {
            await request(baseUrl).delete(`/todos/${todo.id}`);
        }
    } catch (error) {
        throw new Error("Something went wrong in deleting all todos before the test. " + error.message);
    }
};

test.before(async () => {
    await checkServer();
    await deleteAllTodos();
});

const to_test_for = [
    1, 5, 10, 50, 75,
    100, 200, 300, 400, 500, 600, 700, 800, 900,
    1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000,
    10000
]

test('Performance test for todo create', async () => {
    let prevCpu = os.cpus();
    const filePath = path.join(__dirname, '../results/todo_create.csv');
    
    const lines = new Array(1)
    lines[0] = 'NumberOfObjects,TransactionTime(ms),MemoryUse(mb),CpuUse';

    for (let i = 0; i <= 10000; i++) {
        const start = performance.now();

        const todo = await request(baseUrl).post('/todos').send({
            "title": `example title, ${i}`,
            "doneStatus": i % 2 === 0,
            "description": `${i}th todo created`
        });
        const end = performance.now();

        assert.is(todo.status, 201);
        const time = end - start;

        if(to_test_for.includes(i)){
            lines.push(`${i},${time},${os.freemem()/(Math.pow(2, 20))},${await cpu.usage()}`);
        }
    }

    fs.writeFileSync(filePath, lines.join('\n'));

});

test.run();
