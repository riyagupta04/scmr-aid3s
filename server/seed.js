// Creates the admin account and fills the site with PLACEHOLDER content.
// Usage: npm run seed          (only fills empty collections, keeps your edits)
//        npm run seed:reset    (wipes content collections and re-seeds)
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const m = require('./models');

const reset = process.argv.includes('--reset');
const refreshTracks = process.argv.includes('--refresh-tracks');
const legacyTrackTitles = {
  1: 'Artificial Intelligence, Machine Learning and Advanced Computing',
  2: 'AI for Engineering Design and Optimization',
  3: 'AI for Diagnostics and Healthcare',
  4: 'AI in Mechanical and Industrial Engineering',
  5: 'AI in Civil and Environmental Engineering',
  6: 'AI in Electrical Engineering and Communications',
  7: 'Emerging Applications of AI',
};
const legacyTopicTracks = [
  'Deep Learning',
  'Generative AI',
  'Intelligent Optimization',
  'Computer Vision',
  'Natural Language Processing',
  'Autonomous Systems',
];

const settings = {
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
};

const day = (d) => new Date(d + 'T00:00:00.000Z');

// NOTE: the track list and committee names were not visible on the reference page, so these are
// editable placeholders based on the topics named in the conference description.
const content = {
  ImportantDate: [
    { label: 'Paper Submission Opens', order: 1 },
    { label: 'Full Paper Submission Deadline', order: 2 },
    { label: 'Notification of Acceptance', order: 3 },
    { label: 'Camera-Ready Paper Submission', order: 4 },
    { label: 'Conference Dates', order: 5 },
  ],
  Track: require('../shared/tracks.json'),
  Member: require('../shared/members.json'),
};

(async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'ChangeThisPassword123';
  const existing = await m.Admin.findOne({ email });
  if (!existing) {
    await m.Admin.create({ email, passwordHash: await bcrypt.hash(password, 12) });
    console.log(`Admin created: ${email}`);
  } else {
    console.log(`Admin already exists: ${email}`);
  }

  if (reset) {
    await Promise.all([m.Setting.deleteMany({}), ...Object.keys(content).map((k) => m[k].deleteMany({}))]);
    console.log('Existing content cleared');
  }

  if (!(await m.Setting.findOne({ key: 'site' }))) {
    await m.Setting.create({ key: 'site', data: settings });
    console.log('Settings seeded');
  }

  for (const [name, rows] of Object.entries(content)) {
    if ((await m[name].countDocuments()) === 0) {
      await m[name].insertMany(rows);
      console.log(`${name}: ${rows.length} placeholder rows added`);
    }
  }

  if (refreshTracks) {
    const existingTracks = await m.Track.find().lean();
    const isLegacyTopicSet =
      existingTracks.length === legacyTopicTracks.length &&
      existingTracks.every((track) => legacyTopicTracks.includes(track.title) && !(track.topics || []).length);

    if (!existingTracks.length || isLegacyTopicSet) {
      if (isLegacyTopicSet) {
        await m.Track.deleteMany({ _id: { $in: existingTracks.map((track) => track._id) } });
      }
      await m.Track.insertMany(content.Track);
      console.log(`Default tracks refreshed: ${content.Track.length} tracks`);
    } else {
      for (const track of content.Track) {
        const result = await m.Track.updateOne(
          { order: track.order, title: legacyTrackTitles[track.order] },
          { $set: { title: track.title, shortTitle: track.shortTitle, topics: track.topics } }
        );
        if (result.matchedCount) console.log(`Track ${track.order} refreshed`);
        else console.log(`Track ${track.order} unchanged (not a matching default track)`);
      }
    }
  }

  await mongoose.disconnect();
  console.log('Done');
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
