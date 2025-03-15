Feature: View Categories Associated with a Todo
  As a student,
  I want to see all categories associated with a todo so that I can better understand its context and relevance to the project.

  Background:
    Given the server is running
    And a valid todo exists
    And a valid category exists
    And the todo falls under that category

  # Normal Flow
  Scenario: Successfully viewing categories for a todo
    Given the todo with its id has categories associated
    When the student requests the list of categories for the todo using its id
    Then the system should return a list of categories ids associated to the todo
    And the response status should be 200

  # Alternate Flow
  Scenario: Viewing categories for a todo with no associated categories
    Given the todo with its id has no categories associated
    When the student requests the list of categories for the todo using its id
    Then the system should return an empty list
    And the response status should be 200

  # Error Flow
  Scenario: Error when trying to view categories for a non-existent todo
    Given the student requests the list of categories for the todo using "-1"
    Then the response status should be 404
