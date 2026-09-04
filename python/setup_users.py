import json, os, bcrypt, getpass

USERS_FILE = os.path.join(os.path.dirname(__file__), '..', 'json', 'users.json')

def main():
    with open(USERS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print('=== Configuración de usuarios ===\n')
    for user in data['users']:
        print(f'Usuario: {user["username"]}')
        pw = getpass.getpass(f'  Nueva contraseña: ')
        if pw:
            salt = bcrypt.gensalt(rounds=12)
            user['password_hash'] = bcrypt.hashpw(pw.encode('utf-8'), salt).decode('utf-8')
            print('  ✓ Hash generado.\n')
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print('✓ users.json actualizado.')

if __name__ == '__main__':
    main()