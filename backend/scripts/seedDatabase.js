require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const { User, Profile } = require('../api/models');

const playersData = [
  {
    name: "Jamal Musiala",
    email: "jamal.musiala@player.com",
    preferredPosition: "CAM",
    ageCategory: "U-23",
    dominantFoot: "right",
    height: 184,
    weight: 72,
    city: "Munich",
    state: "Bavaria",
    currentClub: "FC Bayern Munich",
    matchesPlayed: 42,
    goals: 18,
    assists: 15,
    bio: "Attacking midfielder known for silky dribbling, close control, and precise final third creation.",
    profilePhoto: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500",
    skills: { speed: 88, passing: 89, dribbling: 94, finishing: 85, defending: 52, vision: 91, stamina: 86, potential: 95, aiScore: 91 }
  },
  {
    name: "Lamine Yamal",
    email: "lamine.yamal@player.com",
    preferredPosition: "RW",
    ageCategory: "U-19",
    dominantFoot: "left",
    height: 180,
    weight: 68,
    city: "Barcelona",
    state: "Catalonia",
    currentClub: "FC Barcelona",
    matchesPlayed: 38,
    goals: 14,
    assists: 18,
    bio: "Prodigious winger with explosive acceleration, elite 1v1 trickery, and world-class vision.",
    profilePhoto: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500",
    skills: { speed: 92, passing: 88, dribbling: 95, finishing: 86, defending: 45, vision: 90, stamina: 85, potential: 98, aiScore: 93 }
  },
  {
    name: "Jude Bellingham",
    email: "jude.bellingham@player.com",
    preferredPosition: "CM",
    ageCategory: "Senior",
    dominantFoot: "right",
    height: 186,
    weight: 75,
    city: "Madrid",
    state: "Community of Madrid",
    currentClub: "Real Madrid CF",
    matchesPlayed: 45,
    goals: 23,
    assists: 12,
    bio: "Complete box-to-box midfielder combining physical dominance with lethal goalscoring runs.",
    profilePhoto: "https://images.unsplash.com/photo-1543351611-c823945388c3?w=500",
    skills: { speed: 84, passing: 90, dribbling: 87, finishing: 88, defending: 78, vision: 92, stamina: 93, potential: 96, aiScore: 92 }
  },
  {
    name: "Pedri Gonzalez",
    email: "pedri.gonzalez@player.com",
    preferredPosition: "CM",
    ageCategory: "Senior",
    dominantFoot: "right",
    height: 174,
    weight: 65,
    city: "Barcelona",
    state: "Catalonia",
    currentClub: "FC Barcelona",
    matchesPlayed: 35,
    goals: 7,
    assists: 14,
    bio: "Master orchestrator with supreme spatial awareness, press-resistance, and tactical maturity.",
    profilePhoto: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500",
    skills: { speed: 80, passing: 94, dribbling: 91, finishing: 78, defending: 68, vision: 96, stamina: 88, potential: 94, aiScore: 89 }
  },
  {
    name: "Arda Güler",
    email: "arda.guler@player.com",
    preferredPosition: "CAM",
    ageCategory: "U-21",
    dominantFoot: "left",
    height: 176,
    weight: 67,
    city: "Madrid",
    state: "Community of Madrid",
    currentClub: "Real Madrid CF",
    matchesPlayed: 24,
    goals: 9,
    assists: 8,
    bio: "Left-footed playmaker with pinpoint curling shots and incisive through balls.",
    profilePhoto: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500",
    skills: { speed: 83, passing: 89, dribbling: 90, finishing: 84, defending: 48, vision: 89, stamina: 82, potential: 93, aiScore: 87 }
  },
  {
    name: "Endrick Felipe",
    email: "endrick.felipe@player.com",
    preferredPosition: "ST",
    ageCategory: "U-19",
    dominantFoot: "left",
    height: 173,
    weight: 71,
    city: "Madrid",
    state: "Community of Madrid",
    currentClub: "Real Madrid CF",
    matchesPlayed: 30,
    goals: 16,
    assists: 5,
    bio: "Explosive center-forward boasting immense power, razor-sharp instincts, and bullet shot accuracy.",
    profilePhoto: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500",
    skills: { speed: 91, passing: 75, dribbling: 86, finishing: 90, defending: 42, vision: 78, stamina: 87, potential: 96, aiScore: 88 }
  },
  {
    name: "Warren Zaïre-Emery",
    email: "warren.emery@player.com",
    preferredPosition: "CDM",
    ageCategory: "U-19",
    dominantFoot: "right",
    height: 178,
    weight: 73,
    city: "Paris",
    state: "Île-de-France",
    currentClub: "Paris Saint-Germain",
    matchesPlayed: 40,
    goals: 6,
    assists: 9,
    bio: "Powerhouse midfielder with elite ball recovery, composure under pressure, and driving runs.",
    profilePhoto: "https://images.unsplash.com/photo-1543351611-c823945388c3?w=500",
    skills: { speed: 82, passing: 86, dribbling: 83, finishing: 74, defending: 85, vision: 84, stamina: 92, potential: 94, aiScore: 86 }
  },
  {
    name: "Kobbie Mainoo",
    email: "kobbie.mainoo@player.com",
    preferredPosition: "CM",
    ageCategory: "U-19",
    dominantFoot: "right",
    height: 175,
    weight: 70,
    city: "Manchester",
    state: "Greater Manchester",
    currentClub: "Manchester United",
    matchesPlayed: 36,
    goals: 5,
    assists: 7,
    bio: "Calm central midfielder with exceptional tight-space agility and intelligent distribution.",
    profilePhoto: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500",
    skills: { speed: 81, passing: 87, dribbling: 88, finishing: 76, defending: 80, vision: 88, stamina: 89, potential: 93, aiScore: 86 }
  },
  {
    name: "Pau Cubarsí",
    email: "pau.cubarsi@player.com",
    preferredPosition: "CB",
    ageCategory: "U-19",
    dominantFoot: "right",
    height: 184,
    weight: 74,
    city: "Barcelona",
    state: "Catalonia",
    currentClub: "FC Barcelona",
    matchesPlayed: 32,
    goals: 2,
    assists: 4,
    bio: "Prodigious center-back with elite line-breaking passing accuracy and sharp defensive reading.",
    profilePhoto: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500",
    skills: { speed: 78, passing: 89, dribbling: 76, finishing: 55, defending: 90, vision: 86, stamina: 86, potential: 95, aiScore: 87 }
  },
  {
    name: "Alejandro Balde",
    email: "alejandro.balde@player.com",
    preferredPosition: "LB",
    ageCategory: "U-21",
    dominantFoot: "left",
    height: 175,
    weight: 69,
    city: "Barcelona",
    state: "Catalonia",
    currentClub: "FC Barcelona",
    matchesPlayed: 34,
    goals: 3,
    assists: 8,
    bio: "Lightning-fast full-back capable of tearing up the flank and delivering dangerous crosses.",
    profilePhoto: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500",
    skills: { speed: 93, passing: 80, dribbling: 84, finishing: 65, defending: 81, vision: 79, stamina: 90, potential: 91, aiScore: 85 }
  },
  {
    name: "Yan Couto",
    email: "yan.couto@player.com",
    preferredPosition: "RB",
    ageCategory: "U-23",
    dominantFoot: "right",
    height: 168,
    weight: 64,
    city: "Dortmund",
    state: "North Rhine-Westphalia",
    currentClub: "Borussia Dortmund",
    matchesPlayed: 31,
    goals: 4,
    assists: 10,
    bio: "Dynamic attacking right-back with electric overlap speed and key chances created.",
    profilePhoto: "https://images.unsplash.com/photo-1543351611-c823945388c3?w=500",
    skills: { speed: 89, passing: 81, dribbling: 83, finishing: 68, defending: 75, vision: 82, stamina: 87, potential: 89, aiScore: 83 }
  },
  {
    name: "Guillaume Restes",
    email: "guillaume.restes@player.com",
    preferredPosition: "GK",
    ageCategory: "U-21",
    dominantFoot: "right",
    height: 188,
    weight: 81,
    city: "Toulouse",
    state: "Occitanie",
    currentClub: "Toulouse FC",
    matchesPlayed: 38,
    goals: 0,
    assists: 1,
    cleanSheets: 14,
    bio: "Reflex goalkeeper with outstanding shot-stopping ability and commanding box presence.",
    profilePhoto: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500",
    skills: { speed: 72, passing: 78, dribbling: 50, finishing: 30, defending: 88, vision: 85, stamina: 84, potential: 92, aiScore: 84 }
  }
];

