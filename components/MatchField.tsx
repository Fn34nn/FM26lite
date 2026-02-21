import React, { useEffect, useRef, useState } from 'react';
import { Team, MatchEvent } from '../types';

interface MatchFieldProps {
  homeTeam: Team;
  awayTeam: Team;
  currentMinute: number;
  lastEvent?: MatchEvent;
  isHomePossession: boolean;
}

// Full horizontal pitch coordinates (0-100 x, 0-100 y)
const FORMATION_COORDS: Record<string, { x: number, y: number }[]> = {
    '4-3-3': [
      { x: 5, y: 50 }, // GK
      { x: 20, y: 15 }, { x: 20, y: 38 }, { x: 20, y: 62 }, { x: 20, y: 85 }, // DEF
      { x: 40, y: 50 }, { x: 50, y: 30 }, { x: 50, y: 70 }, // MID
      { x: 75, y: 15 }, { x: 80, y: 50 }, { x: 75, y: 85 }  // ATT
    ],
    '4-4-2': [
      { x: 5, y: 50 },
      { x: 20, y: 15 }, { x: 20, y: 38 }, { x: 20, y: 62 }, { x: 20, y: 85 },
      { x: 45, y: 15 }, { x: 45, y: 38 }, { x: 45, y: 62 }, { x: 45, y: 85 },
      { x: 80, y: 35 }, { x: 80, y: 65 }
    ],
    '4-2-3-1': [
      { x: 5, y: 50 },
      { x: 20, y: 15 }, { x: 20, y: 38 }, { x: 20, y: 62 }, { x: 20, y: 85 },
      { x: 35, y: 35 }, { x: 35, y: 65 },
      { x: 60, y: 15 }, { x: 60, y: 50 }, { x: 60, y: 85 },
      { x: 80, y: 50 }
    ],
    '3-5-2': [
      { x: 5, y: 50 },
      { x: 20, y: 25 }, { x: 20, y: 50 }, { x: 20, y: 75 },
      { x: 40, y: 10 }, { x: 40, y: 90 }, { x: 45, y: 30 }, { x: 45, y: 70 }, { x: 50, y: 50 },
      { x: 75, y: 35 }, { x: 75, y: 65 }
    ],
    '5-3-2': [
      { x: 5, y: 50 },
      { x: 20, y: 10 }, { x: 20, y: 30 }, { x: 20, y: 50 }, { x: 20, y: 70 }, { x: 20, y: 90 },
      { x: 45, y: 30 }, { x: 45, y: 50 }, { x: 45, y: 70 },
      { x: 75, y: 35 }, { x: 75, y: 65 }
    ],
    '3-4-3': [
      { x: 5, y: 50 },
      { x: 20, y: 25 }, { x: 20, y: 50 }, { x: 20, y: 75 },
      { x: 45, y: 15 }, { x: 45, y: 38 }, { x: 45, y: 62 }, { x: 45, y: 85 },
      { x: 75, y: 15 }, { x: 80, y: 50 }, { x: 75, y: 85 }
    ],
    '4-1-4-1': [
      { x: 5, y: 50 },
      { x: 20, y: 15 }, { x: 20, y: 38 }, { x: 20, y: 62 }, { x: 20, y: 85 },
      { x: 35, y: 50 },
      { x: 55, y: 15 }, { x: 55, y: 38 }, { x: 55, y: 62 }, { x: 55, y: 85 },
      { x: 80, y: 50 }
    ],
    '4-1-2-1-2': [
      { x: 5, y: 50 },
      { x: 20, y: 15 }, { x: 20, y: 38 }, { x: 20, y: 62 }, { x: 20, y: 85 },
      { x: 35, y: 50 },
      { x: 50, y: 25 }, { x: 50, y: 75 },
      { x: 65, y: 50 },
      { x: 80, y: 35 }, { x: 80, y: 65 }
    ]
};

// Types for internal animation state
type Entity = {
    id: string;
    team: 'home' | 'away';
    role: string;
    // We store visual state in a separate mutable ref map
};

// Mutable state for the game loop
type EntityState = {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
};

type BallState = {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    ownerId: string | null;
    state: 'carry' | 'pass' | 'shot';
    progress: number;
};

