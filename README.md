# Overview

The tech stack used to build project is

1. TypeScript
1. NodeJS (Express)
1. MongoDB (Database)
1. Mocha & Chai (For testing)

- When a user logs in a token is created according to the user's tokenVersion in DB. When a user logs out or changes the password we update the tokenVersion and all the previous tokens are revoked.
- Used JWT for token, authentication.
- Middlewares are created according to the roles, isLoggedIn to check login, isAdmin to check if the user is admin or not.
- By default a admin user is created (username=admin & password=test) when the server starts (first time). There is not route for creating a admin user, this should be done directly from the Database.

# Installations

For running this project locally on your machine, you need `docker` && `docker-compose`.
The server runs on `PORT=5000` which can be changed in `docker-compose.yml`

### Building the API Server

```
docker-compose build --no-cache
```

### Starting the API Server

```
docker-compose up -d
```

### Building Tests

```
docker build -t gst-tax-management-test --target test .
```

### Running Tests

```
docker run --network="host" gst-tax-management-test
```

# API Routes

Roles:

1. TA = tax-accountant
1. TP = tap-payer
1. AD = admin

| Route                                  | Permissions |           Description           | Methods |
| :------------------------------------- | :---------: | :-----------------------------: | ------: |
| /api/login                             |     ALL     |           User Login            |    POST |
| /api/logout                            |     ALL     |           User Logout           |  DELETE |
| /api/users/                            |     ALL     |       Create a User (TP)        |    POST |
| /api/users/tax-payer                   |   TA & AD   |          Get ALL (TP)           |     GET |
| /api/users/tax-payer/:userId           |   TA & AD   |           GET A (TP)            |     GET |
| /api/users/tax-payer/:userId           |   TA & AD   |          Update A (TP)          |     PUT |
| /api/users/make-admin/:userId          |     AD      |     Promote a user to (AD)      |     GET |
| /api/users/make-tax-accountant/:userId |   TA & AD   |     Promote a user to (TA)      |     GET |
| /api/users/:userId                     |     AD      |       Delete a User (TP)        |  DELETE |
| /api/taxs/tax-dues                     |     ALL     | Returns tax dues based on role  |     GET |
| /api/taxs/tax-dues/tax-dues/:taxId     |     ALL     | Returns a tax due based on role |     GET |
| /api/taxs/tax-pay/:taxId               |     TP      |         Pays a tax due          |     GET |
| /api/taxs/                             |   TA & AD   |        Creates a tax due        |    POST |
| /api/taxs/:taxId                       |   TA & AD   |        updates a tax due        |     PUT |
| /api/taxs/:taxId                       |     AD      |       remomves a tax due        |  DELETE |

# Features

1. List, view and edit tax-payers - this can only be done by "tax-accountant" and "admin" roles.

1. One tax-accountant can manage different tax-payers.

1. Full tax is dependent on which state the tax-payer belongs to. Total tax = state tax + central tax. if it is a union territory, then no state tax.

1. Create a tax due - This can be done only by "tax-accountant" role. The system will take certain inputs (PAN card of tax-payer, income from salary, income from share market, etc etc) and calculate the total tax due. It also sets status as NEW or DELAYED based on due date.

1. Edit tax due. This can only be done by "tax-accountant".

1. Mark tax as paid. This can only be done by tax-payer. P.S. you dont need to do any UPI integration. Just create a dummy!

1. Ability to list and view tax due based on the filter applied - By "filter" we mean - select by date of creation, date of update, state of tax (NEW, PAID, DELAYED), etc. This action can be done by all : "tax-payer", "tax-accountant" and "admin" roles. HOWEVER - "tax-payer" can only see his own taxes...while "tax-accountant" and "admin" can see everyone's taxes.
