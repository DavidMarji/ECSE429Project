Feature: Assign Todo to a Project with Tasksof
  As a student,
  I want to assign todos to a project so that I can break down the work into manageable tasks and ensure everything gets completed.

  Background:
    Given the server is running

  # Normal Flow
  Scenario: Successfully adding an existing todo to a project (Normal Flow)
    Given a valid project exists
    Given a valid todo exists
    When the student attempts to add the todo to the project
    Then the system should add the project's id in the todo's tasksof section
    And the response status for assigning the todo to the project should be 201

  # Alternate Flow
  Scenario: Successfully adding an existing todo already assigned to a project to a different project (Alternate Flow)
    Given a valid project exists
    Given a valid todo exists
    Given A todo already assigned to a project exists
    And a different project exists
    When the student attempts to add the todo to a different project
    Then the system should add the project's id in the todo's tasksof section
    And the response status for assigning the todo to the project should be 201

  # Error Flow
  Scenario: Error when adding the todo to a non-existent project (Error Flow)
    Given a valid todo exists
    When the student attempts to add the todo to a project with int id "-1"
    Then the system should return an error message about the non-existent project "Could not find thing matching value for id"
    And the response status when attempting to assign the project to a non-existent project should be 404

  # Error Flow
  Scenario: Error when adding non-existent todo to an existing project (Error Flow)
    Given a valid project exists
    When the student attempts to add the todo with id "-1" to the project
    Then the system should return an error message about the non-existent todo "Could not find parent thing for relationship todos/-1/tasksof"
    And the response status when attempting to assign the project to a non-existent project should be 404