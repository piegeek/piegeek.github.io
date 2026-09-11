/* ------------------------------------------------------------------
   Site content. Everything the page renders lives here — edit this
   file, not the markup.
   ------------------------------------------------------------------ */

const IMG = {
  // RISC-V — Project 3, branch predictor results
  bp1: '/assets/Screenshot_2026-05-04_at_4.16.38%20PM-9nn75gZe.png',
  bp2: '/assets/Screenshot_2026-05-04_at_4.17.09%20PM-CKqY-XmR.png',
  bp3: '/assets/Screenshot_2026-05-04_at_4.17.29%20PM-F5Fh-fEq.png',

  // RISC-V — Project 4, cache simulator results
  cache1: '/assets/Screenshot_2026-05-04_at_4.23.23%20PM-BlXCgK54.png',
  cache2: '/assets/Screenshot_2026-05-04_at_4.23.41%20PM-CqDEbrZ5.png',
  cache3: '/assets/Screenshot_2026-05-04_at_4.23.59%20PM-D5KwNBW5.png',
  cache4: '/assets/Screenshot_2026-05-04_at_4.24.17%20PM-oOabJWA3.png',

  // POLL
  poll1: '/assets/Screenshot_2026-05-04_at_3.58.00%20PM-ZGgA-gPL.png',
  poll2: '/assets/Screenshot_2026-05-04_at_3.58.24%20PM-Tn-85G6L.png',

  // Cloud Alarm
  alarm1: '/assets/Simulator_Screen_Shot_-_iPhone_11_Pro_Max_-_2020-08-04_at_00.36.45-B379k6Ay.png',
  alarm2: '/assets/Simulator_Screen_Shot_-_iPhone_11_Pro_Max_-_2020-08-04_at_00.37.35-CMA-la8A.png',
  alarm3: '/assets/Simulator_Screen_Shot_-_iPhone_11_Pro_Max_-_2020-08-04_at_00.37.39-LdQWEgEa.png',
  alarm4: '/assets/Simulator_Screen_Shot_-_iPhone_11_Pro_Max_-_2020-08-04_at_00.37.41-DZBDI07R.png',
};

/* ------------------------------------------------------------------
   PROFILE
   ------------------------------------------------------------------
   NOTE: linkedin.com/in/piegeek could not be read programmatically —
   LinkedIn serves an auth wall (HTTP 999) to every request that is not
   a logged-in browser session, so nothing here was scraped from it.
   The fields below are drawn from this repo (the previous site and the
   project write-ups). Overwrite `headline`, `location`, `current` and
   `about` with the real copy from your LinkedIn profile.
   ------------------------------------------------------------------ */
const PROFILE = {
  name: 'Sang Yeop Han',
  photo: '/assets/profile_img.jpg',
  photoFull: '/assets/profile_img_full_body.jpg',   // shown on avatar hover
  headline: 'BS, Electrical & Computer Engineering, Seoul National University',
  location: '',                 // e.g. 'Seoul, South Korea'
  current: '',                  // e.g. 'Software Engineer @ …'
  // education: 'Seoul National University — Electrical & Computer Engineering',
  focus: 'Frontier LLM research and development',
  employment: 'SNDWorks',
  employmentUrl: 'https://sndworks.ai',
  employmentLogo: '/assets/sndworks-favicon.png',
  email: 'piegeek@snu.ac.kr',
  about:
    'Builds across the stack and down to the metal — from RISC-V CPUs and ' +
    'branch predictors in Verilog, through a relational DBMS written from ' +
    'scratch in Java, to shipped React Native and blockchain applications.',
  skills: [
    'Verilog', 'C++', 'Java', 'Python', 'JavaScript',
    'React Native', 'Node.js', 'Solidity', 'MongoDB', 'AWS Lambda',
    'UI/UX Design',
  ],
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/piegeek/' },
    { label: 'GitHub', href: 'https://github.com/piegeek' },
    { label: 'Email', href: 'mailto:piegeek@snu.ac.kr' },
  ],
};

const STATS = [
  { value: '4', label: 'Projects' },
  { value: '2019–2026', label: 'Span' },
  { value: '11', label: 'Technologies' },
  { value: '~1,500', label: 'App downloads' },
];

/* First year shown on the timeline. Projects are filed under the year
   they started; years in between with nothing in them still get a row. */
const TIMELINE_START = 2019;

/* ------------------------------------------------------------------
   ALGORITHMS
   The "Algorithms" section — write-ups that aren't projects. Entries
   stack in order; add another object to add another write-up.

   `diagram: 'greedy'` mounts the interactive block diagram inline;
   its copy lives in /greedy-key-strategy/strategy.json.
   ------------------------------------------------------------------ */
