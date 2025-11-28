from omegaconf import OmegaConf as oc
from rich.table import Table
from rich.panel import Panel
from rich.console import Console

import os

path = os.path.join(os.path.dirname(__file__), "dados")

entries = os.listdir(path)
print(entries)
if entries:
    filteredFiles = [e for e in entries if os.path.isfile(os.path.join(path, e)) and e.endswith(".yml")]
else:
    filteredFiles = None

console = Console()
table = Table(show_lines=True)
table.add_column(f"Relevant files found in {path}")

if filteredFiles:
    for l in filteredFiles:
        table.add_row(f"{l.replace('.yml', '')}")

console.print(Panel(table, expand=False, border_style="green"))
data = console.input("Which of these files do you want to check? ")

data = oc.load(f"{path}/{data}.yml")
print(data.get('step')) if data.get('step') else None
print(data.get('tags')) if data.get('tags') else None
print(data.get('body')) if data.get('body') else None

desc = data.get('description') if data.get('description') else None

if desc:
    print("\ndescription:")
    print(desc.get('editor')) if desc.get('editor') else None
    print(desc.get('client')) if desc.get('client') else None
    print(desc.get('descBody')) if desc.get('descBody') else None
