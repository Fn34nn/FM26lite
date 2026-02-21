import { Team, Match, MatchEvent, MatchStats, Mentality } from '../types';

interface SimulationResult {
    events: MatchEvent[];
    stats: MatchStats;
}

// Rock Paper Scissors for Formations (Simulated tactical advantage)
const FORMATION_ADVANTAGE: Record<string, string[]> = {
    '4-3-3': ['4-4-2', '5-3-2'], // Overloads midfield
    '4-4-2': ['3-5-2', '4-2-3-1'], // Width exploits narrow formations
    '3-5-2': ['4-3-3', '5-3-2'], // Midfield numbers
    '5-3-2': ['4-2-3-1', '4-3-3'], // Defensive solidity vs attackers
    '4-2-3-1': ['4-4-2', '3-5-2'] // Space between lines
};

export const simulateMatchChunk = (
  match: Match, 
  home: Team, 
  away: Team, 
  minuteStart: number, 
  minuteEnd: number,
  homeMentality: Mentality = 'Balanced',
  awayMentality: Mentality = 'Balanced'
): SimulationResult => {
    const events: MatchEvent[] = [];
    const currentStats: MatchStats = { ...match.stats };

    // Initialize new stats if undefined (migration safety)
    if (currentStats.homeCorners === undefined) currentStats.homeCorners = 0;
    if (currentStats.awayCorners === undefined) currentStats.awayCorners = 0;
    if (currentStats.homeFouls === undefined) currentStats.homeFouls = 0;
    if (currentStats.awayFouls === undefined) currentStats.awayFouls = 0;

    // --- 1. TACTICAL SETUP & MODIFIERS ---
    
    const getMentalityMods = (m: Mentality) => {
        switch(m) {
            case 'Park the Bus': return { att: 0.2, def: 2.0, tempo: 0.3, xG: 0.3, aggro: 0.5 };
            case 'Defensive': return { att: 0.6, def: 1.5, tempo: 0.8, xG: 0.7, aggro: 0.8 };
            case 'Balanced': return { att: 1.0, def: 1.0, tempo: 1.0, xG: 1.0, aggro: 1.0 };
            case 'Attacking': return { att: 1.4, def: 0.8, tempo: 1.2, xG: 1.1, aggro: 1.2 };
            case 'All Out Attack': return { att: 1.8, def: 0.4, tempo: 1.5, xG: 1.3, aggro: 1.4 };
            default: return { att: 1.0, def: 1.0, tempo: 1.0, xG: 1.0, aggro: 1.0 };
        }
    }

    const hMentality = getMentalityMods(homeMentality);
    const aMentality = getMentalityMods(awayMentality);

    const getTeamStrength = (team: Team) => {
        const starters = team.players.slice(0, 11);
        const getEffectiveRating = (p: typeof starters[0]) => {
             const staminaFactor = p.stamina > 60 ? 1 : Math.max(0.4, p.stamina / 60); 
             return p.rating * staminaFactor;
        };

        let attRat = starters.filter(p => p.position === 'ATT' || p.position === 'MID').reduce((a,b) => a + getEffectiveRating(b), 0) / 7; 
        let midRat = starters.filter(p => p.position === 'MID').reduce((a,b) => a + getEffectiveRating(b), 0) / 3;
        let defRat = starters.filter(p => p.position === 'DEF' || p.position === 'GK').reduce((a,b) => a + getEffectiveRating(b), 0) / 5;
        
        // --- TACTICAL SUITABILITY (Massive Impact) ---
        let tacMult = 1.0;
        const t = team.tactics;
        
        // Synergies
        if (t.style === 'Tiki-Taka') {
            if (t.passingDirectness < 40) tacMult += 0.15; else tacMult -= 0.3;
            if (t.tempo < 60) tacMult += 0.1; else tacMult -= 0.1;
            if (t.width > 60) tacMult += 0.1;
        } else if (t.style === 'Gegenpress') {
            if (t.pressingIntensity > 70) tacMult += 0.15; else tacMult -= 0.4; // Gegenpress without pressing is suicide
            if (t.depth > 60) tacMult += 0.1; else tacMult -= 0.2;
            if (t.tempo > 60) tacMult += 0.1;
        } else if (t.style === 'Park the Bus') {
            if (t.depth < 40) tacMult += 0.15; else tacMult -= 0.5; // High line parking bus is fatal
            if (t.pressingIntensity < 40) tacMult += 0.1; else tacMult -= 0.2;
        } else if (t.style === 'Counter') {
            if (t.passingDirectness > 60) tacMult += 0.1; else tacMult -= 0.15;
            if (t.depth < 50) tacMult += 0.1;
            if (t.tempo > 60) tacMult += 0.1;
        }

        // Contradictions
        if (t.depth > 70 && t.pressingIntensity < 40) tacMult -= 0.4; // High line + no pressure = through balls all day
        if (t.depth < 30 && t.offsideTrap) tacMult -= 0.3; // Deep line with offside trap makes no sense
        if (t.passingDirectness > 80 && t.tempo < 30) tacMult -= 0.2; // Long balls but slow tempo?
        if (t.width > 80 && t.style === 'Park the Bus') tacMult -= 0.2; // Wide defense leaves gaps
        
        // Ensure bounds
        tacMult = Math.max(0.3, Math.min(1.8, tacMult));

        return { att: attRat * tacMult, mid: midRat * tacMult, def: defRat * tacMult, tacMult };
    };

    const hStr = getTeamStrength(home);
    const aStr = getTeamStrength(away);

    // --- 2. POSSESSION LOGIC ---
    let hPossFactor = hStr.mid * (home.tactics.tempo / 100 + 0.5) * 1.05; // Home adv
    let aPossFactor = aStr.mid * (away.tactics.tempo / 100 + 0.5);

    // Pressing Intensity impact
    hPossFactor *= (1 + (home.tactics.pressingIntensity - 50) / 200);
    aPossFactor *= (1 + (away.tactics.pressingIntensity - 50) / 200);

    // Passing Directness impact (more direct = less possession)
    hPossFactor *= (1 - (home.tactics.passingDirectness - 50) / 200);
    aPossFactor *= (1 - (away.tactics.passingDirectness - 50) / 200);

    if (FORMATION_ADVANTAGE[home.tactics.formation]?.includes(away.tactics.formation)) hPossFactor *= 1.1;
    if (FORMATION_ADVANTAGE[away.tactics.formation]?.includes(home.tactics.formation)) aPossFactor *= 1.1;

    // Mentality checks for possession
    if (homeMentality === 'Park the Bus') hPossFactor *= 0.6;
    if (awayMentality === 'Park the Bus') aPossFactor *= 0.6;

    const totalPossFactor = hPossFactor + aPossFactor;
    const targetHomePoss = (hPossFactor / totalPossFactor) * 100;

    // Smooth transition of possession
    currentStats.homePossession = currentStats.homePossession * 0.95 + targetHomePoss * 0.05;
    currentStats.awayPossession = 100 - currentStats.homePossession;


    // --- 3. SIMULATION LOOP (Per Minute) ---

    for (let m = minuteStart; m <= minuteEnd; m++) {
        
        const isHomePoss = Math.random() * 100 < currentStats.homePossession;
        const attTeam = isHomePoss ? home : away;
        const defTeam = isHomePoss ? away : home;
        const attStr = isHomePoss ? hStr : aStr;
        const defStr = isHomePoss ? aStr : hStr;
        const attMent = isHomePoss ? hMentality : aMentality;
        const defMent = isHomePoss ? aMentality : hMentality; 

        // Time Wasting impact
        const timeWastingFactor = (attTeam.tactics.timeWasting / 100);
        if (m > 70 && Math.random() < timeWastingFactor * 0.5) {
            // Time wasted, skip minute
            continue;
        }

        // --- CHANCE GENERATION (Boosted) ---
        // Base Chance: 0.14 (14% chance per minute) -> ~12 highlights per half -> ~24 per game total highlights
        let chanceThreshold = 0.14; 
        
        const strDiff = (attStr.att * attMent.att) - (defStr.def * defMent.def);
        chanceThreshold += (strDiff / 400); 

        // Creative Freedom impact
        chanceThreshold *= (1 + (attTeam.tactics.creativeFreedom - 50) / 200);

        // Passing Directness impact (more direct = slightly more chances but lower quality)
        chanceThreshold *= (1 + (attTeam.tactics.passingDirectness - 50) / 400);

        chanceThreshold *= attMent.att; 
        
        // ROLL FOR ACTION
        const actionRoll = Math.random();

        if (actionRoll < chanceThreshold) {
            // Offside Trap Check
            if (defTeam.tactics.offsideTrap && Math.random() < 0.3) {
                // Offside trap successful
                const attacker = attTeam.players.filter(p => p.position === 'ATT' || p.position === 'MID')[Math.floor(Math.random() * 6)] || attTeam.players[0];
                events.push({
                    minute: m,
                    type: 'miss',
                    teamId: attTeam.id,
                    description: `${attacker.name} is caught offside by the trap.`
                });
                continue;
            }

            // --- ATTACKING EVENT ---
            if (isHomePoss) currentStats.homeShots++; else currentStats.awayShots++;
            
            // xG Calculation
            let xG = (Math.random() * 0.25 + 0.02) * attMent.xG; 
            
            // Passing Directness impact on xG (more direct = lower xG per shot)
            xG *= (1 - (attTeam.tactics.passingDirectness - 50) / 400);
            
            // Offside Trap Failure (Big Chance)
            if (defTeam.tactics.offsideTrap && Math.random() < 0.1) {
                xG += 0.3; // Big boost if trap fails
                events.push({
                    minute: m,
                    type: 'big_chance',
                    teamId: attTeam.id,
                    description: `The offside trap fails! ${attTeam.shortName} is through on goal!`
                });
            }
            if (isHomePoss) currentStats.homeXG += xG; else currentStats.awayXG += xG;

            // ON TARGET? (35% base)
            const accuracy = 0.35 + ((attStr.att - defStr.def) / 300); 
            
            if (Math.random() < accuracy) {
                // ON TARGET
                if (isHomePoss) currentStats.homeOnTarget++; else currentStats.awayOnTarget++;
                
                const gk = defTeam.players.find(p => p.position === 'GK') || defTeam.players[0];
                const gkSaveChance = (gk.rating / 100) * 0.85; 
                
                // Goal Probability
                const goalProb = xG * (1.1 - gkSaveChance); 
                
                if (Math.random() < goalProb) {
                    // GOAL
                    if (isHomePoss) currentStats.homeScore++; else currentStats.awayScore++;
                    
                    const scorer = attTeam.players.filter(p => p.position === 'ATT' || p.position === 'MID')[Math.floor(Math.random() * 6)] || attTeam.players[0];
                    events.push({
                        minute: m,
                        type: 'goal',
                        teamId: attTeam.id,
                        playerId: scorer.id,
                        description: `${scorer.name} scores! (xG: ${xG.toFixed(2)})`
                    });
                } else {
                    // SAVE or CORNER
                    if (Math.random() > 0.6) {
                         // Corner
                         if(isHomePoss) currentStats.homeCorners++; else currentStats.awayCorners++;
                         const attacker = attTeam.players.filter(p => p.position === 'ATT' || p.position === 'MID')[Math.floor(Math.random() * 6)] || attTeam.players[0];
                         events.push({
                            minute: m,
                            type: 'corner',
                            teamId: attTeam.id,
                            description: `Corner kick won by ${attacker.name} after a save.`
                        });
                    } else if (Math.random() > 0.9) {
                        // Only log some saves
                        events.push({
                            minute: m,
                            type: 'save',
                            teamId: defTeam.id,
                            description: `${gk.name} makes a brilliant save!`
                        });
                    }
                }
            } else {
                // OFF TARGET
                if (xG > 0.25) {
                     const shooter = attTeam.players.filter(p => p.position === 'ATT' || p.position === 'MID')[Math.floor(Math.random() * 6)] || attTeam.players[0];
                     events.push({
                        minute: m,
                        type: 'miss',
                        teamId: attTeam.id,
                        description: `${shooter.name} shoots wide from a great position!`
                    });
                }
            }
        } else if (actionRoll > 0.95) {
            // --- FOULS / CARDS ---
            let foulChance = 0.3 * (defMent.aggro);
            
            // Tackling impact
            if (defTeam.tactics.tackling === 'Get Stuck In') foulChance *= 1.5;
            if (defTeam.tactics.tackling === 'Stay on Feet') foulChance *= 0.5;

            if (Math.random() < foulChance) {
                if (isHomePoss) currentStats.awayFouls++; else currentStats.homeFouls++;
                
                const cardRoll = Math.random();
                if (cardRoll > 0.85) {
                    const type = cardRoll > 0.98 ? 'card_red' : 'card_yellow';
                    if (type === 'card_yellow') {
                         if(isHomePoss) currentStats.awayYellows++; else currentStats.homeYellows++;
                    } else {
                         if(isHomePoss) currentStats.awayReds++; else currentStats.homeReds++;
                    }

                    const offender = defTeam.players[Math.floor(Math.random()*11)];
                    events.push({
                        minute: m,
                        type: type,
                        teamId: defTeam.id,
                        playerId: offender.id,
                        description: type === 'card_red' ? `RED CARD! ${offender.name} is sent off!` : `Yellow card for ${offender.name}`
                    });
                }
            }
        }
        
        // INJURY CHECK (Very rare)
        if (Math.random() < 0.0003) {
             const injuredPlayer = attTeam.players[Math.floor(Math.random() * 11)];
             events.push({
                 minute: m,
                 type: 'injury',
                 teamId: attTeam.id,
                 playerId: injuredPlayer.id,
                 description: `${injuredPlayer.name} is injured!`
             });
        }
    }

    return { events, stats: currentStats };
};

export const quickSimulateMatch = (match: Match, home: Team, away: Team): Match => {
    const result = simulateMatchChunk(match, home, away, 0, 90, 'Balanced', 'Balanced');
    return {
        ...match,
        played: true,
        result: { homeScore: result.stats.homeScore, awayScore: result.stats.awayScore },
        events: result.events,
        stats: result.stats
    };
};