## Ignite NodeJS - Challenge 07 and Challenge 08

### Unit Testing
- POST "/api/v1/users"
  - [x] should be able to create a new user
- POST "/api/v1/sessions"
  - [x] should be able to authenticate a valid user login
  - [x] should not be able to authenticate an invalid user
  - [x] should not be able to authenticate an user with an invalid password
- GET "/api/v1/profile"
  - [x] should be able to show the user profile
  - [x] should not be able to show a profile of a non-existent user
- POST "/api/v1/statements/deposit"
  - [x] should be able to deposit an amount
  - [x] should not be able to create a statement for a non-existent user
- POST "/api/v1/statements/withdraw"
  - [x] should be able to withdraw an amount
  - [x] should not be able to create a statement for a non-existent user
  - [x] should not be able to create a withdraw statement with insufficient funds
- GET "/api/v1/statements/balance"
  - [x] should be able to get user account balance
  - [x] should not be able get balance from a non-existent user
- GET "/api/v1/statements/:statement_id"
  - [x] should be able to get a statement by id
  - [x] should not be able to get a statement of a non-existent user
  - [x] should not be able to get a non-existent statement

### Integration Testing
- POST "/api/v1/users"
  - [x] should return a status code 201 when successfully create a new user
  - [x] should return a status code 400 when trying to create a user with an already registered email
- POST "/api/v1/sessions"
  - [x] should be able to authenticate a valid user login with a returned status code 200
  - [x] should not be able to authenticate an invalid user returning a status code 401
  - [x] should not be able to authenticate an user with an invalid password returning a status code 401
- GET "/api/v1/profile"
  - [x] should be able to show a valid user profile with a returned status code 200
  - [x] should not be able to show an user profile with an invalid token returning a status code 401
  - [x] should not be able to show a profile of a non-existent user returning a status code 404
- POST "/api/v1/statements/deposit|withdraw"
  - [x] should be able to create a statement with a returned status code 201
  - [x] should not be able to create a statement with an invalid token returning a status code 401
  - [x] should not be able to create a statement of a non-existent user returning a status code 404
- GET "/api/v1/statements/balance"
  - [x] should be able to get user account balance with a returned status code 200
- GET "/api/v1/statements/:statement_id"
  - [x] should be able to get a statement by id with a returned status code 200
