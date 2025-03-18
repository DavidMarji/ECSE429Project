const { Given, When, Then, After } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('supertest');

const baseUrl = 'http://localhost:4567';
let todoId;

// Cleanup after each scenario
After(async () => {
    if (todoId) await request(baseUrl).delete(`/todos/${todoId}`);
    todoId = undefined;
});

// Convert string to boolean
const toBoolean = (value) => value.toLowerCase() === "true";

Given('a todo exists in the system with title {string}, doneStatus {string}, and description {string}', async (title, doneStatus, description) => {
    const response = await request(baseUrl)
        .post('/todos')
        .send({ "title": title, "doneStatus": toBoolean(doneStatus), "description": description });
    
    assert.strictEqual(response.status, 201);
    todoId = response.body.id;
});

When('the student attempts to update the todos title to {string}, doneStatus to {string}, and description to {string} using its id', async (title, doneStatus, description) => {
    this.response = await request(baseUrl)
        .post(`/todos/${todoId}`)
        .send({ "title": title, "doneStatus": toBoolean(doneStatus), "description": description });
});

Then('the system should update the todo and replace the title to {string}, doneStatus to {string}, and description to {string}', async (title, doneStatus, description) => {
    const response = await request(baseUrl).get(`/todos/${todoId}`);
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.todos[0].title, title);
    assert.strictEqual(response.body.todos[0].doneStatus, doneStatus);
    assert.strictEqual(response.body.todos[0].description, description);
});

When('the student attempts to update the todos title {string} using its id', async (title) => {
    this.response = await request(baseUrl)
        .post(`/todos/${todoId}`)
        .send({ "title": title });
});

Then('the system should update the todo with the new title', async () => {
    const response = await request(baseUrl).get(`/todos/${todoId}`);
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.todos[0].title, 'newExample');
});

When('the student submits updated details for a todo using a non-existent id {string}', async (id) => {
    this.response = await request(baseUrl)
        .post(`/todos/${id}`)
        .send({ title: 'New Title' });
});

When('the student submits updated details for an existing todo using its id and attempts to update the id', async () => {
    this.response = await request(baseUrl)
        .post(`/todos/${todoId}`)
        .send({ id: '999' });
});

Then('the response status should be {int} after the title and description updates', async (statusCode) => {
    assert.strictEqual(this.response.status, statusCode);
});

Then('the response status should be {int} after the title update', async (statusCode) => {
    assert.strictEqual(this.response.status, statusCode);
});

Then('the response status should be {int} after the non-existent todo', async (statusCode) => {
    assert.strictEqual(this.response.status, statusCode);
});

Then('the response status should be {int} after the failed id update', async (statusCode) => {
    assert.strictEqual(this.response.status, statusCode);
});

Then('the system should return an error message about the ids {string}', async (errorMessage) => {
    assert.strictEqual(this.response.body.errorMessages[0], errorMessage);
});