Feature: Retrieve Detailed Project Information
  As a student,
  I want to retrieve detailed information about a specific project,
  So that I can understand its objectives, deadlines, and associated tasks.

  Background:
    Given the server is running
    Given Multiple projects exist in the system with varying details and associated tasks

  # Normal Flow
  Scenario: Successfully retrieving detailed information for a specific project (Normal Flow)
    When the student requests detailed information for a valid project using its id
    Then the system should return complete project details including title, description, status
    And the response status should be 200
    And the associated tasks for the project should be included in the response

  # Alternate Flow
  Scenario: Retrieving project information with no associated tasks (Alternate Flow)
    Given A valid project exists which has no tasks assigned
    When the student requests detailed information for this project
    Then the system should return the project details
    And the system should return an empty list for associated tasks
    And the response status should be 200

  # Error Flow
  Scenario: Error when project ID does not exist (Error Flow)
    Given the student has selected a non-existent project with projectId "-1"
    When the student requests detailed information for projectId "-1"
    Then the system should return an error message "Could not find an instance with projects/-1"
    And the response status should include 404