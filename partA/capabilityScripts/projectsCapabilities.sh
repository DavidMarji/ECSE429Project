#!/bin/bash

echo "POST a new project"
response=$(curl --silent --location --request POST 'http://localhost:4567/projects' \
--header 'Content-Type: application/json' \
--data-raw '{
    "title": "New Project",
    "description": "This is a new project",
    "completed": false
}')

# Extract project ID from the JSON response
project_id=$(echo $response | grep -o '"id":"[^"]*' | cut -d'"' -f4)

echo "Created project with ID: $project_id"

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "GET all projects"
curl --location --request GET 'http://localhost:4567/projects'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "GET all projects with filters (title, completed, description)"
curl --location --request GET 'http://localhost:4567/projects?title=pa%20qui%20officia%20deser&completed=false&description=tur%20adipiscing%20elit'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "HEAD all projects"
curl --location --head 'http://localhost:4567/projects'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "GET the created project (id=$project_id)"
curl --location --request GET "http://localhost:4567/projects/$project_id"

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "HEAD the created project (id=$project_id)"
curl --location --head "http://localhost:4567/projects/$project_id"

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "POST (update) the project (id=$project_id)"
curl --location --request POST "http://localhost:4567/projects/$project_id" \
--header 'Content-Type: application/json' \
--data-raw '{
    "title": "Updated Project",
    "description": "Updated description"
}'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "PUT (replace) the project (id=$project_id)"
curl --location --request PUT "http://localhost:4567/projects/$project_id" \
--header 'Content-Type: application/json' \
--data-raw '{
    "title": "Replaced Project",
    "description": "Completely replaced project details",
    "completed": true
}'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "GET categories of project (id=$project_id)"
curl --location --request GET "http://localhost:4567/projects/$project_id/categories"

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "HEAD categories of project (id=$project_id)"
curl --location --head "http://localhost:4567/projects/$project_id/categories"

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'