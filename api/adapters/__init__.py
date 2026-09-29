"""Adapter registry for SAMANVAY"""
from typing import Dict
from .base import ForecastSource
from .ncum import NCUMGAdapter
from .neps import NEPSAdapter
from .imd_gfs import IMDGFSAdapter
from .ecmwf import ECMWFIFSAdapter
from .graphcast import GraphCastAdapter
from .pangu import PanguAdapter
from .fourcastnet import FourCastNetAdapter

ADAPTERS: Dict[str, ForecastSource] = {
    "ncum_g": NCUMGAdapter(),
    "neps": NEPSAdapter(),
    "imd_gfs": IMDGFSAdapter(),
    "ecmwf_ifs": ECMWFIFSAdapter(),
    "graphcast": GraphCastAdapter(),
    "pangu": PanguAdapter(),
    "fourcastnet": FourCastNetAdapter(),
}

def get_adapter(source_id: str) -> ForecastSource:
    if source_id not in ADAPTERS:
        raise KeyError(f"Unknown forecast source: {source_id}")
    return ADAPTERS[source_id]
