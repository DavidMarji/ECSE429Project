const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('supertest');

const baseUrl = 'http://localhost:4567';

let response;
let returnCode;
let projectsWithTasks = [];
let projectWithoutTasks;
let errorMessage;

Given('Multiple projects exist in the system with varying details and associated tasks', async function() {
  const projectData = [
    {
      title: "Research Project",
      description: "Literature review on emerging technologies",
      completed: false,
      active: true
    },
    {
      title: "Term Paper",
      description: "Analysis of economic trends",
      completed: true,
      active: false
    }
  ];

  projectsWithTasks = [];

  for (const data of projectData) {
    const projectRes = await request(baseUrl).post('/projects').send(data);
    assert.strictEqual(projectRes.status, 201);
    const project = projectRes.body;

    const task1 = await request(baseUrl).post('/todos').send({
      title: `Task 1 for ${data.title}`,
      description: "First subtask",
      doneStatus: false
    });

    const task2 = await request(baseUrl).post('/todos').send({
      title: `Task 2 for ${data.title}`,
      description: "Second subtask",
      doneStatus: true
    });

    await request(baseUrl).post(`/projects/${project.id}/tasks`).send({"id": task1.body.id});
    await request(baseUrl).post(`/projects/${project.id}/tasks`).send({"id": task2.body.id});

    projectsWithTasks.push({
      project: project,
      tasks: [task1.body, task2.body]
    });
  }
});

Given('A valid project exists which has no tasks assigned', async function() {
  const projectRes = await request(baseUrl).post('/projects').send({
    title: "Empty Project",
    description: "This project has no tasks",
    completed: false,
    active: true
  });

  assert.strictEqual(projectRes.status, 201);
  projectWithoutTasks = projectRes.body;
});

When('the student requests detailed information for a valid project using its id', async function() {
  const projectId = projectsWithTasks[0].project.id;

  const projectResponse = await request(baseUrl).get(`/projects/${projectId}`);

  const tasksResponse = await request(baseUrl).get(`/projects/${projectId}/tasks`);

  response = {
    project: projectResponse.body,
    tasks: tasksResponse.body
  };

  returnCode = projectResponse.status;
});

Then('the system should return complete project details including title, description, status', function() {
  assert.strictEqual(returnCode, 200);
  const project = response.project.projects[0];
  assert(project, 'Project details not found in response');
  assert(project.title, 'Project title not found');
  assert(project.description !== undefined, 'Project description not found');
  assert(project.completed !== undefined, 'Project completed status not found');
  assert(project.active !== undefined, 'Project active status not found');
});
Then('the response status needs to include {int}', function(expectedStatus) {
  assert.strictEqual(returnCode, expectedStatus);
});
Then('the associated tasks for the project should be included in the response', function() {
  assert(response.tasks.todos.length > 0, 'No tasks found in response');

  response.tasks.todos.forEach(task => {
    assert(task.id, 'Task ID not found');
    assert(task.title, 'Task title not found');
  });
});

When('the student requests detailed information for this project', async function() {
  const projectResponse = await request(baseUrl).get(`/projects/${projectWithoutTasks.id}`);

  const tasksResponse = await request(baseUrl).get(`/projects/${projectWithoutTasks.id}/tasks`);

  response = {
    project: projectResponse.body,
    tasks: tasksResponse.body
  };

  returnCode = projectResponse.status;
});

Then('the system should return the project details', function() {
  assert.strictEqual(returnCode, 200);

  const project = response.project.projects[0];
  assert(project, 'Project details not found in response');
  assert.strictEqual(project.title, projectWithoutTasks.title);
  assert.strictEqual(project.description, projectWithoutTasks.description);
});
Then('the response status have to include {int}', function(expectedStatus) {
  assert.strictEqual(returnCode, expectedStatus);
});

  Then('the system should return an empty list for associated tasks', function() {
  assert(response.tasks.todos.length==0,
    'Tasks array is not empty or not an array');
});

Given('the student has selected a not existent project with projectId {string}', function(invalidId) {
});

When('the student requests detailed information for projectId {string}', async function(invalidId) {
  try {
    response = await request(baseUrl).get(`/projects/${invalidId}`);
    returnCode = response.status;

    if (response.body && response.body.errorMessages) {
      errorMessage = response.body.errorMessages[0];
    }
  } catch (error) {
    returnCode = error.status || 500;
    errorMessage = error.message;
  }
});

Then('the system should return an error message {string}', function(expectedMessage) {
  assert(errorMessage, 'No error message returned');
  assert.strictEqual(errorMessage, expectedMessage);
});

Then('the response status should include {int}', function(expectedStatus) {
  assert.strictEqual(returnCode, expectedStatus);
});

Then('the projects and tasks should be deleted', async function() {
  for (const projectWithTask of projectsWithTasks) {
    for (const task of projectWithTask.tasks) {
      await request(baseUrl).delete(`/todos/${task.id}`);
    }
    await request(baseUrl).delete(`/projects/${projectWithTask.project.id}`);
  }

  if (projectWithoutTasks) {
    await request(baseUrl).delete(`/projects/${projectWithoutTasks.id}`);
  }
});