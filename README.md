[![Build Status](https://travis-ci.org/SaiKrishnaMohan7/NodeTodoAPI.svg?branch=master)](https://travis-ci.org/SaiKrishnaMohan7/NodeTodoAPI)

# Todo API
A Todo API built with express and mongo. It uses JWT (JSON Web Tokens) for authentication and uses tokens for authorization

## Technologies
* Express - Middleware, Business Logic Tier
* MongoDB - Persistence/Data Tier
* Mongoose ORM - Data Access Tier
* Mocha, expect, supertest - Unit Tests
* JSONWebToken - Authentication, Authorization
* BCrypt - Salting and hashinf passwords
* Postman - For testing API endpoints
* Travis - CI
* Heroku - Hosting

## Usage
* The API is live [here](https://todo--node.herokuapp.com/)
* Sign up users by via postman, endpoint `/users` with email and password as JSON in the body (Create)
    * If successful you will receive the auth token in the response header as `x-auth`
* Use the above token in the header of your request to `/todos` with a JSON like `{"text" : "My Todo"}` to create todos (Create)
* Retrieving todos via `/todos/id` will give your todos, if any (Read)
* Update to a specific todo `todo/id` (Update)
* Delete a specific todo `todo/id` (Delete)
* Existing user login via `/users/me` with the same token
* Logout via `/users/me/token` (Delete)
* Todos for each user will be unique

## Future Work
- [ ] Document Postman shortcuts
- [x] Change Heroku app name to antyhing else but the default one
- [x] Async/Await
- [x] Separate routes and application middleware
- [ ] Token refresh (session)
- [ ] Build a UI