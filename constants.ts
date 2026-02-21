import { Team, Player, Match } from './types';

// Real Squad Data (Approximate 2024/25 rosters)
const REAL_SQUADS: Record<string, string[]> = {
  'Ajax': ['Ramaj', 'Rensch', 'Hato', 'Sutalo', 'Gaei', 'Henderson', 'Taylor', 'Hlynsson', 'Bergwijn', 'Brobbey', 'Berghuis', 'Pasveer', 'Kaplan', 'Tahirovic', 'Godts', 'Mannsverk', 'Rijkhoff', 'Medic', 'Gaaei', 'Vos'],
  'PSV': ['Benitez', 'Teze', 'Boscagli', 'Ramalho', 'Dest', 'Schouten', 'Veerman', 'Til', 'Bakayoko', 'de Jong', 'Lozano', 'Drommel', 'Obispo', 'Mauro Jr', 'Saibari', 'Tillman', 'Pepi', 'Babadi', 'Land', 'Waterman'],
  'Feyenoord': ['Wellenreuther', 'Geertruida', 'Beelen', 'Hancko', 'Hartman', 'Wieffer', 'Timber', 'Stengs', 'Paixao', 'Gimenez', 'Ivanusec', 'Bijlow', 'Trauner', 'Nieuwkoop', 'Zerrouki', 'Milambo', 'Ueda', 'Lingr', 'Sauer', 'Minteh'],
  'AZ': ['Ryan', 'Sugawara', 'Goes', 'Bazoer', 'Wolfe', 'Clasie', 'Belic', 'Mijnans', 'Addai', 'Pavlidis', 'van Brederode', 'Verhulst', 'Penetra', 'Martins Indi', 'Dantas', 'de Wit', 'Lahdo', 'Pokuu', 'Sadiq', 'Zeefuik'],
  'FC Twente': ['Unnerstall', 'Sampsted', 'Hilgers', 'Propper', 'Smal', 'Kjolo', 'Sadilek', 'Steijn', 'Rots', 'van Wolfswinkel', 'Vlap', 'Tyton', 'Bruns', 'Regeer', 'Eiting', 'Boadu', 'Unuvar', 'Van Bergen', 'Taha', 'Besselink'],
  'FC Utrecht': ['Barkas', 'Ter Avest', 'van der Hoorn', 'Viergever', 'El Karouani', 'Flamingo', 'Fraulo', 'Toornstra', 'Booth', 'Lammers', 'Boussaid', 'Branderhorst', 'Vesterlund', 'Jensen', 'Iqbal', 'Lidberg', 'Azarkan', 'Okkmans', 'Blake', 'Ramselaar'],
  'Sparta': ['Olij', 'Bakari', 'Vriends', 'Velthuis', 'van der Kust', 'Clement', 'Kitolano', 'Verschueren', 'Mito', 'Lauritsen', 'Saito', 'de Schoep', 'Meissen', 'Warmerdam', 'de Guzman', 'Neghli', 'Brym', 'Rosanas', 'Eerdhuijzen'],
  'NEC': ['Cillessen', 'van Rooij', 'Sandler', 'Nuytinck', 'Verdonk', 'Hoedemakers', 'Proper', 'Chery', 'Gonzalez', 'Ogawa', 'Sano', 'Roefs', 'Pereira', 'Ross', 'Schone', 'Hansen', 'Sow', 'Baas', 'Olden Larsen'],
  'Heerenveen': ['Noppert', 'Braude', 'van Beek', 'Bochniewicz', 'Kohlert', 'Hay', 'Olsson', 'Brouwer', 'Walemark', 'van Amersfoort', 'Sahraoui', 'Mous', 'Hall', 'Nunumete', 'Tahiri', 'Webster', 'Nicolasecu', 'Wouters', 'Karlsbakk'],
  // Generic pools for others to ensure valid names
};

const POSITIONS_POOL = ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'ATT', 'ATT', 'ATT', 'GK', 'DEF', 'DEF', 'MID', 'MID', 'ATT', 'ATT', 'DEF', 'MID'];

