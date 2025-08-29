# Развёртывание статического сайта на VPS

Ниже — два варианта: через Docker+Nginx или через Docker+Caddy (авто-HTTPS на домене).

## Вариант A: Docker + Nginx

1) Установить Docker и docker-compose:

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo $ID)/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$(. /etc/os-release; echo $ID) \
  $(. /etc/os-release; echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

2) Скопировать проект на сервер (git clone или rsync/ssh). Перейти в директорию проекта и запустить:

```bash
docker compose up -d --build
```

3) Открыть в браузере: `http://SERVER_IP:8080`.

- Порты настраиваются в `docker-compose.yml` (8080:80). Если нужен 80 порт на хосте, поменяйте на `"80:80"` и откройте firewall.

## Вариант B: Docker + Caddy (с доменом и HTTPS)

Требования: ваш домен указывает A/AAAA запись на IP вашего VPS.

1) Установить Docker/Compose (как в варианте A).

2) Отредактировать `Caddyfile`: заменить `example.com` на ваш домен и email в глобальном блоке.

3) Собрать и запустить контейнер с Caddy:

```bash
docker build -f Dockerfile.caddy -t password-generator-caddy .
docker run -d --name password-generator-caddy \
  -p 80:80 -p 443:443 \
  password-generator-caddy
```

4) Перейдите на `https://ваш-домен`. Caddy автоматически выпустит сертификат Let's Encrypt.

## Обновления и перезапуск

- Обновить после изменения файлов:
```bash
docker compose build --no-cache && docker compose up -d
```
- или для Caddy-образа:
```bash
docker build -f Dockerfile.caddy -t password-generator-caddy .
docker rm -f password-generator-caddy
docker run -d --name password-generator-caddy -p 80:80 -p 443:443 password-generator-caddy
```

## Systemd unit (по желанию)

Пример для варианта A:

```ini
[Unit]
Description=Password Generator Web (Docker Compose)
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
WorkingDirectory=/opt/password-generator
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
RemainAfterExit=yes
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Скопируйте проект в `/opt/password-generator`, сохраните юнит как `/etc/systemd/system/password-generator.service`, затем:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now password-generator.service
```

## Твики безопасности

- Запуск от непривилегированного пользователя Docker (по умолчанию ок для статического сайта).
- Для Nginx: заголовки безопасности можно добавить в `nginx.conf` (Content-Security-Policy и т.п.).
- Для Caddy: заголовки безопасности можно добавить через директиву `header`.

## Troubleshooting

- Проверить логи: `docker logs password-generator-web` или `docker logs password-generator-caddy`.
- Проверить, что порты открыты в firewall/SG: `sudo ufw allow 80,443/tcp` или `sudo ufw allow 8080/tcp`.
- Убедитесь, что DNS A/AAAA записи указывают на верный IP VPS.