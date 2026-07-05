define LAUNCH_BODY
Usage:\n
\t- make: launch docker compose up\n
\t- make reset-fe: remove and rebuild only the Frontend\n
\t- make reset-be: remove and rebuild only the Backend\n
\t- make resfresh: shuts down the containers and relaunch them after rebuilding\n
\t- make fclean: clean the project\n
\t- make re: fclean + build\n
endef
export LAUNCH_BODY

all:
	@echo $$LAUNCH_BODY

build:
	docker compose up

reset-fe:
	docker compose down
	docker rmi transcendence-frontend:latest || true
	docker compose up

reset-be:
	docker compose down
	docker rmi transcendence-backend:latest
	docker compose up 

refresh:
	docker compose down
	docker compose up --build

fclean:
	docker compose down
	docker rmi grafana/grafana:11.1.0 -f
	docker rmi prom/prometheus:v2.53.0 -f
	docker rmi transcendence-frontend:latest
	docker rmi transcendence-backend:latest
	docker system prune

re: fclean build