"""
Geographical & Climatological Definitions for Indian States/UTs and IMD Zones.
"""
from typing import Dict, List, Any

IMD_ZONES: Dict[str, Dict[str, Any]] = {
    "Northwest India": {
        "id": "Northwest India",
        "name": "Northwest India",
        "description": "Western Himalayas, Indo-Gangetic Plains, and Thar Desert",
        "bounds": {"min_lat": 24.0, "max_lat": 37.5, "min_lon": 68.0, "max_lon": 81.0},
        "color": "#38BDF8"
    },
    "Central India": {
        "id": "Central India",
        "name": "Central India",
        "description": "Deccan Plateau, Malwa, and Central Monsoonal Belt",
        "bounds": {"min_lat": 18.0, "max_lat": 26.5, "min_lon": 72.5, "max_lon": 85.0},
        "color": "#34D399"
    },
    "East & Northeast India": {
        "id": "East & Northeast India",
        "name": "East & Northeast India",
        "description": "Brahmaputra Valley, Seven Sister States, and Gangetic Delta",
        "bounds": {"min_lat": 21.0, "max_lat": 29.5, "min_lon": 83.0, "max_lon": 97.5},
        "color": "#F472B6"
    },
    "South Peninsular India": {
        "id": "South Peninsular India",
        "name": "South Peninsular India",
        "description": "Western Ghats, Coromandel Coast, and Southern Deccan",
        "bounds": {"min_lat": 8.0, "max_lat": 19.5, "min_lon": 74.0, "max_lon": 84.5},
        "color": "#A78BFA"
    }
}

