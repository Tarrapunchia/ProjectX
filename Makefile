define LAUNCH_BODY
Usage:\n
\t- make: launch docker compose up\n
\t- make reset-fe: remove and rebuild only the Frontend\n
\t- make reset-be: remove and rebuild only the Backend\n
\t- make fclean: clean the project\n
endef
export LAUNCH_BODY

all:
	@echo $$LAUNCH_BODY

build:
	docker compose up

reset-fe:
	docker compose down
	docker rmi transcendence-frontend:latest
	docker compose up

reset-be:
	docker compose down
	docker rmi transcendence-backend:latest
	docker compose up 

fclean:
	docker compose down
	docker rmi grafana/grafana:11.1.0 -f
	docker rmi prom/prometheus:v2.53.0 -f
	docker rmi transcendence-frontend:latest
	docker rmi transcendence-backend:latest
	docker system prune