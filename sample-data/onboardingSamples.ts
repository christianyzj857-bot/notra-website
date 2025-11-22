// Onboarding sample data - all static, no API calls
import { OnboardingSampleBundle, NoteSection, QuizItem, Flashcard, OnboardingRole } from '@/types/notra';

export const ONBOARDING_SAMPLES: OnboardingSampleBundle[] = [
  // Middle School - Basic Calculus
  {
    role: "middle_school",
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
        conceptExplanation: "The derivative is one of the most fundamental concepts in calculus. Think of it as a 'speedometer' for functions - it tells you exactly how fast the function is changing at any moment. Unlike average rate of change (which uses two points), the derivative gives you the instantaneous rate of change at a single point. This is crucial because many real-world phenomena (like velocity, growth rates, optimization) require knowing the exact rate of change at a specific instant.",
        formulaDerivation: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
        applications: [
          "Physics: Velocity is the derivative of position with respect to time",
          "Economics: Marginal cost is the derivative of the cost function",
          "Biology: Population growth rate is the derivative of population size",
          "Engineering: Rate of temperature change in heat transfer problems"
        ],
        commonMistakes: [
          "Confusing average rate of change with instantaneous rate of change",
          "Forgetting that the derivative at a point is a number, not a function",
          "Mixing up f'(x) notation with dy/dx notation",
          "Assuming all functions have derivatives everywhere (some functions are not differentiable)"
        ],
        example: "For f(x) = x², the derivative f'(x) = 2x means that at any point x, the function is changing at a rate of 2x units per unit change in x.",
        summaryTable: [
          { concept: "Derivative Definition", formula: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}", notes: "Limit definition" },
          { concept: "Geometric Meaning", formula: "Slope of tangent line", notes: "At point (x, f(x))" },
          { concept: "Physical Meaning", formula: "Instantaneous rate of change", notes: "Velocity, acceleration, etc." }
        ]
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
        conceptExplanation: "These rules form the foundation of differential calculus. Instead of always using the limit definition, we can apply these rules to quickly find derivatives of common functions. Each rule has a specific use case: Power Rule for polynomials, Product Rule for multiplication, Quotient Rule for division, and Chain Rule (covered separately) for composition.",
        formulaDerivation: "Power Rule: \\frac{d}{dx}(x^n) = nx^{n-1} \\\\ Product Rule: \\frac{d}{dx}[f(x)g(x)] = f'(x)g(x) + f(x)g'(x) \\\\ Quotient Rule: \\frac{d}{dx}\\left[\\frac{f(x)}{g(x)}\\right] = \\frac{f'(x)g(x) - f(x)g'(x)}{[g(x)]^2}",
        applications: [
          "Power Rule: Used in polynomial functions, root functions (x^(1/2), x^(1/3))",
          "Product Rule: Essential for functions like x²sin(x) or eˣcos(x)",
          "Quotient Rule: Needed for rational functions like (x+1)/(x-1)",
          "Sum Rule: Allows breaking complex functions into simpler parts"
        ],
        commonMistakes: [
          "Applying Product Rule incorrectly: (fg)' ≠ f'g' (this is wrong!)",
          "Forgetting to square the denominator in Quotient Rule",
          "Mixing up the order in Product Rule: must be f'g + fg'",
          "Not recognizing when to use Chain Rule vs Product Rule"
        ],
        tableSummary: [
          { label: "f(x) = x²", value: "f'(x) = 2x" },
          { label: "f(x) = x³", value: "f'(x) = 3x²" },
          { label: "f(x) = sin(x)", value: "f'(x) = cos(x)" },
          { label: "f(x) = eˣ", value: "f'(x) = eˣ" }
        ],
        summaryTable: [
          { concept: "Power Rule", formula: "\\frac{d}{dx}(x^n) = nx^{n-1}", notes: "For any real number n" },
          { concept: "Product Rule", formula: "(fg)' = f'g + fg'", notes: "Order matters!" },
          { concept: "Quotient Rule", formula: "\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}", notes: "Don't forget g²" },
          { concept: "Sum Rule", formula: "(f + g)' = f' + g'", notes: "Derivative of sum is sum of derivatives" }
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
        conceptExplanation: "Derivatives are not just abstract mathematical concepts - they are powerful tools for solving real-world problems. Optimization problems use derivatives to find maximum profit, minimum cost, or optimal dimensions. In physics, derivatives describe motion: position → velocity → acceleration. In economics, marginal analysis uses derivatives to make business decisions. Understanding these applications helps you see why derivatives matter beyond the classroom.",
        formulaDerivation: "For position s(t): \\\\ Velocity: v(t) = s'(t) = \\frac{ds}{dt} \\\\ Acceleration: a(t) = v'(t) = s''(t) = \\frac{d^2s}{dt^2}",
        applications: [
          "Optimization: Finding the dimensions that minimize material cost for a box with fixed volume",
          "Physics: Calculating when a projectile reaches maximum height (derivative = 0)",
          "Economics: Determining the production level that maximizes profit (marginal cost = marginal revenue)",
          "Biology: Modeling population growth rates and finding when growth is fastest",
          "Engineering: Designing structures to minimize stress or maximize efficiency"
        ],
        commonMistakes: [
          "Setting the function equal to zero instead of its derivative for optimization",
          "Confusing velocity and acceleration (acceleration is derivative of velocity, not position)",
          "Forgetting to check endpoints when finding absolute max/min on a closed interval",
          "Not considering physical constraints in optimization problems"
        ],
        example: "If a ball is thrown upward, its position function is s(t) = -16t² + 64t. The derivative s'(t) = -32t + 64 gives the velocity, and s''(t) = -32 gives the acceleration (gravity).",
        summaryTable: [
          { concept: "Optimization", formula: "f'(x) = 0", notes: "Find critical points" },
          { concept: "Velocity", formula: "v(t) = s'(t)", notes: "First derivative of position" },
          { concept: "Acceleration", formula: "a(t) = s''(t)", notes: "Second derivative of position" },
          { concept: "Marginal Analysis", formula: "MC = C'(x)", notes: "Derivative of cost function" }
        ]
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
        conceptExplanation: "The Chain Rule is essential for differentiating composite functions - functions within functions. It tells us that when we have f(g(x)), we must differentiate the outer function f (treating g(x) as a variable) and then multiply by the derivative of the inner function g. This is one of the most important rules in calculus because most real-world functions are compositions of simpler functions.",
        formulaDerivation: "If y = f(g(x)), then: \\\\ \\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx} \\\\ where u = g(x) \\\\ This gives: \\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)",
        applications: [
          "Differentiating trigonometric functions: sin(x²), cos(3x+1)",
          "Exponential functions: e^(2x+3), 2^(x²)",
          "Logarithmic functions: ln(x²+1), log(3x-2)",
          "Nested functions: (x²+1)⁵, √(x³+2x)"
        ],
        commonMistakes: [
          "Forgetting to multiply by the derivative of the inner function",
          "Differentiating the inner function first instead of the outer function",
          "Not recognizing when a function is composite (e.g., sin(2x) needs Chain Rule)",
          "Confusing Chain Rule with Product Rule when both might apply"
        ],
        example: "For y = (x² + 1)³, let u = x² + 1, then y = u³. Outer function: u³, derivative is 3u². Inner function: x² + 1, derivative is 2x. So dy/dx = 3u² × 2x = 3(x² + 1)² × 2x = 6x(x² + 1)².",
        summaryTable: [
          { concept: "Chain Rule Formula", formula: "\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)", notes: "Derivative of outer × derivative of inner" },
          { concept: "Substitution Method", formula: "Let u = g(x), then \\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}", notes: "Often easier to understand" },
          { concept: "Multiple Compositions", formula: "[f(g(h(x)))]' = f'(g(h(x))) \\cdot g'(h(x)) \\cdot h'(x)", notes: "Extend to nested functions" }
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
    role: "undergraduate",
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
        ],
        conceptExplanation: "Eigenvalues and eigenvectors reveal the 'natural directions' of a linear transformation. When a matrix transforms space, most vectors get both stretched and rotated. However, eigenvectors are special - they only get stretched (or compressed) by their corresponding eigenvalue, maintaining their direction. This makes them incredibly useful for understanding the fundamental behavior of linear systems, from quantum mechanics to data compression.",
        formulaDerivation: "The eigenvalue equation: Av = \\lambda v \\\\ Rearranging: (A - \\lambda I)v = 0 \\\\ For nontrivial solutions, we require: \\det(A - \\lambda I) = 0 \\\\ This is the characteristic equation, whose roots are the eigenvalues.",
        applications: [
          "Principal Component Analysis (PCA): Finding directions of maximum variance in data",
          "Quantum Mechanics: Energy levels correspond to eigenvalues of the Hamiltonian operator",
          "Vibration Analysis: Natural frequencies of mechanical systems",
          "Google PageRank: Eigenvalues determine importance of web pages",
          "Image Compression: Using eigenvectors to reduce dimensionality"
        ],
        commonMistakes: [
          "Confusing eigenvectors with the null space (eigenvectors are not necessarily in null space)",
          "Forgetting that eigenvectors are only defined up to scalar multiples",
          "Not checking that Av = λv after finding eigenvalues and eigenvectors",
          "Assuming all matrices have real eigenvalues (some have complex eigenvalues)"
        ],
        summaryTable: [
          { concept: "Eigenvalue Equation", formula: "Av = \\lambda v", notes: "Fundamental relationship" },
          { concept: "Characteristic Equation", formula: "\\det(A - \\lambda I) = 0", notes: "Used to find eigenvalues" },
          { concept: "Eigenvector", formula: "v \\neq 0 such that Av = \\lambda v", notes: "Direction preserved by transformation" }
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
        conceptExplanation: "The characteristic equation transforms the eigenvalue problem into a polynomial equation. The degree of this polynomial equals the size of the matrix, so an n×n matrix has at most n eigenvalues (counting multiplicities). The process involves creating a matrix where λ is subtracted from diagonal elements, then finding when this matrix becomes singular (determinant = 0).",
        formulaDerivation: "For matrix A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}: \\\\ A - \\lambda I = \\begin{pmatrix} a-\\lambda & b \\\\ c & d-\\lambda \\end{pmatrix} \\\\ \\det(A - \\lambda I) = (a-\\lambda)(d-\\lambda) - bc = 0 \\\\ This gives: \\lambda^2 - (a+d)\\lambda + (ad-bc) = 0",
        applications: [
          "Stability Analysis: Negative eigenvalues indicate stable systems",
          "Spectral Decomposition: Breaking matrices into simpler components",
          "Matrix Powers: Computing Aⁿ efficiently using eigenvalues",
          "Differential Equations: Finding solutions to systems of ODEs"
        ],
        commonMistakes: [
          "Forgetting to subtract λ from diagonal elements correctly",
          "Making arithmetic errors when calculating the determinant",
          "Not finding all eigenvalues (missing complex or repeated eigenvalues)",
          "Confusing algebraic multiplicity with geometric multiplicity"
        ],
        example: "For a 2×2 matrix A = [[2, 1], [0, 3]], we find det(A - λI) = (2-λ)(3-λ) = 0, giving eigenvalues λ₁ = 2 and λ₂ = 3.",
        summaryTable: [
          { concept: "2×2 Matrix", formula: "\\lambda^2 - \\text{tr}(A)\\lambda + \\det(A) = 0", notes: "Trace and determinant method" },
          { concept: "Characteristic Polynomial", formula: "p(\\lambda) = \\det(A - \\lambda I)", notes: "Degree equals matrix size" },
          { concept: "Eigenvalue Sum", formula: "\\sum \\lambda_i = \\text{tr}(A)", notes: "Sum equals trace" },
          { concept: "Eigenvalue Product", formula: "\\prod \\lambda_i = \\det(A)", notes: "Product equals determinant" }
        ]
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
        conceptExplanation: "Finding eigenvectors is essentially finding the null space of (A - λI). For each eigenvalue, we solve a homogeneous system, which always has at least one nonzero solution (since det(A - λI) = 0). The eigenspace (set of all eigenvectors for an eigenvalue) is a vector space, and its dimension is the geometric multiplicity.",
        formulaDerivation: "For eigenvalue \\lambda: \\\\ (A - \\lambda I)\\mathbf{v} = \\mathbf{0} \\\\ This is a homogeneous system. \\\\ The eigenspace E_\\lambda = \\{\\mathbf{v} : (A - \\lambda I)\\mathbf{v} = \\mathbf{0}\\} \\\\ Geometric multiplicity = \\dim(E_\\lambda)",
        applications: [
          "Diagonalization: Eigenvectors form the columns of P in A = PDP⁻¹",
          "Principal Component Analysis: Eigenvectors are principal directions",
          "Dynamical Systems: Eigenvectors determine stable/unstable directions",
          "Quantum Mechanics: Eigenvectors represent quantum states"
        ],
        commonMistakes: [
          "Not checking that Av = λv after finding eigenvectors",
          "Forgetting that eigenvectors are only defined up to scalar multiples",
          "Confusing geometric multiplicity with algebraic multiplicity",
          "Not finding all linearly independent eigenvectors for repeated eigenvalues"
        ],
        tableSummary: [
          { label: "Eigenvalue λ₁ = 2", value: "Eigenvector v₁ = [1, 0]" },
          { label: "Eigenvalue λ₂ = 3", value: "Eigenvector v₂ = [1, 1]" }
        ],
        summaryTable: [
          { concept: "Eigenvector Equation", formula: "(A - \\lambda I)\\mathbf{v} = \\mathbf{0}", notes: "Homogeneous system" },
          { concept: "Eigenspace", formula: "E_\\lambda = \\ker(A - \\lambda I)", notes: "Null space of (A - λI)" },
          { concept: "Geometric Multiplicity", formula: "\\dim(E_\\lambda)", notes: "Dimension of eigenspace" }
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
        ],
        conceptExplanation: "Eigenvalues and eigenvectors are not just abstract mathematical concepts - they reveal the fundamental structure of linear transformations. In data science, they identify the most important directions of variation. In physics, they represent energy states and natural frequencies. In algorithms, they determine convergence rates and stability. Understanding these applications shows why eigenvalues/eigenvectors are among the most important concepts in applied mathematics.",
        applications: [
          "Data Science: PCA reduces dimensionality while preserving variance",
          "Quantum Mechanics: Energy eigenvalues, wave functions as eigenvectors",
          "Vibration Analysis: Natural frequencies and mode shapes",
          "PageRank: Web page importance determined by dominant eigenvector",
          "Image Processing: Eigenfaces for facial recognition",
          "Control Systems: Stability determined by eigenvalue signs",
          "Markov Chains: Steady-state distributions are eigenvectors"
        ],
        commonMistakes: [
          "Not understanding the physical/geometric meaning of eigenvalues",
          "Confusing eigenvectors with other special vectors",
          "Not recognizing when a problem can be solved using eigenvalues",
          "Forgetting that eigenvalues can be complex even for real matrices"
        ],
        summaryTable: [
          { concept: "PCA", formula: "\\text{Principal Components} = \\text{Eigenvectors of } \\Sigma", notes: "Covariance matrix" },
          { concept: "PageRank", formula: "\\mathbf{p} = A\\mathbf{p}", notes: "Dominant eigenvector" },
          { concept: "Quantum States", formula: "H|\\psi\\rangle = E|\\psi\\rangle", notes: "Energy eigenvalues" }
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
        ],
        conceptExplanation: "Diagonalization is the process of finding a basis in which a linear transformation acts simply by scaling. When A = PDP⁻¹, the matrix P changes coordinates to the eigenvector basis, where the transformation becomes diagonal (just scaling). This makes many operations trivial: computing powers, exponentials, and solving differential equations become much easier.",
        formulaDerivation: "A = PDP^{-1} \\\\ where: \\\\ P = [\\mathbf{v}_1 | \\mathbf{v}_2 | \\ldots | \\mathbf{v}_n] \\text{ (eigenvectors)} \\\\ D = \\begin{pmatrix} \\lambda_1 & 0 & \\ldots & 0 \\\\ 0 & \\lambda_2 & \\ldots & 0 \\\\ \\vdots & \\vdots & \\ddots & \\vdots \\\\ 0 & 0 & \\ldots & \\lambda_n \\end{pmatrix} \\\\ Matrix powers: A^k = PD^kP^{-1}",
        applications: [
          "Matrix Powers: Computing Aⁿ efficiently",
          "Matrix Exponential: e^A = Pe^DP⁻¹",
          "Differential Equations: Solving d𝐱/dt = A𝐱",
          "Decoupling Systems: Transforming coupled equations into independent ones",
          "Spectral Decomposition: Understanding matrix structure"
        ],
        commonMistakes: [
          "Assuming all matrices are diagonalizable (not true!)",
          "Confusing diagonalizable with diagonal (different concepts)",
          "Not checking that eigenvectors are linearly independent",
          "Forgetting the order: eigenvalues in D must match eigenvector order in P"
        ],
        summaryTable: [
          { concept: "Diagonalization", formula: "A = PDP^{-1}", notes: "P has eigenvectors, D has eigenvalues" },
          { concept: "Matrix Powers", formula: "A^k = PD^kP^{-1}", notes: "Much easier than direct computation" },
          { concept: "Condition", formula: "n \\text{ linearly independent eigenvectors}", notes: "For n×n matrix" }
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
        conceptExplanation: "The gradient is the multidimensional generalization of the derivative. While a derivative gives the slope in one direction, the gradient captures how a function changes in all directions simultaneously. It's a vector field that points in the direction of maximum increase, making it fundamental for optimization, physics (fields), and machine learning (backpropagation).",
        formulaDerivation: "For f(x,y): \\\\ \\nabla f = \\left(\\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y}\\right) \\\\ Magnitude: ||\\nabla f|| = \\sqrt{\\left(\\frac{\\partial f}{\\partial x}\\right)^2 + \\left(\\frac{\\partial f}{\\partial y}\\right)^2} \\\\ Directional derivative: D_{\\mathbf{u}} f = \\nabla f \\cdot \\mathbf{u}",
        applications: [
          "Machine Learning: Gradient descent uses -∇f to find minima",
          "Physics: Electric field E = -∇V, gravitational field",
          "Optimization: Finding maximum/minimum of multivariable functions",
          "Image Processing: Edge detection using gradient magnitude",
          "Fluid Dynamics: Pressure gradients drive fluid flow"
        ],
        commonMistakes: [
          "Confusing gradient direction (steepest ascent) with -∇f (steepest descent)",
          "Not normalizing the direction vector when computing directional derivative",
          "Forgetting that gradient is a vector, not a scalar",
          "Mixing up partial derivatives when computing gradient components"
        ],
        example: "For f(x,y) = x²y + 3y, we have ∇f = (2xy, x² + 3). At point (2,1), ∇f(2,1) = (4, 7).",
        summaryTable: [
          { concept: "Gradient Definition", formula: "\\nabla f = \\left(\\frac{\\partial f}{\\partial x_1}, \\ldots, \\frac{\\partial f}{\\partial x_n}\\right)", notes: "Vector of partial derivatives" },
          { concept: "Steepest Ascent", formula: "\\text{Direction} = \\frac{\\nabla f}{||\\nabla f||}", notes: "Normalized gradient" },
          { concept: "Maximum Rate of Change", formula: "||\\nabla f||", notes: "Magnitude of gradient" },
          { concept: "Directional Derivative", formula: "D_{\\mathbf{u}} f = \\nabla f \\cdot \\mathbf{u}", notes: "Rate of change in direction u" }
        ]
      },
      {
        id: "note-2",
        heading: "Directional Derivative",
        content: "The directional derivative D_u f measures how f changes when moving in direction u: D_u f = ∇f · u, where u is a unit vector.",
        bullets: [
          "It generalizes the concept of partial derivatives to arbitrary directions",
          "Maximum directional derivative occurs when u points in the direction of ∇f",
          "The value equals ||∇f|| when u = ∇f/||∇f||"
        ],
        conceptExplanation: "The directional derivative extends the concept of partial derivatives (which measure change along coordinate axes) to any direction in space. It answers the question: 'If I move in direction u, how fast does the function change?' This is crucial for optimization, as it tells us not just how steep a function is, but in which direction it's steepest.",
        formulaDerivation: "D_{\\mathbf{u}} f = \\nabla f \\cdot \\mathbf{u} = ||\\nabla f|| \\cdot ||\\mathbf{u}|| \\cos\\theta \\\\ Since \\mathbf{u} is a unit vector: ||\\mathbf{u}|| = 1 \\\\ Maximum when \\cos\\theta = 1, i.e., when \\mathbf{u} = \\frac{\\nabla f}{||\\nabla f||}",
        applications: [
          "Optimization: Finding the best direction to move for fastest increase/decrease",
          "Weather Modeling: Predicting temperature change in specific wind directions",
          "Economics: Analyzing how utility changes with consumption bundles",
          "Engineering: Determining stress changes in different material directions"
        ],
        commonMistakes: [
          "Forgetting to normalize the direction vector (must be unit vector)",
          "Using the wrong sign (positive vs negative directional derivative)",
          "Confusing directional derivative with gradient magnitude",
          "Not recognizing that directional derivative is a scalar, not a vector"
        ],
        summaryTable: [
          { concept: "Directional Derivative", formula: "D_{\\mathbf{u}} f = \\nabla f \\cdot \\mathbf{u}", notes: "u must be unit vector" },
          { concept: "Maximum Value", formula: "\\max D_{\\mathbf{u}} f = ||\\nabla f||", notes: "When u points in gradient direction" },
          { concept: "Minimum Value", formula: "\\min D_{\\mathbf{u}} f = -||\\nabla f||", notes: "When u points opposite to gradient" }
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
        conceptExplanation: "Gradient descent is the workhorse of modern machine learning. The algorithm iteratively moves in the direction of steepest descent (negative gradient) to find local minima. The learning rate α controls step size - too small and convergence is slow, too large and the algorithm may overshoot or diverge. Variants like Adam, RMSprop, and momentum address these limitations.",
        formulaDerivation: "Update rule: \\mathbf{x}_{n+1} = \\mathbf{x}_n - \\alpha \\nabla f(\\mathbf{x}_n) \\\\ Convergence criterion: ||\\nabla f(\\mathbf{x}_n)|| < \\epsilon \\\\ With momentum: \\mathbf{v}_{n+1} = \\beta\\mathbf{v}_n + \\alpha\\nabla f(\\mathbf{x}_n), \\quad \\mathbf{x}_{n+1} = \\mathbf{x}_n - \\mathbf{v}_{n+1}",
        applications: [
          "Neural Network Training: Backpropagation uses gradient descent",
          "Linear Regression: Finding optimal weights to minimize cost function",
          "Logistic Regression: Optimizing likelihood function",
          "Support Vector Machines: Finding optimal hyperplane",
          "Deep Learning: Training complex models with millions of parameters"
        ],
        commonMistakes: [
          "Choosing learning rate too large (causes divergence) or too small (slow convergence)",
          "Not checking convergence properly (may stop too early or too late)",
          "Forgetting that gradient descent finds local, not necessarily global, minima",
          "Not normalizing features, causing slow convergence in some dimensions"
        ],
        tableSummary: [
          { label: "Learning Rate α", value: "Controls step size, must be chosen carefully" },
          { label: "Convergence", value: "Stops when ||∇f|| < ε or after max iterations" },
          { label: "Local Minimum", value: "May not find global minimum" }
        ],
        summaryTable: [
          { concept: "Basic Update", formula: "\\mathbf{x}_{n+1} = \\mathbf{x}_n - \\alpha \\nabla f(\\mathbf{x}_n)", notes: "Step in negative gradient direction" },
          { concept: "Convergence", formula: "||\\nabla f(\\mathbf{x}_n)|| < \\epsilon", notes: "Gradient becomes small" },
          { concept: "Learning Rate", formula: "\\alpha \\in (0, 1)", notes: "Typically 0.001 to 0.1" },
          { concept: "Momentum", formula: "\\mathbf{v}_{n+1} = \\beta\\mathbf{v}_n + \\alpha\\nabla f", notes: "Accelerates convergence" }
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
        ],
        conceptExplanation: "The Hessian matrix captures second-order information about a function's curvature. While the gradient tells us the direction of steepest change, the Hessian tells us how the function curves in different directions. This is essential for understanding the nature of critical points and for second-order optimization methods that converge much faster than gradient descent.",
        formulaDerivation: "For f(x,y): \\\\ H = \\begin{pmatrix} \\frac{\\partial^2 f}{\\partial x^2} & \\frac{\\partial^2 f}{\\partial x \\partial y} \\\\ \\frac{\\partial^2 f}{\\partial y \\partial x} & \\frac{\\partial^2 f}{\\partial y^2} \\end{pmatrix} \\\\ Second derivative test: \\\\ \\det(H) > 0, \\frac{\\partial^2 f}{\\partial x^2} > 0 \\Rightarrow \\text{local minimum} \\\\ \\det(H) > 0, \\frac{\\partial^2 f}{\\partial x^2} < 0 \\Rightarrow \\text{local maximum} \\\\ \\det(H) < 0 \\Rightarrow \\text{saddle point}",
        applications: [
          "Newton's Method: Uses Hessian inverse for faster convergence",
          "Critical Point Classification: Determining if a point is max, min, or saddle",
          "Convexity Testing: Positive definite Hessian implies convex function",
          "Curvature Analysis: Understanding function shape near critical points",
          "Machine Learning: Second-order optimization in deep learning"
        ],
        commonMistakes: [
          "Forgetting that Hessian is symmetric (mixed partials are equal)",
          "Not checking all conditions in second derivative test",
          "Confusing positive definite with positive entries (different concepts)",
          "Computing Hessian incorrectly (wrong order of partial derivatives)"
        ],
        summaryTable: [
          { concept: "Hessian Definition", formula: "H_{ij} = \\frac{\\partial^2 f}{\\partial x_i \\partial x_j}", notes: "Matrix of second partials" },
          { concept: "Local Minimum", formula: "\\det(H) > 0, H_{11} > 0", notes: "Positive definite" },
          { concept: "Local Maximum", formula: "\\det(H) > 0, H_{11} < 0", notes: "Negative definite" },
          { concept: "Saddle Point", formula: "\\det(H) < 0", notes: "Indefinite" }
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
        ],
        conceptExplanation: "The gradient concept extends far beyond mathematics into virtually every field that deals with optimization, fields, or rates of change. In machine learning, gradients enable training of neural networks with millions of parameters. In physics, gradients describe force fields. In economics, they optimize production. Understanding gradients opens doors to advanced applications across disciplines.",
        applications: [
          "Deep Learning: Training neural networks with backpropagation",
          "Computer Vision: Image processing and edge detection",
          "Natural Language Processing: Word embeddings and language models",
          "Physics: Maxwell's equations, quantum mechanics",
          "Economics: Utility maximization, production optimization",
          "Engineering: Finite element analysis, computational fluid dynamics",
          "Robotics: Path planning and control systems"
        ],
        commonMistakes: [
          "Not understanding when to use gradient vs other optimization methods",
          "Confusing gradient with other vector fields",
          "Not recognizing gradient's role in chain rule for multivariable functions",
          "Forgetting that gradient is only defined for differentiable functions"
        ],
        summaryTable: [
          { concept: "Machine Learning", formula: "\\theta_{n+1} = \\theta_n - \\alpha \\nabla_\\theta L", notes: "Parameter update" },
          { concept: "Physics Fields", formula: "\\mathbf{E} = -\\nabla V", notes: "Electric field from potential" },
          { concept: "Optimization", formula: "\\min f(\\mathbf{x})", notes: "Find where \\nabla f = 0" }
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
    role: "working_professional",
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
        conceptExplanation: "The executive summary provides a high-level overview of business performance, highlighting key achievements and trends. This quarter demonstrates exceptional growth driven by enterprise expansion and improved customer success initiatives. The 23% YoY growth significantly outpaces industry averages, while the 92% retention rate indicates strong product-market fit and customer satisfaction.",
        applications: [
          "Strategic Planning: Informing Q3 and annual planning decisions",
          "Investor Relations: Communicating performance to stakeholders",
          "Resource Allocation: Directing investment toward high-growth segments",
          "Competitive Analysis: Benchmarking against industry standards",
          "Risk Management: Identifying areas requiring attention"
        ],
        commonMistakes: [
          "Focusing only on revenue without considering profitability",
          "Ignoring leading indicators in favor of lagging metrics",
          "Not contextualizing numbers (e.g., comparing to industry benchmarks)",
          "Overlooking negative trends that might be masked by overall growth"
        ],
        tableSummary: [
          { label: "Total Revenue", value: "$12.5M" },
          { label: "YoY Growth", value: "+23%" },
          { label: "Enterprise Revenue", value: "$8.5M" },
          { label: "Customer Retention", value: "92%" }
        ],
        summaryTable: [
          { concept: "Revenue Growth", formula: "\\text{YoY Growth} = \\frac{\\text{Current} - \\text{Prior}}{\\text{Prior}} \\times 100\\%", notes: "23% YoY growth" },
          { concept: "Retention Rate", formula: "\\text{Retention} = \\frac{\\text{Retained Customers}}{\\text{Starting Customers}}", notes: "92% retention" },
          { concept: "NPS", formula: "\\text{NPS} = \\% \\text{Promoters} - \\% \\text{Detractors}", notes: "72 NPS score" }
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
        ],
        conceptExplanation: "Key metrics provide granular insights into business performance across different dimensions. Segment analysis reveals where growth is strongest, regional analysis identifies geographic opportunities, and efficiency metrics (CAC, LTV) measure operational effectiveness. The shift toward enterprise (68% of revenue) indicates successful upmarket motion, while APAC growth suggests strong international expansion.",
        applications: [
          "Sales Strategy: Focusing resources on high-growth segments",
          "Market Expansion: Identifying regions for investment",
          "Pricing Strategy: Understanding value delivery by segment",
          "Marketing Optimization: Improving CAC efficiency",
          "Product Development: Prioritizing features for enterprise customers"
        ],
        commonMistakes: [
          "Analyzing metrics in isolation without considering relationships",
          "Not accounting for seasonality or market conditions",
          "Focusing on absolute numbers without growth rates",
          "Ignoring efficiency metrics (CAC, LTV) in favor of revenue only"
        ],
        summaryTable: [
          { concept: "CAC Efficiency", formula: "\\text{CAC Ratio} = \\frac{\\text{LTV}}{\\text{CAC}}", notes: "Target: >3:1" },
          { concept: "Segment Mix", formula: "\\text{Enterprise \\%} = \\frac{\\text{Enterprise Revenue}}{\\text{Total Revenue}}", notes: "68% enterprise" },
          { concept: "Regional Growth", formula: "\\text{Growth Rate} = \\frac{\\text{Current} - \\text{Prior}}{\\text{Prior}}", notes: "45% APAC growth" }
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
        ],
        conceptExplanation: "Trends and insights connect metrics to underlying business dynamics. The shift to SaaS (68% of revenue) reflects market preference for recurring revenue models. Partnership contributions (20% of deals) validate channel strategy. Product innovation driving mid-market adoption suggests successful product-market fit expansion. The 5-point retention improvement demonstrates ROI of customer success investment.",
        applications: [
          "Product Strategy: Prioritizing SaaS features and capabilities",
          "Partnership Development: Expanding strategic alliance programs",
          "Go-to-Market: Adjusting messaging for mid-market segment",
          "Customer Success: Scaling proven retention programs",
          "Investment Planning: Allocating resources to high-ROI initiatives"
        ],
        commonMistakes: [
          "Confusing correlation with causation in trend analysis",
          "Not considering external factors (market conditions, competition)",
          "Over-extrapolating short-term trends",
          "Ignoring negative trends that might require intervention"
        ],
        summaryTable: [
          { concept: "SaaS Mix", formula: "\\text{SaaS \\%} = \\frac{\\text{SaaS Revenue}}{\\text{Total Revenue}}", notes: "68% SaaS" },
          { concept: "Partnership Contribution", formula: "\\text{Partnership \\%} = \\frac{\\text{Partner Deals}}{\\text{Total Deals}}", notes: "20% of deals" },
          { concept: "Retention Improvement", formula: "\\Delta \\text{Retention} = \\text{Current} - \\text{Prior}", notes: "+5 percentage points" }
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
        ],
        conceptExplanation: "Strategic recommendations translate insights into actionable initiatives. These recommendations are prioritized based on ROI potential, strategic alignment, and resource requirements. APAC expansion leverages proven success, mid-market penetration builds on enterprise credibility, product innovation maintains differentiation, and customer success optimization compounds retention gains.",
        applications: [
          "Budget Planning: Allocating resources to recommended initiatives",
          "Team Building: Hiring for APAC expansion and mid-market sales",
          "Product Roadmap: Prioritizing innovation projects",
          "Process Improvement: Scaling customer success best practices",
          "Performance Tracking: Establishing KPIs for each recommendation"
        ],
        commonMistakes: [
          "Recommending too many initiatives without prioritization",
          "Not aligning recommendations with available resources",
          "Ignoring dependencies between recommendations",
          "Failing to establish success metrics for recommendations"
        ],
        summaryTable: [
          { concept: "Market Expansion", formula: "\\text{Investment ROI} = \\frac{\\text{Growth}}{\\text{Investment}}", notes: "APAC: 45% growth" },
          { concept: "Segment Penetration", formula: "\\text{Conversion Rate} = \\frac{\\text{Deals Closed}}{\\text{Opportunities}}", notes: "Mid-market focus" },
          { concept: "Innovation Impact", formula: "\\text{Adoption Rate} = \\frac{\\text{Users}}{\\text{Total Customers}}", notes: "Product-driven" }
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
        ],
        conceptExplanation: "Learning objectives define what students should know, understand, or be able to do after instruction. Well-written objectives are specific, measurable, and aligned with assessment. Active learning objectives emphasize higher-order thinking skills (analysis, synthesis, evaluation) rather than just recall. Research shows that active learning increases retention by 50% compared to passive lecture methods.",
        applications: [
          "Course Design: Structuring curriculum around clear learning outcomes",
          "Assessment Development: Creating tests that measure stated objectives",
          "Instructional Planning: Aligning teaching methods with learning goals",
          "Student Communication: Helping students understand expectations",
          "Program Evaluation: Measuring educational effectiveness"
        ],
        commonMistakes: [
          "Writing vague objectives that can't be measured",
          "Focusing only on lower-order thinking (remember, understand)",
          "Not aligning assessments with stated objectives",
          "Creating too many objectives, making them unachievable"
        ],
        summaryTable: [
          { concept: "Bloom's Taxonomy", formula: "\\text{Remember} < \\text{Understand} < \\text{Apply} < \\text{Analyze} < \\text{Evaluate} < \\text{Create}", notes: "Higher-order thinking" },
          { concept: "SMART Objectives", formula: "\\text{Specific} + \\text{Measurable} + \\text{Achievable}", notes: "Well-defined goals" },
          { concept: "Alignment", formula: "\\text{Objectives} = \\text{Assessment} = \\text{Instruction}", notes: "Three-way alignment" }
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
        conceptExplanation: "Active learning strategies shift the cognitive load from instructor to students. Instead of passively receiving information, students engage in activities that require them to process, analyze, and apply knowledge. Research demonstrates that active learning increases student performance by 6% on exams and reduces failure rates by 1.5x. The key is creating structured activities that promote engagement while maintaining learning objectives.",
        applications: [
          "Large Classes: Think-pair-share engages all students efficiently",
          "STEM Courses: Problem-based learning develops analytical skills",
          "Professional Programs: Case studies bridge theory and practice",
          "Diverse Learners: Multiple strategies accommodate different learning styles",
          "Online Teaching: Adapting active learning for virtual environments"
        ],
        commonMistakes: [
          "Using active learning without clear learning objectives",
          "Not providing enough structure, leading to confusion",
          "Assuming all students will participate equally",
          "Not debriefing activities, missing learning opportunities"
        ],
        tableSummary: [
          { label: "Think-Pair-Share", value: "5-15 min activity" },
          { label: "Problem-Based", value: "Extended projects" },
          { label: "Peer Instruction", value: "Concept reinforcement" },
          { label: "Case Studies", value: "Critical thinking" }
        ],
        summaryTable: [
          { concept: "Think-Pair-Share", formula: "\\text{Think} (2\\text{min}) + \\text{Pair} (5\\text{min}) + \\text{Share} (10\\text{min})", notes: "17 minutes total" },
          { concept: "Problem-Based", formula: "\\text{Problem} \\rightarrow \\text{Research} \\rightarrow \\text{Solution}", notes: "Extended timeline" },
          { concept: "Peer Instruction", formula: "\\text{Individual} + \\text{Discussion} + \\text{Re-vote}", notes: "Concept clarification" }
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
        ],
        conceptExplanation: "Assessment in active learning must measure both content mastery and process skills. Formative assessment provides real-time feedback, allowing instructors to adjust instruction. Peer evaluation develops critical thinking and reduces grading burden. Rubrics ensure consistent evaluation while communicating expectations. Self-reflection promotes metacognition, helping students understand their own learning process.",
        applications: [
          "Formative Assessment: Clicker questions, exit tickets, one-minute papers",
          "Peer Assessment: Peer review of writing, peer evaluation of presentations",
          "Rubrics: Grading collaborative projects, evaluating problem-solving",
          "Self-Assessment: Learning journals, reflection papers, self-grading",
          "Authentic Assessment: Portfolios, projects, real-world applications"
        ],
        commonMistakes: [
          "Relying only on summative assessment (tests, exams)",
          "Not providing timely feedback on formative assessments",
          "Creating rubrics that are too vague or too detailed",
          "Ignoring process in favor of product only"
        ],
        summaryTable: [
          { concept: "Formative Assessment", formula: "\\text{During Learning}", notes: "Real-time feedback" },
          { concept: "Summative Assessment", formula: "\\text{After Learning}", notes: "Final evaluation" },
          { concept: "Peer Assessment", formula: "\\text{Students Evaluate Each Other}", notes: "Develops critical thinking" },
          { concept: "Self-Assessment", formula: "\\text{Students Evaluate Themselves}", notes: "Promotes metacognition" }
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
        ],
        conceptExplanation: "Implementation examples provide concrete, actionable guidance for educators. The think-pair-share example demonstrates how to structure active learning activities with clear time allocations. The progression from individual thinking to pair discussion to class sharing ensures all students engage before public sharing, reducing anxiety and improving participation quality.",
        applications: [
          "Classroom Management: Structured activities reduce off-task behavior",
          "Differentiated Instruction: Accommodates different thinking speeds",
          "Large Classes: Ensures all students participate, not just vocal ones",
          "Shy Students: Provides safe space before public sharing",
          "Concept Reinforcement: Multiple exposures improve retention"
        ],
        commonMistakes: [
          "Not allocating enough time for each phase",
          "Skipping the 'think' phase, going straight to pair discussion",
          "Calling on the same students during 'share' phase",
          "Not connecting the activity back to learning objectives"
        ],
        summaryTable: [
          { concept: "Think Phase", formula: "\\text{Individual} + \\text{Writing}", notes: "2-3 minutes" },
          { concept: "Pair Phase", formula: "\\text{Discussion} + \\text{Comparison}", notes: "5 minutes" },
          { concept: "Share Phase", formula: "\\text{Public} + \\text{Synthesis}", notes: "10 minutes" },
          { concept: "Total Time", formula: "\\text{Think} + \\text{Pair} + \\text{Share}", notes: "15-20 minutes" }
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

