SHELL=/bin/bash
VENV_NAME := $(shell [ -d venv ] && echo venv || echo .venv)
VENV_DIR=${VENV_NAME}
PYTHON=$(shell if [ -d $(VENV_DIR) ]; then echo $(VENV_DIR)/bin/python; else echo python; fi)


ifneq (,$(findstring xterm,${TERM}))
	BOLD         := $(shell tput -Txterm bold)
	RED          := $(shell tput -Txterm setaf 1)
	GREEN        := $(shell tput -Txterm setaf 2)
	YELLOW       := $(shell tput -Txterm setaf 3)
	NORMAL := $(shell tput -Txterm sgr0)
endif

build:
	@echo "${BOLD}${YELLOW}mkdocs build:${NORMAL}"
	${PYTHON} -m mkdocs build -s

serve:
	@echo "${BOLD}${YELLOW}mkdocs serve:${NORMAL}"
	${PYTHON} -m mkdocs build -s && ${PYTHON} -m mkdocs serve

run: serve

update-venv:
	@echo "${BOLD}${YELLOW}update venv:${NORMAL}"
	pip install -U pip
	pip install -U -r requirements.txt
