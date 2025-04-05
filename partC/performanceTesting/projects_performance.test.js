const { test } = require('uvu');
const assert = require('uvu/assert');
const request = require('supertest');
const baseUrl = 'http://localhost:4567';
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');
const osu = require('node-os-utils');
const os = require("os");

const cpu = osu.cpu;

const checkServer = async () => {
    try {
        await request(baseUrl).get('/projects');
        return true;
    } catch (error) {
        throw new Error('Backend is not running. Please start the server.');
    }
};

test.before(async () => {
    await checkServer();
});

const to_test_for = [
    1, 5, 10, 50, 75,
    100, 200, 300, 400, 500, 600, 700, 800, 900,
    1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000,
    10000, 11000, 12000, 13000, 14000, 15000
]

test('Performance test for projects create and update', async () => {
    const filePath = path.join(__dirname, '../results/project_create.csv');
    const updateFilePath = path.join(__dirname, '../results/project_update.csv');

    const lines = new Array(1)
    lines[0] = 'NumberOfObjects,TransactionTime(ms),MemoryUse(mb),CpuUse';
    
    const updateLines = ['NumberOfObjects,TransactionTime(ms),MemoryUse(mb),CpuUse'];

    for (let i = 0; i <= 15000; i++) {
        const start = performance.now();

        const project = await request(baseUrl).post('/projects').send({
            "title": `example title project, ${i}`,
            "completed": i % 2 === 0,
            "active" : i%2 !==0,
            "description": `${i}th project created`
        });
        const end = performance.now();

        assert.is(project.status, 201);
        assert.is(project.body.completed, i % 2 === 0 ? "true" : "false");
        assert.is(project.body.title, `example title project, ${i}`);
        assert.is(project.body.active, i % 2 !== 0 ? "true" : "false");
        assert.is(project.body.description, `${i}th project created`);

        const time = end - start;

        if(to_test_for.includes(i)) {
            lines.push(`${i},${time},${os.freemem()/(Math.pow(2, 20))},${await cpu.usage()}`);
        }

        if(to_test_for.includes(i)) {
            const start_update = performance.now();

            const updateRes = await request(baseUrl).post(`/projects/${project.body.id}`).send({
                "title" : `new title, ${i}`,
                "completed": i % 2 !== 0,
                "active" : i%2 ===0,
                "description": `${i}th project updated`
            });

            const end_update = performance.now();

            assert.is(updateRes.status, 200);
            assert.is(updateRes.body.id, project.body.id);
            assert.is(updateRes.body.completed, i % 2 !== 0 ? "true" : "false");
            assert.is(updateRes.body.active, i % 2 === 0 ? "true" : "false");
            assert.is(updateRes.body.description, `${i}th project updated`);


            updateLines.push(`${i},${end_update - start_update},${os.freemem()/(Math.pow(2, 20))},${await cpu.usage()}`)
        }
    }

    fs.writeFileSync(filePath, lines.join('\n'));
    fs.writeFileSync(updateFilePath, updateLines.join('\n'));

});

test('Performance test for projects delete', async () => {
    const filePath = path.join(__dirname, '../results/projects_delete.csv');
    const deleteLines = ['NumberOfObjects,TransactionTime(ms),MemoryUse(mb),CpuUse'];

    const res = (await request (baseUrl).get('/projects'));
    const projectList = res.body.projects;
 
    for (let i = projectList.length - 1; i >= 0; i--) {
        const start = performance.now();
        const project = await request(baseUrl).delete(`/projects/${projectList[i].id}`);
        const end = performance.now();
        
        assert.is(project.status, 200)

        if(to_test_for.includes(i)) {
            const time = end - start;
            deleteLines.push(`${i},${time},${os.freemem()/(Math.pow(2, 20))},${await cpu.usage()}`);
        }
    }

    fs.writeFileSync(filePath, deleteLines.join('\n'));

});


test.run();
