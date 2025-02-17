const request = require('supertest');
const baseUrl = 'http://localhost:4567';
const checkServer = async () => {
    try {
        await request(baseUrl).get('/todos');
        return true;
    } catch (error) {
        console.error('Backend is not running. Please start the server.');
        process.exit(1);
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

    ['get /todos/:id - should return 404 for non-existent id -1', async () => {

        const res= await (request(baseUrl).get(`/todos/${-1}`));
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

    ['head /todos/:id - should return 404 for non-existent id', async () => {
        const res= await (request(baseUrl).head(`/todos/${-1}`));
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

    ['post /todos/:id - should return 404 for id -1', async () => {
        const res = await (request(baseUrl).post('/todos/-1').send({title : "newTitle", doneStatus : true }));
        expect(res.status).toBe(404)
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

    // ['get /todos/:id/tasksof - should return 200 for existing id and should get correct tasksof', async () => {
        
    // }],
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