export const MatchField: React.FC<MatchFieldProps> = ({ homeTeam, awayTeam, currentMinute, lastEvent, isHomePossession }) => {
    // State to ensure React renders the DIVs
    const [entities, setEntities] = useState<Entity[]>([]);

    // Refs for direct DOM manipulation and game loop state
    const entityStates = useRef<Map<string, EntityState>>(new Map());
    const ballState = useRef<BallState>({ x: 50, y: 50, targetX: 50, targetY: 50, ownerId: null, state: 'carry', progress: 0 });
    const domRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const ballDomRef = useRef<HTMLDivElement | null>(null);
    
    const requestRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    // 1. Initialization: Create Entities when teams change
    useEffect(() => {
        const newEntities: Entity[] = [];
        
        const initTeam = (team: Team, side: 'home'|'away') => {
            team.players.slice(0, 11).forEach((p, i) => {
                newEntities.push({ id: p.id, team: side, role: p.position });
                
                // Initialize state if not exists
                if (!entityStates.current.has(p.id)) {
                    entityStates.current.set(p.id, {
                        x: side === 'home' ? 10 + i * 5 : 90 - i * 5,
                        y: 50,
                        targetX: side === 'home' ? 10 + i * 5 : 90 - i * 5,
                        targetY: 50
                    });
                }
            });
        };

        initTeam(homeTeam, 'home');
        initTeam(awayTeam, 'away');
        setEntities(newEntities);
    }, [homeTeam.id, awayTeam.id]);

    // 2. Logic Update: Calculate Targets based on Minute/Tactics
    useEffect(() => {
        const getBaseCoords = (formation: string) => FORMATION_COORDS[formation] || FORMATION_COORDS['4-3-3'];

        const updateTargets = (team: Team, side: 'home' | 'away', hasBall: boolean) => {
            const coords = getBaseCoords(team.tactics.formation);
            const depthMod = (team.tactics.depth - 50) / 100; 
            const widthMod = team.tactics.width / 50; 

            let phaseOffset = 0;
            if (hasBall) phaseOffset = 15; // Push up
            else phaseOffset = -10; // Drop back

            // We iterate the first 11 players of the team
            team.players.slice(0, 11).forEach((p, i) => {
                const state = entityStates.current.get(p.id);
                if (!state || !coords[i]) return;

                let { x, y } = coords[i];

                if (i > 0) { // Keep GK mostly relative
                    x += (x * depthMod * (side === 'home' ? 1 : -1));
                    y = 50 + (y - 50) * widthMod;
                }

                if (side === 'away') {
                    x = 100 - x;
                    y = 100 - y;
                }

                if (side === 'home') x += phaseOffset;
                else x -= phaseOffset;

                // Add randomness so they don't look like robots
                state.targetX = Math.max(2, Math.min(98, x + (Math.random() * 4 - 2)));
                state.targetY = Math.max(2, Math.min(98, y + (Math.random() * 4 - 2)));
            });
        };

        updateTargets(homeTeam, 'home', isHomePossession);
        updateTargets(awayTeam, 'away', !isHomePossession);

    }, [currentMinute, isHomePossession, homeTeam.tactics, awayTeam.tactics]);

    // 3. Ball Logic
    useEffect(() => {
        const ball = ballState.current;
        
        // Event Handling
        if (lastEvent && lastEvent.minute === currentMinute) {
             const isHomeEvent = lastEvent.teamId === homeTeam.id;
             if (['goal', 'miss', 'save', 'big_chance'].includes(lastEvent.type)) {
                 ball.state = 'shot';
                 ball.ownerId = null;
                 ball.targetX = isHomeEvent ? 100 : 0; 
                 ball.targetY = 50 + (Math.random() * 10 - 5);
                 ball.progress = 0;
                 return;
             }
        }

        // Passing Logic
        const possessingTeam = isHomePossession ? 'home' : 'away';
        // Find entities belonging to possessing team
        const teamIds = entities.filter(e => e.team === possessingTeam).map(e => e.id);
        
        if (!ball.ownerId || !teamIds.includes(ball.ownerId)) {
            // Give to random player if lost
            if (teamIds.length > 0) {
                ball.ownerId = teamIds[Math.floor(Math.random() * teamIds.length)];
                ball.state = 'carry';
            }
        } 
        else if (Math.random() < 0.2) { // Pass chance
            const otherIds = teamIds.filter(id => id !== ball.ownerId);
            if (otherIds.length > 0) {
                const receiverId = otherIds[Math.floor(Math.random() * otherIds.length)];
                const receiverState = entityStates.current.get(receiverId);
                
                if (receiverState) {
                    ball.state = 'pass';
                    ball.targetX = receiverState.targetX;
                    ball.targetY = receiverState.targetY;
                    ball.ownerId = receiverId;
                    ball.progress = 0;
                }
            }
        }

    }, [currentMinute, lastEvent, isHomePossession, entities]);

    // 4. Animation Loop
    const animate = (time: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        // const deltaTime = time - lastTimeRef.current;

        // Animate Players
        entityStates.current.forEach((state, id) => {
            const el = domRefs.current.get(id);
            if (el) {
                // Drifting noise
                const driftX = Math.sin(time / 1000 + Number(id.charCodeAt(0))) * 0.2;
                const driftY = Math.cos(time / 800 + Number(id.charCodeAt(0))) * 0.2;

                // Move towards target
                const dx = (state.targetX + driftX) - state.x;
                const dy = (state.targetY + driftY) - state.y;
                
                const dist = Math.sqrt(dx*dx + dy*dy);
                const speed = dist > 15 ? 0.08 : 0.03; // Sprint vs Jog

                state.x += dx * speed;
                state.y += dy * speed;

                el.style.left = `${state.x}%`;
                el.style.top = `${state.y}%`;
            }
        });

        // Animate Ball
        const ball = ballState.current;
        if (ballDomRef.current) {
            if (ball.state === 'carry') {
                const ownerState = ball.ownerId ? entityStates.current.get(ball.ownerId) : null;
                if (ownerState) {
                    ball.x = ownerState.x + 1.5;
                    ball.y = ownerState.y + 1.5;
                }
            } else if (ball.state === 'pass' || ball.state === 'shot') {
                ball.progress += 0.06; // Ball speed
                if (ball.progress >= 1) {
                    ball.progress = 1;
                    ball.x = ball.targetX;
                    ball.y = ball.targetY;
                    if (ball.state === 'pass') ball.state = 'carry';
                } else {
                    // Simple Lerp
                    ball.x = ball.x + (ball.targetX - ball.x) * 0.15;
                    ball.y = ball.y + (ball.targetY - ball.y) * 0.15;
                }
            }
            ballDomRef.current.style.left = `${ball.x}%`;
            ballDomRef.current.style.top = `${ball.y}%`;
        }

        lastTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    return (
        <div className="relative w-full aspect-[16/9] bg-emerald-700/80 rounded-xl border-2 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)] overflow-hidden">
            {/* Field Markings */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_10%,rgba(0,0,0,0.1)_10%,rgba(0,0,0,0.1)_20%)] pointer-events-none"></div>
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/20"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[15%] aspect-square border-2 border-white/20 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/40 rounded-full"></div>
            
            {/* Goals */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1 h-[15%] bg-white/40"></div>
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1 h-[15%] bg-white/40"></div>

            {/* Boxes */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[15%] h-[40%] border-r-2 border-y-2 border-white/20"></div>
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[15%] h-[40%] border-l-2 border-y-2 border-white/20"></div>

            {/* Render Players */}
            {entities.map(p => (
                <div
                    key={p.id}
                    ref={el => { if (el) domRefs.current.set(p.id, el); }}
                    className={`absolute w-3 h-3 md:w-4 md:h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-sm z-10 will-change-[left,top] ${
                        p.team === 'home' 
                            ? 'bg-red-500 border-red-200' 
                            : 'bg-blue-500 border-blue-200'
                    }`}
                >
                    {/* Role Indicator */}
                    {/* <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white/70 opacity-50">{p.role}</div> */}
                </div>
            ))}

            {/* Render Ball */}
            <div 
                ref={ballDomRef}
                className="absolute w-2 h-2 md:w-2.5 md:h-2.5 bg-yellow-300 rounded-full shadow-[0_0_10px_rgba(253,224,71,0.8)] z-20 -translate-x-1/2 -translate-y-1/2 will-change-[left,top]"
            ></div>

            {/* Overlay Info */}
            <div className="absolute bottom-2 left-3 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                {homeTeam.shortName} ({homeTeam.tactics.formation}) vs {awayTeam.shortName} ({awayTeam.tactics.formation})
            </div>
            {isHomePossession ? (
                <div className="absolute top-2 left-3 text-[10px] font-bold text-red-400 uppercase animate-pulse">Attacking</div>
            ) : (
                <div className="absolute top-2 right-3 text-[10px] font-bold text-blue-400 uppercase animate-pulse">Attacking</div>
            )}
        </div>
    );
};
