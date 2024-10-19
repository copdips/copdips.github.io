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

install:
	@echo "${BOLD}${YELLOW}install:${NORMAL}"
	pipx install uv
	pipx upgrade uv
	@if [ ! -d "$(VENV_DIR)" ]; then \
		python3.12 -m venv $(VENV_DIR); \
	fi
	@. $(VENV_DIR)/bin/activate; \
	uv pip install -r requirements.txt

build:
	@echo "${BOLD}${YELLOW}mkdocs build:${NORMAL}"
	${PYTHON} -m mkdocs build -s

serve:
	@echo "${BOLD}${YELLOW}mkdocs serve:${NORMAL}"
	${PYTHON} -m mkdocs build -s && ${PYTHON} -m mkdocs serve

run: serve

update-venv:
	@echo "${BOLD}${YELLOW}update venv:${NORMAL}"
	${PYTHON} -m pip install -U pip
	uv pip install -Ur requirements.txt

ci-install:
	${PYTHON} -m pip install -U pip
	${PYTHON} -m pip install -U uv
	UV_SYSTEM_PYTHON=true uv pip install -Ur requirements.txt
	echo -e "\nInstalled packages:"
	uv pip list
