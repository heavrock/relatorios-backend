// --- Importações ---
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

// --- Configuração ---
const app = express();
const PORT = 3001;

// --- CORREÇÃO DE CORS ---
// Configuração mais permissiva para aceitar pedidos de qualquer origem.
// Isto é seguro para o desenvolvimento local.
app.use(cors());
// --- FIM DA CORREÇÃO ---

app.use(express.json());

const serviceAccount = require('./serviceAccountKey.json');

// --- Inicialização do Firebase ---
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
console.log('Ligação com o Firestore estabelecida com sucesso!');


// --- Rotas da API (Endpoints) ---

// Rota de teste
app.get('/', (req, res) => {
  res.send('API de Relatórios Técnicos está online!');
});

// ROTA PARA CRIAR UM NOVO RELATÓRIO (Create)
app.post('/api/reports', async (req, res) => {
  try {
    const reportData = req.body;
    console.log('A receber dados para um novo relatório:', reportData.header.equipamento);
    const docRef = await db.collection('reports').add(reportData);
    res.status(201).send({ id: docRef.id });
  } catch (error) {
    console.error('Erro ao criar o relatório:', error);
    res.status(500).send('Erro no servidor ao criar o relatório.');
  }
});

// ROTA PARA OBTER TODOS OS RELATÓRIOS (Read)
app.get('/api/reports', async (req, res) => {
    try {
        const reportsSnapshot = await db.collection('reports').get();
        const reports = [];
        reportsSnapshot.forEach((doc) => {
            reports.push({
                id: doc.id,
                ...doc.data()
            });
        });
        res.status(200).json(reports);
    } catch (error) {
        console.error('Erro ao obter relatórios:', error);
        res.status(500).send('Erro no servidor ao obter os relatórios.');
    }
});

// ROTA PARA ATUALIZAR UM RELATÓRIO (Update)
app.put('/api/reports/:id', async (req, res) => {
    try {
        const reportId = req.params.id;
        const reportData = req.body;
        await db.collection('reports').doc(reportId).update(reportData);
        console.log(`Relatório com ID: ${reportId} foi atualizado.`);
        res.status(200).send({ message: 'Relatório atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar o relatório:', error);
        res.status(500).send('Erro no servidor ao atualizar o relatório.');
    }
});

// ROTA PARA APAGAR UM RELATÓRIO (Delete)
app.delete('/api/reports/:id', async (req, res) => {
    try {
        const reportId = req.params.id;
        await db.collection('reports').doc(reportId).delete();
        console.log(`Relatório com ID: ${reportId} foi apagado.`);
        res.status(200).send({ message: 'Relatório apagado com sucesso!' });
    } catch (error) {
        console.error('Erro ao apagar o relatório:', error);
        res.status(500).send('Erro no servidor ao apagar o relatório.');
    }
});


// --- Iniciar o Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});
