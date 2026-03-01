
import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, Trophy, Zap, Lock, ChevronRight, RotateCcw, Star } from 'lucide-react';
import { supabase } from '../supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Check { label: string; test: (code: string) => boolean; }
interface Lab {
    id: string; domain: string; emoji: string; color: string;
    title: string; difficulty: string; points: number;
    description: string; type: 'html' | 'js' | 'quiz' | 'simulation'; category: string;
    simType?: 'aws_s3' | 'firewall';
    starterCode: string; checks: Check[];
    quizOptions?: string[][]; quizAnswers?: number[];
}

// ─── Color Map ────────────────────────────────────────────────────────────────

const COLOR: Record<string, { bg: string; text: string; badge: string; btn: string; editor: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700', btn: 'bg-blue-600 hover:bg-blue-700', editor: 'text-green-400' },
    yellow: { bg: 'bg-amber-50', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700', btn: 'bg-amber-500 hover:bg-amber-600', editor: 'text-yellow-300' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700', btn: 'bg-purple-600 hover:bg-purple-700', editor: 'text-purple-300' },
    green: { bg: 'bg-green-50', text: 'text-green-600', badge: 'bg-green-100 text-green-700', btn: 'bg-green-600 hover:bg-green-700', editor: 'text-green-300' },
    red: { bg: 'bg-red-50', text: 'text-red-600', badge: 'bg-red-100 text-red-700', btn: 'bg-red-600 hover:bg-red-700', editor: 'text-red-300' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', badge: 'bg-cyan-100 text-cyan-700', btn: 'bg-cyan-600 hover:bg-cyan-700', editor: 'text-cyan-300' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700', btn: 'bg-orange-500 hover:bg-orange-600', editor: 'text-orange-300' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-600', badge: 'bg-pink-100 text-pink-700', btn: 'bg-pink-600 hover:bg-pink-700', editor: 'text-pink-300' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700', btn: 'bg-indigo-600 hover:bg-indigo-700', editor: 'text-indigo-300' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-600', badge: 'bg-teal-100 text-teal-700', btn: 'bg-teal-600 hover:bg-teal-700', editor: 'text-teal-300' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-600', badge: 'bg-slate-100 text-slate-700', btn: 'bg-slate-700 hover:bg-slate-800', editor: 'text-slate-300' },
};

// ─── All Labs ─────────────────────────────────────────────────────────────────