const scoutsData = [
  {
    name: "Piet de Visser",
    email: "piet.devisser@scout.com",
    organization: "Global Talent Hub",
    clubRepresenting: "Chelsea FC",
    designation: "Chief Senior Scout",
    experience: 35,
    bio: "Legendary Dutch talent evaluator credited with discovering Ronaldo Nazário, Romário, and Kevin De Bruyne.",
    profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
    ageGroupsCovered: ["U-17", "U-19", "U-21", "Senior"],
    positionsInterested: ["ST", "CAM", "RW", "LW"],
    verifiedBadge: true
  },
  {
    name: "Luis Campos",
    email: "luis.campos@scout.com",
    organization: "PSG Sporting Intelligence",
    clubRepresenting: "Paris Saint-Germain",
    designation: "Sports Advisor & Head of Recruitment",
    experience: 25,
    bio: "Architect behind Monaco and Lille's championship-winning squads and master scout of elite youth prospects.",
    profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
    ageGroupsCovered: ["U-15", "U-17", "U-19", "U-21"],
    positionsInterested: ["CM", "CDM", "RW", "ST"],
    verifiedBadge: true
  },
  {
    name: "Juni Calafat",
    email: "juni.calafat@scout.com",
    organization: "Real Madrid Scouting Division",
    clubRepresenting: "Real Madrid CF",
    designation: "Chief Scout & South America Director",
    experience: 20,
    bio: "Renowned talent finder who brought Vinícius Jr, Rodrygo, Endrick, and Valverde to Madrid.",
    profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500",
    ageGroupsCovered: ["U-17", "U-19", "U-21", "Senior"],
    positionsInterested: ["ST", "CAM", "RW", "CB"],
    verifiedBadge: true
  },
  {
    name: "Michael Edwards",
    email: "michael.edwards@scout.com",
    organization: "FSG Football Operations",
    clubRepresenting: "Liverpool FC",
    designation: "CEO of Football Recruitment",
    experience: 18,
    bio: "Pioneer of data-driven scouting analytics responsible for building Liverpool's Champions League-winning core.",
    profilePhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500",
    ageGroupsCovered: ["U-19", "U-21", "U-23", "Senior"],
    positionsInterested: ["CM", "CB", "ST", "LB"],
    verifiedBadge: true
  },
  {
    name: "Paul Mitchell",
    email: "paul.mitchell@scout.com",
    organization: "Newcastle United Global Scouting",
    clubRepresenting: "Newcastle United",
    designation: "Sporting Director",
    experience: 22,
    bio: "Acclaimed international talent spotter with key stints at Southampton, Tottenham, RB Leipzig, and Monaco.",
    profilePhoto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500",
    ageGroupsCovered: ["U-17", "U-19", "U-21"],
    positionsInterested: ["LB", "RB", "CB", "CDM"],
    verifiedBadge: true
  },
  {
    name: "Deco",
    email: "deco@scout.com",
    organization: "FC Barcelona Sporting Directorate",
    clubRepresenting: "FC Barcelona",
    designation: "Sporting Director",
    experience: 15,
    bio: "Former Champions League winner leading La Masia integration and global talent acquisition.",
    profilePhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500",
    ageGroupsCovered: ["U-13", "U-15", "U-17", "U-19", "Senior"],
    positionsInterested: ["CAM", "CM", "LW", "RW"],
    verifiedBadge: true
  },
  {
    name: "Sven Mislintat",
    email: "sven.mislintat@scout.com",
    organization: "Dortmund Talent Department",
    clubRepresenting: "Borussia Dortmund",
    designation: "Technical Director",
    experience: 24,
    bio: "Nicknamed 'Diamond Eye' for discovering Robert Lewandowski, Pierre-Emerick Aubameyang, and Ousmane Dembélé.",
    profilePhoto: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500",
    ageGroupsCovered: ["U-17", "U-19", "U-21"],
    positionsInterested: ["ST", "RW", "CB", "CM"],
    verifiedBadge: true
  },
  {
    name: "Monchi",
    email: "monchi@scout.com",
    organization: "Aston Villa Football Intelligence",
    clubRepresenting: "Aston Villa",
    designation: "President of Football Operations",
    experience: 28,
    bio: "Mastermind behind Sevilla's Europa League dominance and hundreds of profitable talent discoveries.",
    profilePhoto: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500",
    ageGroupsCovered: ["U-15", "U-17", "U-19", "U-21", "Senior"],
    positionsInterested: ["ST", "CM", "GK", "CB"],
    verifiedBadge: true
  },
  {
    name: "Roberto Olabe",
    email: "roberto.olabe@scout.com",
    organization: "Real Sociedad Recruitment",
    clubRepresenting: "Real Sociedad",
    designation: "Director of Football",
    experience: 19,
    bio: "Renowned Basque talent director specializing in academy integration and targeted elite signings.",
    profilePhoto: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500",
    ageGroupsCovered: ["U-19", "U-21", "Senior"],
    positionsInterested: ["CM", "CDM", "CB"],
    verifiedBadge: true
  },
  {
    name: "Andrea Berta",
    email: "andrea.berta@scout.com",
    organization: "Atlético Madrid Scouting",
    clubRepresenting: "Atlético Madrid",
    designation: "Sporting Director",
    experience: 21,
    bio: "Defensive stability and physical toughness evaluator for Diego Simeone's championship squads.",
    profilePhoto: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=500",
    ageGroupsCovered: ["U-21", "U-23", "Senior"],
    positionsInterested: ["CB", "CDM", "GK", "ST"],
    verifiedBadge: true
  },
  {
    name: "Tiago Pinto",
    email: "tiago.pinto@scout.com",
    organization: "Bournemouth Talent Network",
    clubRepresenting: "AFC Bournemouth",
    designation: "President of Football Operations",
    experience: 16,
    bio: "Portuguese recruitment specialist with extensive network across European and South American youth leagues.",
    profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500",
    ageGroupsCovered: ["U-19", "U-21", "Senior"],
    positionsInterested: ["LW", "RW", "ST", "CAM"],
    verifiedBadge: true
  },
  {
    name: "Christoph Freund",
    email: "christoph.freund@scout.com",
    organization: "Bayern Campus Recruitment",
    clubRepresenting: "FC Bayern Munich",
    designation: "Sporting Director",
    experience: 17,
    bio: "Former Red Bull Salzburg sporting director who developed Erling Haaland, Dayot Upamecano, and Dominik Szoboszlai.",
    profilePhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500",
    ageGroupsCovered: ["U-15", "U-17", "U-19", "U-21", "Senior"],
    positionsInterested: ["CAM", "CM", "ST", "RW"],
    verifiedBadge: true
  }
];

