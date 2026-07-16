export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  syllabus: string;
}

export interface Semester {
  num: number;
  subjects: Subject[];
}

export interface Degree {
  id: string;
  name: string; // e.g. "BA", "B.Sc"
  fullName: string; // e.g. "Bachelor of Arts"
  description: string;
  icon: string;
  color: string; // Tailwind gradient classes
  semestersCount: number; // e.g. 6
}

// StudyResource — Firestore document shape from courses/.../resources
export interface StudyResource {
  id: string;
  title: string;
  type: string; // "unit_notes"
  unitNumber: number;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  courseId: string;
  semesterId: string;
  subjectId: string;
  createdAt?: any;
  updatedAt?: any;
}

// Complete mock syllabus contents
const CS_SYLLABUS = `UNIT I: INTRODUCTION TO COMPUTERS & ALGORITHMS
Computer Systems Overview, CPU, Memory Hierarchy. Definition of Algorithm, Flowcharts, Pseudocode. Time and Space Complexities, Big-O Notation basics.

UNIT II: CORE DATA STRUCTURES
Arrays: representation, traversal, insertion, deletion. Linked Lists: Single, Double, Circular. Stack & Queue implementations using arrays and linked lists.

UNIT III: SORTING & SEARCHING
Searching: Linear Search, Binary Search. Sorting: Bubble Sort, Selection Sort, Insertion Sort, Quick Sort, Merge Sort. Comparison of runtimes.

UNIT IV: BINARY TREES
Definitions, terminology, binary tree traversal techniques (Preorder, Inorder, Postorder). Binary Search Trees (BST): insertion, deletion, lookup.

UNIT V: GRAPHS & HASHING
Graph terminology, representation (adjacency matrix/list). Graph traversal: BFS, DFS. Hash functions, collision resolution schemes.`;

const MATH_SYLLABUS = `UNIT I: FUNCTIONS OF MULTIPLE VARIABLES
Limits, continuity, partial derivatives, chain rule. Homogeneous functions, Euler's theorem. Jacobians and Taylor's formula.

UNIT II: DOUBLE & TRIPLE INTEGRATION
Double integrals in Cartesian and polar coordinates. Change of order of integration. Triple integrals, volume and area calculations.

UNIT III: VECTOR CALCULUS
Gradient, divergence, and curl. Line, surface, and volume integrals. Vector identities. Green's, Stokes' and Divergence Theorems.

UNIT IV: INFINITE SERIES
Sequences and convergence. Tests for convergence of positive series: comparison test, D'Alembert ratio test, Cauchy root test.

UNIT V: LINEAR ALGEBRA
Matrices, rank, system of linear equations. Eigenvalues and eigenvectors. Cayley-Hamilton Theorem.`;

const PHYSICS_SYLLABUS = `UNIT I: CLASSICAL MECHANICS
Constraints, generalized coordinates, D'Alembert's principle. Lagrangian formulation, Hamilton's equations, planetary orbits.

UNIT II: WAVE MOTION & ACOUSTICS
Simple harmonic motion, damped and forced oscillations. Acoustic measurements, reverberation time, Sabine's formula. Ultrasonics generation.

UNIT III: ELECTROMAGNETISM
Maxwell's equations, displacement current. Electromagnetic waves in free space and dielectrics. Poynting vector, radiation pressure.

UNIT IV: WAVE OPTICS
Interference: division of wavefront/amplitude. Diffraction: Fraunhofer and Fresnel diffraction. Polarization: double refraction, Nicol prism.

UNIT V: QUANTUM BASICS
De Broglie waves, Heisenberg uncertainty principle. Schrodinger equation (time-dependent/independent). Particle in a 1D box.`;

const ENGLISH_SYLLABUS = `UNIT I: ENGLISH LITERATURE ANALYSIS
Introduction to Shakespearean sonnets, poetry structural formats, metaphors, and allegories.

UNIT II: SHAKESPEARE DRAMAS
Detailed study of Hamlet, Macbeth, themes of power, sanity, and tragedy.

UNIT III: VICTORIAN PROSE
Critical review of Charles Dickens' Great Expectations and Jane Austen's Pride and Prejudice.

UNIT IV: TECHNICAL WRITING
Report writing formats, professional email structures, resume construction, and cover letters.

UNIT V: COMPREHENSION & VOCABULARY
Critical reading comprehension, synonyms, antonyms, and correct idioms usage.`;

