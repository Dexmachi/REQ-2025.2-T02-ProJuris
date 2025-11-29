from omegaconf import DictConfig

from typing import cast, Literal
from .dataDiscovery import getDataGranular as gdg

type Handlers = Literal['step', 'editor', "client", "expire"]

def handleStep(data: DictConfig, iterator: int, add: bool, steps: int):
    if data.get('step'):
        if add:
            data.step = data.step+steps
        else:
            data.step = data.step-steps
    else:
        print("No step, this is an issue.")

def handleDescEditor(data: DictConfig): ...


def transformHandler(
    action: Handlers,
    path: str,
    userFiles: list[str],
    add: bool,
    iterator: int = 0,
    steps: int = 0,
) -> bool:

    data = gdg(path, userFiles, iterator)
    data = cast(DictConfig, data)

    if not data:
        print("Could not load data")
        return False

    print(f"Handling {action} in {path}")

    match action:
        case 'step':
            handleStep(data, iterator, add, steps)

        case _:
            print(f"Invalid handler: {action}")
            return False

    return True
