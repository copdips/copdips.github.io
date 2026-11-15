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

venv:
	uv venv -p 3.13.9 --allow-existing

install: venv
	@echo "${BOLD}${YELLOW}install:${NORMAL}"
	uv sync --frozen --all-extras --all-groups --verbose

build:
	@echo "${BOLD}${YELLOW}zensical build:${NORMAL}"
# ! zensical build needs to get tools folder as module
	uv run zensical build -s

run:
	@echo "${BOLD}${YELLOW}zensical serve (fast: no rss, social, optimize):${NORMAL}"
	uv run zensical serve -f zensical.fast.toml

run-complete:
	@echo "${BOLD}${YELLOW}zensical serve (complete: rss, social, optimize):${NORMAL}"
	uv run zensical serve

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
	uv pip show zensical
