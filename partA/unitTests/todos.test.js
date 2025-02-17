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

describe('Todos API Tests', () => {
    beforeAll(async () => {
        await checkServer();
    });
    
    test.concurrent.each([
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

        
        
    ])('%s', async (name, fn) => {
        await fn();
    });
});