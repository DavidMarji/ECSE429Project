Feature: Delete Unnecessary Project
  As a student,
  I want to delete a project that is no longer needed,
  So that I can keep my workspace clean and organized.

  Background:
    Given Multiple projects exist in the system including some that are no longer needed

  # Normal Flow
  Scenario: Successfully deleting a project (Normal Flow)
    Given A valid project exists which the student wants to delete
    When the student requests to delete the project using its id
    Then the project should be removed from the system
    And the response status should be 200

  # Alternate Flow
  Scenario: Deleting a project while maintaining task associations with other projects (Alternate Flow)
    Given A valid project exists with multiple tasks associated with it
    And some of these tasks are also associated with other projects
    When the student requests to delete the project using its id
    Then the project should be removed from the system
    And all tasks should remain in the system
    And the association between the deleted project and its tasks should be removed
    And tasks associated with other projects should maintain those associations
    And the response status should be 200

  # Error Flow
  Scenario: Error when project ID does not exist (Error Flow)
    Given the student has selected a non-existent project with projectId "-1"
    When the student requests to delete the project with projectId "-1"
    Then the system should return an error message "Could not find any instances with projects/-1"
    And the response status should be 404
    And no changes should be made to the system