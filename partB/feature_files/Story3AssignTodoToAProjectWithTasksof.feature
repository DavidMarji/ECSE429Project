Feature: Assign Todo to a Project with Tasksof
  As a student,
  I want to assign todos to a project so that I can break down the work into manageable tasks and ensure everything gets completed.

  Background:
    Given the server is running
    And a valid project exists
    And a valid todo exists

  # Normal Flow
  Scenario: Successfully adding an existing todo to a project (Normal Flow)
    When the student attempts to add the todo to the project
    Then the system should add the project's id in the todo's tasksof section
    And the response status should be 200

  # Alternate Flow
  Scenario: Successfully adding an existing todo already assigned to a project to a different project (Alternate Flow)
    Given A todo already assigned to a project exists
    And a different project exists
    When the student attempts to add the todo to a different project
    Then the system should add the project's id in the todo's tasksof section
    And the response status should be 200

  # Error Flow
  Scenario: Error when adding the todo to a non-existent project with String id (Error Flow)
    Given a todo exists
    When the student attempts to add the todo to a project with string id "-1"
    Then the system should return an error message "Could not find thing matching value for id"
    And the response status should be 404

  # Error Flow
  Scenario: Error when adding the todo to a non-existent project with int id (Error Flow)
    Given a todo exists
    When the student attempts to add the todo to a project with int id "-1"
    Then the system should return an error message "Could not find thing matching value for id"
    And the response status should be 404