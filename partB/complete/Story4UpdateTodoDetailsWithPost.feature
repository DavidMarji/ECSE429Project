Feature: Update Todo Details with P
  As a student,
  I want to update the details of a todo so that it accurately reflects the current status and requirements of the task.

  Background:
    Given the server is running

  # Normal Flow
  Scenario: Successfully updating todo details (Normal Flow)
    Given a todo exists in the system with title "example", doneStatus "false", and description "example description"
    When the student attempts to update the todos title to "newExample", doneStatus to "true", and description to "new description" using its id
    Then the system should update the todo and replace the title to "newExample", doneStatus to "true", and description to "new description"
    And the response status should be 200 after the title and description updates

  # Alternate Flow
  Scenario: Updating todo with partial information (Alternate Flow)
    Given a todo exists in the system with title "example", doneStatus "false", and description "example description"
    When the student attempts to update the todos title "newExample" using its id
    Then the system should update the todo with the new title
    And the response status should be 200 after the title update

  # Error Flow
  Scenario: Error when trying to update a non-existent todo (Error Flow)
    Given a todo exists in the system with title "example", doneStatus "false", and description "example description"
    When the student submits updated details for a todo using a non-existent id "-1"
    Then the system should return an error message about the ids "No such todo entity instance with GUID or ID -1 found"
    And the response status should be 404 after the non-existent todo

  # Error Flow
  Scenario: Error when trying to update an existing todo's id (Error Flow)
    Given a todo exists in the system with title "example", doneStatus "false", and description "example description"
    When the student submits updated details for an existing todo using its id and attempts to update the id
    Then the system should return an error message about the ids "Failed Validation: id should be ID"
    And the response status should be 400 after the failed id update