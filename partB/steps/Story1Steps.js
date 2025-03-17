const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

const request = require('supertest');

const baseUrl = 'http://localhost:4567';

let project1;
let project2;

let resSaved;

let todo1;
let todo2;

let todosList;

Given('The server is running', async () => {
    await request(baseUrl).get('/projects');
});

Given('A valid project exists which has valid todos associated with it', async () => {
    const res = await request(baseUrl).post('/projects');

    assert.strictEqual(res.status, 201);
    project1 = res.body;

    const todo1Res = await request(baseUrl).post('/todos').send({
        title: "example todo1"
    });
    const todo2Res = await request(baseUrl).post('/todos').send({
        title: "example todo2"
    });

    assert.strictEqual(todo1Res.status, 201);
    assert.strictEqual(todo2Res.status, 201);

    todo1 = todo1Res.body;
    todo2 = todo2Res.body;

    const resTodo1Taskof = await request(baseUrl).post(`/todos/${todo1.id}/tasksof`).send({
        "id" : `${project1.id}`
    });
    const resTodo2Taskof = await request(baseUrl).post(`/todos/${todo2.id}/tasksof`).send({
        "id" : `${project1.id}`
    });

    assert.strictEqual(resTodo1Taskof.status, 201);
    assert.strictEqual(resTodo2Taskof.status, 201);

    const resTodo1Get = await request(baseUrl).get(`/todos/${todo1.id}`);
    const resTodo2Get = await request(baseUrl).get(`/todos/${todo2.id}`);

    assert.strictEqual(resTodo1Get.status, 200);
    assert.strictEqual(resTodo2Get.status, 200);

    todo1 = resTodo1Get.body.todos[0];
    todo2 = resTodo2Get.body.todos[0];
});

When('the student requests the list of todos for the valid project using its id', async () => {
    const res = await request(baseUrl).get(`/projects/${project1.id}/tasks`);
    resSaved = res;
    console.log("this is res.body", res.body);
    todosList = res.body.todos;
});

Then('the system should return a list of todos associated with the project', async () => {
    assert.strictEqual(Array.isArray(todosList), true);
    assert.strictEqual(todosList.length, 2);
});

Then('the list should display details for each todo \\(e.g., title, description, due date)', () => {
    for(let t of todosList) {
        if(t.id === todo1.id) {
            assert.strictEqual(t.title, todo1.title);
            assert.strictEqual(t.doneStatus, todo1.doneStatus);
            assert.strictEqual(t.description, todo1.description);
            assert.deepStrictEqual(t.tasksof, todo1.tasksof);
        }
        else if(t.id === todo2.id) {
            assert.strictEqual(t.title, todo2.title);
            assert.strictEqual(t.doneStatus, todo2.doneStatus);
            assert.strictEqual(t.description, todo2.description);
            assert.deepStrictEqual(t.tasksof, todo2.tasksof);
        }
    }
})

Then('the response status should be 200', async () => {
    assert.strictEqual(resSaved.status, 200);

    request(baseUrl).delete(`/todos/${todo1.id}`);
    request(baseUrl).delete(`/todos/${todo2.id}`);
    request(baseUrl).delete(`/projects/${project1.id}`);
});