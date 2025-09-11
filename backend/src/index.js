import express from 'express';
import cors from 'cors';
import router from './routes.js';

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota raiz
app.get('/', (req, res) => {
    res.send('API rodando normalmente')
})

// Rotas Principais
app.use('/api', router);

// Iniciar Servidor
app.listen(PORT, () => {
    console.log(`Rodando em http://localhost:${PORT}`)
})