const LABS: Lab[] = [
    // FRONTEND
    {
        id: 'frontend-1', domain: 'Frontend Dev', emoji: '🎨', color: 'blue', category: 'Web',
        title: 'Build a Product Card', difficulty: 'Beginner', points: 100,
        description: 'Create a product card with image, title, price and "Add to Cart" button.',
        type: 'html',
        starterCode: `<div class="card">\n  <!-- Add your content here -->\n</div>\n\n<style>\n  body { background:#f0f4ff; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; font-family:sans-serif; }\n  .card { background:white; border-radius:16px; padding:20px; width:260px; box-shadow:0 4px 20px rgba(0,0,0,0.08); }\n</style>`,
        checks: [
            { label: 'Has an image or placeholder', test: c => c.includes('<img') || /background|placeholder/i.test(c) },
            { label: 'Has a title (h1–h3)', test: c => /<h[1-3]/.test(c) },
            { label: 'Shows a price', test: c => /\$|₹|price|\d+\.\d{2}/i.test(c) },
            { label: 'Has a button', test: c => c.includes('<button') },
            { label: 'Has CSS styling', test: c => /color|border-radius|background/.test(c) },
        ],
    },

    // BACKEND
    {
        id: 'backend-1', domain: 'Backend Dev', emoji: '⚙️', color: 'slate', category: 'Web',
        title: 'REST API Logic', difficulty: 'Beginner', points: 120,
        description: 'Write JavaScript functions that simulate REST API operations.',
        type: 'js',
        starterCode: `// Simulate a simple in-memory user store
const users = [];

// POST /users - add a user object {name, email}
function createUser(user) {
  // push to users array and return it
}

// GET /users/:id - find user by id (1-indexed)
function getUser(id) {
  // return user at index id-1
}`,
        checks: [
            { label: 'createUser adds to array', test: c => { try { const fn = new Function(`${c}; createUser({name:'A',email:'a@b.com'}); return users.length;`); return fn() > 0; } catch { return false; } } },
            { label: 'createUser returns the user', test: c => { try { const fn = new Function(`${c}; return createUser({name:'Bob',email:'b@b.com'});`); const r = fn(); return r && r.name === 'Bob'; } catch { return false; } } },
            { label: 'getUser returns correct user', test: c => { try { const fn = new Function(`${c}; createUser({name:'Alice',email:'a@x.com'}); return getUser(1);`); const r = fn(); return r && r.name === 'Alice'; } catch { return false; } } },
        ],
    },

    // MOBILE
    {
        id: 'mobile-1', domain: 'Mobile Apps', emoji: '📱', color: 'green', category: 'Mobile',
        title: 'Mobile UI Basics', difficulty: 'Beginner', points: 100,
        description: 'Build a mobile-style card UI with touch-friendly large tap targets.',
        type: 'html',
        starterCode: `<div class="app">\n  <!-- Mobile card UI -->\n</div>\n\n<style>\n  body { background:#1a1a2e; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; }\n  .app { width:375px; background:white; border-radius:24px; overflow:hidden; padding:24px; }\n</style>`,
        checks: [
            { label: 'Has a card/container element', test: c => c.includes('class=') },
            { label: 'Uses large padding/sizing (mobile-friendly)', test: c => /padding:\s*(1[6-9]|[2-9]\d)px|py-[4-9]|p-[4-9]/.test(c) },
            { label: 'Has a button with min 44px tap target', test: c => c.includes('<button') },
            { label: 'Uses rounded corners', test: c => c.includes('border-radius') },
        ],
    },

    // DEVOPS
    {
        id: 'devops-1', domain: 'DevOps & SRE', emoji: '🔧', color: 'orange', category: 'Infrastructure',
        title: 'CI/CD Pipeline Quiz', difficulty: 'Beginner', points: 80,
        description: 'Answer key DevOps concepts: CI/CD, Docker, and Kubernetes.',
        type: 'quiz',
        starterCode: '',
        checks: [],
        quizOptions: [
            ['To deploy code manually', 'To automate build, test and deploy', 'To write code faster', 'To manage databases'],
            ['A virtual machine', 'A lightweight container runtime', 'A DNS server', 'A load balancer'],
            ['kubectl apply', 'docker run', 'npm install', 'git push'],
        ],
        quizAnswers: [1, 1, 0],
    },

    // CLOUD
    {
        id: 'cloud-1', domain: 'Cloud Computing', emoji: '☁️', color: 'cyan', category: 'Infrastructure',
        title: 'Configure a Secure S3 Bucket', difficulty: 'Beginner', points: 150,
        description: 'Simulate an AWS console to create a secure storage bucket. Requirement: Block public access and enable versioning.',
        type: 'simulation',
        simType: 'aws_s3',
        starterCode: '',
        checks: [
            { label: 'Bucket Name provided (min 3 chars)', test: c => (JSON.parse(c).bucketName || '').trim().length >= 3 },
            { label: 'Block all public access enabled', test: c => JSON.parse(c).blockPublicAccess === true },
            { label: 'Bucket Versioning enabled', test: c => JSON.parse(c).versioning === true },
        ],
    },

    // AI/ML
    {
        id: 'aiml-1', domain: 'AI & ML', emoji: '🧠', color: 'purple', category: 'AI',
        title: 'ML Algorithm Challenge', difficulty: 'Intermediate', points: 150,
        description: 'Implement core ML utility functions in JavaScript.',
        type: 'js',
        starterCode: `// Calculate the mean of an array
function mean(arr) {
  // return average value
}

// Normalize array values to 0-1 range
function normalize(arr) {
  // return new array with values between 0 and 1
}`,
        checks: [
            { label: 'mean([2,4,6]) === 4', test: c => { try { const fn = new Function(`${c}; return mean([2,4,6]);`); return fn() === 4; } catch { return false; } } },
            { label: 'mean([10,20,30]) === 20', test: c => { try { const fn = new Function(`${c}; return mean([10,20,30]);`); return fn() === 20; } catch { return false; } } },
            { label: 'normalize([0,5,10])[0] === 0', test: c => { try { const fn = new Function(`${c}; return normalize([0,5,10])[0];`); return fn() === 0; } catch { return false; } } },
            { label: 'normalize([0,5,10])[2] === 1', test: c => { try { const fn = new Function(`${c}; return normalize([0,5,10])[2];`); return fn() === 1; } catch { return false; } } },
        ],
    },

    // DATA SCIENCE
    {
        id: 'datasci-1', domain: 'Data Science', emoji: '📊', color: 'indigo', category: 'AI',
        title: 'Data Aggregation', difficulty: 'Beginner', points: 120,
        description: 'Write functions to aggregate and analyze a dataset.',
        type: 'js',
        starterCode: `const data = [
  {name:'Alice', score:85, dept:'CS'},
  {name:'Bob',   score:72, dept:'ECE'},
  {name:'Carol', score:91, dept:'CS'},
  {name:'Dave',  score:68, dept:'ECE'},
];

// Return average score of all students
function avgScore(data) {}

// Return only students from a given dept
function filterByDept(data, dept) {}`,
        checks: [
            { label: 'avgScore returns correct mean', test: c => { try { const fn = new Function(`${c}; return avgScore(data);`); return Math.abs(fn() - 79) < 0.1; } catch { return false; } } },
            { label: 'filterByDept returns CS students', test: c => { try { const fn = new Function(`${c}; return filterByDept(data,"CS").length;`); return fn() === 2; } catch { return false; } } },
            { label: 'filterByDept returns ECE students', test: c => { try { const fn = new Function(`${c}; return filterByDept(data,"ECE")[0].name;`); return fn() === 'Bob'; } catch { return false; } } },
        ],
    },

    // CYBERSECURITY
    {
        id: 'cyber-1', domain: 'Cybersecurity', emoji: '🛡️', color: 'red', category: 'Security',
        title: 'Network Firewall Config', difficulty: 'Intermediate', points: 150,
        description: 'Simulate a Firewall appliance. Block port 22 (SSH) from the internet, but allow port 443 (HTTPS).',
        type: 'simulation',
        simType: 'firewall',
        starterCode: '',
        checks: [
            { label: 'Port 22 (SSH) is Denied', test: c => JSON.parse(c).port22 === 'deny' },
            { label: 'Port 443 (HTTPS) is Allowed', test: c => JSON.parse(c).port443 === 'allow' },
            { label: 'Port 80 (HTTP) rule configured', test: c => ['allow', 'deny'].includes(JSON.parse(c).port80) },
        ],
    },

    // BLOCKCHAIN
    {
        id: 'blockchain-1', domain: 'Web3 & Crypto', emoji: '⛓️', color: 'yellow', category: 'Web3',
        title: 'Blockchain Logic', difficulty: 'Intermediate', points: 130,
        description: 'Implement a minimal blockchain block structure in JavaScript.',
        type: 'js',
        starterCode: `// Create a blockchain block
function createBlock(index, data, previousHash) {
  return {
    // index, data, previousHash, timestamp (Date.now()), hash
    // hash can just be: index + data + previousHash (simplified)
  };
}

// Check if a chain is valid (each block's previousHash matches prior block's hash)
function isChainValid(chain) {
  // return true if valid, false otherwise
}`,
        checks: [
            { label: 'createBlock returns an object', test: c => { try { const fn = new Function(`${c}; return typeof createBlock(0,"genesis","0");`); return fn() === 'object'; } catch { return false; } } },
            { label: 'Block has index property', test: c => { try { const fn = new Function(`${c}; return createBlock(1,"data","abc").index;`); return fn() === 1; } catch { return false; } } },
            { label: 'Block has previousHash property', test: c => { try { const fn = new Function(`${c}; return createBlock(1,"d","xyz").previousHash;`); return fn() === 'xyz'; } catch { return false; } } },
        ],
    },

    // UI/UX
    {
        id: 'uiux-1', domain: 'UI/UX Design', emoji: '✏️', color: 'pink', category: 'Design',
        title: 'Design a Login Screen', difficulty: 'Beginner', points: 100,
        description: 'Build a clean, accessible login form with email, password and submit button.',
        type: 'html',
        starterCode: `<div class="screen">\n  <!-- Login form here -->\n</div>\n\n<style>\n  body { background:#667eea; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; font-family:sans-serif; }\n  .screen { background:white; border-radius:24px; padding:40px; width:300px; }\n</style>`,
        checks: [
            { label: 'Has an email input', test: c => /type=["']email["']|email/i.test(c) },
            { label: 'Has a password input', test: c => /type=["']password["']/i.test(c) },
            { label: 'Has a submit button', test: c => c.includes('<button') || /type=["']submit["']/.test(c) },
            { label: 'Has form labels or placeholders', test: c => c.includes('<label') || c.includes('placeholder') },
            { label: 'Has visual styling (colors/shadows)', test: c => /box-shadow|background|color/.test(c) },
        ],
    },

    // GAME DEV
    {
        id: 'gaming-1', domain: 'Game Dev', emoji: '🎮', color: 'green', category: 'Creative',
        title: 'Game Loop Logic', difficulty: 'Intermediate', points: 130,
        description: 'Implement core game loop functions: score tracking, collision, and level-up.',
        type: 'js',
        starterCode: `// Track player score
function addScore(currentScore, points) {
  // return new total score
}

// Simple collision: returns true if two 1D ranges [a, a+w] and [b, b+h] overlap
function collides(a, wa, b, wb) {
  // return true if overlapping
}

// Return next level if score >= levelThreshold, else same level
function checkLevelUp(score, level, threshold) {
  // return level+1 or level
}`,
        checks: [
            { label: 'addScore(100, 50) === 150', test: c => { try { const fn = new Function(`${c}; return addScore(100,50);`); return fn() === 150; } catch { return false; } } },
            { label: 'collides(0,10, 5,10) === true', test: c => { try { const fn = new Function(`${c}; return collides(0,10,5,10);`); return fn() === true; } catch { return false; } } },
            { label: 'collides(0,5, 10,5) === false', test: c => { try { const fn = new Function(`${c}; return collides(0,5,10,5);`); return fn() === false; } catch { return false; } } },
            { label: 'checkLevelUp(100,1,100) === 2', test: c => { try { const fn = new Function(`${c}; return checkLevelUp(100,1,100);`); return fn() === 2; } catch { return false; } } },
        ],
    },

    // FINTECH
    {
        id: 'fintech-1', domain: 'FinTech', emoji: '💰', color: 'teal', category: 'Finance',
        title: 'Finance Calculators', difficulty: 'Beginner', points: 110,
        description: 'Build interest and EMI calculation functions used in fintech apps.',
        type: 'js',
        starterCode: `// Simple Interest: P * R * T / 100
function simpleInterest(principal, rate, time) {}

// Compound Interest: P * (1 + R/100)^T - P
function compoundInterest(principal, rate, time) {
  // Return only the interest (not total)
}`,
        checks: [
            { label: 'simpleInterest(1000, 5, 2) === 100', test: c => { try { const fn = new Function(`${c}; return simpleInterest(1000,5,2);`); return fn() === 100; } catch { return false; } } },
            { label: 'simpleInterest(500, 10, 1) === 50', test: c => { try { const fn = new Function(`${c}; return simpleInterest(500,10,1);`); return fn() === 50; } catch { return false; } } },
            { label: 'compoundInterest(1000,10,1) ≈ 100', test: c => { try { const fn = new Function(`${c}; return Math.round(compoundInterest(1000,10,1));`); return fn() === 100; } catch { return false; } } },
        ],
    },

    // SPACETECH
    {
        id: 'spacetech-1', domain: 'SpaceTech', emoji: '🚀', color: 'indigo', category: 'Engineering',
        title: 'Orbital Mechanics Math', difficulty: 'Intermediate', points: 140,
        description: 'Implement physics formulas used in space mission planning.',
        type: 'js',
        starterCode: `const G = 6.674e-11; // Gravitational constant

// Gravitational Force: F = G * m1 * m2 / r^2
function gravForce(m1, m2, r) {}

// Escape velocity: sqrt(2 * G * M / r)
function escapeVelocity(M, r) {}`,
        checks: [
            { label: 'gravForce returns a number', test: c => { try { const fn = new Function(`${c}; return typeof gravForce(1e24,1e10,1e7);`); return fn() === 'number'; } catch { return false; } } },
            { label: 'gravForce(1e10,1e10,1) is large positive', test: c => { try { const fn = new Function(`${c}; return gravForce(1e10,1e10,1) > 0;`); return fn() === true; } catch { return false; } } },
            { label: 'escapeVelocity(5.972e24, 6.371e6) ≈ 11186 m/s', test: c => { try { const fn = new Function(`${c}; return Math.round(escapeVelocity(5.972e24,6.371e6));`); return Math.abs(fn() - 11186) < 10; } catch { return false; } } },
        ],
    },

    // SUSTAINABILITY
    {
        id: 'greentech-1', domain: 'Sustainability', emoji: '🌿', color: 'green', category: 'Engineering',
        title: 'Carbon Footprint Calculator', difficulty: 'Beginner', points: 100,
        description: 'Build functions to estimate CO₂ emissions from daily activities.',
        type: 'js',
        starterCode: `// Car travel CO2: km * 0.21 kg/km
function carEmission(km) {}

// Flight CO2: km * 0.255 kg/km
function flightEmission(km) {}

// Total from array of {type, km}
function totalEmission(trips) {}`,
        checks: [
            { label: 'carEmission(100) === 21', test: c => { try { const fn = new Function(`${c}; return carEmission(100);`); return Math.abs(fn() - 21) < 0.01; } catch { return false; } } },
            { label: 'flightEmission(1000) === 255', test: c => { try { const fn = new Function(`${c}; return flightEmission(1000);`); return Math.abs(fn() - 255) < 0.01; } catch { return false; } } },
        ],
    },

    // EMBEDDED
    {
        id: 'embedded-1', domain: 'Embedded Systems', emoji: '🔌', color: 'orange', category: 'Engineering',
        title: 'Bitwise Operations', difficulty: 'Intermediate', points: 130,
        description: 'Master bitwise operations — the foundation of embedded programming.',
        type: 'js',
        starterCode: `// Set bit n in value x
function setBit(x, n) {}

// Clear bit n in value x
function clearBit(x, n) {}

// Check if bit n is set
function isBitSet(x, n) {}`,
        checks: [
            { label: 'setBit(0b0000, 2) === 4', test: c => { try { const fn = new Function(`${c}; return setBit(0,2);`); return fn() === 4; } catch { return false; } } },
            { label: 'clearBit(0b1111, 1) === 13', test: c => { try { const fn = new Function(`${c}; return clearBit(15,1);`); return fn() === 13; } catch { return false; } } },
            { label: 'isBitSet(4, 2) === true', test: c => { try { const fn = new Function(`${c}; return isBitSet(4,2);`); return fn() === true; } catch { return false; } } },
            { label: 'isBitSet(4, 0) === false', test: c => { try { const fn = new Function(`${c}; return isBitSet(4,0);`); return fn() === false; } catch { return false; } } },
        ],
    },

    // QUANTUM
    {
        id: 'quantum-1', domain: 'Quantum Computing', emoji: '⚛️', color: 'purple', category: 'Science',
        title: 'Quantum Concepts Quiz', difficulty: 'Beginner', points: 80,
        description: 'Test your knowledge of superposition, entanglement, and qubits.',
        type: 'quiz',
        starterCode: '',
        checks: [],
        quizOptions: [
            ['A qubit can only be 0 or 1', 'A qubit can be 0, 1, or both simultaneously', 'A qubit is a classical bit', 'A qubit is always 0'],
            ['Quantum entanglement', 'Quantum superposition', 'Quantum tunneling', 'Quantum decoherence'],
            ['Qiskit (IBM)', 'TensorFlow', 'PyTorch', 'React'],
        ],
        quizAnswers: [1, 0, 0],
    },

    // BIOTECH
    {
        id: 'biotech-1', domain: 'BioTechnology', emoji: '🧬', color: 'teal', category: 'Science',
        title: 'DNA Sequence Analysis', difficulty: 'Intermediate', points: 140,
        description: 'Implement functions to analyze DNA sequences — used in bioinformatics.',
        type: 'js',
        starterCode: `// Count nucleotide occurrences {A, T, G, C}
function nucleotideCount(dna) {
  // return {A:n, T:n, G:n, C:n}
}

// Return complement strand (A<->T, G<->C)
function complement(dna) {}`,
        checks: [
            { label: 'nucleotideCount("AATG").A === 2', test: c => { try { const fn = new Function(`${c}; return nucleotideCount("AATG").A;`); return fn() === 2; } catch { return false; } } },
            { label: 'nucleotideCount("AATG").G === 1', test: c => { try { const fn = new Function(`${c}; return nucleotideCount("AATG").G;`); return fn() === 1; } catch { return false; } } },
            { label: 'complement("AATG") === "TTAC"', test: c => { try { const fn = new Function(`${c}; return complement("AATG");`); return fn() === 'TTAC'; } catch { return false; } } },
        ],
    },

    // AR/VR
    {
        id: 'arvr-1', domain: 'AR/VR Systems', emoji: '🥽', color: 'indigo', category: 'Creative',
        title: '3D Math Fundamentals', difficulty: 'Intermediate', points: 130,
        description: 'Implement 3D vector math — the foundation of every AR/VR engine.',
        type: 'js',
        starterCode: `// Add two 3D vectors
function vecAdd(a, b) {
  // a and b are {x,y,z}
}

// Dot product of two 3D vectors
function dotProduct(a, b) {}

// Magnitude/length of a vector
function magnitude(v) {}`,
        checks: [
            { label: 'vecAdd({x:1,y:2,z:3},{x:4,y:5,z:6}).x === 5', test: c => { try { const fn = new Function(`${c}; return vecAdd({x:1,y:2,z:3},{x:4,y:5,z:6}).x;`); return fn() === 5; } catch { return false; } } },
            { label: 'dotProduct({x:1,y:2,z:3},{x:4,y:5,z:6}) === 32', test: c => { try { const fn = new Function(`${c}; return dotProduct({x:1,y:2,z:3},{x:4,y:5,z:6});`); return fn() === 32; } catch { return false; } } },
            { label: 'magnitude({x:3,y:4,z:0}) === 5', test: c => { try { const fn = new Function(`${c}; return magnitude({x:3,y:4,z:0});`); return fn() === 5; } catch { return false; } } },
        ],
    },

    // E-COMMERCE
    {
        id: 'ecommerce-1', domain: 'E-Commerce', emoji: '🛒', color: 'blue', category: 'Web',
        title: 'Shopping Cart Logic', difficulty: 'Beginner', points: 110,
        description: 'Implement a shopping cart: add, remove, and calculate total.',
        type: 'js',
        starterCode: `let cart = [];

// Add or increment item {id, name, price}
function addToCart(item) {}

// Remove item by id
function removeFromCart(id) {}

// Return total price
function cartTotal() {}`,
        checks: [
            { label: 'addToCart adds an item', test: c => { try { const fn = new Function(`${c}; addToCart({id:1,name:"X",price:10}); return cart.length;`); return fn() > 0; } catch { return false; } } },
            { label: 'cartTotal returns correct sum', test: c => { try { const fn = new Function(`${c}; addToCart({id:1,name:"A",price:10}); addToCart({id:2,name:"B",price:20}); return cartTotal();`); return fn() === 30; } catch { return false; } } },
            { label: 'removeFromCart removes item', test: c => { try { const fn = new Function(`${c}; addToCart({id:1,name:"A",price:10}); removeFromCart(1); return cart.length;`); return fn() === 0; } catch { return false; } } },
        ],
    },

    // GOVTECH
    {
        id: 'govtech-1', domain: 'GovTech', emoji: '🏛️', color: 'slate', category: 'Web',
        title: 'Citizen Form UI', difficulty: 'Beginner', points: 90,
        description: 'Build an accessible government service form with proper labels and validation.',
        type: 'html',
        starterCode: `<main class="form-page">\n  <h1>Citizen Registration</h1>\n  <!-- Form fields: name, ID number, date of birth, submit -->\n</main>\n\n<style>\n  body { background:#f1f5f9; display:flex; justify-content:center; padding-top:40px; margin:0; font-family:sans-serif; }\n  .form-page { background:white; border-radius:12px; padding:32px; width:360px; }\n  h1 { font-size:20px; margin-bottom:24px; }\n</style>`,
        checks: [
            { label: 'Has a text input for name', test: c => /type=["']text["']|name/i.test(c) },
            { label: 'Has a date input or date field', test: c => /type=["']date["']|date|dob|birth/i.test(c) },
            { label: 'Has a submit button', test: c => c.includes('<button') || /type=["']submit["']/.test(c) },
            { label: 'Has form labels', test: c => c.includes('<label') },
        ],
    },

    // EDTECH
    {
        id: 'edtech-1', domain: 'EdTech', emoji: '📚', color: 'yellow', category: 'Web',
        title: 'Quiz Engine', difficulty: 'Intermediate', points: 120,
        description: 'Build a quiz engine: track score, check answers, and calculate percentage.',
        type: 'js',
        starterCode: `// Check single answer: returns true if selected === correct
function checkAnswer(selected, correct) {}

// Calculate percentage: score / total * 100 (rounded)
function calcPercentage(score, total) {}

// Return "Pass" if >= 60%, else "Fail"
function getGrade(percentage) {}`,
        checks: [
            { label: 'checkAnswer(2,2) === true', test: c => { try { const fn = new Function(`${c}; return checkAnswer(2,2);`); return fn() === true; } catch { return false; } } },
            { label: 'checkAnswer(1,2) === false', test: c => { try { const fn = new Function(`${c}; return checkAnswer(1,2);`); return fn() === false; } catch { return false; } } },
            { label: 'calcPercentage(8,10) === 80', test: c => { try { const fn = new Function(`${c}; return calcPercentage(8,10);`); return fn() === 80; } catch { return false; } } },
            { label: 'getGrade(80) === "Pass"', test: c => { try { const fn = new Function(`${c}; return getGrade(80);`); return fn() === 'Pass'; } catch { return false; } } },
            { label: 'getGrade(50) === "Fail"', test: c => { try { const fn = new Function(`${c}; return getGrade(50);`); return fn() === 'Fail'; } catch { return false; } } },
        ],
    },

    // HEALTHTECH
    {
        id: 'medtech-1', domain: 'HealthTech', emoji: '🏥', color: 'red', category: 'Science',
        title: 'Health Metrics Calculator', difficulty: 'Beginner', points: 100,
        description: 'Build BMI, heart rate zone, and calorie calculators used in health apps.',
        type: 'js',
        starterCode: `// BMI = weight(kg) / height(m)^2
function calculateBMI(weight, height) {}

// BMI category: <18.5 "Underweight", <25 "Normal", <30 "Overweight", else "Obese"
function bmiCategory(bmi) {}`,
        checks: [
            { label: 'calculateBMI(70, 1.75) ≈ 22.86', test: c => { try { const fn = new Function(`${c}; return Math.round(calculateBMI(70,1.75)*100)/100;`); return fn() === 22.86; } catch { return false; } } },
            { label: 'bmiCategory(22) === "Normal"', test: c => { try { const fn = new Function(`${c}; return bmiCategory(22);`); return fn() === 'Normal'; } catch { return false; } } },
            { label: 'bmiCategory(17) === "Underweight"', test: c => { try { const fn = new Function(`${c}; return bmiCategory(17);`); return fn() === 'Underweight'; } catch { return false; } } },
            { label: 'bmiCategory(32) === "Obese"', test: c => { try { const fn = new Function(`${c}; return bmiCategory(32);`); return fn() === 'Obese'; } catch { return false; } } },
        ],
    },

    // DIGITAL ARTS
    {
        id: 'creative-1', domain: 'Digital Arts', emoji: '🎨', color: 'pink', category: 'Design',
        title: 'CSS Art Challenge', difficulty: 'Beginner', points: 100,
        description: 'Create a visually stunning gradient card with animation purely using CSS.',
        type: 'html',
        starterCode: `<div class="art-card">\n  <h2>Digital Art</h2>\n  <p>Made with CSS only</p>\n</div>\n\n<style>\n  body { background:#111; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; }\n  .art-card {\n    /* Add gradient, animation, and creative styling here */\n    padding:40px; border-radius:24px; color:white;\n    font-family:sans-serif; text-align:center;\n  }\n</style>`,
        checks: [
            { label: 'Uses a gradient', test: c => c.includes('gradient') },
            { label: 'Has a CSS animation or transition', test: c => c.includes('animation') || c.includes('transition') || c.includes('@keyframes') },
            { label: 'Has styled text (font-size or font-weight)', test: c => /font-size|font-weight/.test(c) },
            { label: 'Has rounded corners', test: c => c.includes('border-radius') },
        ],
    },

    // ROBOTICS
    {
        id: 'robotics-1', domain: 'Robotics', emoji: '🤖', color: 'cyan', category: 'Engineering',
        title: 'Robot Navigation Logic', difficulty: 'Intermediate', points: 130,
        description: 'Program a robot\'s movement and position tracking functions.',
        type: 'js',
        starterCode: `// Robot starts at {x:0, y:0, direction:'N'}
// Move forward by 1 step based on direction
function moveForward(robot) {
  // N→y+1, S→y-1, E→x+1, W→x-1
  // return new robot object
}

// Turn right: N→E→S→W→N
function turnRight(robot) {
  // return new robot with updated direction
}`,
        checks: [
            { label: 'moveForward facing N increases y', test: c => { try { const fn = new Function(`${c}; return moveForward({x:0,y:0,direction:'N'}).y;`); return fn() === 1; } catch { return false; } } },
            { label: 'moveForward facing E increases x', test: c => { try { const fn = new Function(`${c}; return moveForward({x:0,y:0,direction:'E'}).x;`); return fn() === 1; } catch { return false; } } },
            { label: 'turnRight from N gives E', test: c => { try { const fn = new Function(`${c}; return turnRight({x:0,y:0,direction:'N'}).direction;`); return fn() === 'E'; } catch { return false; } } },
            { label: 'turnRight from W gives N', test: c => { try { const fn = new Function(`${c}; return turnRight({x:0,y:0,direction:'W'}).direction;`); return fn() === 'N'; } catch { return false; } } },
        ],
    },
];

// ─── Score Helpers ────────────────────────────────────────────────────────────

const getScores = (): Record<string, number> => {
    try { return JSON.parse(localStorage.getItem('lab_scores') || '{}'); } catch { return {}; }
};

const syncScoresFromCloud = async (setScores: (s: Record<string, number>) => void) => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return; // Not logged in

        const { data, error } = await supabase
            .from('lab_scores')
            .select('lab_id, score')
            .eq('user_id', session.user.id);

        if (!error && data) {
            const cloudScores: Record<string, number> = {};
            data.forEach(row => cloudScores[row.lab_id] = row.score);
            // Merge cloud scores into local storage to keep them in sync
            const updated = { ...getScores(), ...cloudScores };
            localStorage.setItem('lab_scores', JSON.stringify(updated));
            setScores(updated);
        }
    } catch (err) { console.error("Cloud sync failed", err); }
};

const saveScore = async (id: string, score: number) => {
    // 1. Save Locally
    const s = getScores();
    s[id] = Math.max(s[id] || 0, score);
    localStorage.setItem('lab_scores', JSON.stringify(s));

    // 2. Save to Cloud
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            await supabase.from('lab_scores').upsert({
                user_id: session.user.id,
                lab_id: id,
                score: s[id]
            }, { onConflict: 'user_id, lab_id' });
        }
    } catch (err) { console.error("Cloud save failed", err); }
};

// ─── Quiz Lab Component ───────────────────────────────────────────────────────

const QuizLab: React.FC<{ lab: Lab; onComplete: (s: number) => void }> = ({ lab, onComplete }) => {
    const [selected, setSelected] = useState<(number | null)[]>(Array(lab.quizOptions!.length).fill(null));
    const [submitted, setSubmitted] = useState(false);
    const c = COLOR[lab.color];

    const submit = () => {
        setSubmitted(true);
        const correct = selected.filter((s, i) => s === lab.quizAnswers![i]).length;
        const score = Math.round((correct / lab.quizAnswers!.length) * lab.points);
        if (score > 0) onComplete(score);
    };

    const QUESTIONS = [
        'What is CI/CD used for?', 'What is Docker?', 'Which kubectl command deploys?',
        'What is AWS S3?', 'Which service is serverless on AWS?', 'What does serverless mean?',
        'What is XSS?', 'Best defense against SQL Injection?', 'Why use hashing for passwords?',
        'What is a qubit?', 'What allows qubits to hold multiple states?', 'Which is a quantum computing SDK?',
        'What can a qubit be?', 'What enables multiple states?', 'Quantum SDK?',
    ];

    const getQ = (idx: number) => {
        if (lab.id === 'devops-1') return ['What is CI/CD used for?', 'What is Docker?', 'Which command applies a K8s manifest?'][idx];
        if (lab.id === 'cloud-1') return ['What is AWS S3?', 'Which AWS service is serverless compute?', 'What does serverless mean?'][idx];
        if (lab.id === 'cyber-1') return ['What is XSS?', 'Best defense against SQL Injection?', 'Why hash passwords?'][idx];
        if (lab.id === 'quantum-1') return ['What can a qubit be?', 'What is "quantum entanglement" most famous for?', 'Which is a quantum computing SDK?'][idx];
        return QUESTIONS[idx] || `Question ${idx + 1}`;
    };

    const passed = submitted ? selected.filter((s, i) => s === lab.quizAnswers![i]).length : 0;

    return (
        <div className="p-4 space-y-6">
            {lab.quizOptions!.map((opts, qi) => {
                const isCorrect = submitted && selected[qi] === lab.quizAnswers![qi];
                const isWrong = submitted && selected[qi] !== null && selected[qi] !== lab.quizAnswers![qi];
                return (
                    <div key={qi}>
                        <p className="text-[13px] font-black text-slate-800 mb-3">Q{qi + 1}. {getQ(qi)}</p>
                        <div className="space-y-2">
                            {opts.map((opt, oi) => {
                                const isSelected = selected[qi] === oi;
                                const isAnswer = submitted && oi === lab.quizAnswers![qi];
                                return (
                                    <button key={oi} disabled={submitted}
                                        onClick={() => setSelected(prev => { const n = [...prev]; n[qi] = oi; return n; })}
                                        className={`w-full text-left px-4 py-3 rounded-xl border-2 text-[12px] font-bold transition-all
                      ${isAnswer ? 'border-green-500 bg-green-50 text-green-800' :
                                                isSelected && isWrong ? 'border-red-400 bg-red-50 text-red-700' :
                                                    isSelected ? `border-current ${COLOR[lab.color].bg} ${COLOR[lab.color].text}` :
                                                        'border-slate-100 bg-white text-slate-600 hover:border-slate-300'}`}
                                    >
                                        {String.fromCharCode(65 + oi)}. {opt}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
            {!submitted ? (
                <button onClick={submit}
                    disabled={selected.includes(null)}
                    className={`w-full ${c.btn} text-white font-black py-4 rounded-2xl disabled:opacity-40 transition-all`}>
                    Submit Answers
                </button>
            ) : (
                <div className={`${passed === lab.quizAnswers!.length ? 'bg-green-500' : 'bg-blue-600'} text-white rounded-2xl p-4 text-center font-black`}>
                    {passed === lab.quizAnswers!.length
                        ? <><Trophy className="w-6 h-6 inline mr-2" />Perfect! +{lab.points} pts</>
                        : <>{passed}/{lab.quizAnswers!.length} correct · +{Math.round((passed / lab.quizAnswers!.length) * lab.points)} pts</>
                    }
                </div>
            )}
        </div>
    );
};

// ─── Code Lab (HTML + JS) ─────────────────────────────────────────────────────

const CodeLab: React.FC<{ lab: Lab; onComplete: (s: number) => void }> = ({ lab, onComplete }) => {
    const [code, setCode] = useState(lab.starterCode);
    const [results, setResults] = useState<boolean[]>([]);
    const [ran, setRan] = useState(false);
    const [previewHtml, setPreviewHtml] = useState('');
    const [previewKey, setPreviewKey] = useState(0);
    const c = COLOR[lab.color];

    const run = () => {
        const res = lab.checks.map(ch => { try { return ch.test(code); } catch { return false; } });
        setResults(res);
        setRan(true);
        if (lab.type === 'html') { setPreviewHtml(code); setPreviewKey(k => k + 1); }
        const score = Math.round((res.filter(Boolean).length / lab.checks.length) * lab.points);
        if (score > 0) onComplete(score);
    };

    const passed = results.filter(Boolean).length;

    return (
        <div className="flex flex-col md:flex-row h-full min-h-0">
            {/* Left: Editor */}
            <div className="flex flex-col md:w-1/2 min-h-0 border-r border-slate-100">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-800">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {lab.type === 'html' ? 'HTML/CSS Editor' : 'JavaScript Editor'}
                    </span>
                    <button onClick={() => { setCode(lab.starterCode); setResults([]); setRan(false); }}
                        className="text-[9px] font-black text-slate-400 flex items-center gap-1 uppercase hover:text-white">
                        <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                </div>
                <textarea value={code} onChange={e => setCode(e.target.value)}
                    className={`flex-1 bg-slate-900 ${c.editor} font-mono text-[12px] p-5 resize-none outline-none leading-relaxed w-full min-h-[220px] md:min-h-0`}
                    spellCheck={false} />
                <button onClick={run}
                    className={`shrink-0 w-full ${c.btn} text-white font-black py-3.5 flex items-center justify-center gap-2 text-sm`}>
                    {lab.type === 'html' ? <Play className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    Run & Check
                </button>
            </div>

            {/* Right: Preview + Results */}
            <div className="flex flex-col md:w-1/2 min-h-0">
                {/* Preview */}
                <div className="flex-1 min-h-[160px] flex flex-col border-b border-slate-100">
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-400" /><div className="w-2 h-2 rounded-full bg-amber-400" /><div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">
                            {lab.type === 'html' ? 'Live Preview' : 'Test Console'}
                        </span>
                    </div>
                    {lab.type === 'html' ? (
                        <iframe key={previewKey}
                            srcDoc={previewHtml || '<body style="display:flex;height:100%;align-items:center;justify-content:center;margin:0;font-family:sans-serif;font-size:11px;color:#94a3b8;font-weight:800;letter-spacing:0.1em;text-transform:uppercase">Run code to preview</body>'}
                            className="flex-1 w-full border-none bg-white" sandbox="allow-scripts" />
                    ) : (
                        <div className="flex-1 bg-slate-900 p-4 font-mono text-[11px] overflow-y-auto no-scrollbar">
                            {!ran ? <span className="text-slate-500">{'>'} Click "Run & Check" to see results</span>
                                : results.map((pass, i) => (
                                    <div key={i} className={`mb-1 ${pass ? 'text-green-400' : 'text-red-400'}`}>
                                        {pass ? '✔' : '✘'} {lab.checks[i].label}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                {/* Results */}
                <div className="shrink-0 bg-white p-4 space-y-1.5 max-h-52 overflow-y-auto no-scrollbar">
                    {!ran ? (
                        <p className="text-[11px] text-slate-300 font-black uppercase tracking-widest text-center py-3">Test results appear here ↑</p>
                    ) : (
                        <>
                            <div className="flex justify-between mb-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tests</span>
                                <span className={`font-black text-sm ${c.text}`}>{passed}/{lab.checks.length}</span>
                            </div>
                            {lab.checks.map((ch, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    {results[i] ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                                    <span className={`text-[11px] font-bold ${results[i] ? 'text-slate-700' : 'text-slate-400'}`}>{ch.label}</span>
                                </div>
                            ))}
                            {passed === lab.checks.length && (
                                <div className="mt-2 bg-green-500 text-white rounded-xl p-3 text-center font-black text-sm flex items-center justify-center gap-2">
                                    <Trophy className="w-4 h-4" /> Perfect! +{lab.points} pts
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Simulation Lab ────────────────────────────────────────────────────────

const SimulationLab: React.FC<{ lab: Lab; onComplete: (s: number) => void }> = ({ lab, onComplete }) => {
    const [state, setState] = useState<Record<string, any>>({});
    const [submitted, setSubmitted] = useState(false);
    const [results, setResults] = useState<boolean[]>([]);
    const c = COLOR[lab.color];

    const handleSubmit = () => {
        setSubmitted(true);
        const jsonState = JSON.stringify(state);
        const res = lab.checks.map(ch => { try { return ch.test(jsonState); } catch { return false; } });
        setResults(res);
        const score = Math.round((res.filter(Boolean).length / lab.checks.length) * lab.points);
        if (score > 0) onComplete(score);
    };

    const isS3 = lab.simType === 'aws_s3';
    const isFirewall = lab.simType === 'firewall';

    return (
        <div className="flex flex-col md:flex-row h-full min-h-0 bg-slate-50">
            <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 max-w-xl mx-auto">
                    <h3 className="text-2xl font-black text-slate-800 mb-2">{isS3 ? 'Amazon S3 Console' : 'Firewall Control Panel'}</h3>
                    <p className="text-[12px] text-slate-500 font-bold mb-8">Follow the requirements to secure the environment.</p>

                    {isS3 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Bucket Name</label>
                                <input type="text" value={state.bucketName || ''} onChange={e => setState({ ...state, bucketName: e.target.value })} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:border-cyan-400 outline-none transition-all font-mono text-sm" placeholder="my-secure-bucket" />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 bg-slate-50">
                                <div>
                                    <p className="font-bold text-[14px] text-slate-800">Block all public access</p>
                                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">Recommended: Turning this off makes bucket public</p>
                                </div>
                                <button onClick={() => setState({ ...state, blockPublicAccess: !state.blockPublicAccess })} className={`w-12 h-6 shrink-0 rounded-full transition-colors relative focus:outline-none ${state.blockPublicAccess ? 'bg-cyan-500' : 'bg-slate-300'}`}>
                                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${state.blockPublicAccess ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 bg-slate-50">
                                <div>
                                    <p className="font-bold text-[14px] text-slate-800">Bucket Versioning</p>
                                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">Keep multiple versions of an object format</p>
                                </div>
                                <button onClick={() => setState({ ...state, versioning: !state.versioning })} className={`w-12 h-6 shrink-0 rounded-full transition-colors relative focus:outline-none ${state.versioning ? 'bg-cyan-500' : 'bg-slate-300'}`}>
                                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${state.versioning ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    )}

                    {isFirewall && (
                        <div className="space-y-4">
                            {['port22', 'port80', 'port443'].map(port => {
                                const portName = port === 'port22' ? 'Port 22 (SSH)' : port === 'port80' ? 'Port 80 (HTTP)' : 'Port 443 (HTTPS)';
                                return (
                                    <div key={port} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center font-mono text-[10px] font-black text-slate-500">{port.replace('port', '')}</div>
                                            <p className="font-black text-[13px] text-slate-800">{portName}</p>
                                        </div>
                                        <div className="flex bg-slate-200 rounded-xl p-1 shrink-0">
                                            <button onClick={() => setState({ ...state, [port]: 'allow' })} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all focus:outline-none ${state[port] === 'allow' ? 'bg-white shadow-sm text-green-600' : 'text-slate-500 hover:text-slate-700'}`}>Allow</button>
                                            <button onClick={() => setState({ ...state, [port]: 'deny' })} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all focus:outline-none ${state[port] === 'deny' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500 hover:text-slate-700'}`}>Deny</button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    <button onClick={handleSubmit} className={`mt-8 w-full ${c.btn} text-white font-black py-4 rounded-2xl transition-all active:scale-95 focus:outline-none`}>
                        Apply Configuration
                    </button>
                </div>
            </div>

            {submitted && (
                <div className="md:w-80 bg-white border-l border-slate-100 flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verification Check</h4>
                    </div>
                    <div className="flex-1 p-6 space-y-4 overflow-y-auto no-scrollbar">
                        {lab.checks.map((ch, i) => (
                            <div key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl">
                                {results[i] ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
                                <span className={`text-[12px] font-bold leading-tight ${results[i] ? 'text-slate-700' : 'text-slate-500'}`}>{ch.label}</span>
                            </div>
                        ))}
                    </div>
                    {results.every(Boolean) && (
                        <div className="shrink-0 p-6 border-t border-slate-100 bg-green-50">
                            <div className="bg-green-500 text-white rounded-2xl p-4 text-center font-black flex flex-col items-center justify-center gap-1 shadow-sm">
                                <Trophy className="w-6 h-6 mb-1" />
                                <span>Perfect! Module Passed</span>
                                <span className="text-[10px] uppercase text-green-100">+{lab.points} XP added</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Category grouping ────────────────────────────────────────────────────────

const CATEGORIES = ['Web', 'Mobile', 'Infrastructure', 'AI', 'Security', 'Web3', 'Finance', 'Engineering', 'Science', 'Design', 'Creative'];

// ─── Main Labs Section ────────────────────────────────────────────────────────

const LabsSection: React.FC = () => {
    const [activeLab, setActiveLab] = useState<string | null>(null);
    const [scores, setScores] = useState<Record<string, number>>(getScores());
    const [filter, setFilter] = useState('All');

    // Fetch cloud scores on mount
    useEffect(() => {
        syncScoresFromCloud(setScores);
    }, []);

    const totalPoints = Object.values(scores).reduce((a, b) => a + b, 0);
    const maxPoints = LABS.reduce((a, l) => a + l.points, 0);

    const handleComplete = (id: string, score: number) => {
        saveScore(id, score);
        // Force state update natively
        setScores(prev => ({ ...prev, [id]: Math.max(prev[id] || 0, score) }));
    };

    const selectedLab = activeLab ? LABS.find(l => l.id === activeLab) : null;

    if (selectedLab) {
        const c = COLOR[selectedLab.color];
        return (
            <div className="flex flex-col h-full bg-white">
                <div className="shrink-0 px-5 py-3 border-b border-slate-100 flex items-center gap-3">
                    <button onClick={() => setActiveLab(null)}
                        className="flex items-center gap-1 text-slate-400 font-black text-[9px] uppercase tracking-widest hover:text-slate-700">
                        <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Labs
                    </button>
                    <span className="text-slate-200">/</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${c.badge}`}>
                        {selectedLab.emoji} {selectedLab.domain}
                    </span>
                    <div className="flex-1 min-w-0">
                        <h2 className="font-black text-slate-900 text-[15px] truncate">{selectedLab.title}</h2>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black ${c.bg} ${c.text}`}>
                        <Star className="w-3 h-3" /> {selectedLab.points}pts
                    </span>
                </div>
                <div className="shrink-0 px-5 py-2 bg-slate-50 border-b border-slate-100">
                    <p className="text-[11px] text-slate-500 font-medium">{selectedLab.description}</p>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                    {selectedLab.type === 'quiz' ? (
                        <div className="h-full overflow-y-auto no-scrollbar"><QuizLab lab={selectedLab} onComplete={s => handleComplete(selectedLab.id, s)} /></div>
                    ) : selectedLab.type === 'simulation' ? (
                        <div className="h-full overflow-hidden"><SimulationLab lab={selectedLab} onComplete={s => handleComplete(selectedLab.id, s)} /></div>
                    ) : (
                        <CodeLab lab={selectedLab} onComplete={s => handleComplete(selectedLab.id, s)} />
                    )}
                </div>
            </div>
        );
    }

    const filtered = filter === 'All' ? LABS : LABS.filter(l => l.category === filter);

    return (
        <div className="p-5 pb-28 overflow-y-auto h-full no-scrollbar">
            <header className="mb-6">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Labs</h1>
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">{LABS.length} Challenges · All Domains</p>
            </header>

            {/* Score Card */}
            <div className="bg-slate-900 text-white p-5 rounded-[2rem] mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-16 -mt-16 rounded-full" />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Score</p>
                <div className="flex items-end gap-2 mb-3">
                    <span className="text-4xl font-black">{totalPoints}</span>
                    <span className="text-slate-500 font-black text-base mb-0.5">/ {maxPoints} pts</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0}%` }} />
                </div>
                <p className="text-[9px] font-black text-slate-500 mt-1.5 uppercase tracking-widest">
                    {LABS.filter(l => scores[l.id]).length}/{LABS.length} completed
                </p>
            </div>

            {/* Filter pills */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-5">
                {['All', ...CATEGORIES].map(cat => (
                    <button key={cat} onClick={() => setFilter(cat)}
                        className={`shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all
              ${filter === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* Lab Cards */}
            <div className="space-y-3">
                {filtered.map(lab => {
                    const c = COLOR[lab.color];
                    const labScore = scores[lab.id] || 0;
                    const isDone = labScore >= lab.points;
                    return (
                        <button key={lab.id} onClick={() => setActiveLab(lab.id)}
                            className="w-full bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all text-left group">
                            <div className={`w-12 h-12 ${c.bg} rounded-2xl flex items-center justify-center text-xl shrink-0`}>
                                {isDone ? '✅' : lab.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest mb-1 ${c.badge}`}>
                                    {lab.domain}
                                </div>
                                <h3 className="font-black text-slate-900 text-[14px] leading-tight truncate">{lab.title}</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5">{lab.difficulty} · {lab.points} pts</p>
                                {labScore > 0 && (
                                    <div className="mt-1.5 h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-400 rounded-full" style={{ width: `${(labScore / lab.points) * 100}%` }} />
                                    </div>
                                )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-200 shrink-0 group-active:translate-x-1 transition-transform" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default LabsSection;
