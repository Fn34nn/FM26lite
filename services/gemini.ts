import { GoogleGenAI } from "@google/genai";
import { Team, Player } from '../types';

let ai: GoogleGenAI | null = null;

if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const getTacticalAdvice = async (myTeam: Team, opponent: Team): Promise<string> => {
    if (!ai) return "Tactical Analysis unavailable. Connect API Key.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `
                I am managing ${myTeam.name} in the Eredivisie.
                Our ratings - ATT: ${myTeam.rating.attack}, MID: ${myTeam.rating.midfield}, DEF: ${myTeam.rating.defense}.
                Our Formation: ${myTeam.tactics.formation}.
                
                We are playing against ${opponent.name}.
                Their ratings - ATT: ${opponent.rating.attack}, MID: ${opponent.rating.midfield}, DEF: ${opponent.rating.defense}.
                
                Give me 3 short, punchy tactical bullet points to win this match. Focus on their weaknesses.
                Format as plain text bullet points.
            `,
        });
        return response.text || "Play your game and focus.";
    } catch (e) {
        console.error("Gemini Error", e);
        return "Assistant Manager is currently unavailable.";
    }
};

export const getScoutReport = async (player: Player): Promise<string> => {
    if (!ai) return "Scouting network offline.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `
                Give me a fictional but realistic scout report for a player named ${player.name}, 
                Position: ${player.position}, Rating: ${player.rating}/100, Age: ${player.age}.
                Keep it to 2 sentences max. Mention a strength and a weakness.
            `,
        });
        return response.text || "Standard player. Good fundamentals.";
    } catch (e) {
        return "Scouting report failed.";
    }
};