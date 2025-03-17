Feature: Delete a Completed Todo
  As a student,
  I want to delete a completed todo so that I can keep my task list organized and focus only on pending work.

  Background:
    Given the server is running

  # Normal Flow
  Scenario: Successfully deleting a completed todo (Normal Flow)
    Given a valid todo exists with doneStatus "true"
    When the student requests to delete the completed todo
    Then the system should delete the todo
    And the response status after deletion should be 200

  # Alternate Flow
  Scenario: Successfully deleting a todo assigned to a project (Alternate Flow)
    Given a todo is assigned to a project
    When the student requests to delete the todo
    Then the system should delete the todo
    And the project's tasks list should no longer include the todo's id
    And the response status after deletion should be 200

  # Error Flow
  Scenario: Error when trying to delete a non-existent todo (Error Flow)
    When the student requests to delete the todo with id -1
    Then the system should return an error message about the todo id being not found "Could not find any instances with todos/-1"
    And the response status after attempted deletion should be 404