// Helper to generate players
const generateSquad = (teamName: string, baseRating: number): Player[] => {
  const realNames = REAL_SQUADS[teamName];
  
  return POSITIONS_POOL.map((pos, i) => {
    let name = `${teamName} ${pos} ${i + 1}`;
    if (realNames && realNames[i]) {
      name = realNames[i];
    }

    // Rating logic: Starters (0-10) get better ratings than bench
    const isStarter = i < 11;
    const ratingVariance = isStarter ? Math.random() * 5 : Math.random() * 10 - 5;
    const finalRating = Math.floor(baseRating + ratingVariance - (isStarter ? 0 : 5));

    return {
      id: `${teamName.substring(0, 3).replace(/\s/g, '')}-${i}`,
      name,
      position: pos as any,
      rating: Math.max(50, Math.min(99, finalRating)),
      age: Math.floor(18 + Math.random() * 15),
      value: Math.floor(baseRating * 0.5 * (Math.random() + 0.5)),
      wage: Math.floor(baseRating * 500),
      form: [Math.floor(Math.random() * 5) + 5, Math.floor(Math.random() * 5) + 5, 7, 6, 8],
      goals: 0,
      assists: 0,
      stamina: 100,
      isInjured: false
    };
  });
};

const TEAMS_DATA = [
  { 
    name: 'Ajax', 
    short: 'AJA', 
    colors: ['#D2122E', '#FFFFFF'], 
    logo: 'https://tmssl.akamaized.net/images/wappen/head/610.png',
    rating: 82, 
    budget: 35 
  },
  { 
    name: 'PSV', 
    short: 'PSV', 
    colors: ['#FF0000', '#FFFFFF'], 
    logo: 'https://tmssl.akamaized.net/images/wappen/head/383.png',
    rating: 85, 
    budget: 40 
  },
  { 
    name: 'Feyenoord', 
    short: 'FEY', 
    colors: ['#FF0000', '#000000'], 
    logo: 'https://tmssl.akamaized.net/images/wappen/head/234.png',
    rating: 84, 
    budget: 30 
  },
  { 
    name: 'AZ', 
    short: 'AZ', 
    colors: ['#DD0000', '#FFFFFF'], 
    logo: 'https://tmssl.akamaized.net/images/wappen/head/1090.png',
    rating: 78, 
    budget: 15 
  },
  { 
    name: 'FC Twente', 
    short: 'TWE', 
    colors: ['#DD0000', '#D41212'], 
    logo: 'https://tmssl.akamaized.net/images/wappen/head/322.png',
    rating: 77, 
    budget: 12 
  },
  { 
    name: 'FC Utrecht', 
    short: 'UTR', 
    colors: ['#E30613', '#FFFFFF'], 
    logo: 'https://tmssl.akamaized.net/images/wappen/head/200.png',
    rating: 74, 
    budget: 8 
  },
  { 
    name: 'Sparta', 
    short: 'SPA', 
    colors: ['#FFFFFF', '#FF0000'], 
    logo: 'https://tmssl.akamaized.net/images/wappen/head/468.png',
    rating: 71, 
    budget: 5 
  },
  { 
    name: 'NEC', 
    short: 'NEC', 
    colors: ['#E71419', '#036536'], 
    logo: 'https://tmssl.akamaized.net/images/wappen/head/467.png',
    rating: 70, 
    budget: 4 
  },
  { 
    name: 'Heerenveen', 
    short: 'HEE', 
    colors: ['#1C5BAF', '#FFFFFF'], 
    logo: 'https://tmssl.akamaized.net/images/wappen/head/306.png',
    rating: 70, 
    budget: 5 
  },
  { 
    name: 'Go Ahead Eagles', 
    short: 'GAE', 
    colors: ['#FFD700', '#FF0000'], 
    logo: 'https://tmssl.akamaized.net/images/wappen/head/1435.png',
    rating: 69, 
    budget: 3 
  },
  { 
    name: 'Fortuna Sittard', 
    short: 'FOR', 
    colors: ['#FFD700', '#008000'], 
    logo: 'https://tmssl.akamaized.net/images/wappen/head/385.png',
    rating: 68, 
    budget: 3 
  },
  { 
    name: 'PEC Zwolle', 
    short: 'PEC', 
    colors: ['#0C3877', '#FFFFFF'], 
    logo: 'https://tmssl.akamaized.net/images/wappen/head/1269.png',
    rating: 67, 
    budget: 2 
  },
  { 
    name: 'Heracles', 
    short: 'HER', 
    colors: ['#000000', '#FFFFFF'], 
    logo: 'https://tmssl.akamaized.net/images/wappen/head/1304.png',
    rating: 67, 
    budget: 2 
  },
  { 
    name: 'Almere City', 
    short: 'ALM', 
    colors: ['#DA291C', '#000000'], 
    logo: 'https://tmssl.akamaized.net/images/wappen/head/724.png',
    rating: 66, 
    budget: 2 
  },
  { 
    name: 'RKC Waalwijk', 
    short: 'RKC', 
    colors: ['#FFD700', '#1C5BAF'], 
    logo: 'https://tmssl.akamaized.net/images/wappen/head/235.png',
    rating: 65, 
    budget: 1.5 
  },
  { 
    name: 'Excelsior', 
    short: 'EXC', 
    colors: ['#000000', '#FF0000'], 
    logo: 'https://tmssl.akamaized.net/images/wappen/head/748.png',
    rating: 65, 
    budget: 1.5 
  },
  { 
    name: 'Vitesse', 
    short: 'VIT', 
    colors: ['#FFD700', '#000000'], 
    logo: 'https://tmssl.akamaized.net/images/wappen/head/499.png',
    rating: 64, 
    budget: 1 
  },
  { 
    name: 'Volendam', 
    short: 'VOL', 
    colors: ['#FF6600', '#000000'], 
    logo: 'https://tmssl.akamaized.net/images/wappen/head/725.png',
    rating: 63, 
    budget: 1 
  },
];

