Feature: Filter Projects by Status or Title
  As a student,
  I want to filter projects based on their status (active/inactive) or title,
  So that I can quickly find relevant projects.

  Background:
    Given the server is running
    Given Multiple projects exist in the system with varying statuses and titles

  # Normal Flow
  Scenario: Successfully filtering projects by active status (Normal Flow)
    When the student requests to filter projects with active status "true"
    Then the system should return only projects with active status "true"
    And the response status should be 200
    And all returned projects should have active status "true"

  # Alternate Flow - Filter by Title
  Scenario: Successfully filtering projects by title substring (Alternate Flow)
    When the student requests to filter projects with title containing "Math"
    Then the system should return only projects with "Math" in their title
    And the response status should be 200
    And all returned projects should contain "Math" in their title

  # Alternate Flow - Filter by Completed Status
  Scenario: Successfully filtering projects by completed status (Alternate Flow)
    When the student requests to filter projects with completed status "false"
    Then the system should return only projects with completed status "false"
    And the response status should be 200
    And all returned projects should have completed status "false"

  # Error Flow
  Scenario: No matching projects found for filter criteria (Error Flow)
    When the student requests to filter projects with completed status "XYZ123"
    Then the response status should be 404