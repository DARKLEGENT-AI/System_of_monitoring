from pymongo import MongoClient
import bcrypt


def get_mongo_connection(uri: str, db_name: str, collection_name: str):
    """Устанавливает подключение к MongoDB и возвращает коллекцию."""
    client = MongoClient(uri)
    database = client[db_name]
    return database[collection_name]


def get_user_input() -> dict:
    """Запрашивает данные нового пользователя с консоли."""
    login = input("Введите логин: ").strip()
    password = input("Введите пароль: ").strip()
    role = input("Введите роль (user/admin) [по умолчанию: user]: ").strip().lower() or "user"
    return {"login": login, "password": password, "role": role}


def hash_password(password: str) -> bytes:
    """Хэширует пароль с помощью bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())


def user_exists(collection, login: str) -> bool:
    """Проверяет, существует ли пользователь с данным логином."""
    return collection.find_one({"login": login}) is not None


def create_user(collection, login: str, hashed_password: bytes, role: str):
    """Создаёт нового пользователя в коллекции."""
    user_data = {
        "login": login,
        "password": hashed_password,
        "role": role
    }
    collection.insert_one(user_data)
    print(f"✔ Пользователь '{login}' успешно добавлен.")


def main():
    # Настройки подключения к БД
    mongo_uri = "mongodb://root:example@localhost:27017/"
    db_name = "monitor"
    collection_name = "users"

    # Получаем коллекцию пользователей
    users = get_mongo_connection(mongo_uri, db_name, collection_name)

    # Запрашиваем данные у пользователя
    credentials = get_user_input()

    # Проверяем, существует ли пользователь
    if user_exists(users, credentials["login"]):
        print("❌ Пользователь с таким логином уже существует.")
        return

    # Хэшируем пароль и создаём пользователя
    hashed_pw = hash_password(credentials["password"])
    create_user(users, credentials["login"], hashed_pw, credentials["role"])


if __name__ == "__main__":
    main()
