from pymongo import MongoClient
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from subprocess import Popen, PIPE
import platform
import bcrypt

# Подключение к Базе Данных
client = MongoClient("mongodb://root:example@localhost:27017/")
db = client["monitor"]
pc_collection = db["pcs"]
user_collection = db["users"]
user_collection.create_index("login", unique=True)

# CORS 
origins = ["*"]
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"])

# Pydantic-модели
class Process(BaseModel):
    pid: int
    name: str
    cpu: float
    ram: float
class Report(BaseModel):
    pc_name: str
    ip: str
    user: str
    cpu: float
    ram: float
    session_seconds: int
    processes: List[Process]

# Проверка IP
def is_host_alive(ip: str) -> bool:
    param = "-n" if platform.system().lower() == "windows" else "-c"
    try:
        proc = Popen(["ping", param, "1", ip], stdout=PIPE, stderr=PIPE)
        stdout, _ = proc.communicate()
        output = stdout.decode("cp866" if platform.system().lower() == "windows" else "utf-8")
        return "TTL=" in output or "ttl=" in output
    except Exception:
        return False

# Создание админского аккаунта
def ensure_admin_exists():
    if user_collection.count_documents({}) == 0:
        default_admin = {
            "login": "admin",
            "password": bcrypt.hashpw("admin12345".encode(), bcrypt.gensalt()),
            "role": "admin"
        }
        user_collection.insert_one(default_admin)
        print("✔ Создан пользователь: admin / admin12345")
ensure_admin_exists()

# Аунтификация пользователя
@app.post("/auth")
def login_user(data: dict):
    login = data.get("login")
    password = data.get("password")

    user = user_collection.find_one({"login": login})
    if user and bcrypt.checkpw(password.encode(), user["password"]):
        return {"status": "ok", "role": user["role"]}
    
    return {"status": "fail"}

# POST /report — от агента, Получение данных от ПК
@app.post("/report")
def receive_report(report: Report):
    now = datetime.now(timezone.utc)
    activity = "Занят" if report.user else "Свободен"

    data = {
        "pc_name": report.pc_name,
        "ip": report.ip,
        "user": report.user,
        "cpu": report.cpu,
        "ram": report.ram,
        "session_seconds": report.session_seconds,
        "last_seen": now,
        "processes": [proc.dict() for proc in report.processes],
        "activity": activity
    }

    existing = pc_collection.find_one({"ip": report.ip})
    if existing:
        pc_collection.update_one({"ip": report.ip}, {"$set": data})
    else:
        pc_collection.insert_one(data)

    return {"status": "ok"}

# GET /admin/pcs, Получение информации о всех компьютерах
@app.get("/admin/pcs")
def list_pcs():
    now = datetime.now(timezone.utc)
    result = []

    for pc in pc_collection.find():
        last_seen = pc.get("last_seen", now)

        if last_seen.tzinfo is None:
            last_seen = last_seen.replace(tzinfo=timezone.utc)

        is_active = (now - last_seen).total_seconds() < 10

        update = {}
        if not is_active:
            update.update({
                "activity": "Неактивен",
                "cpu": 0.0,
                "ram": 0.0,
                "session_seconds": 0,
                "processes": []
            })
        elif pc.get("user"):
            update["activity"] = "Занят"
        else:
            update["activity"] = "Свободен"

        if update:
            pc_collection.update_one({"_id": pc["_id"]}, {"$set": update})
            pc.update(update)

        result.append({
            "id": str(pc["_id"]),
            "name": pc.get("pc_name"),
            "cpu": pc.get("cpu"),
            "ram": pc.get("ram"),
            "status": pc.get("activity"),
            "user": pc.get("user") or "–"
        })

    return result

# GET /admin/pc/{id}, информация о ПК
@app.get("/admin/pc/{pc_id}")
def pc_details(pc_id: str):
    pc = pc_collection.find_one({"_id": ObjectId(pc_id)})
    if not pc:
        return {"error": "ПК не найден"}

    now = datetime.now(timezone.utc)
    last_seen = pc.get("last_seen", now)

    if last_seen.tzinfo is None:
        last_seen = last_seen.replace(tzinfo=timezone.utc)

    is_active = (now - last_seen).total_seconds() < 10

    activity = "Неактивен"
    if is_active:
        activity = "Занят" if pc.get("user") else "Свободен"

    pc_collection.update_one({"_id": pc["_id"]}, {"$set": {"activity": activity}})

    return {
        "id": str(pc["_id"]),
        "name": pc.get("pc_name"),
        "ip": pc.get("ip"),
        "cpu": pc.get("cpu"),
        "ram": pc.get("ram"),
        "status": activity,
        "user": pc.get("user"),
        "session_seconds": pc.get("session_seconds"),
        "processes": pc.get("processes")
    }

# POST /admin/add_pc, добавление нового компьютера
@app.post("/admin/add_pc")
def add_pc(data: dict):
    pc_id = data.get("pc_id")  # Не нужен в Mongo, можно игнорировать
    pc_name = data.get("pc_name")
    ip = data.get("ip")

    if not pc_name or not ip:
        raise HTTPException(status_code=400, detail="Нужно указать pc_name и ip")

    if pc_collection.find_one({"ip": ip}):
        return {"status": "fail", "reason": "ПК с таким IP уже существует"}

    if not is_host_alive(ip):
        return {"status": "fail", "reachable": False, "reason": "ПК не отвечает на ping"}

    pc = {
        "pc_name": pc_name,
        "ip": ip,
        "user": None,
        "cpu": 0.0,
        "ram": 0.0,
        "session_seconds": 0,
        "last_seen": datetime.now(timezone.utc),
        "processes": [],
        "activity": "Свободен"
    }
    pc_collection.insert_one(pc)
    return {"status": "ok", "reachable": True, "message": f"ПК добавлен"}

# POST /user/{username}, Получение информации о конкретном ПК
@app.get("/user/{username}")
def user_status(username: str):
    pc = pc_collection.find_one({"user": username})
    if not pc:
        return {"error": "Пользователь не найден"}
    return {
        "cpu": pc.get("cpu"),
        "ram": pc.get("ram"),
        "session_seconds": pc.get("session_seconds")
    }