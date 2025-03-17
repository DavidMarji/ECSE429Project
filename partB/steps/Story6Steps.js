const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('supertest');

const baseUrl = 'http://localhost:4567';

let response;
let projectId;
let validProject;
let returnCode;
let errorMessage;

// Background Steps
Given('the server is running', async function() {
  await request(baseUrl).get('/projects');
});

Given('A valid project exists in the system', async function() {

  const res = await request(baseUrl).post('/projects').send({
    title: "Test Project",
    completed: false,
    active: true
  });

  assert.strictEqual(res.status, 201);
  validProject = res.body;
  projectId = validProject.id;
});

// Normal Flow Steps
When('the student updates the valid project using its id to set completed status to {string}',
  async function(completedStatus) {
    response = await request(baseUrl)
      .put(`/projects/${projectId}`)
      .send({ completed: completedStatus === "true" });

    returnCode = response.status;
});

Then('the project\'s completed status should be updated to {string}',
  async function(expectedStatus) {
    const projectResponse = await request(baseUrl).get(`/projects/${projectId}`);
    const project = projectResponse.body.projects[0];
    assert.strictEqual(project.completed, expectedStatus);
});

Then('the response status should be a {int}', function(expectedStatus) {
  assert.strictEqual(returnCode, expectedStatus);
});

// Alternate Flow Steps
When('the student updates the valid project using its id with the following attributes:',
  async function(dataTable) {
    const attributes = dataTable.hashes()[0];
    response = await request(baseUrl)
      .put(`/projects/${projectId}`)
      .send({
        completed: attributes.completed === "true",
        active: attributes.active === "true",
        description: attributes.description
      });

    returnCode = response.status;
});

Then('the project should be updated with all the new attributes', async function() {
  const projectResponse = await request(baseUrl).get(`/projects/${projectId}`);

  // Access the project from the projects array
  const project = projectResponse.body.projects[0];

  // Convert boolean values to strings for comparison
  const expected = {
    completed: String(response.request._data.completed),
    active: String(response.request._data.active),
    description: response.request._data.description
  };

  assert.strictEqual(project.completed, expected.completed);
  assert.strictEqual(project.active, expected.active);
  assert.strictEqual(project.description, expected.description);
});
Then('the response status should be the {int}', function(expectedStatus) {
  assert.strictEqual(returnCode, expectedStatus);
});


// Error Flow Steps
Given('the student has selected a non-existent project with projectId {string}',
  function(invalidId) {
    projectId = invalidId;
});

When('the student attempts to update the project with projectId {string} to set completed status to {string}',
  async function(invalidId, completedStatus) {
    response = await request(baseUrl)
      .put(`/projects/${invalidId}`)
      .send({ completed: completedStatus === "true" });

    returnCode = response.status;
    if (response.body.errorMessages) {
      errorMessage = response.body.errorMessages[0];
    }
});

Then('the system should return this {string}', function(expectedMessage) {
  assert.strictEqual(errorMessage, expectedMessage);
});
Then

Then('the project should be deleted', async function() {
  if (projectId && projectId !== "-1") {
    await request(baseUrl).delete(`/projects/${projectId}`);
  }

      request(baseUrl).delete(`/projects/${projectId}`);
});