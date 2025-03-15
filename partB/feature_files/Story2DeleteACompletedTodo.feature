Feature: Delete a Completed Todo
  As a student,
  I want to delete a completed todo so that I can keep my task list organized and focus only on pending work.

  Background:
    Given the server is running

  # Normal Flow
  Scenario: Successfully deleting a completed todo
    And a valid todo exists with doneStatus True
    When the student requests to delete the completed todo
    Then the system should delete the todo
    And the response status should be 200

  # Alternate Flow
  Scenario: Successfully deleting a todo assigned to a project
    Given a todo is marked is assigned to a project
    When the student requests to delete the todo
    Then the system should delete the todo
    And the projects tasks list should no longer include the todo's id
    And the response status should be 200

  # Error Flow
  Scenario: Error when trying to delete a non-existent todo
    Given the student has specified a non-existent todo id "-1"
    When the student requests to delete the todo with id "-1"
    Then the system should return an error message "Could not find any instances with todos/2"
    And the response status should be 404