export const INITIAL_TEAMS: Team[] = TEAMS_DATA.map((t, idx) => {
  const players = generateSquad(t.name, t.rating);
  const totalWages = players.reduce((sum, p) => sum + p.wage, 0);

  return {
    id: `team-${idx}`,
    name: t.name,
    shortName: t.short,
    logoUrl: t.logo,
    colors: t.colors as [string, string],
    rating: {
      attack: t.rating,
      midfield: t.rating - 2,
      defense: t.rating - 1,
    },
    budget: t.budget, // Millions
    financialStats: {
      income: {
        sponsorship: Math.floor(t.budget * 25000), // Weekly sponsorship
        transfers: 0,
        matchDay: 0,
        total: 0
      },
      expenses: {
        wages: totalWages,
        transfers: 0,
        total: 0
      },
      history: [{ week: 0, balance: t.budget }]
    },
    players: players,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    points: 0,
    tactics: { 
      formation: '4-3-3', 
      style: 'Possession',
      tempo: 50,
      width: 50,
      depth: 50,
      aggression: 50,
      passingDirectness: 50,
      pressingIntensity: 50,
      tackling: 'Normal',
      offsideTrap: false,
      timeWasting: 0,
      creativeFreedom: 50
    }
  };
});

export const FORMATIONS = [
  '4-3-3',
  '4-4-2',
  '4-2-3-1',
  '3-5-2',
  '5-3-2',
  '3-4-3',
  '4-1-4-1',
  '4-1-2-1-2' // Diamond
];

export const generateSchedule = (teams: Team[]): Match[][] => {
  const schedule: Match[][] = [];
  const teamIds = teams.map(t => t.id);
  const totalRounds = teamIds.length - 1;
  const matchesPerRound = teamIds.length / 2;

  for (let round = 0; round < totalRounds; round++) {
    const roundMatches: Match[] = [];
    for (let match = 0; match < matchesPerRound; match++) {
      const home = (round + match) % (teamIds.length - 1);
      const away = (teamIds.length - 1 - match + round) % (teamIds.length - 1);
      
      let homeTeamId = teamIds[home];
      let awayTeamId = teamIds[away];

      if (match === 0) {
        awayTeamId = teamIds[teamIds.length - 1];
      }

      // Flip Home/Away every other round to ensure balance
      if (round % 2 === 1) {
          const temp = homeTeamId;
          homeTeamId = awayTeamId;
          awayTeamId = temp;
      }

      roundMatches.push({
        id: `match-${round}-${match}`,
        homeTeamId,
        awayTeamId,
        week: round + 1,
        played: false,
        events: [],
        stats: {
          homeScore: 0, awayScore: 0,
          homePossession: 50, awayPossession: 50,
          homeShots: 0, awayShots: 0,
          homeOnTarget: 0, awayOnTarget: 0,
          homeXG: 0, awayXG: 0,
          homeCorners: 0, awayCorners: 0,
          homeFouls: 0, awayFouls: 0,
          homeYellows: 0, awayYellows: 0,
          homeReds: 0, awayReds: 0
        }
      });
    }
    schedule.push(roundMatches);
  }
  return schedule;
};