const { Given, When, Then, After } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('supertest');

const baseUrl = 'http://localhost:4567';
let todoId, projectId, anotherProjectId;

After(async () => {
    if (todoId !== undefined) await request(baseUrl).delete(`/todos/${todoId}`);
    if (projectId !== undefined) await request(baseUrl).delete(`/projects/${projectId}`);
    if (anotherProjectId !== undefined) await request(baseUrl).delete(`/projects/${anotherProjectId}`);
    
    todoId = undefined;
    projectId = undefined;
    anotherProjectId = undefined;
});

Given('a valid project exists', async () => {
    const response = await request(baseUrl).post('/projects').send({"title" : "example title story 3"});

    assert.strictEqual(response.status, 201);
    projectId = response.body.id;
});

Given('a valid todo exists', async () => {
    const response = await request(baseUrl)
        .post('/todos')
        .send({ title: 'example todo1' });

    assert.strictEqual(response.status, 201);
    todoId = response.body.id;
});

Given('A todo already assigned to a project exists', async () => {
    const res = await request(baseUrl).post(`/todos/${todoId}/tasksof`).send({ id: projectId });
    assert.strictEqual(res.status, 201);
});

Given('a different project exists', async () => {
    const response = await request(baseUrl)
        .post('/projects').send({"title" : "example title story 3 a different project exists"});

    assert.strictEqual(response.status, 201);
    anotherProjectId = response.body.id;
});

When('the student attempts to add the todo to the project', async () => {
    this.response = await request(baseUrl).post(`/todos/${todoId}/tasksof`).send({ id: projectId });
});

When('the student attempts to add the todo to a different project', async () => {
    this.response = await request(baseUrl).post(`/todos/${todoId}/tasksof`).send({ id: anotherProjectId });
});

When('the student attempts to add the todo to a project with int id "-1"', async () => {
    this.response = await request(baseUrl).post(`/todos/${todoId}/tasksof`).send({ id: "-1" });
});

When('the student attempts to add the todo with id "-1" to the project', async () => {
    this.response = await request(baseUrl).post('/todos/-1/tasksof').send({ id: projectId });
});

Then('the system should add the project\'s id in the todo\'s tasksof section', async () => {
    const response = await request(baseUrl).get(`/todos/${todoId}`);
    assert.strictEqual(response.status, 200);
    
    let found = false;
    for (const task of response.body.todos) {
        if(task.id === todoId) {
            assert.notStrictEqual(task.tasksof, undefined);

            for(const taskof of task.tasksof) {
                if(taskof.id === projectId) {
                    found = true;
                    break;
                }
            }
        }
    }

    assert(found);
});

Then('the response status for assigning the todo to the project should be {int}', async (statusCode) => {
    assert.strictEqual(this.response.status, statusCode);
});

Then('the system should return an error message about the non-existent project {string}', async (errorMessage) => {
    assert.strictEqual(this.response.status, 404);
    assert(this.response.body.errorMessages[0].includes(errorMessage));
});

Then('the system should return an error message about the non-existent todo {string}', async (errorMessage) => {
    assert.strictEqual(this.response.status, 404);
    assert(this.response.body.errorMessages[0].includes(errorMessage));
});

Then('the response status when attempting to assign the project to a non-existent project should be {int}', async (statusCode) => {
    assert.strictEqual(this.response.status, statusCode);
});
