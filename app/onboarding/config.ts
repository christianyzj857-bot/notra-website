// Centralized onboarding sample data configuration

export type OnboardingRole = 
  | 'middleschool' 
  | 'highschool' 
  | 'undergrad' 
  | 'grad' 
  | 'professional' 
  | 'educator' 
  | 'other';

export interface SampleFile {
  title: string;
  subtitle: string;
  fileName: string;
  iconColor: string;
}

export interface NoteContent {
  title: string;
  subtitle: string;
  mainTitle: string;
  mainSubtitle: string;
  sections: {
    overview: string;
    keyConcepts?: string[];
    illustrations?: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
    conceptIntuition: {
      title: string;
      paragraphs: string[];
    };
    formalDefinition: {
      title: string;
      definition: string;
      explanation: string;
    };
    commonPatterns: {
      title: string;
      items: Array<{ function: string; derivative: string }>;
    };
    realWorldApplications: {
      title: string;
      items: string[];
    };
    workedExample: {
      title: string;
      problem: string;
      steps: string[];
    };
    summaryTable: {
      title: string;
      rows: Array<{ function: string; derivative: string; notes: string }>;
    };
  };
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Flashcard {
  front: string;
  back: string;
  icon: string;
}

export interface OnboardingSample {
  file: SampleFile;
  note: NoteContent;
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
}

export const onboardingSamples: Record<OnboardingRole, OnboardingSample> = {
  middleschool: {
    file: {
      title: 'Algebra: Linear Equations',
      subtitle: 'Intro to solving for x',
      fileName: 'Algebra_Linear_Equations.pdf',
      iconColor: 'from-green-500 to-emerald-600',
    },
    note: {
      title: "We'll create beautiful notes for you.",
      subtitle: 'Algebra 101 – Linear Equations',
      mainTitle: 'Linear Equations',
      mainSubtitle: 'Overview',
      sections: {
        overview: 'Equations that form straight lines when graphed. Essential for solving real-world problems involving proportional relationships.',
        keyConcepts: [
          'Basic form: y = mx + b',
          'Slope (m) = rate of change',
          'y-intercept (b) = starting value',
        ],
        conceptIntuition: {
          title: 'Concept Intuition',
          paragraphs: [
            'A linear equation represents a straight line. For every change in x, y changes by a constant amount (the slope m).',
            'Used everywhere: calculating costs, predicting trends, understanding proportional relationships.',
          ],
        },
        formalDefinition: {
          title: 'Formal Definition',
          definition: 'ax + b = 0',
          explanation: 'One variable: solution is x = -b/a. Two variables: y = mx + b, where m is slope and b is y-intercept.',
        },
        commonPatterns: {
          title: 'Common Patterns',
          items: [
            { function: 'x + 5 = 12', derivative: 'x = 7' },
            { function: '2x - 3 = 9', derivative: 'x = 6' },
            { function: '3x + 2 = 14', derivative: 'x = 4' },
            { function: 'y = 2x + 3', derivative: 'Slope: 2, y-int: 3' },
            { function: 'y = -x + 5', derivative: 'Slope: -1, y-int: 5' },
          ],
        },
        realWorldApplications: {
          title: 'Real-world Applications',
          items: [
            'Budget planning: savings over time',
            'Distance problems: speed × time',
            'Shopping: fixed price calculations',
            'Temperature conversion: Celsius ↔ Fahrenheit',
          ],
        },
        workedExample: {
          title: 'Worked Example',
          problem: 'Solve: 3x + 7 = 22',
          steps: [
            'Subtract 7: 3x = 15',
            'Divide by 3: x = 5',
            'Verify: 3(5) + 7 = 22 ✓',
          ],
        },
        summaryTable: {
          title: 'Summary Table',
          rows: [
            { function: 'x + a = b', derivative: 'x = b - a', notes: 'Simple addition' },
            { function: 'ax = b', derivative: 'x = b/a', notes: 'Multiplication' },
            { function: 'ax + b = c', derivative: 'x = (c - b)/a', notes: 'General form' },
            { function: 'y = mx + b', derivative: 'Slope: m', notes: 'Linear function' },
            { function: 'y = -x + b', derivative: 'Slope: -1', notes: 'Negative slope' },
          ],
        },
      },
    },
    quiz: [
      {
        question: 'What is the solution to 2x + 5 = 13?',
        options: ['x = 4', 'x = 5', 'x = 6', 'x = 7'],
        correctAnswer: 0,
      },
    ],
    flashcards: [
      {
        front: 'Linear Equation',
        back: 'An equation that forms a straight line when graphed, typically in the form y = mx + b',
        icon: '📊',
      },
    ],
  },
  highschool: {
    file: {
      title: 'Calculus Chapter 3: Derivatives',
      subtitle: 'Derivatives',
      fileName: 'Calculus_Chapter_3.pdf',
      iconColor: 'from-blue-500 to-indigo-600',
    },
    note: {
      title: "We'll create beautiful notes for you.",
      subtitle: 'Calculus 101 – Derivatives & Limits',
      mainTitle: 'Definition of a Derivative',
      mainSubtitle: 'Overview',
      sections: {
        overview: 'The derivative of a function represents the rate of change of the function with respect to its variable. It measures how a function\'s output value changes as its input value changes. Geometrically, the derivative at a point gives us the slope of the tangent line to the function\'s graph at that point.',
        illustrations: [
          { title: 'Limit Definition', description: 'f\'(x) = lim[h→0] (f(x+h) - f(x))/h', icon: '📐' },
          { title: 'Tangent Line', description: 'Slope visualization on curve', icon: '📈' },
          { title: 'Rate of Change', description: 'Instantaneous velocity', icon: '⚡' },
          { title: 'Applications', description: 'Physics & Engineering', icon: '🔬' },
        ],
        conceptIntuition: {
          title: 'Concept Intuition',
          paragraphs: [
            'Imagine you\'re driving a car and looking at your speedometer. The speedometer shows your instantaneous speed at any given moment—that\'s what a derivative measures: the instantaneous rate of change.',
            'If you have a function that describes your position over time, the derivative tells you your velocity. If you have velocity, the derivative tells you acceleration. Derivatives help us understand how things change moment by moment.',
            'Geometrically, think of a curve on a graph. At any point, you can draw a tangent line that just touches the curve. The slope of that tangent line is the derivative at that point. Steeper lines mean faster change, flatter lines mean slower change.',
          ],
        },
        formalDefinition: {
          title: 'Formal Definition',
          definition: 'The derivative of a function f(x) at a point x is defined as: f\'(x) = lim[h→0] [f(x+h) - f(x)]/h, provided this limit exists.',
          explanation: 'This limit represents the instantaneous rate of change. The notation f\'(x), dy/dx, or Df(x) all represent the derivative. The derivative can be positive (increasing), negative (decreasing), or zero (constant).',
        },
        commonPatterns: {
          title: 'Common Patterns',
          items: [
            { function: 'f(x) = x²', derivative: 'f\'(x) = 2x' },
            { function: 'f(x) = x³', derivative: 'f\'(x) = 3x²' },
            { function: 'f(x) = sin(x)', derivative: 'f\'(x) = cos(x)' },
            { function: 'f(x) = eˣ', derivative: 'f\'(x) = eˣ' },
            { function: 'f(x) = ln(x)', derivative: 'f\'(x) = 1/x' },
            { function: 'f(x) = cos(x)', derivative: 'f\'(x) = -sin(x)' },
          ],
        },
        realWorldApplications: {
          title: 'Real-world Applications',
          items: [
            'Physics: Velocity is the derivative of position with respect to time',
            'Economics: Marginal cost is the derivative of the total cost function',
            'Biology: Population growth rates can be modeled using derivatives',
            'Engineering: Optimization problems use derivatives to find maximum and minimum values',
          ],
        },
        workedExample: {
          title: 'Worked Example',
          problem: 'Find the derivative of f(x) = x³ at x = 2',
          steps: [
            'Step 1: Apply power rule → f\'(x) = 3x²',
            'Step 2: Substitute x = 2 → f\'(2) = 3(2)²',
            'Step 3: Calculate → f\'(2) = 3(4) = 12',
            'Step 4: Interpretation: The slope of the tangent line at x = 2 is 12',
          ],
        },
        summaryTable: {
          title: 'Summary Table',
          rows: [
            { function: 'xⁿ', derivative: 'nxⁿ⁻¹', notes: 'Power rule' },
            { function: 'eˣ', derivative: 'eˣ', notes: 'Exponential' },
            { function: 'ln(x)', derivative: '1/x', notes: 'Natural log' },
            { function: 'sin(x)', derivative: 'cos(x)', notes: 'Trigonometric' },
            { function: 'cos(x)', derivative: '-sin(x)', notes: 'Trigonometric' },
            { function: 'aˣ', derivative: 'aˣ ln(a)', notes: 'General exponential' },
          ],
        },
      },
    },
    quiz: [
      {
        question: 'What is the derivative of f(x) = x²?',
        options: ['2x', 'x', '2', 'None of the above'],
        correctAnswer: 0,
      },
    ],
    flashcards: [
      {
        front: 'Limit Definition of Derivative',
        back: 'The derivative of a function f(x) at a point x is defined as the limit of the difference quotient as h approaches zero: f\'(x) = lim(h→0) [f(x+h) - f(x)]/h. This limit represents the instantaneous rate of change of the function at that point, which geometrically corresponds to the slope of the tangent line to the curve.',
        icon: '📐',
      },
    ],
  },
  undergrad: {
    file: {
      title: 'Linear Algebra: Eigenvalues & Eigenvectors',
      subtitle: 'Matrix transformations',
      fileName: 'Linear_Algebra_Eigenvalues.pdf',
      iconColor: 'from-purple-500 to-pink-600',
    },
    note: {
      title: "We'll create beautiful notes for you.",
      subtitle: 'Linear Algebra 201 – Eigenvalues & Eigenvectors',
      mainTitle: 'Eigenvalues and Eigenvectors',
      mainSubtitle: 'Overview',
      sections: {
        overview: 'Reveal intrinsic properties of linear transformations. Eigenvectors preserve direction; eigenvalues scale them.',
        keyConcepts: [
          'Eigenvalue equation: Av = λv',
          'Characteristic polynomial: det(A - λI) = 0',
          'Applications: PCA, quantum mechanics',
        ],
        conceptIntuition: {
          title: 'Concept Intuition',
          paragraphs: [
            'Eigenvectors are special directions that only get scaled, not rotated. Eigenvalues are the scaling factors.',
            'Like stretching a rubber sheet: some directions stretch uniformly—those are eigenvectors.',
          ],
        },
        formalDefinition: {
          title: 'Formal Definition',
          definition: 'Av = \\lambda v',
          explanation: 'For square matrix A, nonzero vector v is eigenvector if Av = λv. Find λ from det(A - λI) = 0, then solve (A - λI)v = 0.',
        },
        commonPatterns: {
          title: 'Common Patterns',
          items: [
            { function: '2×2 Identity', derivative: 'λ = 1 (multiplicity 2)' },
            { function: 'Diagonal Matrix', derivative: 'Eigenvalues = diagonal entries' },
            { function: 'Rotation Matrix', derivative: 'Complex eigenvalues' },
            { function: 'Symmetric Matrix', derivative: 'Real eigenvalues' },
            { function: 'Triangular Matrix', derivative: 'Eigenvalues = diagonal' },
          ],
        },
        realWorldApplications: {
          title: 'Real-world Applications',
          items: [
            'PCA: directions of maximum variance',
            'Quantum mechanics: energy states',
            'Vibration analysis: natural frequencies',
            'PageRank: page importance',
          ],
        },
        workedExample: {
          title: 'Worked Example',
          problem: 'Find eigenvalues/eigenvectors of A = [[2, 1], [0, 3]]',
          steps: [
            'Characteristic: det(A - λI) = (2-λ)(3-λ) = 0',
            'Eigenvalues: λ₁ = 2, λ₂ = 3',
            'Eigenvectors: v₁ = [1, 0] for λ₁, v₂ = [1, 1] for λ₂',
          ],
        },
        summaryTable: {
          title: 'Summary Table',
          rows: [
            { function: 'Av = λv', derivative: 'Eigenvalue equation', notes: 'Fundamental relation' },
            { function: 'det(A - λI) = 0', derivative: 'Characteristic equation', notes: 'Find eigenvalues' },
            { function: '(A - λI)v = 0', derivative: 'Find eigenvectors', notes: 'For each λ' },
            { function: 'Diagonalizable', derivative: 'A = PDP⁻¹', notes: 'P has eigenvectors' },
            { function: 'Trace = Σλ', derivative: 'Sum of eigenvalues', notes: 'Matrix property' },
          ],
        },
      },
    },
    quiz: [
      {
        question: 'If Av = 3v for a nonzero vector v, what is the eigenvalue?',
        options: ['1', '2', '3', 'Cannot determine'],
        correctAnswer: 2,
      },
    ],
    flashcards: [
      {
        front: 'Eigenvalue',
        back: 'A scalar λ such that Av = λv for some nonzero vector v. It represents the factor by which the eigenvector is scaled during the transformation.',
        icon: '🔢',
      },
    ],
  },
  grad: {
    file: {
      title: 'Advanced Calculus: Multivariable Gradients',
      subtitle: 'Vector calculus',
      fileName: 'Advanced_Calculus_Gradients.pdf',
      iconColor: 'from-indigo-500 to-purple-600',
    },
    note: {
      title: "We'll create beautiful notes for you.",
      subtitle: 'Advanced Calculus 301 – Multivariable Gradients',
      mainTitle: 'Gradient and Directional Derivatives',
      mainSubtitle: 'Overview',
      sections: {
        overview: 'Generalizes derivative to multiple variables. Points in direction of steepest ascent; magnitude = rate of change.',
        keyConcepts: [
          'Gradient: ∇f = (∂f/∂x, ∂f/∂y, ...)',
          'Directional derivative: D_u f = ∇f · u',
          'Applications: optimization, ML',
        ],
        conceptIntuition: {
          title: 'Concept Intuition',
          paragraphs: [
            'Like a compass pointing uphill fastest. Combines all partial derivatives into one vector.',
            'Gradient is perpendicular to level curves. Maximum change direction is perpendicular to constant-value lines.',
          ],
        },
        formalDefinition: {
          title: 'Formal Definition',
          definition: '\\nabla f = (\\frac{\\partial f}{\\partial x_1}, \\frac{\\partial f}{\\partial x_2}, \\ldots)',
          explanation: 'Gradient points to steepest increase; ||∇f|| = max rate. Directional derivative: D_u f = ∇f · u.',
        },
        commonPatterns: {
          title: 'Common Patterns',
          items: [
            { function: 'f(x,y) = x² + y²', derivative: '∇f = (2x, 2y)' },
            { function: 'f(x,y) = xy', derivative: '∇f = (y, x)' },
            { function: 'f(x,y) = e^(x+y)', derivative: '∇f = (e^(x+y), e^(x+y))' },
            { function: 'f(x,y,z) = xyz', derivative: '∇f = (yz, xz, xy)' },
          ],
        },
        realWorldApplications: {
          title: 'Real-world Applications',
          items: [
            'ML: gradient descent optimization',
            'Physics: electric/gravitational fields',
            'Economics: optimal production',
            'Engineering: heat flow, fluid dynamics',
          ],
        },
        workedExample: {
          title: 'Worked Example',
          problem: 'Find ∇f for f(x,y) = x²y + 3y at (2, 1)',
          steps: [
            'Partials: ∂f/∂x = 2xy, ∂f/∂y = x² + 3',
            'Gradient: ∇f = (2xy, x² + 3)',
            'At (2,1): ∇f = (4, 7), rate = √65',
          ],
        },
        summaryTable: {
          title: 'Summary Table',
          rows: [
            { function: '∇f', derivative: 'Gradient vector', notes: 'Direction of steepest ascent' },
            { function: 'D_u f', derivative: 'Directional derivative', notes: 'Rate in direction u' },
            { function: '∇(f+g)', derivative: '∇f + ∇g', notes: 'Linearity' },
            { function: '∇(fg)', derivative: 'f∇g + g∇f', notes: 'Product rule' },
            { function: '||∇f||', derivative: 'Magnitude', notes: 'Maximum rate of change' },
          ],
        },
      },
    },
    quiz: [
      {
        question: 'What does the gradient of f(x,y) point toward?',
        options: ['Steepest descent', 'Steepest ascent', 'Level curve', 'Origin'],
        correctAnswer: 1,
      },
    ],
    flashcards: [
      {
        front: 'Gradient',
        back: 'The gradient ∇f of a function f is a vector containing all partial derivatives. It points in the direction of steepest increase, and its magnitude gives the maximum rate of change.',
        icon: '📐',
      },
    ],
  },
  professional: {
    file: {
      title: 'Q2 Sales Report – TechCorp',
      subtitle: 'Business performance briefing',
      fileName: 'Q2_Sales_Report_TechCorp.pdf',
      iconColor: 'from-slate-600 to-slate-800',
    },
    note: {
      title: "We'll create beautiful notes for you.",
      subtitle: 'Business Report – Q2 Sales Analysis',
      mainTitle: 'Executive Summary',
      mainSubtitle: 'Q2 Performance Overview',
      sections: {
        overview: 'Q2 2024: 23% revenue growth YoY. Strong enterprise sales (+35%) and improved retention (92%).',
        keyConcepts: [
          'Revenue: $12.5M (+23% YoY)',
          'Enterprise: +35% growth',
          'Retention: 92%',
        ],
        conceptIntuition: {
          title: 'Key Metrics',
          paragraphs: [
            'Revenue $12.5M (+23% YoY), driven by enterprise (+35%). Customer acquisition costs down 12%, lifetime value up 18%.',
            'Asia-Pacific: +45%, North America: +15%, Europe: +8%.',
          ],
        },
        formalDefinition: {
          title: 'Trends & Insights',
          definition: 'Enterprise segment growth accelerated due to successful product launches and strategic partnerships. SaaS revenue now represents 68% of total revenue, up from 58% last quarter.',
          explanation: 'Customer retention improved to 92%, with churn rate dropping to 2.1%. Net Promoter Score (NPS) increased to 72, indicating strong customer satisfaction.',
        },
        commonPatterns: {
          title: 'Performance Highlights',
          items: [
            { function: 'Revenue Growth', derivative: '+23% YoY' },
            { function: 'Enterprise Sales', derivative: '+35% YoY' },
            { function: 'Customer Retention', derivative: '92%' },
            { function: 'NPS Score', derivative: '72' },
            { function: 'Market Share', derivative: '+15%' },
          ],
        },
        realWorldApplications: {
          title: 'Strategic Recommendations',
          items: [
            'Continue investment in Asia-Pacific market expansion',
            'Leverage enterprise success to penetrate mid-market segment',
            'Focus on product innovation to maintain competitive advantage',
            'Optimize customer success programs to further improve retention',
          ],
        },
        workedExample: {
          title: 'Financial Breakdown',
          problem: 'Q2 2024 Revenue Analysis',
          steps: [
            'Enterprise Sales: $8.5M (68% of total)',
            'SMB Sales: $3.2M (26% of total)',
            'Consumer Sales: $0.8M (6% of total)',
            'Total: $12.5M (23% YoY growth)',
          ],
        },
        summaryTable: {
          title: 'Summary Table',
          rows: [
            { function: 'Total Revenue', derivative: '$12.5M', notes: '+23% YoY' },
            { function: 'Enterprise', derivative: '$8.5M', notes: '+35% YoY' },
            { function: 'Customer Retention', derivative: '92%', notes: '+5% vs Q1' },
            { function: 'NPS Score', derivative: '72', notes: '+8 points' },
            { function: 'Market Share', derivative: '15%', notes: '+2.3%' },
          ],
        },
      },
    },
    quiz: [
      {
        question: 'What was the year-over-year revenue growth in Q2?',
        options: ['15%', '20%', '23%', '30%'],
        correctAnswer: 2,
      },
    ],
    flashcards: [
      {
        front: 'NPS Score',
        back: 'Net Promoter Score measures customer satisfaction and loyalty. A score of 72 indicates strong customer advocacy and high likelihood of referrals.',
        icon: '📊',
      },
    ],
  },
  educator: {
    file: {
      title: 'Teaching Strategies for Active Learning',
      subtitle: 'Textbook chapter sample',
      fileName: 'Teaching_Strategies_Active_Learning.pdf',
      iconColor: 'from-orange-500 to-red-600',
    },
    note: {
      title: "We'll create beautiful notes for you.",
      subtitle: 'Education 101 – Active Learning Strategies',
      mainTitle: 'Active Learning Teaching Strategies',
      mainSubtitle: 'Overview',
      sections: {
        overview: 'Engages students through thinking, discussion, and application. Improves retention, critical thinking, and engagement vs. lectures.',
        keyConcepts: [
          'Think-pair-share: individual → pair → class',
          'Problem-based learning: real-world scenarios',
          'Peer instruction: student-to-student teaching',
        ],
        conceptIntuition: {
          title: 'Learning Objectives',
          paragraphs: [
            'Understand active vs. passive learning. Identify strategies for engagement and retention.',
            'Equip educators with practical techniques for any subject or class size. Transform lectures into dynamic learning.',
          ],
        },
        formalDefinition: {
          title: 'Teaching Strategies',
          definition: 'Think-pair-share, problem-based learning, case studies, peer instruction, collaborative projects.',
          explanation: 'Requires active processing vs. passive receiving. Includes feedback, peer interaction, real-world application. Instructor = facilitator.',
        },
        commonPatterns: {
          title: 'Key Strategies',
          items: [
            { function: 'Think-Pair-Share', derivative: 'Individual → Pair → Class discussion' },
            { function: 'Problem-Based Learning', derivative: 'Real-world problem solving' },
            { function: 'Peer Instruction', derivative: 'Student-to-student teaching' },
            { function: 'Case Studies', derivative: 'Analyze real scenarios' },
            { function: 'Collaborative Projects', derivative: 'Team-based learning' },
          ],
        },
        realWorldApplications: {
          title: 'Assessment Ideas',
          items: [
            'Formative assessments during activities',
            'Peer evaluation in group projects',
            'Rubrics: process + product',
            'Self-reflection for metacognition',
          ],
        },
        workedExample: {
          title: 'Implementation Example',
          problem: 'Think-pair-share in 30-student class',
          steps: [
            'Pose question (2 min)',
            'Individual thinking + writing (3 min)',
            'Pair discussion (5 min)',
            'Class sharing (10 min)',
          ],
        },
        summaryTable: {
          title: 'Summary Table',
          rows: [
            { function: 'Think-Pair-Share', derivative: 'Individual → Pair → Share', notes: '5-15 min activity' },
            { function: 'Problem-Based', derivative: 'Real-world scenarios', notes: 'Extended projects' },
            { function: 'Peer Instruction', derivative: 'Student teaching', notes: 'Concept reinforcement' },
            { function: 'Case Studies', derivative: 'Analysis & discussion', notes: 'Critical thinking' },
            { function: 'Collaborative', derivative: 'Team projects', notes: 'Social learning' },
          ],
        },
      },
    },
    quiz: [
      {
        question: 'What is the first step in think-pair-share?',
        options: ['Pair discussion', 'Individual thinking', 'Class sharing', 'Group formation'],
        correctAnswer: 1,
      },
    ],
    flashcards: [
      {
        front: 'Active Learning',
        back: 'A teaching method that engages students in activities requiring them to think, discuss, and apply knowledge, rather than passively receiving information through lectures.',
        icon: '👥',
      },
    ],
  },
  other: {
    file: {
      title: 'Calculus Chapter 3: Derivatives',
      subtitle: 'Derivatives',
      fileName: 'Calculus_Chapter_3.pdf',
      iconColor: 'from-blue-500 to-indigo-600',
    },
    note: {
      title: "We'll create beautiful notes for you.",
      subtitle: 'Calculus 101 – Derivatives & Limits',
      mainTitle: 'Definition of a Derivative',
      mainSubtitle: 'Overview',
      sections: {
        overview: 'The derivative of a function represents the rate of change of the function with respect to its variable. It measures how a function\'s output value changes as its input value changes. Geometrically, the derivative at a point gives us the slope of the tangent line to the function\'s graph at that point.',
        illustrations: [
          { title: 'Limit Definition', description: 'f\'(x) = lim[h→0] (f(x+h) - f(x))/h', icon: '📐' },
          { title: 'Tangent Line', description: 'Slope visualization on curve', icon: '📈' },
          { title: 'Rate of Change', description: 'Instantaneous velocity', icon: '⚡' },
          { title: 'Applications', description: 'Physics & Engineering', icon: '🔬' },
        ],
        conceptIntuition: {
          title: 'Concept Intuition',
          paragraphs: [
            'Imagine you\'re driving a car and looking at your speedometer. The speedometer shows your instantaneous speed at any given moment—that\'s what a derivative measures: the instantaneous rate of change.',
            'If you have a function that describes your position over time, the derivative tells you your velocity. If you have velocity, the derivative tells you acceleration. Derivatives help us understand how things change moment by moment.',
            'Geometrically, think of a curve on a graph. At any point, you can draw a tangent line that just touches the curve. The slope of that tangent line is the derivative at that point. Steeper lines mean faster change, flatter lines mean slower change.',
          ],
        },
        formalDefinition: {
          title: 'Formal Definition',
          definition: 'The derivative of a function f(x) at a point x is defined as: f\'(x) = lim[h→0] [f(x+h) - f(x)]/h, provided this limit exists.',
          explanation: 'This limit represents the instantaneous rate of change. The notation f\'(x), dy/dx, or Df(x) all represent the derivative. The derivative can be positive (increasing), negative (decreasing), or zero (constant).',
        },
        commonPatterns: {
          title: 'Common Patterns',
          items: [
            { function: 'f(x) = x²', derivative: 'f\'(x) = 2x' },
            { function: 'f(x) = x³', derivative: 'f\'(x) = 3x²' },
            { function: 'f(x) = sin(x)', derivative: 'f\'(x) = cos(x)' },
            { function: 'f(x) = eˣ', derivative: 'f\'(x) = eˣ' },
            { function: 'f(x) = ln(x)', derivative: 'f\'(x) = 1/x' },
            { function: 'f(x) = cos(x)', derivative: 'f\'(x) = -sin(x)' },
          ],
        },
        realWorldApplications: {
          title: 'Real-world Applications',
          items: [
            'Physics: Velocity is the derivative of position with respect to time',
            'Economics: Marginal cost is the derivative of the total cost function',
            'Biology: Population growth rates can be modeled using derivatives',
            'Engineering: Optimization problems use derivatives to find maximum and minimum values',
          ],
        },
        workedExample: {
          title: 'Worked Example',
          problem: 'Find the derivative of f(x) = x³ at x = 2',
          steps: [
            'Step 1: Apply power rule → f\'(x) = 3x²',
            'Step 2: Substitute x = 2 → f\'(2) = 3(2)²',
            'Step 3: Calculate → f\'(2) = 3(4) = 12',
            'Step 4: Interpretation: The slope of the tangent line at x = 2 is 12',
          ],
        },
        summaryTable: {
          title: 'Summary Table',
          rows: [
            { function: 'xⁿ', derivative: 'nxⁿ⁻¹', notes: 'Power rule' },
            { function: 'eˣ', derivative: 'eˣ', notes: 'Exponential' },
            { function: 'ln(x)', derivative: '1/x', notes: 'Natural log' },
            { function: 'sin(x)', derivative: 'cos(x)', notes: 'Trigonometric' },
            { function: 'cos(x)', derivative: '-sin(x)', notes: 'Trigonometric' },
            { function: 'aˣ', derivative: 'aˣ ln(a)', notes: 'General exponential' },
          ],
        },
      },
    },
    quiz: [
      {
        question: 'What is the derivative of f(x) = x²?',
        options: ['2x', 'x', '2', 'None of the above'],
        correctAnswer: 0,
      },
    ],
    flashcards: [
      {
        front: 'Limit Definition of Derivative',
        back: 'The derivative of a function f(x) at a point x is defined as the limit of the difference quotient as h approaches zero: f\'(x) = lim(h→0) [f(x+h) - f(x)]/h. This limit represents the instantaneous rate of change of the function at that point, which geometrically corresponds to the slope of the tangent line to the curve.',
        icon: '📐',
      },
    ],
  },
};

