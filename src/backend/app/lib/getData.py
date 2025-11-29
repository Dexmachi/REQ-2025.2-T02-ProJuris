from typing import Dict, Any, cast

from .dataDiscovery import getData

type Value = str | list[str] | int | list[Value] | None

def granularGetList(key: str, path: str, userFiles: list[str], isDesc: bool) -> Value:
    dataList = getData(path, userFiles)
    if not dataList:
        return None

    keyData: list[Value] = []
    for data in dataList:
        data = cast(Dict[str, Any], data)
        desc = data.get('description')

        current: Value = None
        if isDesc and desc:
            if isinstance(desc, dict):
                current = desc.get(key)
        else:
            current = data.get(key)

        keyData.append(current)

    return keyData if keyData else None

# VERSÃO QUE EU RETORNO UMA LISTA:
# descStringList = granularGet('descBody', path, userFiles, True)
# descStringSpecific = descStringList[i]
# (isso aqui é BEM MENOS IO bound)
