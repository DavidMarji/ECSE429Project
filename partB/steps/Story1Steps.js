const { Given, When, Then, After } = require('@cucumber/cucumber');
const assert = require('assert');

const request = require('supertest');

const baseUrl = 'http://localhost:4567';

let project1;
let project2;

let resSaved;

let todo1;
let todo2;

let todosList;

After(async () => {
    await request(baseUrl).delete(`/todos/${todo1?.id}`);
    await request(baseUrl).delete(`/todos/${todo2?.id}`);
    await request(baseUrl).delete(`/projects/${project1?.id}`);
    await request(baseUrl).delete(`/projects/${project2?.id}`);

    project1 = undefined;
    project2 = undefined;
    todo1 = undefined;
    todo2 = undefined;
    resSaved = undefined;
    todosList = undefined;
});

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
    console.log("this is ", resSaved);
    assert.strictEqual(resSaved.status, 200);
});

Given('A valid project exists which has no todos assigned', async () => {
    const res = await request(baseUrl).post('/projects');

    assert.strictEqual(res.status, 201);
    project2 = res.body;
});

When('the student requests the list of todos for the project', async () => {
    const res = await request(baseUrl).get(`/projects/${project2.id}/tasks`);
    resSaved = res;
    todosList = res.body.todos;
});

Then('the system should return an empty list', () => {
    assert.strictEqual(Array.isArray(todosList), true);
    assert.strictEqual(todosList.length, 0);
});

Given('the student has selected an invalid project with projectId \"-1\"', () => {
});

Given('the student requests the list of todos for projectId \"-1\"', async () => {
    const res = await request(baseUrl).get(`/projects/-1/tasks`);
    assert.notStrictEqual(res, undefined);
    assert.notStrictEqual(res, null);

    resSaved = res;
});

Then('the system should return an error message about the project id being not found {string}', function (string){
    assert.strictEqual(resSaved.body.errorMessages[0], string);
});

// undocumented behaviour where it prints all todos in the system even if the project doesnt exist (id = -1)
Then('the response status should be 404', () => {
    assert.strictEqual(resSaved.status, 404);

    resSaved = undefined;
});