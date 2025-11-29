from omegaconf import OmegaConf as oc
from omegaconf import DictConfig
from rich.table import Table
from rich.panel import Panel
from rich.console import Console

import os

# ------------ MÓDULO DE DATA DISCOVERY. RETORNA UMA LISTA DE DictConfig CARREGADO PELO OMEGACONF. ----------

# ---------------- DESCOBERTA DE ARQUIVOS RELEVANTES ----------------------
def pathDiscovery(path: str) -> tuple[str, list[str] | None, Table]:

    entries = os.listdir(path)
    print(entries)
    if entries:
        filteredFiles = [e for e in entries if os.path.isfile(os.path.join(path, e)) and e.endswith(".yml")]
    else:
        filteredFiles = None

    table = Table(show_lines=True)
    table.add_column(f"Relevant files found in {path}")

    if filteredFiles:
        for l in filteredFiles:
            table.add_row(f"{l.replace('.yml', '')}")
    return path, filteredFiles, table
# ---------------- DESCOBERTA DE ARQUIVOS RELEVANTES ----------------------

# ---------------- DESCOBERTA DE DADOS -- OS DADOS DEVEM SER EM FORMATO DE DICT. -- ------------------
def getData(path: str, userFiles: list[str]) -> list[DictConfig] | None:
    path, filteredFiles, table = pathDiscovery(path)

    console = Console()
    console.print(Panel(table, expand=False, border_style="green"))
    data = console.input("Which of these files do you want to check? ")

    if not userFiles:
        return None

    try:
        files: list[DictConfig] = []
        if filteredFiles:
            for file in userFiles:
                if file in userFiles and file in filteredFiles:
                    data = oc.load(f"{path}/{data}")
                    if not data:
                        print (f"mano, vai fazer um dado")
                        return None
                    if isinstance(data, DictConfig):
                        files.append(data)
                        return files
                    console.print(f"[bold red]ERROR:[/] data is not a OmegaConf dict: {path}/{data}")
                    return None
                console.print(f"[bold yellow]WARNING:[/] file {file} is not a acceptable file")
    except FileNotFoundError:
        console.print(f"[bold red]ERROR:[/] file not found at: {path}/{data}")
        return None

# ---------------- DESCOBERTA DE DADOS -- OS DADOS DEVEM SER EM FORMATO DE DICT. -- ------------------

def main(path: str, userFiles: list[str]) -> list[DictConfig] | None:
    data = getData(path, userFiles)
    return data
