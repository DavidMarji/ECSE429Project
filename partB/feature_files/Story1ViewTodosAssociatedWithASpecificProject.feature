Feature: View Todos Associated with a Specific Project
  As a student,
  I want to view a list of all todos associated with a specific project from one of my classes,
  So that I can track my remaining tasks and manage my workload effectively.

  Background:
    Given The server is running
    And A valid project exists which has valid todos associated with it

  # Normal Flow
  Scenario: Successfully viewing todos for a specific project (Normal Flow)
    When the student requests the list of todos for the valid project using its id
    Then the system should return a list of todos associated with the project
    And the list should display details for each todo (e.g., title, description, due date)
    And the response status should be 200

  # Alternate Flow
  Scenario: Viewing todos for a project with no associated todos (Alternate Flow)
    Given A valid project exists which has no todos assigned
    When the student requests the list of todos for the project
    Then the system should return an empty list
    And the response status should be 200

  # Error Flow
  Scenario: Error when project ID is invalid (Error Flow)
    Given the student has selected an invalid project with projectId "-1"
    When the student requests the list of todos for projectId "-1"
    Then the system should return an error message "Could not find an instance with projects/-1"
    And the response status should be 404
