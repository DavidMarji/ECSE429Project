Feature: Update Todo Details with Post
  As a student,
  I want to update the details of a todo so that it accurately reflects the current status and requirements of the task.

  Background:
    Given the server is running
    And a todo exists in the system with title "example", doneStatus "False", and description "example description"

  # Normal Flow
  Scenario: Successfully updating todo details
    When the student attempts to update the todos title to "newExample", doneStatus to "True", and description to "new description" using its id
    Then the system should update the todo and replace the title to "newExample", doneStatus to "True", and description to "new description"
    And the response status should be 200

  # Alternate Flow
  Scenario: Updating todo with partial information
     When the student attempts to update the todos title "newExample" using its id
    Then the system should update the todo with the new title
    And the response status should be 200

  # Error Flow
  Scenario: Error when trying to update a non-existent todo
    When the student submits updated details for a todo using a non-existent id "-1"
    Then the system should return an error message "No such todo entity instance with GUID or ID -1 found"
    And the response status should be 404

  # Error Flow
  Scenario: Error when trying to update a existing todo's id
    When the student submits updated details for an existing todo using its id and attempts to update the id
    Then the system should return an error message "No such todo entity instance with GUID or ID -1 found"
    And the response status should be 404