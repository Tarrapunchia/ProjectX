define LAUCH_BODY
Usage: launching init.sh will generate the db and launch the webapp with nodemon, so you can easily update the whole webapp by changing and saving one of the ts files
\nOther Scripts:\n
\t- "build:ts": compile the src folder into the final js files\n
\t- "build:ts:watch": compile the src folder into the final js files in watch mode\n
\t- "build:css": compile the tailwindcss into usable css in dist\n
\t- "build:css:watch": compile the tailwindcss into usable css in dist in watch mode (for style only)\n
\t- "build": build:ts + build:css\n
\t- "start": launch the webapp\n
\t- "dev": should update at every change of a ts file\n
\t- "buildev": build + update when ts is rebuild\n
\t- "clean": rm -rf content of dist folder && rm package-lock.json && rm node_modules -> clean the folder for push\n\n
endef
export LAUCH_BODY

define USAGE_BODY
API: check the swagger at '\docs', tests all the API endpoints
First of all seed the db with /api/v1/users/seed
Then you can test the endpoints (the db is empty otherwise)
endef
export USAGE_BODY

all:
	@npm i
	@chmod -x init.sh
	@echo $$LAUCH_BODY
	@echo $$USAGE_BODY