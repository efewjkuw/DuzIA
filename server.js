// server.js (corrigido com gírias e personalidades)

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error("ERRO CRÍTICO: GEMINI_API_KEY não encontrada!");
    process.exit(1);
}

const app = express();
const PORT = 3000;

// Aumenta o limite do corpo da requisição para aceitar imagens em base64
app.use(express.json({ limit: '10mb' }));
app.use(cors());

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.post('/api/chat', async (req, res) => {
    try {
        const { message, fileData, personality } = req.body;

        if (!message && !fileData) {
            return res.status(400).json({ error: 'Nenhuma mensagem ou arquivo foi enviado.' });
        }

        // --- PERSONALIDADE DINÂMICA ---
        let estilo = "";
        switch (personality) {
            case "feliz":
                estilo = "Responda sempre com muita empolgação, emojis 😁✨ e bom humor.";
                break;
            case "raiva":
                estilo = "Responda de forma irritada, mas engraçada, como se tivesse estressado.";
                break;
            case "sarcástica":
                estilo = "Responda de forma irônica e debochada, usando sarcasmo baiano.";
                break;
            case "chata":
                estilo = "Responda de forma pedante, corrigindo e explicando tudo de forma chata.";
                break;
            default:
                estilo = "Responda de forma amigável e simpática.";
        }

        // --- INSTRUÇÃO BASE ---
        const baseInstruction = `
        Você é DuzAi, um assistente virtual da Bahia.
        Sempre responda em português brasileiro, usando gírias e expressões baianas como “oxe”, “meu rei”, “massa”, “arretado”.
        Nunca fale inglês, mesmo que o usuário pergunte.
        ${estilo}
        `;

        // Inicia o chat com instrução de sistema correta
        const chat = model.startChat({
            systemInstruction: { text: baseInstruction }
        });

        // --- LÓGICA MULTIMODAL ---
        // Força instrução dentro da mensagem para garantir PT-BR + gírias
        const messageParts = [
            { text: baseInstruction + "\nUsuário disse: " + (message || "") }
        ];

        if (fileData && fileData.data) {
            messageParts.push({
                inlineData: {
                    mimeType: fileData.type,
                    data: fileData.data
                }
            });
}
        // Envia a mensagem para a API
        const result = await chat.sendMessage(messageParts);
        const responseText = await result.response.text();

        res.json({ reply: responseText });

    } catch (error) {
        console.error("   - ERRO ao comunicar com a API do Gemini:", error.message);
        res.status(500).json({ error: "Oxe, véi, deu um piripaque aqui. Tenta de novo aí, meu rei." });
    }
});

app.listen(PORT, () => {
    console.log(`✨ Servidor DuzAi rodando com sucesso na porta http://localhost:${PORT}`);
});
