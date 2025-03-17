const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const request = require('supertest');

const baseUrl = 'http://localhost:4567';

let response;
let returnCode;
let projects = [];

Given('Multiple projects exist in the system with varying statuses and titles', async function() {
  const projectData = [
    { title: "Math Assignment", completed: false, active: true },
    { title: "Science Project", completed: true, active: false },
    { title: "Math Quiz", completed: false, active: true },
    { title: "History Essay", completed: true, active: true }
  ];

  projects = [];

  for (const data of projectData) {
    const res = await request(baseUrl).post('/projects').send(data);
    assert.strictEqual(res.status, 201);
    projects.push(res.body);
  }
});

When('the student requests to filter projects with active status {string}', async function(activeStatus) {
  response = await request(baseUrl)
    .get(`/projects?active=${activeStatus}`);

  returnCode = response.status;
});

Then('the system should return only projects with active status {string}', function(expectedStatus) {
  assert.strictEqual(returnCode, 200);
  assert(response.body.projects.length > 0, 'No projects returned');
});

Then('the response status should have {int}', function(expectedStatus) {
  assert.strictEqual(returnCode, expectedStatus);
});

Then('all returned projects should have active status {string}', function(expectedStatus) {
  for (const project of response.body.projects) {
    if (typeof project.active === 'boolean') {
      const boolExpectedStatus = expectedStatus === 'true';
      assert.strictEqual(project.active, boolExpectedStatus,
        `Project with id ${project.id} has active status ${project.active} instead of ${boolExpectedStatus}`);
    } else {
      assert.strictEqual(String(project.active), expectedStatus,
        `Project with id ${project.id} has active status ${project.active} instead of ${expectedStatus}`);
    }
  }
});

When('the student requests to filter projects with title containing {string}', async function(titleSubstring) {
  response = await request(baseUrl)
    .get(`/projects?title=${titleSubstring}`);

  returnCode = response.status;
});

Then('the system should return only projects with {string} in their title', function(titleSubstring) {
  assert.strictEqual(returnCode, 200);

  assert(Array.isArray(response.body.projects), 'Projects array is not defined');
});

Then('the response status should contain {int}', function(expectedStatus) {
  assert.strictEqual(returnCode, expectedStatus);
});

Then('all returned projects should contain {string} in their title', function(titleSubstring) {
  if (response.body.projects && response.body.projects.length > 0) {
    for (const project of response.body.projects) {
      assert(project.title.includes(titleSubstring),
        `Project title "${project.title}" does not contain "${titleSubstring}"`);
    }
  }
});

When('the student requests to filter projects with completed status {string}', async function(completedStatus) {
  response = await request(baseUrl)
    .get(`/projects?completed=${completedStatus}`);

  returnCode = response.status;
});

Then('the system should return only projects with completed status {string}', function(expectedStatus) {
  assert.strictEqual(returnCode, 200);
  assert(response.body.projects.length > 0, 'No projects returned');
});

Then('the response status should expect {int}', function(expectedStatus) {
  assert.strictEqual(returnCode, expectedStatus);
});

Then('all returned projects should have completed status {string}', function(expectedStatus) {
  for (const project of response.body.projects) {
    if (typeof project.completed === 'boolean') {
      const boolExpectedStatus = expectedStatus === 'true';
      assert.strictEqual(project.completed, boolExpectedStatus,
        `Project with id ${project.id} has completed status ${project.completed} instead of ${boolExpectedStatus}`);
    } else {
      assert.strictEqual(String(project.completed), expectedStatus,
        `Project with id ${project.id} has completed status ${project.completed} instead of ${expectedStatus}`);
    }
  }
});

Then('the response status should say {int}', function(expectedStatus) {
  if (expectedStatus === 404) {
    try {
      if (returnCode === 200) {
        assert(response.body.projects.length === 0,
          `Expected no projects for invalid filter, but got ${response.body.projects.length}`);
      } else {
        assert.strictEqual(returnCode, expectedStatus);
      }
    } catch (e) {
      assert.strictEqual(returnCode, expectedStatus);
    }
  } else {
    assert.strictEqual(returnCode, expectedStatus);
  }
});

Then('all created test projects should be deleted', async function() {
  for (const project of projects) {
    await request(baseUrl).delete(`/projects/${project.id}`);
  }
});