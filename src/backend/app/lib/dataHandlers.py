from omegaconf import DictConfig, OmegaConf as oc

import os

from typing import cast, Literal, Any
from .dataDiscovery import getDataGranular as gdg

type Handlers = Literal[
'step',
'editor',
"client",
"expire",
"body",
]

def handleStep(data: DictConfig, payload: dict[str, Any]) -> bool:
    steps: int = payload.get('steps', 1)
    add: bool = payload.get('add', True)
    if 'step' in data:
        if add:
            if (data.step + steps) <= 3:
                data.step = data.step+steps
            else:
                print("ERROR: Trying to place kanban file into an unbound step.")
                return False
            return True
        else:
            if (data.step - steps) >= 0:
                data.step = data.step-steps
            else:
                print("ERROR: Trying to place kanban file into an unbound step.")
                return False
            return True
    else:
        if steps >= 0 and steps <= 3:
            data.step = steps
            return True
        print("ERROR: Trying to place kanban file into an unbound step.")
        return False

def handleDescEditor(data: DictConfig, payload: dict[str, Any]) -> bool:
    newEditor = payload.get('editor')
    desc = data.get('description')

    if not newEditor:
        print("Error: Must pass a new editor.")
        return False

    if not desc:
        data.description = {}
        desc = data.get('description')

    desc.editor = newEditor
    return True

def handleDescClient(data: DictConfig, payload: dict[str, Any]) -> bool:
    newClient = payload.get('client')
    desc = data.get('description')

    if not newClient:
        print("ERROR: must pass a new editor.")
        return False

    if not desc:
        data.description = {}
        desc = data.get('description')

    desc.client = newClient
    return True

def handleBody(data: DictConfig, payload: dict[str, Any]) -> bool:
    content = payload.get('body')
    placing = payload.get('bodyLocation', 'root')

    if not content:
        print("ERROR: no content passed")
        return False

    if placing == 'description':
        if 'description' not in data or data.description is None:
            data.description = {}
        data.description.body = content
        return True

    data.body = content
    return True


def transformHandler(
    # APENAS PARA ESSA ÚNICA FUNÇÃO
    actions: list[Handlers],
    iterator: int,
    userFiles: list[str],
    # APENAS PARA ESSA ÚNICA FUNÇÃO

    # GERAL
    path: str,
    # GERAL

    # PEGA TUDO QUE FOR PASSADO, É RESPONSABILIDADE DAS OUTRAS DEF PEGAR O QUE PRECISAM DE VDD.
    **payload
) -> bool:

    dataList = gdg(path, userFiles, iterator)
    if dataList:
        data = dataList[0]
    else:
        print("No data parsed")
        return False

    data = cast(DictConfig, data)

    if not data:
        print("Could not load data")
        return False

    changes = False

    for action in actions:
        print(f"Handling {action} in {path}")

        match action:
            case 'step':
                if handleStep(data, payload):
                    changes = True

            case 'editor':
                if handleDescEditor(data, payload):
                    changes = True

            case 'client':
                if handleDescClient(data, payload):
                    changes = True

            case 'body':
                if handleBody(data, payload):
                    changes = True

            case _:
                print(f"Invalid handler: {action}")
                continue

    if changes:
        try:
            target = userFiles[iterator]
            fullPath = os.path.join(path, target)
            oc.save(data, fullPath)
        except Exception as e:
            print(f'Unexpected error: {e}')
        return True

    print("No changes made.")
    return False