# 36 States & Union Territories of India
STATES_UTS: List[Dict[str, Any]] = [
    {"code": "JK", "name": "Jammu & Kashmir", "zone": "Northwest India", "lat": 33.7782, "lon": 76.5762, "pop_millions": 13.6, "terrain": "Himalayan Mountainous"},
    {"code": "LA", "name": "Ladakh", "zone": "Northwest India", "lat": 34.1526, "lon": 77.5771, "pop_millions": 0.3, "terrain": "High Altitude Cold Desert"},
    {"code": "HP", "name": "Himachal Pradesh", "zone": "Northwest India", "lat": 31.1048, "lon": 77.1734, "pop_millions": 7.5, "terrain": "Himalayan Ridge"},
    {"code": "PB", "name": "Punjab", "zone": "Northwest India", "lat": 31.1471, "lon": 75.3412, "pop_millions": 30.5, "terrain": "Agricultural Plains"},
    {"code": "HR", "name": "Haryana", "zone": "Northwest India", "lat": 29.0588, "lon": 76.0856, "pop_millions": 28.9, "terrain": "Semi-Arid Plains"},
    {"code": "DL", "name": "Delhi (NCT)", "zone": "Northwest India", "lat": 28.7041, "lon": 77.1025, "pop_millions": 21.0, "terrain": "Urban Megacity Basin"},
    {"code": "UT", "name": "Uttarakhand", "zone": "Northwest India", "lat": 30.0668, "lon": 79.0193, "pop_millions": 11.7, "terrain": "Garhwal/Kumaon Himalayas"},
    {"code": "UP", "name": "Uttar Pradesh", "zone": "Central India", "lat": 26.8467, "lon": 80.9462, "pop_millions": 240.0, "terrain": "Gangetic Alluvial Plain"},
    {"code": "RJ", "name": "Rajasthan", "zone": "Northwest India", "lat": 27.0238, "lon": 74.2179, "pop_millions": 81.0, "terrain": "Thar Desert & Aravalli"},
    {"code": "CH", "name": "Chandigarh", "zone": "Northwest India", "lat": 30.7333, "lon": 76.7794, "pop_millions": 1.2, "terrain": "Sub-Himalayan Foothills"},
    {"code": "MP", "name": "Madhya Pradesh", "zone": "Central India", "lat": 22.9734, "lon": 78.6569, "pop_millions": 85.0, "terrain": "Central Vindhya Plateau"},
    {"code": "CG", "name": "Chhattisgarh", "zone": "Central India", "lat": 21.2787, "lon": 81.8661, "pop_millions": 30.0, "terrain": "Mahanadi Basin & Sal Forests"},
    {"code": "GJ", "name": "Gujarat", "zone": "Central India", "lat": 22.2587, "lon": 71.1924, "pop_millions": 70.4, "terrain": "Coastal Marsh & Kathiawar"},
    {"code": "MH", "name": "Maharashtra", "zone": "Central India", "lat": 19.7515, "lon": 75.7139, "pop_millions": 126.0, "terrain": "Western Ghats & Deccan Trap"},
    {"code": "GA", "name": "Goa", "zone": "Central India", "lat": 15.2993, "lon": 74.1240, "pop_millions": 1.6, "terrain": "Konkan Coastal Escarpment"},
    {"code": "DD", "name": "Dadra & Nagar Haveli and Daman & Diu", "zone": "Central India", "lat": 20.4283, "lon": 72.8397, "pop_millions": 0.6, "terrain": "Coastal Lowland"},
    {"code": "WB", "name": "West Bengal", "zone": "East & Northeast India", "lat": 22.9868, "lon": 87.8550, "pop_millions": 100.0, "terrain": "Sundarbans Delta & Sub-Himalaya"},
    {"code": "BR", "name": "Bihar", "zone": "East & Northeast India", "lat": 25.0961, "lon": 85.3131, "pop_millions": 127.0, "terrain": "Kosi-Ganga Floodplain"},
    {"code": "JH", "name": "Jharkhand", "zone": "East & Northeast India", "lat": 23.6102, "lon": 85.2799, "pop_millions": 39.0, "terrain": "Chota Nagpur Plateau"},
    {"code": "OD", "name": "Odisha", "zone": "East & Northeast India", "lat": 20.9517, "lon": 85.0985, "pop_millions": 46.0, "terrain": "Bay of Bengal Coastal Arc"},
    {"code": "AS", "name": "Assam", "zone": "East & Northeast India", "lat": 26.2006, "lon": 92.9376, "pop_millions": 36.0, "terrain": "Brahmaputra River Valley"},
    {"code": "AR", "name": "Arunachal Pradesh", "zone": "East & Northeast India", "lat": 28.2180, "lon": 94.7278, "pop_millions": 1.6, "terrain": "Eastern Alpine Himalayas"},
    {"code": "ML", "name": "Meghalaya", "zone": "East & Northeast India", "lat": 25.4670, "lon": 91.3662, "pop_millions": 3.4, "terrain": "Shillong Plateau / Cherrapunji"},
    {"code": "NL", "name": "Nagaland", "zone": "East & Northeast India", "lat": 26.1584, "lon": 94.5624, "pop_millions": 2.2, "terrain": "Naga Hills Rugged Ridge"},
    {"code": "MN", "name": "Manipur", "zone": "East & Northeast India", "lat": 24.6637, "lon": 93.9063, "pop_millions": 3.1, "terrain": "Imphal Valley & Hills"},
    {"code": "MZ", "name": "Mizoram", "zone": "East & Northeast India", "lat": 23.1645, "lon": 92.9376, "pop_millions": 1.2, "terrain": "Lushai Hills Ridge System"},
    {"code": "TR", "name": "Tripura", "zone": "East & Northeast India", "lat": 23.9408, "lon": 91.9882, "pop_millions": 4.1, "terrain": "Riverine Hills & Plains"},
    {"code": "SK", "name": "Sikkim", "zone": "East & Northeast India", "lat": 27.5330, "lon": 88.5122, "pop_millions": 0.7, "terrain": "Kanchenjunga Alpine Massif"},
    {"code": "AP", "name": "Andhra Pradesh", "zone": "South Peninsular India", "lat": 15.9129, "lon": 79.7400, "pop_millions": 53.0, "terrain": "Eastern Ghats & Krishna Delta"},
    {"code": "TG", "name": "Telangana", "zone": "South Peninsular India", "lat": 18.1124, "lon": 79.0193, "pop_millions": 38.0, "terrain": "Semi-Arid Deccan Plateau"},
    {"code": "KA", "name": "Karnataka", "zone": "South Peninsular India", "lat": 15.3173, "lon": 75.7139, "pop_millions": 68.0, "terrain": "Western Ghats & Southern Maidan"},
    {"code": "TN", "name": "Tamil Nadu", "zone": "South Peninsular India", "lat": 11.1271, "lon": 78.6569, "pop_millions": 77.0, "terrain": "Coromandel Coastal Plain"},
    {"code": "KL", "name": "Kerala", "zone": "South Peninsular India", "lat": 10.8505, "lon": 76.2711, "pop_millions": 35.5, "terrain": "Malabar Coast & Ghats Crest"},
    {"code": "PY", "name": "Puducherry", "zone": "South Peninsular India", "lat": 11.9416, "lon": 79.8083, "pop_millions": 1.5, "terrain": "Coastal Enclaves"},
    {"code": "LD", "name": "Lakshadweep", "zone": "South Peninsular India", "lat": 10.5667, "lon": 72.6417, "pop_millions": 0.07, "terrain": "Arabian Coral Atolls"},
    {"code": "AN", "name": "Andaman & Nicobar Islands", "zone": "South Peninsular India", "lat": 11.7401, "lon": 92.6586, "pop_millions": 0.43, "terrain": "Tropical Maritime Archipelago"}
]

