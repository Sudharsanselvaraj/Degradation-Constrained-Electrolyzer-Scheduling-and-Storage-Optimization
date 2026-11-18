"""
Channel definitions, units, and physical schemas for the Jülich 100 kW PEM dataset.
Forschungszentrum Jülich (2018–2023), DOI: 10.26165/JUELICH-DATA/FEKKSS
"""

from dataclasses import dataclass
from typing import Dict, List, Optional

@dataclass
class ChannelInfo:
    col_index: int
    tag: str
    unit: str
    description: str
    si_unit: str
    conversion_factor: float = 1.0  # multiplier to convert raw unit to SI
    category: str = "general"

# 100 kW Teststand physical geometry
NOMINAL_POWER_KW = 100.0
NUM_STACKS = 2
CELLS_PER_STACK = 30
TOTAL_CELLS = NUM_STACKS * CELLS_PER_STACK
MEA_ACTIVE_AREA_CM2 = 300.0  # Active area in cm² per cell

# Crucial core channels mapped from row 50 (description), row 51 (tag), row 52 (unit)
CORE_CHANNELS: Dict[str, ChannelInfo] = {
    "step_nr": ChannelInfo(1, "Nr.", "Nr.", "Measurement step number", "count", 1.0, "index"),
    "date": ChannelInfo(2, "Datum", "jjjjmmdd", "Measurement date", "date", 1.0, "time"),
    "time": ChannelInfo(3, "Zeit", "hh:mm:ss", "Measurement time of day", "time", 1.0, "time"),
    "time_rel_s": ChannelInfo(4, "t", "s", "Relative elapsed time in seconds", "s", 1.0, "time"),
    "time_rel_h": ChannelInfo(5, "t", "h", "Relative elapsed time in hours", "h", 3600.0, "time"),
    
    # Electrical Stack 1
    "j_set_stack1": ChannelInfo(6, "Soll_j_Stack-1", "A/cm²", "Setpoint current density Stack 1", "A/cm²", 1.0, "electrical"),
    "j_meas_stack1": ChannelInfo(7, "j_Stack-1", "A/cm²", "Measured current density Stack 1", "A/cm²", 1.0, "electrical"),
    "i_meas_stack1": ChannelInfo(8, "I_Stack-1", "A", "Measured current Stack 1", "A", 1.0, "electrical"),
    "u_meas_stack1": ChannelInfo(15, "U_Netz-1", "V", "Measured power supply voltage Stack 1", "V", 1.0, "electrical"),
    
    # Electrical Stack 2
    "j_set_stack2": ChannelInfo(9, "Soll_j_Stack-2", "A/cm²", "Setpoint current density Stack 2", "A/cm²", 1.0, "electrical"),
    "j_meas_stack2": ChannelInfo(10, "j_Stack-2", "A/cm²", "Measured current density Stack 2", "A/cm²", 1.0, "electrical"),
    "i_meas_stack2": ChannelInfo(11, "I_Stack-2", "A", "Measured current Stack 2", "A", 1.0, "electrical"),
    "u_meas_stack2": ChannelInfo(19, "U_Netz-2", "V", "Measured power supply voltage Stack 2", "V", 1.0, "electrical"),
    
    # Gas & Production
    "h2_flow_rate": ChannelInfo(37, "FI-24", "m³/h", "Hydrogen volumetric flow outlet", "m³/s", 1.0 / 3600.0, "production"),
    "system_pressure": ChannelInfo(50, "PIAS-32", "bar", "System inert gas pressure", "Pa", 1e5, "fluidics"),
    
    # Thermal & Temperature
    "t_anode_in": ChannelInfo(55, "TIC11a/b", "°C", "Anode inlet water temperature", "K", 1.0, "thermal"),
    "t_anode_out": ChannelInfo(59, "TICAS+12/13", "°C", "Anode outlet water temperature", "K", 1.0, "thermal"),
    "t_cathode_in": ChannelInfo(63, "TIC21a/b", "°C", "Cathode inlet water temperature", "K", 1.0, "thermal"),
    "t_cathode_out": ChannelInfo(67, "TICAS+22/23", "°C", "Cathode outlet water temperature", "K", 1.0, "thermal"),
    "t_cool_in": ChannelInfo(73, "TI-32", "°C", "Cooling water inlet temperature", "K", 1.0, "thermal"),
    "t_cool_out": ChannelInfo(74, "TI-33", "°C", "Cooling water outlet temperature", "K", 1.0, "thermal"),
    "t_stack_1": ChannelInfo(164, "T-Stack_1", "°C", "Internal stack temperature sensor 1", "K", 1.0, "thermal"),
    "t_stack_2": ChannelInfo(165, "T-Stack_2", "°C", "Internal stack temperature sensor 2", "K", 1.0, "thermal"),
    "t_stack_3": ChannelInfo(166, "T-Stack_3", "°C", "Internal stack temperature sensor 3", "K", 1.0, "thermal"),
    "t_amb_lower": ChannelInfo(150, "TI34", "°C", "Ambient test bench temp lower", "K", 1.0, "thermal"),
    "t_amb_upper": ChannelInfo(151, "TI35", "°C", "Ambient test bench temp upper", "K", 1.0, "thermal"),
    
    # Fluid Flow Rates
    "v_anode_1": ChannelInfo(22, "V_Anode-1", "l/min", "Anode water volume flow Stack 1", "m³/s", 1e-3 / 60.0, "fluidics"),
    "v_anode_2": ChannelInfo(26, "V_Anode-2", "l/min", "Anode water volume flow Stack 2", "m³/s", 1e-3 / 60.0, "fluidics"),
}

# Individual Cell Voltage columns:
# Stack 1: columns 84 to 113 (cells 1 to 30)
# Stack 2: columns 115 to 144 (cells 1 to 30)
STACK1_CELL_VOLTAGE_COLS = {f"u_cell_s1_{i}": 83 + i for i in range(1, 31)}
STACK2_CELL_VOLTAGE_COLS = {f"u_cell_s2_{i}": 114 + i for i in range(1, 31)}
