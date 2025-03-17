const { Given, When, Then, After } = require('@cucumber/cucumber');
const assert = require('assert');

const request = require('supertest');

const baseUrl = 'http://localhost:4567';

let todo1 = undefined;
let resSaved = undefined;
let project1 = undefined;

After(async () => {
   todo1 = undefined;
   resSaved = undefined;

   if(project1)
    await request(baseUrl).delete(`/projects/${project1.id}`);

   project1 = undefined;
});

Given('the server is running', async () => {
    await request(baseUrl).get('/projects');
});

Given("a valid todo exists with doneStatus {string}", async (string) => {
    const res = await request(baseUrl).post("/todos").send({
        "title" : "example todo1",
        "doneStatus" : string === "true"
    });

    assert.strictEqual(res.status, 201);

    todo1 = res.body;
});

When("the student requests to delete the completed todo", async () => {
    const res = await request(baseUrl).delete(`/todos/${todo1.id}`);
    resSaved = res;
});

Then("the system should delete the todo", async () => {
   const res = await request(baseUrl).get(`/todos/${todo1.id}`);
   assert.notStrictEqual(res, undefined);

   assert.strictEqual(res.status, 404);
   
   assert.notStrictEqual(res.body, undefined);
   assert.notStrictEqual(res.body.errorMessages, undefined);
   assert.strictEqual(res.body.errorMessages[0], `Could not find an instance with todos/${todo1.id}`);
});

Then("the response status after deletion should be 200", () => {
    assert.strictEqual(resSaved.status, 200);
});

Given("a todo is assigned to a project", async () => {
    const todoRes = await request(baseUrl).post('/todos').send({
        "title" : "example"
    });

    assert.strictEqual(todoRes.status, 201);

    assert.notStrictEqual(todoRes.body, undefined);
    todo1 = todoRes.body;

    const projectRes = await request(baseUrl).post('/projects');
    assert.strictEqual(projectRes.status, 201);
    assert.notStrictEqual(projectRes.body, undefined);
    project1 = projectRes.body;

    const taskRes = await request(baseUrl).post(`/todos/${todo1.id}/tasksof`).send({
        "id" : project1.id
    });

    assert.strictEqual(taskRes.status, 201);
});

Given("the student requests to delete the todo", async () => {
    resSaved = await request(baseUrl).delete(`/todos/${todo1.id}`);
});


Then("the project\'s tasks list should no longer include the todo's id", async () => {
    const res = await request(baseUrl).get(`/projects/${project1.id}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.tasks, undefined); // since it only had a single todo, the tasks array shouldn't be sent in the api
});

Given("the student requests to delete the todo with id {int}", async (int) => {
    resSaved = await request(baseUrl).delete(`/todos/${int}`);
});

Then("the system should return an error message about the todo id being not found {string}", (string) => {
    assert.strictEqual(resSaved.body.errorMessages[0], string);
});

Then("the response status after attempted deletion should be 404", () => {
    assert.strictEqual(resSaved.status, 404);
});