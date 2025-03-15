Feature: Delete a Completed Todo
  As a student,
  I want to delete a completed todo so that I can keep my task list organized and focus only on pending work.

  Background:
    Given the student is logged in

  # Normal Flow
  Scenario: Successfully deleting a completed todo
    Given a valid todo exists with doneStatus True
    When the student requests to delete the completed todo
    Then the system should delete the todo
    And the response status should be 200
    And a confirmation message "Todo successfully deleted" is returned

  # Alternate Flow
  Scenario: Attempting to delete a todo that is not completed
    Given a todo with id "todo456" is marked as pending
    When the student requests to delete the todo with id "todo456"
    Then the system should not delete the todo
    And the response status should be 400
    And an error message "Only completed todos can be deleted" is returned

  # Error Flow
  Scenario: Error when trying to delete a non-existent todo
    Given the student has specified a non-existent todo id "invalid_todo"
    When the student requests to delete the todo with id "invalid_todo"
    Then the system should return an error message "Todo not found"
    And the response status should be 404