# Climatological normal reference values by season (for departure calculation)
SEASON_CLIMATOLOGY: Dict[str, Dict[str, Dict[str, float]]] = {
    "JJAS": {
        "Northwest India": {"rainfall": 8.5, "tmax": 35.5, "tmin": 24.5, "wind_speed": 14.0, "wind_gust": 28.0},
        "Central India": {"rainfall": 14.8, "tmax": 31.0, "tmin": 23.5, "wind_speed": 18.5, "wind_gust": 36.0},
        "East & Northeast India": {"rainfall": 16.5, "tmax": 32.0, "tmin": 24.0, "wind_speed": 12.0, "wind_gust": 24.0},
        "South Peninsular India": {"rainfall": 11.2, "tmax": 30.5, "tmin": 22.0, "wind_speed": 22.0, "wind_gust": 42.0}
    },
    "DJF": {
        "Northwest India": {"rainfall": 1.5, "tmax": 19.5, "tmin": 6.5, "wind_speed": 8.0, "wind_gust": 18.0},
        "Central India": {"rainfall": 0.6, "tmax": 26.5, "tmin": 11.5, "wind_speed": 7.5, "wind_gust": 16.0},
        "East & Northeast India": {"rainfall": 0.9, "tmax": 24.0, "tmin": 10.5, "wind_speed": 6.0, "wind_gust": 14.0},
        "South Peninsular India": {"rainfall": 1.8, "tmax": 29.5, "tmin": 19.0, "wind_speed": 11.0, "wind_gust": 22.0}
    },
    "MAM": {
        "Northwest India": {"rainfall": 1.8, "tmax": 38.5, "tmin": 21.0, "wind_speed": 16.0, "wind_gust": 38.0},
        "Central India": {"rainfall": 1.2, "tmax": 41.5, "tmin": 25.0, "wind_speed": 14.0, "wind_gust": 32.0},
        "East & Northeast India": {"rainfall": 5.8, "tmax": 35.0, "tmin": 22.5, "wind_speed": 15.0, "wind_gust": 35.0},
        "South Peninsular India": {"rainfall": 3.4, "tmax": 36.5, "tmin": 24.5, "wind_speed": 13.0, "wind_gust": 26.0}
    },
    "OND": {
        "Northwest India": {"rainfall": 0.8, "tmax": 26.0, "tmin": 12.0, "wind_speed": 7.0, "wind_gust": 15.0},
        "Central India": {"rainfall": 1.5, "tmax": 29.0, "tmin": 16.0, "wind_speed": 9.0, "wind_gust": 18.0},
        "East & Northeast India": {"rainfall": 3.8, "tmax": 28.0, "tmin": 17.0, "wind_speed": 10.0, "wind_gust": 22.0},
        "South Peninsular India": {"rainfall": 9.8, "tmax": 29.0, "tmin": 21.5, "wind_speed": 18.0, "wind_gust": 38.0}
    }
}
