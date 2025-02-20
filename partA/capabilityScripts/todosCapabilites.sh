#!/bin/bash
echo "GET all todos with no filter"

curl --location --request GET 'http://localhost:4567/todos'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "GET all todos with filter on id = 2"

curl --location --request GET 'http://localhost:4567/todos?id=2'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "GET all todos with filter on title = Wash Dishes"

curl --location --request GET 'http://localhost:4567/todos?title=Wash+Dishes'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "GET all todos with filter on doneStatus = False"

curl --location --request GET 'http://localhost:4567/todos?doneStatus=false'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "GET all todos with filter on doneStatus = True"

curl --location --request GET 'http://localhost:4567/todos?doneStatus=true'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "HEAD all todos with no filter"

curl --location --head 'http://localhost:4567/todos'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "POST a todo with request body and including the mandatory title field"

curl --location --request POST 'http://localhost:4567/todos' \
--header 'Content-Type: application/json' \
--data-raw '{
            "title" : "exampleTitle1",
            "doneStatus": true
        }'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "GET a todo with existing id"

curl --location --request GET 'http://localhost:4567/todos/2'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "HEAD a todo with existing id"

curl --location --head 'http://localhost:4567/todos/2'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "PUT a todo with existing id and make doneStatus True"

curl --location --request PUT 'http://localhost:4567/todos/2' \
--header 'Content-Type: application/json' \
--data-raw '{
            "title" : "example"
            "doneStatus": true
        }'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "PUT a todo with existing id and make doneStatus False"

curl --location --request PUT 'http://localhost:4567/todos/2' \
--header 'Content-Type: application/json' \
--data-raw '{
            "title": "example",
            "doneStatus": false
        }'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "DELETE a todo"

curl --location --request DELETE 'http://localhost:4567/todos/1'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "GET all todo tasksof"

curl --location --request GET 'http://localhost:4567/todos/2/tasksof'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "HEAD the todo tasksof"

curl --location --head 'http://localhost:4567/todos/2/tasksof'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "POST a todo tasksof relation (make the todo a task of an existing project)"

curl --location --request POST 'http://localhost:4567/todos/2/tasksof' \
--header 'Content-Type: application/json' \
--data-raw '{
            "id" : "1"
        }'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "DELETE a todo tasksof relation (make the todo not a task of an existing project)"

curl --location --request DELETE 'http://localhost:4567/todos/2/tasksof/1'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "GET the categories of a todo"

curl --location --request GET 'http://localhost:4567/todos/2/categories'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "HEAD the categories of a todo"

curl --location --head 'http://localhost:4567/todos/2/categories'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "POST the categories of a todo (create a new relation between a todo and a category)"

curl --location --request POST 'http://localhost:4567/todos/2/categories' \
--header 'Content-Type: application/json' \
--data-raw '{
            "id" : "2"
        }'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'

echo "DELETE a todo category relation (remove the category from the todo)"

curl --location --request DELETE 'http://localhost:4567/todos/2/categories/2'

echo $'\n----------------------------------------------------------------------------------------------------------------------------------------------------------------\n'