export const DEGREES: Degree[] = [
  { id: "ba", name: "BA", fullName: "Bachelor of Arts", description: "Humanities, languages, social sciences, and literary studies.", icon: "🎭", color: "from-amber-500 to-orange-500", semestersCount: 6 },
  { id: "bcom", name: "B.Com", fullName: "Bachelor of Commerce", description: "Financial accounting, business management, economics, and law.", icon: "📊", color: "from-emerald-500 to-teal-500", semestersCount: 6 },
  { id: "bsc", name: "B.Sc", fullName: "Bachelor of Science", description: "Scientific methodology, advanced maths, computer sciences, and physics.", icon: "🧬", color: "from-indigo-500 to-blue-500", semestersCount: 6 },
  { id: "bba", name: "BBA", fullName: "Bachelor of Business Administration", description: "Management metrics, operations, human resources, and marketing.", icon: "💼", color: "from-purple-500 to-pink-500", semestersCount: 6 },
  { id: "msc", name: "M.Sc", fullName: "Master of Science", description: "Advanced graduate studies in mathematics, computer sciences, and technology.", icon: "🧠", color: "from-rose-500 to-rose-700", semestersCount: 4 }
];

export const getSubjectsForSemester = (degreeId: string, semesterNum: number): Subject[] => {
  if (degreeId === "bsc" || degreeId === "msc") {
    return [
      { id: `${degreeId}-sem${semesterNum}-cs`, name: "Computer Science", code: `CS-${semesterNum}01`, description: "Data structures, OOPs, database queries, and web technologies.", syllabus: CS_SYLLABUS },
      { id: `${degreeId}-sem${semesterNum}-math`, name: "Mathematics", code: `MTH-${semesterNum}02`, description: "Calculus limits, linear algebraic vectors, matrices, and differential theorems.", syllabus: MATH_SYLLABUS },
      { id: `${degreeId}-sem${semesterNum}-phy`, name: "Physics", code: `PHY-${semesterNum}03`, description: "Electromagnetism wave optics, Newtonian dynamics, and quantum energy fields.", syllabus: PHYSICS_SYLLABUS },
      { id: `${degreeId}-sem${semesterNum}-eng`, name: "English", code: `ENG-${semesterNum}04`, description: "Grammatical syntax rules, prose composition, literature analysis, and reports.", syllabus: ENGLISH_SYLLABUS }
    ];
  } else if (degreeId === "ba") {
    return [
      { id: `${degreeId}-sem${semesterNum}-eng`, name: "English Literature", code: `ENG-${semesterNum}11`, description: "Sonnets analysis, Hamlet plays, Victorian novels, and vocabulary building.", syllabus: ENGLISH_SYLLABUS },
      { id: `${degreeId}-sem${semesterNum}-his`, name: "History", code: `HIS-${semesterNum}12`, description: "Medieval periods, world conflicts, and evolution of civil societies.", syllabus: "UNIT I: Ancient civilisations.\nUNIT II: Medieval trade.\nUNIT III: Renaissance details.\nUNIT IV: World Wars.\nUNIT V: Modern alliances." },
      { id: `${degreeId}-sem${semesterNum}-pol`, name: "Political Science", code: `POL-${semesterNum}13`, description: "Constitutional articles, state policies, legislative bodies, and foreign policies.", syllabus: "UNIT I: Sovereignty.\nUNIT II: Constitution rights.\nUNIT III: Legislative processes.\nUNIT IV: International courts.\nUNIT V: Globalization parameters." }
    ];
  } else { // bcom, bba
    return [
      { id: `${degreeId}-sem${semesterNum}-acc`, name: "Financial Accounting", code: `ACC-${semesterNum}21`, description: "Ledger books balancing, cash flow audits, balancesheets, and tax rules.", syllabus: "UNIT I: Accounting basics.\nUNIT II: Double entry systems.\nUNIT III: Trial balance audits.\nUNIT IV: Depreciation ratios.\nUNIT V: Final balance calculations." },
      { id: `${degreeId}-sem${semesterNum}-bus`, name: "Business Management", code: `MGT-${semesterNum}22`, description: "Planning metrics, operations frameworks, leadership styles, and structures.", syllabus: "UNIT I: Management functions.\nUNIT II: Decision matrices.\nUNIT III: Directing and leading.\nUNIT IV: Organization graphs.\nUNIT V: Control systems metrics." },
      { id: `${degreeId}-sem${semesterNum}-eng`, name: "Business English", code: `ENG-${semesterNum}23`, description: "Proposal writes, report layouts, resume forms, and communication metrics.", syllabus: ENGLISH_SYLLABUS }
    ];
  }
};

// Retrieve a specific subject by its ID
export const getSubjectById = (subjectId: string): { degree: Degree; semesterNum: number; subject: Subject } | null => {
  const parts = subjectId.split("-");
  if (parts.length < 3) return null;

  const degreeId = parts[0];
  const semPart = parts[1]; // e.g. "sem3"
  const semesterNum = parseInt(semPart.replace("sem", ""));

  const degree = DEGREES.find(d => d.id === degreeId);
  if (!degree) return null;

  const subjects = getSubjectsForSemester(degreeId, semesterNum);
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject) return null;

  return { degree, semesterNum, subject };
};
