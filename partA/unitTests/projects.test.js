const request = require('supertest');
const baseUrl = 'http://localhost:4567';

const checkServer = async () => {
    try {
        await request(baseUrl).get('/projects');
        return true;
    } catch (error) {
        console.error('Backend is not running. Please start the server.');
        process.exit(1);
    }
};

const testCases = [
    ['GET /projects - should return all projects', async () => {
        const res = await request(baseUrl).get('/projects');
        expect(res.status).toBe(200);
        expect(res.body.projects).toBeInstanceOf(Array);
    }],

    ['GET /projects?active=false - should return all projects with active=false', async () => {
        const res = await request(baseUrl).get('/projects?active=falgse');
        expect(res.status).toBe(200);
        expect(res.body.projects).toBeInstanceOf(Array);
        for(let i = 0; i < res.body.projects.length; i++) {
            expect(res.body.projects[i].active).toBe("false");
        }
    }],

    ['HEAD /projects - should return 200', async () => {
        const res = await request(baseUrl).head('/projects');
        expect(res.status).toBe(200);
    }],

    ['POST /projects - should return 201 and create new project', async () => {
        const res = await request(baseUrl).post('/projects').send({ title: 'Test Project' });
        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();
    }],

   

    ['POST /projects - should reject invalid data format', async () => {
        const res = await request(baseUrl).post('/projects').send({ 
            title: { nested: 'Invalid' }, 
            invalidField: true 
        });
        expect(res.status).toBe(400);
    }],

    ['POST /projects - should handle malformed JSON', async () => {
        const res = await request(baseUrl)
            .post('/projects')
            .set('Content-Type', 'application/json')
            .send('{"title": "Malformed JSON"');
        expect(res.status).toBe(400);
    }],

    ['GET /projects/:id - should return 200 and correct project', async () => {
        const createRes = await request(baseUrl).post('/projects').send({ title: 'Test Project' });
        expect(createRes.status).toBe(201);

        const res = await request(baseUrl).get(`/projects/${createRes.body.id}`);
        expect(res.status).toBe(200);
        expect(res.body.projects[0].id).toBe(createRes.body.id);
    }],

    ['GET /projects/:id - should return 404 for non-existent id', async () => {
        const res = await request(baseUrl).get('/projects/999999');
        expect(res.status).toBe(404);
    }],

    ['GET /projects/:id - should return 404 for negative id', async () => {
        const res = await request(baseUrl).get('/projects/-1');
        expect(res.status).toBe(404);
    }],

    ['HEAD /projects/:id - should return 200 for existing project', async () => {
        const createRes = await request(baseUrl).post('/projects').send({ title: 'Test Project' });
        expect(createRes.status).toBe(201);

        const res = await request(baseUrl).head(`/projects/${createRes.body.id}`);
        expect(res.status).toBe(200);
    }],

    ['HEAD /projects/:id - should return 404 for non-existent id', async () => {
        const res = await request(baseUrl).head('/projects/999999');
        expect(res.status).toBe(404);
    }],

    ['POST /projects/:id - should update existing project', async () => {
        const createRes = await request(baseUrl).post('/projects').send({ title: 'Original Title' });
        expect(createRes.status).toBe(201);

        const updateRes = await request(baseUrl)
            .post(`/projects/${createRes.body.id}`)
            .send({ title: 'Updated Title' });
        expect(updateRes.status).toBe(200);

        const getRes = await request(baseUrl).get(`/projects/${createRes.body.id}`);
        expect(getRes.body.projects[0].title).toBe('Updated Title');
    }],

    ['POST /projects/:id - should return 404 for non-existent id', async () => {
        const res = await request(baseUrl)
            .post('/projects/999999')
            .send({ title: 'Updated Title' });
        expect(res.status).toBe(404);
    }],

    ['POST /projects/:id - should handle invalid update data', async () => {
        const createRes = await request(baseUrl).post('/projects').send({ title: 'Test Project' });
        expect(createRes.status).toBe(201);

        const res = await request(baseUrl)
            .post(`/projects/${createRes.body.id}`)
            .send({ title: { nested: 'Invalid' } });
        expect(res.status).toBe(400);
    }],

    ['PUT /projects/:id - should update existing project', async () => {
        const createRes = await request(baseUrl).post('/projects').send({ title: 'Original Title' });
        expect(createRes.status).toBe(201);

        const updateRes = await request(baseUrl)
            .put(`/projects/${createRes.body.id}`)
            .send({ title: 'Updated Title' });
        expect(updateRes.status).toBe(200);

        const getRes = await request(baseUrl).get(`/projects/${createRes.body.id}`);
        expect(getRes.body.projects[0].title).toBe('Updated Title');
    }],

    ['PUT /projects/:id - should return 404 for non-existent id', async () => {
        const res = await request(baseUrl)
            .put('/projects/999999')
            .send({ title: 'Updated Title' });
        expect(res.status).toBe(404);
    }],

    ['DELETE /projects/:id - should delete existing project', async () => {
        const createRes = await request(baseUrl).post('/projects').send({ title: 'Test Project' });
        expect(createRes.status).toBe(201);

        const deleteRes = await request(baseUrl).delete(`/projects/${createRes.body.id}`);
        expect(deleteRes.status).toBe(200);

        const getRes = await request(baseUrl).get(`/projects/${createRes.body.id}`);
        expect(getRes.status).toBe(404);
    }],

    ['DELETE /projects/:id - should return 404 for non-existent id', async () => {
        const res = await request(baseUrl).delete('/projects/999999');
        expect(res.status).toBe(404);
    }],

    ['GET /projects/:id/categories - should return categories for project', async () => {
        const projectRes = await request(baseUrl).post('/projects').send({ title: 'Test Project' });
        expect(projectRes.status).toBe(201);

        const res = await request(baseUrl).get(`/projects/${projectRes.body.id}/categories`);
        expect(res.status).toBe(200);
        expect(res.body.categories).toBeInstanceOf(Array);
    }],

    ['GET /projects/:id/categories - should return 404 for non-existent project', async () => {
        const res = await request(baseUrl).get('/projects/999999/categories');
        expect(res.status).toBe(404);
    }],

    ['HEAD /projects/:id/categories - should return 200 for existing project', async () => {
        const projectRes = await request(baseUrl).post('/projects').send({ title: 'Test Project' });
        expect(projectRes.status).toBe(201);

        const res = await request(baseUrl).head(`/projects/${projectRes.body.id}/categories`);
        expect(res.status).toBe(200);
    }],

    ['HEAD /projects/:id/categories - should return 404 for non-existent project', async () => {
        const res = await request(baseUrl).head('/projects/999999/categories');
        expect(res.status).toBe(404);
    }],

    ['POST /projects/:id/categories - should create category relationship', async () => {
        const projectRes = await request(baseUrl).post('/projects').send({ title: 'Test Project' });
        expect(projectRes.status).toBe(201);

        const categoryRes = await request(baseUrl).post('/categories').send({ title: 'Test Category' });
        expect(categoryRes.status).toBe(201);

        const res = await request(baseUrl)
            .post(`/projects/${projectRes.body.id}/categories`)
            .send({ id: categoryRes.body.id });
        expect(res.status).toBe(201);

        const checkRes = await request(baseUrl).get(`/projects/${projectRes.body.id}/categories`);
        expect(checkRes.body.categories.some(cat => cat.id === categoryRes.body.id)).toBe(true);
    }],

    
    ['GET /projects/:id/tasks - should return tasks for project', async () => {
        const projectRes = await request(baseUrl).post('/projects').send({ title: 'Test Project' });
        expect(projectRes.status).toBe(201);

        const res = await request(baseUrl).get(`/projects/${projectRes.body.id}/tasks`);
        expect(res.status).toBe(200);
        expect(res.body.todos).toBeInstanceOf(Array);
    }],

    ['GET /projects/:id/tasks - should return 404 for non-existent project', async () => {
        const res = await request(baseUrl).get('/projects/999999/tasks');
        expect(res.status).toBe(404);
    }],

    ['HEAD /projects/:id/tasks - should return 200 for existing project', async () => {
        const projectRes = await request(baseUrl).post('/projects').send({ title: 'Test Project' });
        expect(projectRes.status).toBe(201);

        const res = await request(baseUrl).head(`/projects/${projectRes.body.id}/tasks`);
        expect(res.status).toBe(200);
    }],

    ['HEAD /projects/:id/tasks - should return 404 for non-existent project', async () => {
        const res = await request(baseUrl).head('/projects/999999/tasks');
        expect(res.status).toBe(404);
    }],

    ['POST /projects/:id/tasks - should create task relationship', async () => {
        const projectRes = await request(baseUrl).post('/projects').send({ title: 'Test Project' });
        const todoRes = await request(baseUrl).post('/todos').send({ title: 'Test Todo' });

        const res = await request(baseUrl)
            .post(`/projects/${projectRes.body.id}/tasks`)
            .send({ id: todoRes.body.id });
        expect(res.status).toBe(201);

        const checkRes = await request(baseUrl).get(`/projects/${projectRes.body.id}/tasks`);
        expect(checkRes.body.todos.some(todo => todo.id === todoRes.body.id)).toBe(true);
    }],

    

    ['DELETE /projects/:id/tasks/:taskId - should delete task relationship', async () => {
        const projectRes = await request(baseUrl).post('/projects').send({ title: 'Test Project' });
        const todoRes = await request(baseUrl).post('/todos').send({ title: 'Test Todo' });

        await request(baseUrl)
            .post(`/projects/${projectRes.body.id}/tasks`)
            .send({ id: todoRes.body.id });

        const deleteRes = await request(baseUrl)
            .delete(`/projects/${projectRes.body.id}/tasks/${todoRes.body.id}`);
        expect(deleteRes.status).toBe(200);

        const checkRes = await request(baseUrl).get(`/projects/${projectRes.body.id}/tasks`);
        expect(checkRes.body.todos.some(todo => todo.id === todoRes.body.id)).toBe(false);
    }]
];

describe('Projects API Tests', () => {
    beforeAll(async () => {
        await checkServer();
    });

    test.each(testCases)('%s', async (name, fn) => {
        await fn();
    });
});