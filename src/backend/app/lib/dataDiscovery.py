from omegaconf import OmegaConf as oc
from omegaconf import DictConfig
from rich.table import Table
from rich.panel import Panel
from rich.console import Console

import os

# ------------ MÓDULO DE DATA DISCOVERY. RETORNA UM DICT CARREGADO PELO OMEGACONF. ----------

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
def getData(path: str) -> DictConfig | None:
    path, filteredFiles, table = pathDiscovery(path)
    console = Console()
    console.print(Panel(table, expand=False, border_style="green"))
    data = console.input("Which of these files do you want to check? ")

    try:
        data = oc.load(f"{path}/{data}.yml")
    except FileNotFoundError:
        console.print(f"[bold red]ERROR:[/] file not found at: {path}/{data}")
        return None

    if not data:
        print (f"mano, vai fazer um dado")
        return None
    if isinstance(data, DictConfig):
        return data

    console.print(f"[bold red]ERROR:[/] data is not a OmegaConf dict: {path}/{data}")
    return None
# ---------------- DESCOBERTA DE DADOS -- OS DADOS DEVEM SER EM FORMATO DE DICT. -- ------------------

def main(path: str) -> DictConfig | None:
    data = getData(path)
    return data
