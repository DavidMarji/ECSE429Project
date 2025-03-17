const request = require('supertest');
const baseUrl = 'http://localhost:4567';
const checkServer = async () => {
    try {
        await request(baseUrl).get('/todos');
        return true;
    } catch (error) {
        throw new Error('Backend is not running. Please start the server.');
    }
};

testCases = [
    ['GET /todos - should return all todos', async () => {
        const res = await request(baseUrl).get('/todos');
        expect(res.status).toBe(200);
        expect(res.body.todos).toBeInstanceOf(Array);
    }],

   ['GET /todos?doneStatus=false - should return all todos with doneStatus=false', async () => {
        const res = await request(baseUrl).get('/todos?doneStatus=false');
        expect(res.status).toBe(200);
        expect(res.body.todos).toBeInstanceOf(Array);
        for(let i = 0; i < res.body.todos.length; i++) {
            expect(res.body.todos[i].doneStatus).toBe("false");
        }
   }],

   ['GET /todos?doneStatus=true - should return all todos with doneStatus=true', async () => {
    const res = await request(baseUrl).get('/todos?doneStatus=true');
    expect(res.status).toBe(200);
    expect(res.body.todos).toBeInstanceOf(Array);
    for(let i = 0; i < res.body.todos.length; i++) {
        expect(res.body.todos[i].doneStatus).toBe("true");
    }
    }],

    ['HEAD /todos - should return 200', async () => {
        const res = await request(baseUrl).head('/todos');
        expect(res.status).toBe(200);
    }],

    ['HEAD /todos?doneStatus=true - should return 200', async () => {
        const res = await request(baseUrl).head('/todos?doneStatus=true');
        expect(res.status).toBe(200);
    }],

    ['POST /todos - should return 400 since no title and it is mandatory', async () => {
        const res = await request(baseUrl).post('/todos');
        expect(res.status).toBe(400);
    }],

    ['POST /todos - should return 201 since title is given', async () => {
        const res = await (request(baseUrl).post('/todos').send({title: 'Test Todo', description: 'Test Description'}));
        expect(res.status).toBe(201);
    }],

    ['get /todos/:id - should return 200', async () => {
        // create an example with post as todos could be empty
        const resPost = await (request(baseUrl).post('/todos').send({title: 'Test Todo', description: 'Test Description'}));
        expect(resPost.status).toBe(201);

        const res= await (request(baseUrl).get('/todos'));
        expect(res.status).toBe(200);

        for(let i = 0; i < res.body.todos.length; i++) {
            const resId = await (request(baseUrl).get('/todos/' + res.body.todos[i].id));
            expect(resId.status).toBe(200);
            expect(resId.body.todos[0]).toStrictEqual(res.body.todos[i]);
        }
    }],

    ['get /todos/:id - should return 404 for negative id', async () => {

        const res= await (request(baseUrl).get(`/todos/${-1}`));
        expect(res.status).toBe(404);
    }],

    ['get /todos/:id - should return 404 for non-existent id', async () => {

        const allTodos = await (request(baseUrl).get(`/todos`));
        expect(allTodos.status).toBe(200);

        // delete all todos and try to get a to do with id 23
        for(let i = 0; i < allTodos.body.todos.length; i++) {
            await request(baseUrl).delete(`/todos/${allTodos.body.todos[i].id}`)
        }

        const res= await (request(baseUrl).get(`/todos/${23}`));
        expect(res.status).toBe(404);
    }],
    
    ['head /todos/:id - should return 200', async () => {
        // create an example with post as todos could be empty
        const resPost = await (request(baseUrl).post('/todos').send({title: 'Test Todo', description: 'Test Description'}));
        expect(resPost.status).toBe(201);

        const res= await (request(baseUrl).get('/todos'));
        expect(res.status).toBe(200);

        for(let i = 0; i < res.body.todos.length; i++) {
            const resId = await (request(baseUrl).head('/todos/'+res.body.todos[i].id));
            expect(resId.status).toBe(200);
        }
    }],

    ['head /todos/:id - should return 404 for negative id', async () => {
        const res= await (request(baseUrl).head(`/todos/-1`));
        expect(res.status).toBe(404);
    }],

    ['head /todos/:id - should return 404 for non-existent id', async () => {
        const allTodos = await (request(baseUrl).get(`/todos`));
        expect(allTodos.status).toBe(200);

        // delete all todos and try to get a to do with id 23
        for(let i = 0; i < allTodos.body.todos.length; i++) {
            await request(baseUrl).delete(`/todos/${allTodos.body.todos[i].id}`)
        }

        const res= await (request(baseUrl).head(`/todos/${23}`));
        expect(res.status).toBe(404);
    }],

    ['post /todos/:id - should return 200 and update todo with the given id', async () => {
        const resPost = await (request(baseUrl).post('/todos').send({ title : "example", doneStatus : false}));
        expect(resPost.status).toBe(201)

        const res = await (request(baseUrl).post(`/todos/${resPost.body.id}`).send({ title : "newTitle", doneStatus : true }));
        expect(res.status).toBe(200);

        const resUpdated = await (request(baseUrl).post(`/todos/${resPost.body.id}`));
        expect(resUpdated.status).toBe(200);

        expect(resUpdated.body).toStrictEqual(res.body);
    }],

    ['post /todos/:id - should return 404 for non-existent id', async () => {
        const allTodos = await (request(baseUrl).get(`/todos`));
        expect(allTodos.status).toBe(200);

        // delete all todos and try to get a to do with id 23
        for(let i = 0; i < allTodos.body.todos.length; i++) {
            await request(baseUrl).delete(`/todos/${allTodos.body.todos[i].id}`)
        }

        const res = await (request(baseUrl).post('/todos/').send({title : "newTitle", doneStatus : true }));
        expect(res.status).toBe(404)
    }],

    ['post /todos/:id - should return 404 for id -1', async () => {
        const res = await (request(baseUrl).post('/todos/-1').send({title : "newTitle", doneStatus : true }));
        expect(res.status).toBe(404)
    }],

    // here it passes but with put it doesn't. So they work differently and this was undocumented
    ['post /todos/:id - should return 200 and update todo with the given id without title in body', async () => {
        const resPost = await (request(baseUrl).post('/todos').send({ title : "example", doneStatus : false}));
        expect(resPost.status).toBe(201)

        const res = await (request(baseUrl).post(`/todos/${resPost.body.id}`).send({ doneStatus : true }));
        expect(res.status).toBe(200);

        const resUpdated = await (request(baseUrl).get(`/todos/${resPost.body.id}`));
        expect(resUpdated.status).toBe(200);

        expect(resUpdated.body.todos[0]).toStrictEqual(res.body);
    }],
    
    ['put /todos/:id - should return 200 and update todo with the given id', async () => {
        const resPost = await (request(baseUrl).post('/todos').send({ title : "example", doneStatus : false}));
        expect(resPost.status).toBe(201)

        const res = await (request(baseUrl).put(`/todos/${resPost.body.id}`).send({ title : "newTitle", doneStatus : true }));
        expect(res.status).toBe(200);

        const resUpdated = await (request(baseUrl).get(`/todos/${resPost.body.id}`));
        expect(resUpdated.status).toBe(200);

        expect(resUpdated.body.todos[0]).toStrictEqual(res.body);
    }],

    // bug
    // undocumented that put must have title when post doesn't need it
    ['put /todos/:id - should return 200 and update todo with the given id without title in body', async () => {
        const resPost = await (request(baseUrl).post('/todos').send({ title : "example", doneStatus : false}));
        expect(resPost.status).toBe(201)

        const res = await (request(baseUrl).put(`/todos/${resPost.body.id}`).send({ doneStatus : true }));
        expect(res.status).toBe(200);

        const resUpdated = await (request(baseUrl).get(`/todos/${resPost.body.id}`));
        expect(resUpdated.status).toBe(200);

        expect(resUpdated.body.todos[0]).toStrictEqual(res.body);
    }],

    ['put /todos/:id - should return 404 for non-existent id', async () => {
        const allTodos = await (request(baseUrl).get(`/todos`));
        expect(allTodos.status).toBe(200);

        // delete all todos and try to get a to do with id 23
        for(let i = 0; i < allTodos.body.todos.length; i++) {
            await request(baseUrl).delete(`/todos/${allTodos.body.todos[i].id}`)
        }

        const res = await (request(baseUrl).put('/todos/1').send({title : "newTitle", doneStatus : true }));
        expect(res.status).toBe(404)
    }],
        

    ['put /todos/:id - should return 404 for id -1', async () => {
        const res = await (request(baseUrl).put('/todos/-1').send({title : "newTitle", doneStatus : true }));
        expect(res.status).toBe(404)
    }],

    ['delete /todos/:id - should return 404 for id -1', async () => {
        const res = await (request(baseUrl).delete('/todos/-1'));
        expect(res.status).toBe(404)
    }],

    ['delete /todos/:id - should return 200 for existing id and get /todos/:id after deletion should return 404', async () => {
        const resPost = await (request(baseUrl).post('/todos').send({ title : "example", doneStatus : false}));
        expect(resPost.status).toBe(201);

        const res = await (request(baseUrl).delete(`/todos/${resPost.body.id}`));
        expect(res.status).toBe(200);

        const getRes = await (request(baseUrl).get(`/todos/${resPost.body.id}`));
        expect(getRes.status).toBe(404);
    }],

    ['get /todos/:id/tasksof - should return 200 for existing id and should get correct tasksof', async () => {
        const projectPost = await (request(baseUrl).post('/projects'));
        expect(projectPost.status).toBe(201);

        const todoPost = await ((request(baseUrl).post('/todos')).send({
            title : "example",
            tasksof : [ { id : `${projectPost.body.id}`} ]
        }));
        expect(todoPost.status).toBe(201);
        expect(todoPost.body.tasksof).toBeInstanceOf(Array);

        const res = await (request(baseUrl).get(`/todos/${todoPost.body.id}/tasksof`));

        expect(res.status).toBe(200);
        expect(res.body.projects).toBeInstanceOf(Array);
        expect(res.body.projects[0].id).toStrictEqual(todoPost.body.tasksof[0].id);
    }],

    // fails due to bug
    ['get /todos/:id/tasksof - should return 404 for non-existent todo id', async () => {
        const allTodos = await (request(baseUrl).get(`/todos`));
        expect(allTodos.status).toBe(200);

        // delete all todos and try to get a to do with id 23
        for(let i = 0; i < allTodos.body.todos.length; i++) {
            await request(baseUrl).delete(`/todos/${allTodos.body.todos[i].id}`)
        }

        const res = await (request(baseUrl).get(`/todos/23/tasksof`));
        expect(res.status).toBe(404);
    }],

    // fails due to bug
    ['get /todos/:id/tasksof - should return 404 for negative todo id', async () => {
        const allTodos = await (request(baseUrl).get(`/todos`));
        expect(allTodos.status).toBe(200);

        // delete all todos and try to get a to do with id 23
        for(let i = 0; i < allTodos.body.todos.length; i++) {
            await request(baseUrl).delete(`/todos/${allTodos.body.todos[i].id}`)
        }

        const res = await (request(baseUrl).get(`/todos/-1/tasksof`));
        expect(res.status).toBe(404);
    }],

    ['head /todos/:id/tasksof - should return 200 for existing id', async () => {
        const projectPost = await (request(baseUrl).post('/projects'));
        expect(projectPost.status).toBe(201);

        const todoPost = await ((request(baseUrl).post('/todos')).send({
            title : "example",
            tasksof : [ { id : `${projectPost.body.id}`} ]
        }));
        expect(todoPost.status).toBe(201);
        expect(todoPost.body.tasksof).toBeInstanceOf(Array);

        const res = await (request(baseUrl).head(`/todos/${todoPost.body.id}/tasksof`));

        expect(res.status).toBe(200);
    }],

    // fails due to bug
    ['head /todos/:id/tasksof - should return 404 for negative id', async () => {
        const res = await (request(baseUrl).head(`/todos/-1/tasksof`));
        expect(res.status).toBe(404);
    }],

    // fails due to bug
    ['head /todos/:id/tasksof - should return 404 for non-existent id', async () => {
        const allTodos = await (request(baseUrl).get(`/todos`));
        expect(allTodos.status).toBe(200);

        // delete all todos and try to get a to do with id 23
        for(let i = 0; i < allTodos.body.todos.length; i++) {
            await request(baseUrl).delete(`/todos/${allTodos.body.todos[i].id}`)
        }

        const res = await (request(baseUrl).head(`/todos/123/tasksof`));

        expect(res.status).toBe(404);
    }],

    ['post /todos/:id/tasksof - should return 200 for existing todo id and should create a tasksof relationship in the todo', async () => {
        // created a project to use in the test
        const projectPost = await (request(baseUrl).post('/projects'));
        expect(projectPost.status).toBe(201);

        // created a todo to use in the test
        const todoPost = await ((request(baseUrl).post('/todos')).send({
            title : "example",
        }));
        expect(todoPost.status).toBe(201);

        const res = await (request(baseUrl).post(`/todos/${todoPost.body.id}/tasksof`).send({ "id" : projectPost.body.id }));
        // created the relationship
        expect(res.status).toBe(201);

        // get the todo with the id we know
        const getTodo = await (request(baseUrl).get(`/todos/${todoPost.body.id}`));
        expect(getTodo.status).toBe(200);
        expect(getTodo.body.todos[0].tasksof).toBeInstanceOf(Array);
        expect(getTodo.body.todos[0].tasksof[0].id).toBe(`${projectPost.body.id}`);
    }],

    // fails due to a bug where it creates a new project for the todo
    // this behaviour was undocumented so it might be intended but it was never mentioned
    ['post /todos/:id/tasksof - should return 400 for existing todo id and no project id in the body', async () => {
        // created a todo to use in the test
        const todoPost = await ((request(baseUrl).post('/todos')).send({
            title : "example",
        }));
        expect(todoPost.status).toBe(201);

        const res = await (request(baseUrl).post(`/todos/${todoPost.body.id}/tasksof`));
        // created the relationship
        expect(res.status).toBe(400);
    }],

    ['post /todos/:id/tasksof - should return 404 for negative todo id and a valid body', async () => {
        // created a project to use in the test
        const projectPost = await (request(baseUrl).post('/projects'));
        expect(projectPost.status).toBe(201);

        const res = await (request(baseUrl).post(`/todos/-1/tasksof`).send({ "id" : projectPost.body.id }));
        // created the relationship
        expect(res.status).toBe(404);
    }],

    ['post /todos/:id/tasksof - should return 404 for existing todo id and a non-existent project id in req body', async () => {
        // created a project to use in the test
        const todoPost = await ((request(baseUrl).post('/todos')).send({
            title : "example",
        }));
        expect(todoPost.status).toBe(201);

        const res = await (request(baseUrl).post(`/todos/${todoPost.body.id}/tasksof`).send({ "id" : -1 }));
        // created the relationship
        expect(res.status).toBe(404);
    }],

    ['post /todos/:id/tasksof - should return 404 for existing todo id and a non-existent project id in req body', async () => {
        // created a project to use in the test
        const todoPost = await ((request(baseUrl).post('/todos')).send({
            title : "example",
        }));
        expect(todoPost.status).toBe(201);

        const res = await (request(baseUrl).post(`/todos/${todoPost.body.id}/tasksof`).send({ "id" : -1 }));
        // created the relationship
        expect(res.status).toBe(404);
    }],

    ['DELETE /todos/:id/tasksof/:id - should return 200 for valid ids and existing relation', async () => {
        // Create a project to use in the test
        const projectPost = await (request(baseUrl).post('/projects'));
        expect(projectPost.status).toBe(201);
    
        // Create a todo to use in the test
        const todoPost = await ((request(baseUrl).post('/todos')).send({
            title : "example",
            tasksof : [{ id : `${projectPost.body.id}`}]
        }));
        expect(todoPost.status).toBe(201);
    
        // Delete the tasksof relation
        const res = await (request(baseUrl).delete(`/todos/${todoPost.body.id}/tasksof/${projectPost.body.id}`));
        expect(res.status).toBe(200);
    
        // Verify the relationship is removed
        const getTodo = await (request(baseUrl).get(`/todos/${todoPost.body.id}`));
        expect(getTodo.status).toBe(200);
        expect(getTodo.body.todos[0].tasksof).toStrictEqual(undefined);
    }],
    
    
    ['DELETE /todos/:id/tasksof/:id - should return 404 for valid ids but no relation exists', async () => {
        // Create a project to use in the test
        const projectPost = await (request(baseUrl).post('/projects'));
        expect(projectPost.status).toBe(201);
    
        // Create a todo to use in the test
        const todoPost = await ((request(baseUrl).post('/todos')).send({
            title : "example"
        }));
        expect(todoPost.status).toBe(201);
    
        // Try to delete the tasksof relation when none exists
        const res = await (request(baseUrl).delete(`/todos/${todoPost.body.id}/tasksof/${projectPost.body.id}`));
        expect(res.status).toBe(404);
    }],
    
    
    ['DELETE /todos/:id/tasksof/:id - should return 404 for todo id exists but tasksof id does not', async () => {
        // Create a todo to use in the test
        const todoPost = await ((request(baseUrl).post('/todos')).send({
            title : "example"
        }));
        expect(todoPost.status).toBe(201);
    
        // Try to delete a non-existent tasksof relation
        const res = await (request(baseUrl).delete(`/todos/${todoPost.body.id}/tasksof/${-1}`));
        expect(res.status).toBe(404);
    }],
    
    
    ['DELETE /todos/:id/tasksof/:id - should return 404 for tasksof id exists but todo id does not', async () => {
        // Create a project to use in the test
        const projectPost = await (request(baseUrl).post('/projects'));
        expect(projectPost.status).toBe(201);
    
        // Try to delete a tasksof relation for a non-existent todo
        const res = await (request(baseUrl).delete(`/todos/${-1}/tasksof/${projectPost.body.id}`));
        expect(res.status).toBe(404);
    }],

    ['GET /todos/:id/categories - should return 200 and categories for valid todo id', async () => {
        // Create a todo to use in the test
        const todoPost = await ((request(baseUrl).post('/todos')).send({
            title : "example"
        }));
        expect(todoPost.status).toBe(201);
    
        // Create a category and associate it with the todo
        const categoryPost = await ((request(baseUrl).post(`/todos/${todoPost.body.id}/categories`)).send({
            title: "Office",
            description: ""
        }));
        expect(categoryPost.status).toBe(201);
    
        // Retrieve categories for the created todo
        const res = await (request(baseUrl).get(`/todos/${todoPost.body.id}/categories`));
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            categories: [
                {
                    id: expect.any(String),  // The id will be dynamically generated
                    title: "Office",
                    description: ""
                }
            ]
        });
    }],
    
    // fails due to bug where it doesn't return 404 not found if todo id doesnt exist
    ['GET /todos/:id/categories - should return 404 for todo id that does not exist', async () => {
        const res = await (request(baseUrl).get(`/todos/${-1}/categories`));
        expect(res.status).toBe(404);
    }],

    ['HEAD /todos/:id/categories - should return 200 and categories for valid todo id', async () => {
        // Create a todo to use in the test
        const todoPost = await ((request(baseUrl).post('/todos')).send({
            title : "example"
        }));
        expect(todoPost.status).toBe(201);
    
        // Create a category and associate it with the todo
        const categoryPost = await ((request(baseUrl).post(`/todos/${todoPost.body.id}/categories`)).send({
            title: "Office",
            description: ""
        }));
        expect(categoryPost.status).toBe(201);
    
        // Send HEAD request to check categories for the created todo
        const res = await (request(baseUrl).head(`/todos/${todoPost.body.id}/categories`));
        expect(res.status).toBe(200);
    }],
    
    // fails due to an error where it doesn't return 404 when todo is not found
    ['HEAD /todos/:id/categories - should return 404 for todo id that does not exist', async () => {
        const res = await (request(baseUrl).head(`/todos/${-1}/categories`));
        expect(res.status).toBe(404);
    }],

    ['POST /todos/:id/categories - should return 201 and associate category with todo when both exist', async () => {
        // Create a todo
        const todoPost = await (request(baseUrl).post('/todos').send({
            title: "example todo"
        }));
        expect(todoPost.status).toBe(201);
    
        // Create a category
        const categoryPost = await (request(baseUrl).post('/categories').send({
            title: "Office"
        }));
        expect(categoryPost.status).toBe(201);
    
        // Associate the category with the todo
        const res = await (request(baseUrl).post(`/todos/${todoPost.body.id}/categories`).send({
            id: categoryPost.body.id
        }));
        expect(res.status).toBe(201);
    }],
    
    ['POST /todos/:id/categories - should return 404 if todo id does not exist', async () => {
        const categoryPost = await (request(baseUrl).post('/categories').send({
            title: "Office"
        }));
        expect(categoryPost.status).toBe(201);
    
        const res = await (request(baseUrl).post(`/todos/${-1}/categories`).send({
            id: categoryPost.body.id
        }));
        expect(res.status).toBe(404);
    }],
    
    ['POST /todos/:id/categories - should return 404 if category id does not exist', async () => {
        const todoPost = await (request(baseUrl).post('/todos').send({
            title: "example todo"
        }));
        expect(todoPost.status).toBe(201);
    
        const res = await (request(baseUrl).post(`/todos/${todoPost.body.id}/categories`).send({
            id: -1
        }));
        expect(res.status).toBe(404);
    }],
    
    ['POST /todos/:id/categories - should return 400 if request body is missing', async () => {
        const todoPost = await (request(baseUrl).post('/todos').send({
            title: "example todo"
        }));
        expect(todoPost.status).toBe(201);
    
        const res = await (request(baseUrl).post(`/todos/${todoPost.body.id}/categories`));
        expect(res.status).toBe(400);
    }],

    ['DELETE /todos/:id/categories/:id - should return 404 if todo exists but category id does not exist', async () => {
        // Create a todo
        const todoPost = await (request(baseUrl).post('/todos').send({
            title: "example todo"
        }));
        expect(todoPost.status).toBe(201);
    
        const res = await (request(baseUrl).delete(`/todos/${todoPost.body.id}/categories/${-1}`));
        expect(res.status).toBe(404);
    }],
    
    ['DELETE /todos/:id/categories/:id - should return 404 if todo and category exist but no relation exists', async () => {
        // Create a todo
        const todoPost = await (request(baseUrl).post('/todos').send({
            title: "example todo"
        }));
        expect(todoPost.status).toBe(201);
    
        // Create a category
        const categoryPost = await (request(baseUrl).post('/categories').send({
            title: "Office"
        }));
        expect(categoryPost.status).toBe(201);
    
        // Try deleting the non-existing relation between them
        const res = await (request(baseUrl).delete(`/todos/${todoPost.body.id}/categories/${categoryPost.body.id}`));
        expect(res.status).toBe(404);
    }],
    
    ['DELETE /todos/:id/categories/:id - should return 200 and delete relation if both todo and category exist and the relation exists', async () => {
        // Create a todo
        const todoPost = await (request(baseUrl).post('/todos').send({
            title: "example todo"
        }));
        expect(todoPost.status).toBe(201);
    
        // Create a category
        const categoryPost = await (request(baseUrl).post('/categories').send({
            title: "Office"
        }));
        expect(categoryPost.status).toBe(201);
    
        // Create the relation between todo and category
        await (request(baseUrl).post(`/todos/${todoPost.body.id}/categories`).send({
            id: categoryPost.body.id
        }));
    
        // Now delete the relation
        const res = await (request(baseUrl).delete(`/todos/${todoPost.body.id}/categories/${categoryPost.body.id}`));
        expect(res.status).toBe(200);
    }],
    
    ['DELETE /todos/:id/categories/:id - should return 404 if category id does not exist', async () => {
        // Create a todo
        const todoPost = await (request(baseUrl).post('/todos').send({
            title: "example todo"
        }));
        expect(todoPost.status).toBe(201);
    
        const res = await (request(baseUrl).delete(`/todos/${todoPost.body.id}/categories/${-1}`));
        expect(res.status).toBe(404);
    }],
]

// randomize order
testCases.sort(() => Math.random() - 0.5);

describe('Todos API Tests', () => {
    beforeAll(async () => {
        await checkServer();
    });
    
    test.each(testCases)('%s', async (name, fn) => {
        await fn();
    });
});