const ALGORITHMS = [
  {
    id: 'greedy-key',
    title: 'Greedy Key Strategy',
    kind: 'Framework',
    timeline: '2026 – ongoing',
    // Attribution: shown as the byline, and appended to text copied from
    // this entry. Author defaults to PROFILE.name.
    published: '2026-09-11',
    url: 'https://piegeek.github.io/#algorithms',
    license: {
      name: 'CC BY-NC-ND 4.0',
      href: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
    },
    blurb:
      'Identify the key, read the output shape, then follow one of four ' +
      'rows to the greedy algorithm strategy',
    // Where the design came from — adapted from the prompt that started
    // it. Rendered as the "Motivation" block above the diagram.
    motivation: [
      {
        heading: 'Two kinds of DP',
        paras: [
          'For optimization problems I work with two DP shapes. Exploration DP builds a permutation; decision DP builds a subset.',
        ],
        code: [
          {
            label: 'Exploration DP — builds a permutation',
            src: [
              'for i in range(n):',
              '    if not (visited & (1 << i)):',
              '        visited |= (1 << i)',
              '        ret = max(ret, cost[i] + dp(i, visited))',
              '        visited &= ~(1 << i)',
              'return ret',
            ].join('\n'),
          },
          {
            label: 'Decision DP — builds a subset',
            src: [
              '# Skip',
              'ret = dp(idx + 1, C)',
              '# Take',
              'ret = max(ret, cost[idx] + dp(idx + 1, C + cap[idx]))',
              'return ret',
            ].join('\n'),
          },
        ],
      },
      {
        heading: 'Two kinds of greedy',
        paras: [
          'Greedy algorithms are a special case of DP: in optimization problems, the DP frontier collapses to 1. So the same split carries over. Exploration greedy builds a permutation greedily; decision greedy builds a subset greedily.',
          "The keyword is \u201cgreedily\u201d. Either way, I need a greedy key to build the answer by.",
        ],
      },
      {
        heading: 'Where the textbook method stops',
        paras: [
          'The traditional method has two steps: verify the greedy property with the exchange argument, then verify that optimal substructure holds. Its limitation is that it only applies once you have found the key, and the key is not easy to find.',
          "I tried inferring the key structurally \u2014 write the DP solution first, then derive something from the feasibility requirements or the code structure. That is logically impossible. The greedy key can't be extracted by looking at the DP solution's code; it can't be derived syntactically from a DP formulation.",
        ],
      },
      {
        heading: 'What I had so far',
        paras: [
          'For exploration greedy, since I am building a permutation, the question in my head was: against which property is delaying an item most costly? Common answers are most constrained, most frequent, earliest deadline. Then I pick a data structure that fits the problem\u2019s conditions (usually a stack or a queue), walk the input, and greedily add items or remove them with a feasibility check. But how exactly to add them greedily still needed a rule I didn\u2019t have.',
          'Decision greedy was a bit more structured. The matroid approach sorts the inputs by some key and adds each one if it passes the independence check. Where the matroid property can\u2019t be used, I check whether feasibility depends on a single variable, and if so, derive the key from that. Still, there was no golden rule that solved every problem this way.',
        ],
      },
      {
        heading: 'Why build a framework',
        paras: [
          'It felt like I had to memorise every type of question: whether I could solve a greedy problem depended on whether I had seen a similar one. Coming up with a DP solution is more straightforward than that.',
          'Asking an LLM didn\u2019t fix it. It has seen so many coding problems that it recalls the greedy key without the intuition behind it. I wanted a golden standard for deriving keys that I could build on, not a list of problem types and their solutions.',
        ],
      },
      {
        heading: 'Where it went',
        paras: [
          'The permutation/subset split didn\u2019t survive enough problems intact. Pairing and assignment problems needed rows of their own, and several problems that look like permutations \u2014 Prim\u2019s, Huffman, meeting rooms, deadline scheduling \u2014 turned out to be subsets. The diagram below is where it ended up.',
        ],
      },
    ],
    tags: ['Greedy', 'Matroids', 'Lagrangian duality', 'Proof strategy'],
    diagram: 'greedy',
  },
];

/* ------------------------------------------------------------------
   PROJECTS
   Order here is the order on the dashboard; all cards render the
   same size.
   ------------------------------------------------------------------ */
