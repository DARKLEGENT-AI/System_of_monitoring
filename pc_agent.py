import psutil
import socket
import time
import requests
import getpass

SERVER_URL = "http://localhost:8000/report"

# Получение IP компьютера
def get_ip():
    try:
        return socket.gethostbyname(socket.gethostname())
    except:
        return "0.0.0.0"

# Получение данных с ПК
def collect_data():
    # Метрики системы
    cpu = psutil.cpu_percent(interval=1)
    ram = psutil.virtual_memory().percent
    username = getpass.getuser()
    hostname = socket.gethostname()
    ip = get_ip()

    # Длительность сессии
    boot_time = psutil.boot_time()
    now = time.time()
    session_seconds = int(now - boot_time)

    # Активные процессы
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
        try:
            info = proc.info
            processes.append({
                "pid": info['pid'],
                "name": info['name'],
                "cpu": info['cpu_percent'],
                "ram": info['memory_percent']
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    return {
        "pc_name": hostname,
        "ip": ip,
        "user": username,
        "cpu": cpu,
        "ram": ram,
        "session_seconds": session_seconds,
        "processes": processes
    }

# Цикл отправки данных на сервер
if __name__ == "__main__":
    while True:
        try:
            data = collect_data()
            response = requests.post(SERVER_URL, json=data, timeout=3)
            print(f"[OK] Report sent: {response.status_code}")
        except Exception as e:
            print(f"[ERR] {e}")
        time.sleep(5)
