Feature: Update Project Status
  As a student,
  I want to mark my projects as completed,
  So that I can track my accomplishments and focus on remaining work.

  Background:
    Given the server is running
    Given A valid project exists in the system

  # Normal Flow
  Scenario: Successfully marking a project as completed (Normal Flow)
    When the student updates the valid project using its id to set completed status to "true"
    Then the project's completed status should be updated to "true"
    And the response status should be a 200

  # Alternate Flow
  Scenario: Successfully updating multiple project attributes (Alternate Flow)
    When the student updates the valid project using its id with the following attributes:
      | completed | active | description            |
      | "true"    | "false"| "Final version submitted" |
    Then the project should be updated with all the new attributes
    And the response status should be the 200

  # Error Flow
  Scenario: Error when project ID does not exist (Error Flow)
    Given the student has selected a non-existent project with projectId "-1"
    When the student attempts to update the project with projectId "-1" to set completed status to "true"
    Then the system should return an error message "Invalid GUID for -1 entity project"
    And the response status should be a 404