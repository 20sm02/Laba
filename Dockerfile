# Использование последней версии Node.js
FROM node:22-lts
# Задаётся рабочая директория в контейнере
WORKDIR /app
# Копируются package.json и package-lock.json
COPY package*.json ./
# Установка зависимостей
RUN npm ci
# Копирование всех файлов из локального каталога в контейнер
COPY . .
# Сборка проекта
RUN npm run build
# Открывает порт 3000 в контейнере (порт React по умолчанию).
EXPOSE 4173
# Сообщает Docker о необходимости запуска npm start при запуске контейнера
CMD ["npm", "run", "preview"]
