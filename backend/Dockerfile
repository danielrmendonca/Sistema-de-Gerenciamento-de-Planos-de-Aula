# ----------IMAGEM DO BACKEND----------
# node:20-alpine: imagem oficial e leve do Node 20, mesma versao usada na CI
FROM node:20-alpine

WORKDIR /app

# Copia package.json e package-lock.json primeiro para aproveitar o cache do Docker:
# se eles nao mudarem, o npm ci nao roda de novo a cada rebuild
COPY package*.json ./

# npm ci e mais rapido e determinista que npm install,
# omit=dev exclui nodemon, jest e ferramentas de lint da imagem de producao
RUN npm ci --omit=dev

# Copia o restante do codigo apos as deps para que mudancas no codigo nao invalidem o cache do npm
COPY . .

EXPOSE 3000

# node direto, sem nodemon, pois nao queremos hot reload em producao
CMD ["node", "src/index.js"]