async function seedDatabase() {
  const connected = await connectDB();
  if (!connected) {
    console.error("Failed to connect to PostgreSQL database.");
    process.exit(1);
  }

  console.log("🌱 Seeding NeonDB PostgreSQL Database with 12 Players and 12 Scouts...");

  const passwordHash = await bcrypt.hash("Password123!", 10);
  let playersCreated = 0;
  let scoutsCreated = 0;

  // 1. CREATE PLAYERS
  for (const item of playersData) {
    let user = await User.findOne({ email: item.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        email: item.email.toLowerCase(),
        password: passwordHash,
        role: "player",
        isVerified: true
      });
    }

    let profile = await Profile.findOne({ user: user._id });
    const profileFields = {
      user: user._id,
      name: item.name,
      preferredPosition: item.preferredPosition,
      ageCategory: item.ageCategory,
      dominantFoot: item.dominantFoot,
      height: item.height,
      weight: item.weight,
      city: item.city,
      state: item.state,
      currentClub: item.currentClub,
      matchesPlayed: item.matchesPlayed,
      goals: item.goals,
      assists: item.assists,
      cleanSheets: item.cleanSheets || 0,
      bio: item.bio,
      profilePhoto: item.profilePhoto,
      skills: item.skills,
      verifiedBadge: true
    };

    if (!profile) {
      await Profile.create(profileFields);
    } else {
      await Profile.updateOne({ user: user._id }, profileFields);
    }
    playersCreated++;
    console.log(` [Player ${playersCreated}/12] Created: ${item.name} (${item.preferredPosition} - ${item.currentClub})`);
  }

  // 2. CREATE SCOUTS
  for (const item of scoutsData) {
    let user = await User.findOne({ email: item.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        email: item.email.toLowerCase(),
        password: passwordHash,
        role: "scout",
        isVerified: true
      });
    }

    let profile = await Profile.findOne({ user: user._id });
    const profileFields = {
      user: user._id,
      name: item.name,
      organization: item.organization,
      clubRepresenting: item.clubRepresenting,
      designation: item.designation,
      experience: item.experience,
      bio: item.bio,
      profilePhoto: item.profilePhoto,
      ageGroupsCovered: item.ageGroupsCovered,
      positionsInterested: item.positionsInterested,
      verifiedBadge: item.verifiedBadge
    };

    if (!profile) {
      await Profile.create(profileFields);
    } else {
      await Profile.updateOne({ user: user._id }, profileFields);
    }
    scoutsCreated++;
    console.log(` [Scout ${scoutsCreated}/12] Created: ${item.name} (${item.clubRepresenting})`);
  }

  console.log("\n✅ NeonDB PostgreSQL Database Seeding Complete!");
  console.log(`Summary: ${playersCreated} Players & ${scoutsCreated} Scouts inserted/updated.`);
  console.log("All accounts have default password: Password123!\n");
  process.exit(0);
}

seedDatabase();
