import express from 'express';
import cors from 'cors';
import router from './routes';

const app = express();
const port = process.env.PORT || 3001;

// Aumentar límites
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configurar CORS
app.use(cors());

// Configurar timeout global
app.use((req, res, next) => {
    res.setTimeout(300000, () => {
        console.log('Request has timed out.');
        res.status(408).json({ error: 'Request timeout' });
    });
    next();
});

// Rutas
app.use('/', router);

// Manejador de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        details: err.message
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export default app;