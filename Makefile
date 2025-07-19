SHELL=/bin/bash
VENV_NAME := $(shell [ -d venv ] && echo venv || echo .venv)
# VENV_DIR=${VENV_NAME}
VENV_DIR=.venv
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
	pipx install uv --force
# 	@if [ ! -d "$(VENV_DIR)" ]; then \
# 		python3.12 -m venv $(VENV_DIR); \
# 	fi
# 	@. $(VENV_DIR)/bin/activate; \
	uv sync --frozen --verbose
	@echo "To activate manually, run: ${BOLD}${YELLOW}source $(VENV_DIR)/bin/activate${NORMAL}"; \

build:
	@echo "${BOLD}${YELLOW}mkdocs build:${NORMAL}"
	${PYTHON} -m mkdocs build -s

run:
	@echo "${BOLD}${YELLOW}mkdocs serve:${NORMAL}"
	${PYTHON} -m mkdocs serve --dirty

update-venv:
	@echo "${BOLD}${YELLOW}update venv:${NORMAL}"
# 	${PYTHON} -m pip install -U pip
# 	uv pip install -Ur requirements.txt
#   uv self update for CI, pipx upgrade uv for local
	uv self update || pipx upgrade uv
	uv lock --upgrade

ci-install:
	@echo "${BOLD}${YELLOW}ci-install:${NORMAL}"
	uv sync --frozen --verbose
	uv pip show mkdocs
