import os

# Створимо базову структуру папок
os.makedirs("app/api/v1/endpoints", exist_ok=True)
os.makedirs("app/core", exist_ok=True)
os.makedirs("app/db", exist_ok=True)
os.makedirs("app/models", exist_ok=True)
os.makedirs("app/schemas", exist_ok=True)
os.makedirs("app/services", exist_ok=True)

