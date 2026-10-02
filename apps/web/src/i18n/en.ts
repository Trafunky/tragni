import type { Dictionary } from "./de";

const en: Dictionary = {
  meta: {
    siteName: "Stephan Tragni",
    homeTitle: "Stephan Tragni — a platform being built in the open",
    homeDescription:
      "A platform being built in the open, and you can watch it happen: requirements, architecture, code and deployment are all on record.",
    aboutTitle: "About — Stephan Tragni",
    aboutDescription:
      "Application analyst between the business and the system. From the shop floor through work scheduling into IT.",
  },

  identity: {
    name: "Stephan Tragni",
    role: "Application Analyst",
    degree: "Dipl. Informatiker HF, Professional Bachelor",
    portraitAlt: "Illustrated portrait of Stephan Tragni",
  },

  nav: {
    home: "Start",
    about: "About",
    languageLabel: "Language",
    menuLabel: "Main navigation",
  },

  home: {
    title: "A platform being built in the open — and you can watch it happen.",
    lede: "This site is not a business card. It is the project itself: requirements, architecture, code, server and deployment take shape in public, and have been readable from the first commit.",

    idea: {
      heading: "The idea",
      first:
        "Most portfolios show the result. Here the route is on record too: why Next.js and not Astro, why no mediator framework, why database migrations do not run when the application starts. Every one of those decisions is written down — with the alternatives that lost, and the condition under which it should be reconsidered.",
      second:
        "That includes the mistakes. I learned that a cancelled check in the deployment pipeline is not a failure — and therefore silently ships nothing — by having it happen to me. It is in the documentation now, together with the fix.",
    },

    status: {
      heading: "Status",
      doneHeading: "Done",
      done: [
        "Requirements and architecture",
        "Server, containers, reverse proxy, backup",
        "Browser → frontend → API → database, live",
        "Delivery: build, tests, images, migration, verification",
        "German and English",
      ],
      nextHeading: "Next",
      next: [
        "Project catalogue and content management",
        "Public project pages",
        "Observability and metrics",
        "End-to-end tests",
      ],
    },

    reading: {
      heading: "Read on",
      repository: {
        label: "Repository",
        description: "Code, documentation and history in one place",
      },
      architecture: {
        label: "Architecture",
        description:
          "arc42: context, building blocks, runtime, deployment, risks",
      },
      decisions: {
        label: "Decisions",
        description: "Every architecture decision with its rationale and alternatives",
      },
      development: {
        label: "Run it locally",
        description: "What you need to build and run the whole thing yourself",
      },
    },

    built: {
      heading: "Built with",
    },

    about: {
      heading: "About me",
      text: "From the shop floor through work scheduling into IT. Today an application analyst: I run a manufacturing execution system, turn needs into requirements, test them and put them into production — between the business and the system. I learned to build software alongside my job, and keep it alive in projects like this one.",
      link: "Career and education",
    },
  },

  about: {
    title: "Between the business and the system.",
    lede: "I make sure software works where it is used: clarifying requirements, connecting systems, simplifying how work gets done. My route ran from the shop floor through work scheduling into IT — I know the operations I build for from the inside.",

    work: {
      heading: "At work",
      first:
        "As an application analyst I am responsible for running a manufacturing execution system connected to SAP. I pick up what the operation needs and turn it into requirements for the supplier. What comes back, I test, agree with the key users and put into production.",
      second:
        "The interesting part is rarely the technology alone. It sits in between: understanding what a process actually needs, and simplifying it so that less of the working day is spent on software.",
      tasks: [
        "Keep the applications I am responsible for running and available",
        "Gather requirements, write them down and agree them with the supplier",
        "Test changes, have key users accept them, and release them",
        "Look after interfaces and data flows between systems",
        "Turn production data into reporting people can use",
        "Lead sub-projects: migrations, rollouts, introductions",
        "Coordinate AI topics within the unit and contribute to the ICT working group",
      ],
    },

    besides: {
      heading: "Besides",
      first:
        "Building software is not the main part of this role — day to day it means smaller tools and analyses. I learned to develop alongside my job, in a higher diploma course specialising in application development, and I keep it alive in projects of my own.",
      second:
        "This platform is one of them: requirements, architecture, code, server and delivery — all built by hand and documented in the open.",
    },

    stations: {
      heading: "Career",
      current: {
        when: "since 2023",
        what: "Application Analyst",
        detail:
          "Running applications, requirements, interfaces and reporting in a manufacturing company.",
      },
      earlier: {
        when: "2015 – 2023",
        what: "Eight years, one employer, five roles",
        detail:
          "Started in production, moved through deputy team lead and work scheduling into IT — and stayed there.",
        steps: [
          "Plant and apparatus constructor",
          "Deputy team lead and vocational trainer",
          "Work scheduling",
          "ERP specialist",
          "Data and systems specialist",
        ],
      },
    },

    education: {
      heading: "Education",
      entries: [
        {
          when: "2022 – 2025",
          what: "Dipl. Informatiker HF, Professional Bachelor",
          detail: "Application development, alongside full-time work",
        },
        {
          when: "2018",
          what: "Vocational trainer in host companies",
          detail: "Certificate",
        },
        {
          when: "2018",
          what: "Technical supervisor",
          detail: "Leadership course",
        },
        {
          when: "2011 – 2015",
          what: "Plant and apparatus constructor, Swiss federal diploma",
          detail: "Four-year apprenticeship, focus on rail vehicle construction",
        },
      ],
    },

    tools: {
      heading: "What I work with",
      professionalHeading: "At work",
      professional: [
        "Requirements management",
        "Testing and acceptance",
        "Process analysis",
        "Interfaces",
        "SQL",
        "Business intelligence",
        "MES",
        "ERP",
      ],
      ownHeading: "In my own projects",
    },
  },

  footer: {
    note: "Built, documented and operated from the ground up.",
  },
};

export default en;
