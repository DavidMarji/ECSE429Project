Feature: View Categories Associated with a Todo
  As a student,
  I want to see all categories associated with a todo so that I can better understand its context and relevance to the project.

  Background:
    Given the server is running

  # Normal Flow
  Scenario: Successfully viewing categories for a todo (Normal flow)
    Given a todo exists and multiple categories exist and the todo is associated with them
    When the student requests the list of categories for the todo using its id
    Then the system should return a list of categories ids associated to the todo
    And the response status should be 200 when the student requests to see all the categories the todo falls under

  # Alternate Flow
  Scenario: Viewing categories for a todo with no associated categories (Alternate Flow)
    Given a todo exists and it is associated to no categories
    When the student requests the list of categories for the todo using its id
    Then the system should return an empty list of categories
    And the response status should be 200 when the student requests to see all the categories the todo falls under

  # Error Flow
  Scenario: Error when trying to view categories for a non-existent todo (Error flow)
    Given the student requests the list of categories for the todo using "-1"
    Then the response status should be 404 for the invalid todos categories
