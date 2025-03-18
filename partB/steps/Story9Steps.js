const { Given, When, Then, After } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('supertest');

const baseUrl = 'http://localhost:4567';

let response;
let projectId;
let initialProjectCount;

Given('The system is running and the student has access to create projects', async function() {
  const res = await request(baseUrl).get('/projects');
  assert.strictEqual(res.status, 200);

  initialProjectCount = res.body.projects.length;
});

When('the student creates a new project with the following details:', async function(dataTable) {
  const projectData = dataTable.hashes()[0];

  if (projectData.active) {
    projectData.active = projectData.active === 'true';
  }
  if (projectData.completed) {
    projectData.completed = projectData.completed === 'true';
  }

  Object.keys(projectData).forEach(key => {
    if (typeof projectData[key] === 'string') {
      projectData[key] = projectData[key].replace(/"/g, '');
    }
  });

  response = await request(baseUrl).post('/projects').send(projectData);

  if (response.body && response.body.id) {
    projectId = response.body.id;
  }
});

Then('a new project should be created in the system', async function() {
  const res = await request(baseUrl).get('/projects');

  assert.strictEqual(res.body.projects.length, initialProjectCount + 1);

  const createdProject = res.body.projects.find(p => p.id === projectId);
  assert(createdProject, 'Newly created project not found in the system');
});

Then('the response an {int}', function(expectedStatus) {
  assert.strictEqual(response.status, expectedStatus);
});

When('the student creates a new project with only the required title:', async function(dataTable) {
  const projectData = dataTable.hashes()[0];

  Object.keys(projectData).forEach(key => {
    if (typeof projectData[key] === 'string') {
      projectData[key] = projectData[key].replace(/"/g, '');
    }
  });

  response = await request(baseUrl).post('/projects').send(projectData);

  if (response.body && response.body.id) {
    projectId = response.body.id;
  }
});
Then('the response message includes {int}', function(expectedStatus) {
  assert.strictEqual(response.status, expectedStatus);
});

Then('a new project should be created with default values for optional fields', async function() {
  const res = await request(baseUrl).get(`/projects/${projectId}`);

  assert.strictEqual(res.status, 200);

  const project = res.body.projects[0];

  assert.strictEqual(project.description, '', 'Default description should be empty string');
  assert.strictEqual(project.active, 'false', 'Default active status should be false');
  assert.strictEqual(project.completed, 'false', 'Default completed status should be false');
});

Then('the system should return the newly created project details including an assigned id', function() {
  assert(response.body.id, 'Response does not include an ID');

  assert(response.body.title !== undefined, 'Response does not include title');
  assert(response.body.description !== undefined, 'Response does not include description');
  assert(response.body.active !== undefined, 'Response does not include active status');
  assert(response.body.completed !== undefined, 'Response does not include completed status');
});

// Error Flow
When('the student attempts to create a new project with id in request body', async function() {
  const invalidData = {
    id: '999',
    title: 'Invalid Project',
    description: 'This should fail'
  };

  response = await request(baseUrl).post('/projects').send(invalidData);
});

Then('the system should {string}', function(expectedMessage) {
  assert(response.body && response.body.errorMessages, 'No error messages found in response');
  assert(response.body.errorMessages.includes(expectedMessage),
    `Expected error message "${expectedMessage}" not found in response`);
});
Then('the response status implies {int}', function(expectedStatus) {
  assert.strictEqual(response.status, expectedStatus);
});
Then('no new project should be created in the system', async function() {
  const res = await request(baseUrl).get('/projects');
  assert.strictEqual(res.body.projects.length, initialProjectCount,
    'The total number of projects should not have changed');
});

After( async function() {
  if (projectId) {
    await request(baseUrl).delete(`/projects/${projectId}`);
    projectId = null;
  }
});