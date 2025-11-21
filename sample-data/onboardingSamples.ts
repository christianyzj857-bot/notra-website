// Onboarding sample data - all static, no API calls
import { OnboardingSampleBundle, NoteSection, QuizItem, Flashcard, OnboardingRole } from '@/types/notra';

export const ONBOARDING_SAMPLES: OnboardingSampleBundle[] = [
  // High School - Basic Calculus
  {
    role: "high-school",
    file: {
      id: "sample-highschool-1",
      title: "Calculus Chapter 3: Derivatives",
      subject: "Mathematics",
      level: "High School",
      description: "Introduction to derivatives and their applications"
    },
    notes: [
      {
        id: "note-1",
        heading: "What is a Derivative?",
        content: "A derivative represents the rate of change of a function at any given point. It tells us how fast a function's output is changing relative to its input.",
        bullets: [
          "Geometrically, the derivative is the slope of the tangent line to the curve",
          "It measures instantaneous rate of change",
          "Common notation: f'(x), dy/dx, or Df(x)"
        ],
        example: "For f(x) = x², the derivative f'(x) = 2x means that at any point x, the function is changing at a rate of 2x units per unit change in x."
      },
      {
        id: "note-2",
        heading: "Basic Derivative Rules",
        content: "There are several fundamental rules that make finding derivatives easier:",
        bullets: [
          "Power Rule: If f(x) = xⁿ, then f'(x) = nxⁿ⁻¹",
          "Constant Rule: The derivative of a constant is zero",
          "Sum Rule: (f + g)' = f' + g'",
          "Product Rule: (fg)' = f'g + fg'",
          "Quotient Rule: (f/g)' = (f'g - fg')/g²"
        ],
        tableSummary: [
          { label: "f(x) = x²", value: "f'(x) = 2x" },
          { label: "f(x) = x³", value: "f'(x) = 3x²" },
          { label: "f(x) = sin(x)", value: "f'(x) = cos(x)" },
          { label: "f(x) = eˣ", value: "f'(x) = eˣ" }
        ]
      },
      {
        id: "note-3",
        heading: "Applications of Derivatives",
        content: "Derivatives have many practical applications in real-world problems:",
        bullets: [
          "Finding maximum and minimum values (optimization)",
          "Determining velocity and acceleration in physics",
          "Analyzing rates of change in economics and biology",
          "Solving related rates problems"
        ],
        example: "If a ball is thrown upward, its position function is s(t) = -16t² + 64t. The derivative s'(t) = -32t + 64 gives the velocity, and s''(t) = -32 gives the acceleration (gravity)."
      },
      {
        id: "note-4",
        heading: "Chain Rule",
        content: "The chain rule is used to find the derivative of composite functions. If y = f(g(x)), then dy/dx = f'(g(x)) × g'(x).",
        bullets: [
          "Identify the outer and inner functions",
          "Differentiate the outer function, keeping the inner function unchanged",
          "Multiply by the derivative of the inner function"
        ],
        example: "For y = (x² + 1)³, let u = x² + 1, then y = u³. So dy/dx = 3u² × 2x = 3(x² + 1)² × 2x = 6x(x² + 1)²."
      }
    ],
    quizzes: [
      {
        id: "quiz-1",
        question: "What is the derivative of f(x) = x²?",
        options: [
          { label: "A", text: "2x" },
          { label: "B", text: "x" },
          { label: "C", text: "2" },
          { label: "D", text: "x²" }
        ],
        correctIndex: 0,
        explanation: "Using the power rule: if f(x) = xⁿ, then f'(x) = nxⁿ⁻¹. For x², n = 2, so f'(x) = 2x²⁻¹ = 2x.",
        difficulty: "easy"
      },
      {
        id: "quiz-2",
        question: "What does the derivative represent geometrically?",
        options: [
          { label: "A", text: "The area under the curve" },
          { label: "B", text: "The slope of the tangent line" },
          { label: "C", text: "The y-intercept" },
          { label: "D", text: "The x-intercept" }
        ],
        correctIndex: 1,
        explanation: "The derivative at a point gives the slope of the tangent line to the curve at that point. This represents the instantaneous rate of change.",
        difficulty: "easy"
      },
      {
        id: "quiz-3",
        question: "If f(x) = 3x⁴, what is f'(x)?",
        options: [
          { label: "A", text: "12x³" },
          { label: "B", text: "3x³" },
          { label: "C", text: "12x⁴" },
          { label: "D", text: "4x³" }
        ],
        correctIndex: 0,
        explanation: "Using the power rule: f'(x) = 3 × 4x⁴⁻¹ = 12x³. The constant 3 stays, and we multiply by the exponent 4, then reduce the exponent by 1.",
        difficulty: "medium"
      }
    ],
    flashcards: [
      {
        id: "card-1",
        front: "Derivative",
        back: "The derivative of a function f(x) at a point x is the instantaneous rate of change of the function at that point. It represents the slope of the tangent line to the curve.",
        tag: "Definition"
      },
      {
        id: "card-2",
        front: "Power Rule",
        back: "If f(x) = xⁿ, then f'(x) = nxⁿ⁻¹. This rule allows us to quickly find the derivative of any power function.",
        tag: "Rule"
      },
      {
        id: "card-3",
        front: "Chain Rule",
        back: "For composite functions y = f(g(x)), the derivative is dy/dx = f'(g(x)) × g'(x). This is essential for differentiating complex functions.",
        tag: "Rule"
      },
      {
        id: "card-4",
        front: "Product Rule",
        back: "If h(x) = f(x) × g(x), then h'(x) = f'(x)g(x) + f(x)g'(x). Used when multiplying two functions together.",
        tag: "Rule"
      }
    ]
  },
  // Undergraduate - Linear Algebra
  {
    role: "undergrad",
    file: {
      id: "sample-undergrad-1",
      title: "Linear Algebra: Eigenvalues & Eigenvectors",
      subject: "Mathematics",
      level: "Undergraduate",
      description: "Understanding eigenvalues, eigenvectors, and their applications in linear transformations"
    },
    notes: [
      {
        id: "note-1",
        heading: "Introduction to Eigenvalues and Eigenvectors",
        content: "Eigenvalues and eigenvectors are fundamental concepts in linear algebra that reveal the intrinsic properties of linear transformations. They help us understand how matrices stretch, rotate, and transform vectors in space.",
        bullets: [
          "An eigenvector is a nonzero vector that, when transformed by a matrix, only gets scaled (not rotated)",
          "The eigenvalue is the scalar factor by which the eigenvector is scaled",
          "The equation Av = λv defines the relationship, where A is a matrix, v is an eigenvector, and λ is an eigenvalue"
        ]
      },
      {
        id: "note-2",
        heading: "Finding Eigenvalues",
        content: "To find eigenvalues, we solve the characteristic equation det(A - λI) = 0, where I is the identity matrix.",
        bullets: [
          "Subtract λ from each diagonal element of matrix A",
          "Calculate the determinant of (A - λI)",
          "Set the determinant equal to zero and solve for λ",
          "The solutions are the eigenvalues"
        ],
        example: "For a 2×2 matrix A = [[2, 1], [0, 3]], we find det(A - λI) = (2-λ)(3-λ) = 0, giving eigenvalues λ₁ = 2 and λ₂ = 3."
      },
      {
        id: "note-3",
        heading: "Finding Eigenvectors",
        content: "Once eigenvalues are found, eigenvectors are determined by solving (A - λI)v = 0 for each eigenvalue λ.",
        bullets: [
          "For each eigenvalue λ, substitute it into (A - λI)v = 0",
          "Solve the resulting homogeneous system of equations",
          "The solution space gives the eigenvectors (there may be multiple linearly independent eigenvectors for one eigenvalue)"
        ],
        tableSummary: [
          { label: "Eigenvalue λ₁ = 2", value: "Eigenvector v₁ = [1, 0]" },
          { label: "Eigenvalue λ₂ = 3", value: "Eigenvector v₂ = [1, 1]" }
        ]
      },
      {
        id: "note-4",
        heading: "Applications",
        content: "Eigenvalues and eigenvectors have numerous applications across mathematics, physics, and engineering:",
        bullets: [
          "Principal Component Analysis (PCA) in data science",
          "Quantum mechanics: energy states correspond to eigenvalues",
          "Vibration analysis in mechanical systems",
          "Google PageRank algorithm",
          "Stability analysis in differential equations"
        ]
      },
      {
        id: "note-5",
        heading: "Diagonalization",
        content: "A matrix is diagonalizable if it can be written as A = PDP⁻¹, where P contains eigenvectors and D is a diagonal matrix of eigenvalues.",
        bullets: [
          "Not all matrices are diagonalizable",
          "A matrix is diagonalizable if it has n linearly independent eigenvectors (for an n×n matrix)",
          "Diagonalization simplifies matrix operations like computing powers"
        ]
      }
    ],
    quizzes: [
      {
        id: "quiz-1",
        question: "If Av = 3v for a nonzero vector v, what is the eigenvalue?",
        options: [
          { label: "A", text: "1" },
          { label: "B", text: "2" },
          { label: "C", text: "3" },
          { label: "D", text: "Cannot determine" }
        ],
        correctIndex: 2,
        explanation: "The eigenvalue equation is Av = λv. If Av = 3v, then λ = 3 is the eigenvalue corresponding to eigenvector v.",
        difficulty: "easy"
      },
      {
        id: "quiz-2",
        question: "How do you find eigenvalues of a matrix A?",
        options: [
          { label: "A", text: "Solve det(A) = 0" },
          { label: "B", text: "Solve det(A - λI) = 0" },
          { label: "C", text: "Solve Av = 0" },
          { label: "D", text: "Find the trace of A" }
        ],
        correctIndex: 1,
        explanation: "Eigenvalues are found by solving the characteristic equation det(A - λI) = 0, where I is the identity matrix.",
        difficulty: "medium"
      },
      {
        id: "quiz-3",
        question: "What does it mean if a matrix has n distinct eigenvalues?",
        options: [
          { label: "A", text: "The matrix is not diagonalizable" },
          { label: "B", text: "The matrix has n linearly independent eigenvectors" },
          { label: "C", text: "The matrix is singular" },
          { label: "D", text: "The matrix has no eigenvectors" }
        ],
        correctIndex: 1,
        explanation: "If a matrix has n distinct eigenvalues, it will have n linearly independent eigenvectors, making it diagonalizable.",
        difficulty: "medium"
      },
      {
        id: "quiz-4",
        question: "In PCA, what do the eigenvalues represent?",
        options: [
          { label: "A", text: "The number of data points" },
          { label: "B", text: "The variance explained by each principal component" },
          { label: "C", text: "The mean of the data" },
          { label: "D", text: "The standard deviation" }
        ],
        correctIndex: 1,
        explanation: "In Principal Component Analysis, eigenvalues represent the variance explained by each principal component. Larger eigenvalues indicate more important directions of variation.",
        difficulty: "hard"
      }
    ],
    flashcards: [
      {
        id: "card-1",
        front: "Eigenvalue",
        back: "A scalar λ such that Av = λv for some nonzero vector v. It represents the factor by which the eigenvector is scaled during the transformation.",
        tag: "Definition"
      },
      {
        id: "card-2",
        front: "Eigenvector",
        back: "A nonzero vector v such that Av = λv for some scalar λ. Eigenvectors point in directions that are preserved (only scaled) by the transformation.",
        tag: "Definition"
      },
      {
        id: "card-3",
        front: "Characteristic Equation",
        back: "The equation det(A - λI) = 0 used to find eigenvalues. The roots of this polynomial are the eigenvalues of matrix A.",
        tag: "Method"
      },
      {
        id: "card-4",
        front: "Diagonalization",
        back: "The process of writing A = PDP⁻¹, where P contains eigenvectors and D is a diagonal matrix of eigenvalues. This simplifies many matrix operations.",
        tag: "Concept"
      },
      {
        id: "card-5",
        front: "Geometric Multiplicity",
        back: "The dimension of the eigenspace corresponding to an eigenvalue. It represents how many linearly independent eigenvectors exist for that eigenvalue.",
        tag: "Concept"
      }
    ]
  },
  // Graduate - Advanced Calculus
  {
    role: "graduate",
    file: {
      id: "sample-grad-1",
      title: "Advanced Calculus: Multivariable Gradients",
      subject: "Mathematics",
      level: "Graduate",
      description: "Understanding gradients, directional derivatives, and optimization in multiple dimensions"
    },
    notes: [
      {
        id: "note-1",
        heading: "Gradient Vector",
        content: "The gradient of a function f(x₁, x₂, ..., xₙ) is a vector containing all partial derivatives: ∇f = (∂f/∂x₁, ∂f/∂x₂, ..., ∂f/∂xₙ).",
        bullets: [
          "The gradient points in the direction of steepest ascent",
          "The magnitude ||∇f|| gives the maximum rate of change",
          "At any point, the gradient is perpendicular to the level curve/surface"
        ],
        example: "For f(x,y) = x²y + 3y, we have ∇f = (2xy, x² + 3). At point (2,1), ∇f(2,1) = (4, 7)."
      },
      {
        id: "note-2",
        heading: "Directional Derivative",
        content: "The directional derivative D_u f measures how f changes when moving in direction u: D_u f = ∇f · u, where u is a unit vector.",
        bullets: [
          "It generalizes the concept of partial derivatives to arbitrary directions",
          "Maximum directional derivative occurs when u points in the direction of ∇f",
          "The value equals ||∇f|| when u = ∇f/||∇f||"
        ]
      },
      {
        id: "note-3",
        heading: "Gradient Descent",
        content: "Gradient descent is an optimization algorithm that uses the negative gradient direction to find local minima.",
        bullets: [
          "Start at an initial point x₀",
          "Update: x_{n+1} = x_n - α∇f(x_n), where α is the learning rate",
          "Iterate until convergence or maximum iterations",
          "Widely used in machine learning for training neural networks"
        ],
        tableSummary: [
          { label: "Learning Rate α", value: "Controls step size, must be chosen carefully" },
          { label: "Convergence", value: "Stops when ||∇f|| < ε or after max iterations" },
          { label: "Local Minimum", value: "May not find global minimum" }
        ]
      },
      {
        id: "note-4",
        heading: "Hessian Matrix",
        content: "The Hessian matrix H contains all second-order partial derivatives. For f(x,y), H = [[∂²f/∂x², ∂²f/∂xy], [∂²f/∂yx, ∂²f/∂y²]].",
        bullets: [
          "Used in second-order optimization methods (Newton's method)",
          "Determinant helps classify critical points (max, min, saddle)",
          "Eigenvalues indicate curvature in different directions"
        ]
      },
      {
        id: "note-5",
        heading: "Applications",
        content: "Gradients are fundamental in many advanced applications:",
        bullets: [
          "Machine Learning: Backpropagation uses gradients to train models",
          "Physics: Electric and gravitational fields are gradient fields",
          "Economics: Gradient helps find optimal production levels",
          "Engineering: Heat flow and fluid dynamics use gradient concepts"
        ]
      }
    ],
    quizzes: [
      {
        id: "quiz-1",
        question: "What does the gradient of f(x,y) point toward?",
        options: [
          { label: "A", text: "Steepest descent" },
          { label: "B", text: "Steepest ascent" },
          { label: "C", text: "Level curve" },
          { label: "D", text: "Origin" }
        ],
        correctIndex: 1,
        explanation: "The gradient always points in the direction of steepest increase of the function. To go downhill (steepest descent), you move in the negative gradient direction.",
        difficulty: "medium"
      },
      {
        id: "quiz-2",
        question: "If ∇f = (3, 4) at a point, what is the maximum rate of change?",
        options: [
          { label: "A", text: "5" },
          { label: "B", text: "7" },
          { label: "C", text: "12" },
          { label: "D", text: "25" }
        ],
        correctIndex: 0,
        explanation: "The maximum rate of change is the magnitude of the gradient: ||∇f|| = √(3² + 4²) = √(9 + 16) = √25 = 5.",
        difficulty: "easy"
      },
      {
        id: "quiz-3",
        question: "In gradient descent, what happens if the learning rate α is too large?",
        options: [
          { label: "A", text: "Convergence is faster" },
          { label: "B", text: "The algorithm may overshoot and diverge" },
          { label: "C", text: "It finds the global minimum" },
          { label: "D", text: "Nothing changes" }
        ],
        correctIndex: 1,
        explanation: "If the learning rate is too large, the algorithm takes steps that are too big and may overshoot the minimum, potentially causing divergence or oscillation.",
        difficulty: "medium"
      }
    ],
    flashcards: [
      {
        id: "card-1",
        front: "Gradient",
        back: "The gradient ∇f of a function f is a vector containing all partial derivatives. It points in the direction of steepest increase, and its magnitude gives the maximum rate of change.",
        tag: "Definition"
      },
      {
        id: "card-2",
        front: "Directional Derivative",
        back: "D_u f = ∇f · u, where u is a unit vector. It measures how f changes when moving in direction u. Maximum occurs when u points in the direction of ∇f.",
        tag: "Definition"
      },
      {
        id: "card-3",
        front: "Gradient Descent",
        back: "An optimization algorithm: x_{n+1} = x_n - α∇f(x_n). Uses the negative gradient direction to iteratively find local minima. Essential in machine learning.",
        tag: "Algorithm"
      },
      {
        id: "card-4",
        front: "Hessian Matrix",
        back: "A matrix of second-order partial derivatives. Used in second-order optimization methods and to classify critical points (max, min, saddle) using its eigenvalues.",
        tag: "Concept"
      }
    ]
  },
  // Professional - Business Report
  {
    role: "professional",
    file: {
      id: "sample-professional-1",
      title: "Q2 Sales Report – TechCorp",
      subject: "Business",
      level: "Professional",
      description: "Quarterly sales performance analysis and strategic recommendations"
    },
    notes: [
      {
        id: "note-1",
        heading: "Executive Summary",
        content: "Q2 2024 sales performance shows strong growth across all major product lines, with total revenue increasing 23% year-over-year. Key metrics indicate successful market expansion and improved customer retention rates.",
        bullets: [
          "Total revenue: $12.5M (23% YoY growth)",
          "Enterprise segment: $8.5M (35% YoY growth)",
          "Customer retention: 92% (up from 87% in Q1)",
          "Net Promoter Score: 72 (industry-leading)"
        ],
        tableSummary: [
          { label: "Total Revenue", value: "$12.5M" },
          { label: "YoY Growth", value: "+23%" },
          { label: "Enterprise Revenue", value: "$8.5M" },
          { label: "Customer Retention", value: "92%" }
        ]
      },
      {
        id: "note-2",
        heading: "Key Metrics",
        content: "Performance highlights across different business segments and regions:",
        bullets: [
          "Enterprise sales grew 35% YoY, now representing 68% of total revenue",
          "SMB segment maintained steady 15% growth",
          "Asia-Pacific region showed exceptional 45% growth",
          "Customer acquisition costs decreased by 12%",
          "Customer lifetime value increased by 18%"
        ]
      },
      {
        id: "note-3",
        heading: "Trends & Insights",
        content: "Analysis of market trends and business performance indicators:",
        bullets: [
          "SaaS revenue now represents 68% of total (up from 58% last quarter)",
          "Strategic partnerships contributed to 20% of new enterprise deals",
          "Product innovation drove increased adoption in mid-market segment",
          "Customer success programs improved retention by 5 percentage points"
        ]
      },
      {
        id: "note-4",
        heading: "Strategic Recommendations",
        content: "Based on current performance, the following strategic actions are recommended:",
        bullets: [
          "Continue investment in Asia-Pacific market expansion",
          "Leverage enterprise success to penetrate mid-market segment",
          "Focus on product innovation to maintain competitive advantage",
          "Optimize customer success programs to further improve retention"
        ]
      }
    ],
    quizzes: [
      {
        id: "quiz-1",
        question: "What was the year-over-year revenue growth in Q2?",
        options: [
          { label: "A", text: "15%" },
          { label: "B", text: "20%" },
          { label: "C", text: "23%" },
          { label: "D", text: "30%" }
        ],
        correctIndex: 2,
        explanation: "The Q2 report shows total revenue increased 23% year-over-year, reaching $12.5M compared to the previous year's Q2.",
        difficulty: "easy"
      },
      {
        id: "quiz-2",
        question: "What percentage of total revenue does enterprise sales represent?",
        options: [
          { label: "A", text: "58%" },
          { label: "B", text: "65%" },
          { label: "C", text: "68%" },
          { label: "D", text: "72%" }
        ],
        correctIndex: 2,
        explanation: "Enterprise sales of $8.5M represent 68% of the total $12.5M revenue, up from 58% in the previous quarter.",
        difficulty: "medium"
      }
    ],
    flashcards: [
      {
        id: "card-1",
        front: "NPS Score",
        back: "Net Promoter Score measures customer satisfaction and loyalty. A score of 72 indicates strong customer advocacy and high likelihood of referrals.",
        tag: "Metric"
      },
      {
        id: "card-2",
        front: "Customer Retention Rate",
        back: "The percentage of customers who continue using the service over a period. 92% retention indicates strong product-market fit and customer satisfaction.",
        tag: "Metric"
      },
      {
        id: "card-3",
        front: "YoY Growth",
        back: "Year-over-Year growth compares performance to the same period in the previous year. 23% YoY growth shows strong business momentum.",
        tag: "Term"
      }
    ]
  },
  // Educator - Teaching Strategies
  {
    role: "educator",
    file: {
      id: "sample-educator-1",
      title: "Teaching Strategies for Active Learning",
      subject: "Education",
      level: "Educator",
      description: "Evidence-based approaches to engage students and improve learning outcomes"
    },
    notes: [
      {
        id: "note-1",
        heading: "Learning Objectives",
        content: "By the end of this module, educators will understand the principles of active learning and how it differs from passive learning approaches. They will be equipped with practical techniques to implement active learning in their classrooms.",
        bullets: [
          "Understand the research behind active learning effectiveness",
          "Identify key strategies that promote student engagement",
          "Learn to design activities that require student participation",
          "Develop assessment methods aligned with active learning"
        ]
      },
      {
        id: "note-2",
        heading: "Teaching Strategies",
        content: "Active learning strategies include think-pair-share, problem-based learning, case studies, peer instruction, and collaborative projects. These methods require students to actively process information rather than passively receiving it.",
        bullets: [
          "Think-Pair-Share: Individual thinking → Pair discussion → Class sharing",
          "Problem-Based Learning: Students solve real-world problems",
          "Peer Instruction: Students teach each other concepts",
          "Case Studies: Analyze real scenarios and apply knowledge",
          "Collaborative Projects: Team-based learning activities"
        ],
        tableSummary: [
          { label: "Think-Pair-Share", value: "5-15 min activity" },
          { label: "Problem-Based", value: "Extended projects" },
          { label: "Peer Instruction", value: "Concept reinforcement" },
          { label: "Case Studies", value: "Critical thinking" }
        ]
      },
      {
        id: "note-3",
        heading: "Assessment Ideas",
        content: "Effective assessment in active learning environments requires multiple approaches:",
        bullets: [
          "Use formative assessments during activities to gauge understanding",
          "Implement peer evaluation in group projects",
          "Create rubrics that assess both process and product",
          "Incorporate self-reflection exercises to promote metacognition"
        ]
      },
      {
        id: "note-4",
        heading: "Implementation Example",
        content: "How to implement think-pair-share in a 30-student class:",
        bullets: [
          "Step 1: Pose a thought-provoking question (2 minutes)",
          "Step 2: Students think individually and write responses (3 minutes)",
          "Step 3: Pair students to discuss their ideas (5 minutes)",
          "Step 4: Select pairs to share with the whole class (10 minutes)"
        ]
      }
    ],
    quizzes: [
      {
        id: "quiz-1",
        question: "What is the first step in think-pair-share?",
        options: [
          { label: "A", text: "Pair discussion" },
          { label: "B", text: "Individual thinking" },
          { label: "C", text: "Class sharing" },
          { label: "D", text: "Group formation" }
        ],
        correctIndex: 1,
        explanation: "Think-pair-share begins with individual thinking, where students first process the question on their own before discussing with a partner.",
        difficulty: "easy"
      },
      {
        id: "quiz-2",
        question: "What is a key benefit of active learning?",
        options: [
          { label: "A", text: "Less preparation time for teachers" },
          { label: "B", text: "Improved student retention and engagement" },
          { label: "C", text: "Easier to grade assignments" },
          { label: "D", text: "Requires fewer resources" }
        ],
        correctIndex: 1,
        explanation: "Research consistently shows that active learning improves student retention, engagement, and critical thinking compared to passive lecture-based methods.",
        difficulty: "medium"
      }
    ],
    flashcards: [
      {
        id: "card-1",
        front: "Active Learning",
        back: "A teaching method that engages students in activities requiring them to think, discuss, and apply knowledge, rather than passively receiving information through lectures.",
        tag: "Concept"
      },
      {
        id: "card-2",
        front: "Think-Pair-Share",
        back: "A three-step active learning strategy: (1) Individual thinking, (2) Pair discussion, (3) Class sharing. Takes 5-15 minutes and promotes participation.",
        tag: "Strategy"
      },
      {
        id: "card-3",
        front: "Formative Assessment",
        back: "Assessment conducted during the learning process to provide feedback and adjust instruction. Essential in active learning to gauge understanding in real-time.",
        tag: "Assessment"
      }
    ]
  },
  // Other - Default to Calculus
  {
    role: "other",
    file: {
      id: "sample-other-1",
      title: "Calculus Chapter 3: Derivatives",
      subject: "Mathematics",
      level: "General",
      description: "Introduction to derivatives and their applications"
    },
    notes: [
      {
        id: "note-1",
        heading: "What is a Derivative?",
        content: "A derivative represents the rate of change of a function at any given point. It tells us how fast a function's output is changing relative to its input.",
        bullets: [
          "Geometrically, the derivative is the slope of the tangent line to the curve",
          "It measures instantaneous rate of change",
          "Common notation: f'(x), dy/dx, or Df(x)"
        ]
      },
      {
        id: "note-2",
        heading: "Basic Derivative Rules",
        content: "There are several fundamental rules that make finding derivatives easier:",
        bullets: [
          "Power Rule: If f(x) = xⁿ, then f'(x) = nxⁿ⁻¹",
          "Constant Rule: The derivative of a constant is zero",
          "Sum Rule: (f + g)' = f' + g'"
        ]
      }
    ],
    quizzes: [
      {
        id: "quiz-1",
        question: "What is the derivative of f(x) = x²?",
        options: [
          { label: "A", text: "2x" },
          { label: "B", text: "x" },
          { label: "C", text: "2" },
          { label: "D", text: "None of the above" }
        ],
        correctIndex: 0,
        explanation: "Using the power rule: if f(x) = xⁿ, then f'(x) = nxⁿ⁻¹. For x², n = 2, so f'(x) = 2x.",
        difficulty: "easy"
      }
    ],
    flashcards: [
      {
        id: "card-1",
        front: "Derivative",
        back: "The derivative of a function f(x) at a point x is the instantaneous rate of change of the function at that point.",
        tag: "Definition"
      }
    ]
  }
];