const PROJECTS = [
  {
    id: 'riscv',
    title: 'RISC-V CPU and Hardware Design Using Verilog',
    short: 'RISC-V CPU Design',
    timeline: 'Mar 2025 – Jun 2025',
    year: '2025',
    type: 'Course Project',
    role: 'Individual (100%)',
    preview: IMG.bp1,
    description: [
      'Designed and implemented RISC-V 32I CPU architectures using Verilog',
      'Project 1: Built a Single-Cycle CPU and defined instruction execution flow',
      'Project 2: Developed a 5-stage pipelined CPU with data and control hazard handling logic',
      'Project 3: Designed and integrated G-Share and Perceptron-based branch predictors into the pipeline',
      'Project 4: Implemented a multi-level cache simulator in C++ to analyze cache performance across architectures',
    ],
    performance: [
      {
        title: 'Performance Improvements (Project 3)',
        metrics: [
          'G-Share Branch Predictor: 19.9% speedup improvement',
          'Perceptron Branch Predictor: 21.2% speedup improvement',
        ],
      },
      {
        title: 'Cache Optimization Results (Project 4)',
        metrics: [
          '8-way set associative cache achieved ~2% higher L1 hit rate compared to direct-mapped cache',
          '(95.1% → 97.1%)',
        ],
      },
    ],
    techStack: ['Verilog', 'C++'],
    // Grouped so each sub-project's charts read as one set instead of a
    // stack of full-width images.
    galleries: [
      {
        title: 'Project 3 — Branch predictor results',
        images: [IMG.bp1, IMG.bp2, IMG.bp3],
      },
      {
        title: 'Project 4 — Cache simulator results',
        images: [IMG.cache1, IMG.cache2, IMG.cache3, IMG.cache4],
      },
    ],
  },

  {
    id: 'poll',
    title: "Ethereum-based Survey Application 'POLL'",
    short: 'POLL',
    timeline: 'Mar 2021 – Jun 2021',
    year: '2021',
    type: 'Course Project (SNU Global Education Center for Engineers)',
    role: 'Team (Contribution: 70%)',
    preview: IMG.poll1,
    description: [
      'Designed a blockchain-based survey system to address the lack of incentive mechanisms in traditional survey platforms',
      'Implemented a smart contract architecture that rewards users with ERC20 tokens upon survey participation',
      'Led UI/UX design and frontend development, while coordinating overall project execution',
      'Built an end-to-end workflow: user input → blockchain transaction → token reward → result visualization',
    ],
    techStack: ['HTML/CSS', 'Vanilla JS', 'Solidity'],
    galleries: [{ title: 'Interface', images: [IMG.poll1, IMG.poll2] }],
    cta: {
      label: 'View presentation',
      href: 'https://gece.snu.ac.kr/gecexe/index.php?mid=gece_lms&document_srl=59232',
    },
  },

  {
    id: 'dbms',
    title: 'DBMS from scratch',
    short: 'DBMS from scratch',
    timeline: 'Mar 2020 – Jun 2020',
    year: '2020',
    type: 'Course Project',
    role: 'Individual (100%)',
    // No screenshot exists for this one — the card renders a code preview.
    previewCode: [
      'CREATE TABLE users (',
      "  id   INT NOT NULL,",
      '  name CHAR(50),',
      '  PRIMARY KEY (id)',
      ');',
      '',
      "DELETE FROM users WHERE id = 1;",
      '  -> soft delete: value := ^@',
    ].join('\n'),
    description: [
      'Built a functional relational DBMS from scratch by integrating a hand-written SQL parser with Berkeley DB as the persistent storage backend',
      'System accepts SQL input from stdin, parses it via a JavaCC grammar, and executes each statement against an embedded key-value store on disk',
      "Implements a 'Soft Delete' strategy",
      'Supports ACID transactions',
    ],
    techStack: ['Java', 'JavaCC', 'Berkeley DB'],
    simulator: true,
  },

  {
    id: 'cloudalarm',
    title: "Course Registration Notification App 'Cloud Alarm'",
    short: 'Cloud Alarm',
    timeline: 'Dec 2019 – Feb 2020',
    year: '2020',
    type: 'Personal Project',
    role: 'Individual (100%)',
    preview: IMG.alarm1,
    description: [
      'Developed a real-time notification service to address inefficiencies in monitoring course seat availability during high-demand registration periods',
      'Implemented a web scraping system to track seat availability and trigger push notifications upon changes',
      'Designed an event-driven, serverless architecture using AWS Lambda for scalable and efficient data polling',
      'Built a full-stack application, covering frontend (React Native), backend (Node.js), and database (MongoDB)',
      'Deployed, operated, and maintained the service, ensuring stable performance',
    ],
    achievements: ['Achieved approximately 1,500 cumulative downloads'],
    techStack: ['Python', 'Node.js', 'React Native', 'MongoDB', 'AWS Lambda'],
    galleries: [
      {
        title: 'App screens',
        tall: true,
        images: [IMG.alarm1, IMG.alarm2, IMG.alarm3, IMG.alarm4],
      },
    ],
  },
];
