# Usage
Launching ```init.sh``` will generate the db and launch the webapp with ```nodemon```, so you can easily update the whole webapp by changing and saving one of the **ts** files.

# !!!
**[!!!]** The server runs on PORT **5000**, so every address should start with ```localhost:5000``` **[!!!]** 
## Other Scripts:
 - ```build:ts```: compile the src folder into the final js files
 - ```build:ts:watch```: compile the src folder into the final js files in watch mode
 - ```build```: build:ts + build:css
 - ```start```: launch the webapp
 - ```dev```: should update at every change of a ts file
 - ```clean```: rm -rf content of dist folder && rm package-lock.json && rm node_modules -> clean the folder for push

## Pages
***(for a more detailed look at the SPA pages, check the routes const array in src/public/main.ts)***

For the ```API```: check the swagger at ```\docs```
