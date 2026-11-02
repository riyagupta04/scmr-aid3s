const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const fallbackSettings = {
  name: 'International Conference on Artificial Intelligence in Design, Diagnostics and Decision Systems',
  shortName: 'AID3S',
  tagline: 'AID3S - 2027',
  startDate: '2027-02-26',
  endDate: '2027-02-28',
  venue: 'Centro Escolar University, Manila',
  city: 'Manila, Philippines',
  organizer: 'Centro Escolar University, Manila and SPJ Centre for Multidisciplinary Research (SCMR)',
  email: 'secretary@scmrglobal.org',
  submissionOpen: true,
  highlights:
    'Natural Language Processing\nAutonomous Systems\nDeep Learning\nGenerative AI\nIntelligent Optimization\nComputer Vision',
  about:
    'AID3S is jointly organized by Centro Escolar University, Manila, Philippines and SPJ Centre for Multidisciplinary Research (SCMR) in Centro Escolar University, Manila from 26 to 28 February, 2027.\nArtificial Intelligence (AI) and Machine Learning (ML) are transforming the way complex problems are designed, analyzed, diagnosed and solved across computing, engineering, healthcare and industrial applications. Advances in deep learning, generative AI, intelligent optimization, computer vision, natural language processing and autonomous systems are creating new opportunities for innovation across multiple domains.\nThe International Conference on Artificial Intelligence in Design, Diagnostics and Decision Systems (AID3S 2027) aims to provide an international platform for researchers, academicians, industry professionals and practitioners to present and discuss recent advances in AI methodologies and their applications in computing, biomedical engineering, core engineering disciplines and emerging technologies.\nThe conference invites original research contributions addressing theoretical foundations, novel algorithms, computational methods, intelligent systems and real-world applications of AI and ML. Particular emphasis will be placed on the integration of AI into engineering design, intelligent diagnostics, predictive modelling, optimization, decision support and autonomous systems.',
  objectives:
    'To promote research in AI, ML and advanced intelligent computing.\nTo encourage the application of AI methods to complex engineering and biomedical problems.\nTo facilitate interdisciplinary collaboration among researchers in computing, engineering, healthcare and applied sciences.\nTo explore trustworthy, explainable, responsible and deployable AI systems.\nTo foster collaboration between academia, research institutions and industry.',
  publication:
    "The conference organizers intend to explore suitable publication opportunities for selected papers, subject to the scope, quality requirements and independent acceptance procedures of the relevant publisher or proceedings series.\nPublication in **Springer proceedings** or any other publisher's series is **not guaranteed**. Details will be announced only after the relevant publication arrangements have been formally confirmed.",
  participate:
    'Researchers, faculty members, scientists, doctoral scholars, postgraduate students, industry professionals and practitioners working in AI, ML, Computer Science, biomedical engineering and other engineering disciplines are invited to participate.\nWe welcome interdisciplinary contributions that demonstrate how AI and ML can advance design, diagnostics, prediction, optimization and decision-making in real-world systems.\nJoin AID3S 2027 to share research, exchange ideas and advance intelligent solutions across computing, engineering and applied sciences.',
  footerAbout:
    'Artificial Intelligence in Design, Diagnostics and Decision Systems — bringing together researchers, academicians and industry professionals to advance intelligent solutions.',
  guidelines:
    'Papers must be original, unpublished work and must not be under review elsewhere.\nSubmit your paper as a PDF of at most 10 MB.\nAt least one author of every accepted paper must present the work.',
  feeInPersonRegular: 500,
  feeInPersonShort: 200,
  feeInPersonParticipant: 400,
  feeInPersonStudent: 300,
  feeOnlineRegular: 250,
};

const fallbackDates = [
  { _id: 'd1', label: 'Paper Submission Opens', order: 1, date: '2026-10-15' },
  { _id: 'd2', label: 'Full Paper Submission Deadline', order: 2, date: '2026-12-30' },
  { _id: 'd3', label: 'Notification of Acceptance', order: 3, date: '2027-01-20' },
  { _id: 'd4', label: 'Camera-Ready Paper Submission', order: 4, date: '2027-02-05' },
  { _id: 'd5', label: 'Conference Dates', order: 5, date: '2027-02-26' },
];

let fallbackMembers = [];
try {
  const rawMembers = require('../shared/members.json');
  fallbackMembers = rawMembers.map((m, idx) => ({ _id: `m_${idx + 1}`, ...m }));
} catch (e) {
  fallbackMembers = [];
}

let fallbackTracks = [];
try {
  const rawTracks = require('../shared/tracks.json');
  fallbackTracks = rawTracks.map((t, idx) => ({ _id: `t_${idx + 1}`, ...t }));
} catch (e) {
  fallbackTracks = [];
}

const defaults = {
  settings: fallbackSettings,
  dates: fallbackDates,
  tracks: fallbackTracks,
  members: fallbackMembers,
  submissions: [],
  messages: [],
};

function getFilePath(key) {
  return path.join(dataDir, `${key}.json`);
}

function getData(key) {
  const file = getFilePath(key);
  try {
    if (fs.existsSync(file)) {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (Array.isArray(defaults[key]) && Array.isArray(parsed)) return parsed;
      if (!Array.isArray(defaults[key]) && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.error(`Error reading ${key}.json:`, e.message);
  }
  const initial = defaults[key] || [];
  setData(key, initial);
  return initial;
}

function setData(key, data) {
  const file = getFilePath(key);
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`Error writing ${key}.json:`, e.message);
  }
}

function addItem(key, item) {
  const list = getData(key);
  if (!Array.isArray(list)) return item;
  const newItem = {
    _id: `loc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ...item,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  list.unshift(newItem);
  setData(key, list);
  return newItem;
}

function updateItem(key, id, patch) {
  const list = getData(key);
  if (!Array.isArray(list)) return null;
  const idx = list.findIndex((x) => String(x._id) === String(id));
  if (idx < 0) return null;
  list[idx] = {
    ...list[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  setData(key, list);
  return list[idx];
}

function deleteItem(key, id) {
  const list = getData(key);
  if (!Array.isArray(list)) return false;
  const filtered = list.filter((x) => String(x._id) !== String(id));
  if (filtered.length === list.length) return false;
  setData(key, filtered);
  return true;
}

module.exports = {
  fallbackSettings,
  fallbackDates,
  fallbackTracks,
  fallbackMembers,
  getData,
  setData,
  addItem,
  updateItem,
  deleteItem,
};

