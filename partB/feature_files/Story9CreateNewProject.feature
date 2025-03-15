Feature: Create New Project
  As a student,
  I want to create a new project,
  So that I can organize my tasks and collaborate effectively with my team.

  Background:
    Given The system is running and the student has access to create projects

  # Normal Flow
  Scenario: Successfully creating a new project with all required details
    When the student creates a new project with the following details:
      | title                | description                              | active | completed
      | "Group Assignment 1" | "Research paper on renewable energy"     | true   | false
    Then a new project should be created in the system
    And the response status should be 201


  # Alternate Flow
  Scenario: Creating a new project with minimal required details
    When the student creates a new project with only the required title:
      | title                |
      | "Individual Project" |
    Then a new project should be created with default values for optional fields
    And the response status should be 201
    And the system should return the newly created project details including an assigned id

  # Error Flow
  Scenario: Error when creating a project with id in request body
    When the student attempts to create a new project with id in request body
    Then the system should return an error message "Invalid Creation: Failed Validation: Not allowed to create with id"
    And the response status should be 400
    And no new project should be created in the system