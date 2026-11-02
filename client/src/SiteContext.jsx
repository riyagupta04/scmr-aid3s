import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

export const defaults = {
  name: 'International Conference on Artificial Intelligence in Design, Diagnostics and Decision Systems',
  shortName: 'AID3S',
  tagline: 'AID3S - 2027',
  startDate: '2027-02-26',
  endDate: '2027-02-28',
  venue: 'Centro Escolar University, Manila',
  city: 'Manila, Philippines',
  organizer: '',
  email: '',
  submissionOpen: true,
  highlights:
    'Natural Language Processing\nAutonomous Systems\nDeep Learning\nGenerative AI\nIntelligent Optimization\nComputer Vision',
  about:
    'AID3S is jointly organized by Centro Escolar University, Manila, Philippines and SPJ Centre for Multidisciplinary Research (SCMR) in Centro Escolar University, Manila from 26 to 28 February, 2027.\nArtificial Intelligence (AI) and Machine Learning (ML) are transforming the way complex problems are designed, analyzed, diagnosed and solved across computing, engineering, healthcare and industrial applications. Advances in deep learning, generative AI, intelligent optimization, computer vision, natural language processing and autonomous systems are creating new opportunities for innovation across multiple domains.\nThe International Conference on Artificial Intelligence in Design, Diagnostics and Decision Systems (AID3S 2027) aims to provide an international platform for researchers, academicians, industry professionals and practitioners to present and discuss recent advances in AI methodologies and their applications in computing, biomedical engineering, core engineering disciplines and emerging technologies.\nThe conference invites original research contributions addressing theoretical foundations, novel algorithms, computational methods, intelligent systems and real-world applications of AI and ML. Particular emphasis will be placed on the integration of AI into engineering design, intelligent diagnostics, predictive modelling, optimization, decision support and autonomous systems.',
  objectives:
    'To promote research in AI, ML and advanced intelligent computing.\nTo encourage the application of AI methods to complex engineering and biomedical problems.\nTo facilitate interdisciplinary collaboration among researchers in computing, engineering, healthcare and applied sciences.\nTo explore trustworthy, explainable, responsible and deployable AI systems.\nTo foster collaboration between academia, research institutions and industry.',
  publication: '',
  participate: '',
  footerAbout: '',
  guidelines: '',
  feeInPersonRegular: 500,
  feeInPersonShort: 200,
  feeInPersonParticipant: 400,
  feeInPersonStudent: 300,
  feeOnlineRegular: 250,
};

const Ctx = createContext({ ...defaults, reload: () => {} });
const year = (d) => (d ? new Date(d).getUTCFullYear() : '');
const titleText = (site) => {
  if (site.tagline) return site.tagline;
  if (site.shortName) return `${site.shortName}${site.startDate ? ` - ${year(site.startDate)}` : ''}`;
  return site.name;
};
export const useSite = () => useContext(Ctx);

export function SiteProvider({ children }) {
  const [site, setSite] = useState(defaults);

  const reload = useCallback(
    () =>
      api('/settings')
        .then((d) => setSite({ ...defaults, ...d }))
        .catch(() => {}),
    []
  );

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    const docTitle = titleText(site);
    document.title = site.shortName || site.tagline ? `${docTitle} | International Conference` : site.name;
  }, [site.name, site.shortName, site.startDate, site.tagline]);

  return <Ctx.Provider value={{ ...site, reload }}>{children}</Ctx.Provider>;
}
