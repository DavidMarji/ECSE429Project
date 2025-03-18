const { Given, When, Then, After } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('supertest');

const baseUrl = 'http://localhost:4567';
let todoId, categoryIds = [];

After(async () => {
    if (todoId) await request(baseUrl).delete(`/todos/${todoId}`);
    for (const categoryId of categoryIds) {
        await request(baseUrl).delete(`/categories/${categoryId}`);
    }
    todoId = undefined;
    categoryIds = [];
});

Given('a todo exists and multiple categories exist and the todo is associated with them', async () => {
    // Create a todo
    const todoResponse = await request(baseUrl)
        .post('/todos')
        .send({ title: 'example todo1' });

    assert.strictEqual(todoResponse.status, 201);
    todoId = todoResponse.body.id;

    // Create multiple categories
    for (let i = 0; i < 2; i++) {
        const categoryResponse = await request(baseUrl)
            .post('/categories')
            .send({ title: `Category ${i + 1}` });

        assert.strictEqual(categoryResponse.status, 201);
        const categoryId = categoryResponse.body.id;
        categoryIds.push(categoryId);

        // Associate categories with the todo
        const linkResponse = await request(baseUrl)
            .post(`/todos/${todoId}/categories`)
            .send({ id: categoryId });

        assert.strictEqual(linkResponse.status, 201);
    }
});

Given('a todo exists and it is associated to no categories', async () => {
    // Create a todo with no associated categories
    const response = await request(baseUrl)
        .post('/todos')
        .send({ title: 'example todo2' });

    assert.strictEqual(response.status, 201);
    todoId = response.body.id;
});

When('the student requests the list of categories for the todo using its id', async () => {
    this.response = await request(baseUrl).get(`/todos/${todoId}/categories`);
});

Given('the student requests the list of categories for the todo using {string}', async (todoId) => {
    this.response = await request(baseUrl).get(`/todos/${todoId}/categories`);
});

Then('the system should return a list of categories ids associated to the todo', async () => {
    assert.strictEqual(this.response.status, 200);

    assert.strictEqual(this.response.body.categories.length > 0, true);
    for (const category of this.response.body.categories) {
        assert.strictEqual(categoryIds.includes(category.id), true);
    }
});

Then('the system should return an empty list of categories', async () => {
    assert.strictEqual(this.response.status, 200);
    assert(Array.isArray(this.response.body.categories));
    assert.strictEqual(this.response.body.categories.length, 0);
});

Then('the response status should be 200 when the student requests to see all the categories the todo falls under', async () => {
    assert.strictEqual(this.response.status, 200);
});


// bug/undocumented behaviour where it prints all categories when todo doesnt exist instead of doing the more intuitive option of returning 404 since the todo id doesnt exist
Then('the response status should be 404 for the invalid todos categories', async () => {
    assert.strictEqual(this.response.status, 404);
});
