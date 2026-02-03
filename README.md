# Summary
1. [Guide](#guide)
2. [Usage](#usage)
3. [Backend Api](#backend-api)

# Guide
For a guide for Fastify and the general structure of the project go to **<a href='./README.md'>Fastify Guide</a>**.


# Usage
```bash
make
./init.sh
```
Launching ```init.sh``` will generate the db and launch backend with ```nodemon```, so you can easily update the whole webapp by changing and saving one of the **ts** files.

# !!!
**[!!!]** The server runs on PORT **5000**, so every address should start with ```localhost:5000``` **[!!!]** 
## Other Scripts:
 - ```build:ts```: compile the src folder into the final js files
 - ```build:ts:watch```: compile the src folder into the final js files in watch mode
 - ```build```: build:ts + build:css
 - ```start```: launch the webapp
 - ```dev```: should update at every change of a ts file **best in dev**
 - ```clean```: rm -rf content of dist folder && rm package-lock.json && rm node_modules -> clean the folder for push

## Pages
***(TODO: pulire il main, ci sono ancora un botto di routes che non uso piu' e che si usavano prima per gestire direttamente il frontend, non guardarlo proprio)***

For the ```API```: check the swagger at ```\docs```

# Backend Api
Crossed are implemented, void are TODO
## Users
- [x] **GET** All Users ✅
- [x] **GET** Single user by id ✅
- [x] **POST** add single user ✅
- [x] **POST** user login ✅
- [x] **POST** user logout ✅
- [ ] **PUT** Modify user infos
- [ ] **DELETE** Delete a user profile

## Organizations
- [x] **GET** All organizations ✅
- [x] **GET** Single organization by id ✅
- [x] **GET** Single organization's members (users) by id ✅
- [x] **POST** add single organization ✅
- [x] **POST** add a member to the organization ✅
- [ ] **PUT** Modify organizations infos
- [ ] **DELETE** Delete a organizations profile

## Projects
- [ ] **GET** All Projects
- [ ] **GET** Single Project by id
- [ ] **GET** Single Project's members (users) by id
- [ ] **POST** add single Project
- [ ] **POST** add a member to the Project
- [ ] **PUT** Modify Projects infos
- [ ] **DELETE** Delete a Projects profile
