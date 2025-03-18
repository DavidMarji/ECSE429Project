const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('supertest');

const baseUrl = 'http://localhost:4567';

let response;
let projectToDelete;
let taskIdsBeforeDeletion = [];
let taskAssociations = {};
let errorMessage;
let allProjectsBeforeDeletion = [];

Given('Multiple projects exist in the system including some that are no longer needed', async function() {
  const projectData = [
    {
      title: "Old Project 1",
      description: "This project is no longer needed",
      completed: true,
      active: false
    },
    {
      title: "Active Project",
      description: "This is an active project",
      completed: false,
      active: true
    }
  ];

  for (const data of projectData) {
    const res = await request(baseUrl).post('/projects').send(data);
    assert.strictEqual(res.status, 201);
  }

  const projectsRes = await request(baseUrl).get('/projects');
  assert.strictEqual(projectsRes.status, 200);
  assert(projectsRes.body.projects.length >= 2, 'Not enough projects created');

  allProjectsBeforeDeletion = projectsRes.body.projects;
});

Given('A valid project exists which the student wants to delete', async function() {
  const projectRes = await request(baseUrl).post('/projects').send({
    title: "Project to Delete",
    description: "This project will be deleted",
    completed: false,
    active: true
  });

  assert.strictEqual(projectRes.status, 201);
  projectToDelete = projectRes.body;
});

When('the student requests to delete the project using its id', async function() {
  response = await request(baseUrl).delete(`/projects/${projectToDelete.id}`);
});

Then('the project should be removed from the system', async function() {
  const projectRes = await request(baseUrl).get(`/projects/${projectToDelete.id}`);

  if (projectRes.status === 404) {
    assert.strictEqual(projectRes.status, 404);
  } else {
    assert.strictEqual(projectRes.body.projects.length, 0);
  }
});
Then('the response is {int}', function(expectedStatus) {
  assert.strictEqual(response.status, expectedStatus);
});

Given('A valid project exists with multiple tasks associated with it', async function() {
  const projectRes = await request(baseUrl).post('/projects').send({
    title: "Project with Tasks",
    description: "This project has tasks and will be deleted",
    completed: false,
    active: true
  });

  assert.strictEqual(projectRes.status, 201);
  projectToDelete = projectRes.body;

  for (let i = 0; i < 3; i++) {
    const taskRes = await request(baseUrl).post('/todos').send({
      title: `Task ${i + 1} for Project ${projectToDelete.id}`,
      description: `This is task ${i + 1}`,
      doneStatus: false
    });

    assert.strictEqual(taskRes.status, 201);

    const associationRes = await request(baseUrl)
      .post(`/projects/${projectToDelete.id}/tasks`)
      .send({"id": taskRes.body.id});

    assert.strictEqual(associationRes.status, 201);

    taskIdsBeforeDeletion.push(taskRes.body.id);

    taskAssociations[taskRes.body.id] = [projectToDelete.id];
  }
});

Given('some of these tasks are also associated with other projects', async function() {
  const otherProjectRes = await request(baseUrl).post('/projects').send({
    title: "Other Project",
    description: "This project will remain after deletion",
    completed: false,
    active: true
  });

  assert.strictEqual(otherProjectRes.status, 201);
  const otherProject = otherProjectRes.body;

  for (let i = 0; i < 2; i++) {
    const taskId = taskIdsBeforeDeletion[i];

    const associationRes = await request(baseUrl)
      .post(`/projects/${otherProject.id}/tasks`)
      .send({"id": taskId});

    assert.strictEqual(associationRes.status,
    201);

    taskAssociations[taskId].push(otherProject.id);
  }
});

Then('all tasks should remain in the system', async function() {
  for (const taskId of taskIdsBeforeDeletion) {
    const taskRes = await request(baseUrl).get(`/todos/${taskId}`);
    assert.strictEqual(taskRes.status, 200);
    assert(taskRes.body.todos.length > 0, `Task ${taskId} not found`);
  }
});

Then('the association between the deleted project and its tasks should be removed', async function() {
  try {
    const projectTasksRes = await request(baseUrl).get(`/projects/${projectToDelete.id}/tasks`);
    if (projectTasksRes.status !== 404) {
      assert.strictEqual(projectTasksRes.body.length, 0, 'Tasks are still associated with deleted project');
    }
  } catch (error) {
  }
});

Then('tasks associated with other projects should maintain those associations', async function() {
  for (const taskId in taskAssociations) {
    const projectIds = taskAssociations[taskId];

    const remainingProjectIds = projectIds.filter(id => id !== projectToDelete.id);

    for (const projectId of remainingProjectIds) {
      const projectTasksRes = await request(baseUrl).get(`/projects/${projectId}/tasks`);
      assert.strictEqual(projectTasksRes.status, 200);

      if (projectTasksRes.body.todos && Array.isArray(projectTasksRes.body.todos)) {
        const taskFound = projectTasksRes.body.todos.some(task => task.id === taskId);
        assert(taskFound, `Task ${taskId} not found in project ${projectId}`);
      } else {
        assert.fail(`Unexpected response structure: ${JSON.stringify(projectTasksRes.body)}`);
      }
    }
  }
});
Then('the response have {int}', function(expectedStatus) {
  assert.strictEqual(response.status, expectedStatus);
});


Given('the student has selected  non-existent project with projectId {string}', function(projectId) {
  projectToDelete = { id: projectId };
});

When('the student requests to delete the project with projectId {string}', async function(projectId) {
  try {
    response = await request(baseUrl).delete(`/projects/${projectId}`);

    if (response.body && response.body.errorMessages) {
      errorMessage = response.body.errorMessages[0];
    }
  } catch (error) {
    response = { status: error.status || 500 };
    errorMessage = error.message;
  }
});

Then('the system says {string}', function(expectedMessage) {
  assert(errorMessage, 'No error message returned');
  assert.strictEqual(errorMessage, expectedMessage);
});
Then('the response with {int}', function(expectedStatus) {
  assert.strictEqual(response.status, expectedStatus);
});

Then('no changes should be made to the system', async function() {
  const projectsRes = await request(baseUrl).get('/projects');

  assert(projectsRes.body.projects.length >= allProjectsBeforeDeletion.length,
    'Number of projects has changed unexpectedly');

  for (const project of allProjectsBeforeDeletion) {
    if (projectToDelete && project.id === projectToDelete.id) {
      continue;
    }

    const projectStillExists = projectsRes.body.projects.some(p => p.id === project.id);
    assert(projectStillExists, `Project ${project.id} no longer exists`);
  }
});

Then('cleanup projects and tasks created for testing', async function() {
  for (const taskId of taskIdsBeforeDeletion) {
    await request(baseUrl).delete(`/todos/${taskId}`);
  }

  const projectsRes = await request(baseUrl).get('/projects');
  const projects = projectsRes.body.projects;

  for (const project of projects) {
    if (project.title.includes('Project to Delete') ||
        project.title.includes('Project with Tasks') ||
        project.title.includes('Other Project') ||
        project.title.includes('Old Project')) {
      await request(baseUrl).delete(`/projects/${project.id}`);
    }
  }
});