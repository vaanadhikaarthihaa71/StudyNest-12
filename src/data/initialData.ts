import { Subject, Chapter, Question } from '../types';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-physics',
    name: 'Physics',
    description: 'Comprehensive study of mechanics, electromagnetism, wave optics, modern physics, and electronic devices for board exams.',
    icon: 'Atom',
    display_order: 1,
    color_theme: 'blue',
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'sub-chemistry',
    name: 'Chemistry',
    description: 'Master physical chemistry equations, coordination compounds, electrochemistry, and organic reaction mechanisms.',
    icon: 'FlaskConical',
    display_order: 2,
    color_theme: 'violet',
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'sub-biology',
    name: 'Biology',
    description: 'Detailed insights into reproduction, genetics and evolution, biotechnology applications, and ecology.',
    icon: 'Dna',
    display_order: 3,
    color_theme: 'emerald',
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'sub-mathematics',
    name: 'Mathematics',
    description: 'Rigorous step-by-step calculus, vectors, 3D geometry, matrices, determinants, and linear programming.',
    icon: 'Calculator',
    display_order: 4,
    color_theme: 'amber',
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'sub-cs',
    name: 'Computer Science',
    description: 'Python programming, data structures (stacks), database management with SQL, computer networks, and societal impacts.',
    icon: 'Terminal',
    display_order: 5,
    color_theme: 'cyan',
    created_at: new Date('2026-01-01').toISOString(),
  },
];

export const INITIAL_CHAPTERS: Chapter[] = [
  // Physics Chapters
  {
    id: 'chap-phy-1',
    subject_id: 'sub-physics',
    chapter_number: 1,
    title: 'Electric Charges and Fields',
    description: "Coulomb's Law, electric field intensity, electric dipoles, Gauss's theorem, and its applications.",
    display_order: 1,
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'chap-phy-2',
    subject_id: 'sub-physics',
    chapter_number: 2,
    title: 'Current Electricity',
    description: "Ohm's law, drift velocity, Kirchhoff's laws, Wheatstone bridge, and potentiometer principles.",
    display_order: 2,
    created_at: new Date('2026-01-01').toISOString(),
  },

  // Chemistry Chapters
  {
    id: 'chap-chem-1',
    subject_id: 'sub-chemistry',
    chapter_number: 1,
    title: 'Solutions and Colligative Properties',
    description: "Henry's Law, Raoult's Law, ideal vs non-ideal solutions, elevation in boiling point, depression in freezing point.",
    display_order: 1,
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'chap-chem-2',
    subject_id: 'sub-chemistry',
    chapter_number: 2,
    title: 'Electrochemistry',
    description: 'Nernst equation, conductance in electrolytic solutions, Kohlrausch law, galvanic cells, and batteries.',
    display_order: 2,
    created_at: new Date('2026-01-01').toISOString(),
  },

  // Biology Chapters
  {
    id: 'chap-bio-1',
    subject_id: 'sub-biology',
    chapter_number: 1,
    title: 'Molecular Basis of Inheritance',
    description: 'Structure of DNA and RNA, semiconservative replication, transcription, genetic code, and translation.',
    display_order: 1,
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'chap-bio-2',
    subject_id: 'sub-biology',
    chapter_number: 2,
    title: 'Biotechnology: Principles and Processes',
    description: 'Recombinant DNA technology, restriction endonucleases, plasmids, PCR, and bioreactors.',
    display_order: 2,
    created_at: new Date('2026-01-01').toISOString(),
  },

  // Mathematics Chapters
  {
    id: 'chap-math-1',
    subject_id: 'sub-mathematics',
    chapter_number: 1,
    title: 'Integrals and Applications',
    description: 'Definite and indefinite integrals, integration by parts, partial fractions, and area under simple curves.',
    display_order: 1,
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'chap-math-2',
    subject_id: 'sub-mathematics',
    chapter_number: 2,
    title: 'Matrices and Determinants',
    description: 'Matrix multiplication, transpose, adjoint, inverse of a matrix, and solving systems of linear equations.',
    display_order: 2,
    created_at: new Date('2026-01-01').toISOString(),
  },

  // Computer Science Chapters
  {
    id: 'chap-cs-1',
    subject_id: 'sub-cs',
    chapter_number: 1,
    title: 'File Handling in Python',
    description: 'Text files, binary files with pickle module, CSV files with csv module, file open modes, read, write, and seek.',
    display_order: 1,
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'chap-cs-2',
    subject_id: 'sub-cs',
    chapter_number: 2,
    title: 'Data Structures: Linear Stack',
    description: 'Stack implementation using Python lists, LIFO principle, PUSH and POP operations with overflow/underflow checks.',
    display_order: 2,
    created_at: new Date('2026-01-01').toISOString(),
  },
];

export const INITIAL_QUESTIONS: Question[] = [
  // Physics - Question 1 (Long Answer with Audio & Video demo!)
  {
    id: 'q-phy-101',
    chapter_id: 'chap-phy-1',
    question_text: "State Gauss's Law in electrostatics. Using Gauss's Law, derive an expression for the electric field intensity due to an infinitely long straight uniformly charged wire with linear charge density λ.",
    question_type: 'Long Answer',
    marks: 5,
    answer_content: `### 1. Statement of Gauss's Law
Gauss's law states that the total electric flux $\\Phi_E$ through any closed Gaussian surface enclosing a charge $q$ is equal to $\\frac{1}{\\varepsilon_0}$ times the net charge enclosed by the surface:

$$\\Phi_E = \\oint \\vec{E} \\cdot d\\vec{A} = \\frac{q_{\\text{enclosed}}}{\\varepsilon_0}$$

---

### 2. Derivation for Infinitely Long Straight Charged Wire

Let an infinitely long thin wire have uniform linear charge density $\\lambda$ (Coulomb per meter).

#### Step 1: Symmetry and Choice of Gaussian Surface
- By cylindrical symmetry, the electric field $\\vec{E}$ points radially outwards everywhere perpendicular to the length of the wire.
- Choose an imaginary closed **cylindrical Gaussian surface** of radius $r$ and length $l$ coaxial with the charged wire.

#### Step 2: Flux Calculation Across Surfaces
The cylinder has three distinct surfaces:
1. **Circular Flat End Cap 1:** Area vector $d\\vec{A}_1$ is parallel to the wire axis, while $\\vec{E}$ is radial (perpendicular).
   $$\\Phi_1 = \\int \\vec{E} \\cdot d\\vec{A}_1 = E \\cos(90^\\circ) = 0$$
2. **Circular Flat End Cap 2:** Similarly perpendicular.
   $$\\Phi_2 = 0$$
3. **Curved Cylindrical Surface:** The electric field $\\vec{E}$ and surface area vector $d\\vec{A}$ are in the exact same radial direction $(\\theta = 0^\\circ)$ and $E$ is constant at radius $r$.
   $$\\Phi_3 = \\int E \\cdot dA \\cdot \\cos(0^\\circ) = E \\int dA = E \\cdot (2\\pi r l)$$

#### Step 3: Total Flux
$$\\Phi_{\\text{total}} = \\Phi_1 + \\Phi_2 + \\Phi_3 = E \\cdot (2\\pi r l)$$

#### Step 4: Applying Gauss's Theorem
The charge enclosed in length $l$ is $q_{\\text{enclosed}} = \\lambda \\cdot l$.
By Gauss's Law:
$$E \\cdot (2\\pi r l) = \\frac{\\lambda l}{\\varepsilon_0}$$

Canceling $l$ on both sides:
$$\\mathbf{E = \\frac{\\lambda}{2\\pi \\varepsilon_0 r}}$$

In vector notation:
$$\\vec{E} = \\frac{\\lambda}{2\\pi \\varepsilon_0 r} \\hat{n}$$
*(where $\\hat{n}$ is a radial unit vector normal to the wire).*

---
**Key Takeaways for Board Exam:**
* The field varies inversely with distance: $E \\propto \\frac{1}{r}$.
* Mention the direction: radially outward for $\\lambda > 0$ and radially inward for $\\lambda < 0$.`,
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/humming_room_tone.ogg',
    audio_title: "Audio Concept Walkthrough: Gauss's Law Application",
    audio_description: 'A 3-minute concept breakdown explaining how to draw the cylindrical Gaussian surface and avoid losing marks on surface end caps.',
    video_url: 'https://www.youtube.com/watch?v=kITJvI0o_1A',
    video_title: "Video Explanation: Electric Field Due to Line Charge",
    video_description: 'Watch the step-by-step 3D visualization showing why flux through the circular end caps equals zero.',
    status: 'published',
    display_order: 1,
    created_at: new Date('2026-01-02').toISOString(),
    updated_at: new Date('2026-01-02').toISOString(),
  },

  // Physics - Question 2 (Short Answer)
  {
    id: 'q-phy-102',
    chapter_id: 'chap-phy-1',
    question_text: "Why do electrostatic field lines never form closed loops? State one other fundamental property of electric field lines.",
    question_type: 'Short Answer',
    marks: 2,
    answer_content: `### Reason:
Electrostatic field lines **never form closed loops** because the electrostatic force is **conservative** in nature.

1. Electrostatic field lines originate from positive charges and terminate on negative charges.
2. If they were to form a closed loop, the line integral of the electric field around a closed path $(\\oint \\vec{E} \\cdot d\\vec{l})$ would be non-zero, which violates the conservative nature of static electric fields where work done along a closed path is strictly zero.

### Additional Property:
* **No two electric field lines can intersect each other.** If they intersected, there would be two tangents at the intersection point, representing two different directions of the resultant electric field at that single point, which is physically impossible.`,
    status: 'published',
    display_order: 2,
    created_at: new Date('2026-01-02').toISOString(),
    updated_at: new Date('2026-01-02').toISOString(),
  },

  // Physics - Question 3 (Current Electricity)
  {
    id: 'q-phy-201',
    chapter_id: 'chap-phy-2',
    question_text: "Define drift velocity of free electrons in a conductor. Derive the relation between electric current (I) and drift velocity (vd).",
    question_type: 'Long Answer',
    marks: 3,
    answer_content: `### 1. Definition of Drift Velocity ($v_d$)
Drift velocity is defined as the average velocity with which free electrons in a metallic conductor get drifted towards the positive terminal under the influence of an external electric field applied across its ends.

Formula:
$$v_d = -\\frac{e E \\tau}{m}$$
*(where $e$ is electron charge, $E$ is electric field, $\\tau$ is relaxation time, and $m$ is mass of electron).*

---

### 2. Relation Between Current and Drift Velocity
Consider a conductor of length $L$ and uniform cross-sectional area $A$.
Let $n$ be the number density of free electrons (number of electrons per unit volume).

1. **Volume of the conductor:** $V = A \\cdot L$
2. **Total number of free electrons:** $N = n \\cdot A \\cdot L$
3. **Total charge in the conductor:** $Q = N \\cdot e = n \\cdot A \\cdot L \\cdot e$
4. **Time taken by electrons to cross length $L$:** $t = \\frac{L}{v_d}$

Now, by definition of electric current:
$$I = \\frac{Q}{t} = \\frac{n A L e}{\\left(\\frac{L}{v_d}\\right)}$$

$$\\mathbf{I = n e A v_d}$$

This proves the direct proportional relationship: $I \\propto v_d$.`,
    audio_url: 'https://actions.google.com/sounds/v1/ambiences/office_white_noise.ogg',
    audio_title: 'Quick Audio Revision: Drift Velocity and Current Density',
    audio_description: 'Key derivation check: remember to define n as number density, not total electrons.',
    status: 'published',
    display_order: 1,
    created_at: new Date('2026-01-03').toISOString(),
    updated_at: new Date('2026-01-03').toISOString(),
  },

  // Chemistry - Question 1 (Solutions - Short Answer)
  {
    id: 'q-chem-101',
    chapter_id: 'chap-chem-1',
    question_text: "State Raoult's Law for a solution of volatile liquids. Give one major condition under which a real solution exhibits positive deviation from Raoult's Law.",
    question_type: 'Short Answer',
    marks: 2,
    answer_content: `### 1. Raoult's Law
For a solution of volatile liquids, the partial vapour pressure of each component in the solution is directly proportional to its mole fraction present in the solution.

For a binary mixture of components A and B:
$$p_A = p_A^\\circ \\cdot x_A$$
$$p_B = p_B^\\circ \\cdot x_B$$

Total vapour pressure:
$$P_{\\text{total}} = p_A + p_B = (p_A^\\circ \\cdot x_A) + (p_B^\\circ \\cdot x_B)$$

### 2. Condition for Positive Deviation
A solution exhibits **positive deviation** when the intermolecular attractive forces between solute and solvent molecules (A-B interactions) are **weaker** than the solute-solute (A-A) and solvent-solvent (B-B) attractive forces.

**Example:** Mixture of Ethanol and Acetone. In pure ethanol, hydrogen bonding is strong. Addition of acetone disrupts the hydrogen bonds, increasing the escaping tendency of molecules and raising vapour pressure.
* $\\Delta H_{\\text{mixing}} > 0$ (Endothermic)
* $\\Delta V_{\\text{mixing}} > 0$ (Volume expansion)`,
    status: 'published',
    display_order: 1,
    created_at: new Date('2026-01-03').toISOString(),
    updated_at: new Date('2026-01-03').toISOString(),
  },

  // Chemistry - Question 2 (Electrochemistry - Long Answer)
  {
    id: 'q-chem-201',
    chapter_id: 'chap-chem-2',
    question_text: "Write the Nernst equation for the following cell at 298 K:\n$$\\text{Mg}(s) | \\text{Mg}^{2+}(aq) || \\text{Ag}^+(aq) | \\text{Ag}(s)$$\nCalculate the cell potential at 298 K if $[\\text{Mg}^{2+}] = 0.130\\text{ M}$, $[\\text{Ag}^+] = 1.00 \\times 10^{-4}\\text{ M}$, given $E^\\circ_{\\text{Mg}^{2+}/\\text{Mg}} = -2.37\\text{ V}$ and $E^\\circ_{\\text{Ag}^+/\\text{Ag}} = +0.80\\text{ V}$.",
    question_type: 'Long Answer',
    marks: 5,
    answer_content: `### Step 1: Write Cell Reactions
* **Anode (Oxidation):**
  $$\\text{Mg}(s) \\rightarrow \\text{Mg}^{2+}(aq) + 2e^-$$
* **Cathode (Reduction):**
  $$2\\text{Ag}^+(aq) + 2e^- \\rightarrow 2\\text{Ag}(s)$$
* **Overall Cell Reaction:**
  $$\\text{Mg}(s) + 2\\text{Ag}^+(aq) \\rightarrow \\text{Mg}^{2+}(aq) + 2\\text{Ag}(s)$$

Number of electrons transferred: $n = 2$.

---

### Step 2: Calculate Standard Cell Potential ($E^\\circ_{\\text{cell}}$)
$$E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}}$$
$$E^\\circ_{\\text{cell}} = 0.80\\text{ V} - (-2.37\\text{ V}) = +3.17\\text{ V}$$

---

### Step 3: Apply Nernst Equation
$$E_{\\text{cell}} = E^\\circ_{\\text{cell}} - \\frac{0.0591}{n} \\log_{10} \\left( \\frac{[\\text{Mg}^{2+}]}{[\\text{Ag}^+]^2} \\right)$$

Substitute values:
$$E_{\\text{cell}} = 3.17 - \\frac{0.0591}{2} \\log_{10} \\left( \\frac{0.130}{(1.00 \\times 10^{-4})^2} \\right)$$

Calculate reaction quotient term:
$$Q = \\frac{0.130}{1.00 \\times 10^{-8}} = 1.30 \\times 10^7$$
$$\\log_{10}(1.30 \\times 10^7) = \\log_{10}(1.30) + 7 = 0.1139 + 7 = 7.1139$$

Compute potential:
$$E_{\\text{cell}} = 3.17 - (0.02955 \\times 7.1139)$$
$$E_{\\text{cell}} = 3.17 - 0.210 = \\mathbf{+2.96\\text{ V}}$$

**Final Answer:**
The cell potential at 298 K is **+2.96 V**.`,
    video_url: 'https://www.youtube.com/watch?v=x4M84_4-pvg',
    video_title: 'Step-by-step Nernst Equation Calculations',
    video_description: 'Common pitfalls in stoichiometry squaring (e.g. [Ag+]^2) explained with examples.',
    status: 'published',
    display_order: 1,
    created_at: new Date('2026-01-04').toISOString(),
    updated_at: new Date('2026-01-04').toISOString(),
  },

  // Biology - Question 1 (DNA Replication - Long Answer)
  {
    id: 'q-bio-101',
    chapter_id: 'chap-bio-1',
    question_text: "Describe the semiconservative replication of DNA. Name the main enzymes involved and explain the discontinuous synthesis of the lagging strand.",
    question_type: 'Long Answer',
    marks: 5,
    answer_content: `### 1. Principle of Semiconservative Replication
Proposed by Watson and Crick (1953) and proven experimentally by Meselson and Stahl (1958). During replication:
* The two strands of the parent DNA double helix unwind.
* Each parental strand acts as a template for the synthesis of a new complementary daughter strand.
* Each new daughter DNA molecule contains **one conserved parental strand and one newly synthesised strand**.

---

### 2. Key Enzymes and Their Specific Roles
1. **DNA Helicase:** Unwinds the double-stranded DNA helix at the replication fork by breaking hydrogen bonds between base pairs.
2. **Topoisomerase (DNA Gyrase):** Relieves torsional strain and supercoiling ahead of the replication fork.
3. **RNA Primase:** Synthesises a short single-stranded RNA primer essential for initiating DNA synthesis.
4. **DNA Polymerase III:** Main enzyme that adds deoxyribonucleotides in the $5' \\rightarrow 3'$ direction with high proofreading fidelity.
5. **DNA Ligase:** Joins Okazaki fragments together by forming phosphodiester bonds.

---

### 3. Continuous vs Discontinuous Synthesis
Because DNA Polymerase can only polymerise in the **$5' \\rightarrow 3'$ direction**:
* **Leading Strand:** The template strand with polarity $3' \\rightarrow 5'$ is replicated continuously towards the replication fork.
* **Lagging Strand:** The template strand with polarity $5' \\rightarrow 3'$ is replicated discontinuously away from the replication fork in short segments called **Okazaki fragments**.
* Each Okazaki fragment requires an RNA primer. Later, DNA Polymerase I removes the RNA primer and fills the gap, and **DNA Ligase** seals the nick.`,
    status: 'published',
    display_order: 1,
    created_at: new Date('2026-01-04').toISOString(),
    updated_at: new Date('2026-01-04').toISOString(),
  },

  // Mathematics - Question 1 (Integrals - Long Answer)
  {
    id: 'q-math-101',
    chapter_id: 'chap-math-1',
    question_text: "Evaluate the definite integral using properties of definite integrals:\n$$I = \\int_{0}^{\\frac{\\pi}{2}} \\frac{\\sqrt{\\sin x}}{\\sqrt{\\sin x} + \\sqrt{\\cos x}} \\, dx$$",
    question_type: 'Short Answer',
    marks: 3,
    answer_content: `### Solution:

Let the given integral be (1):
$$I = \\int_{0}^{\\frac{\\pi}{2}} \\frac{\\sqrt{\\sin x}}{\\sqrt{\\sin x} + \\sqrt{\\cos x}} \\, dx \\quad \\text{--- (1)}$$

#### Using King's Property:
$$\\int_{a}^{b} f(x) \\, dx = \\int_{a}^{b} f(a + b - x) \\, dx$$

Here $a = 0$ and $b = \\frac{\\pi}{2}$, so replace $x$ with $\\left(\\frac{\\pi}{2} - x\\right)$:
$$I = \\int_{0}^{\\frac{\\pi}{2}} \\frac{\\sqrt{\\sin(\\frac{\\pi}{2} - x)}}{\\sqrt{\\sin(\\frac{\\pi}{2} - x)} + \\sqrt{\\cos(\\frac{\\pi}{2} - x)}} \\, dx$$

Recall: $\\sin(\\frac{\\pi}{2} - x) = \\cos x$ and $\\cos(\\frac{\\pi}{2} - x) = \\sin x$:
$$I = \\int_{0}^{\\frac{\\pi}{2}} \\frac{\\sqrt{\\cos x}}{\\sqrt{\\cos x} + \\sqrt{\\sin x}} \\, dx \\quad \\text{--- (2)}$$

#### Adding Equations (1) and (2):
$$2I = \\int_{0}^{\\frac{\\pi}{2}} \\left( \\frac{\\sqrt{\\sin x} + \\sqrt{\\cos x}}{\\sqrt{\\sin x} + \\sqrt{\\cos x}} \\right) dx$$

$$2I = \\int_{0}^{\\frac{\\pi}{2}} 1 \\, dx$$
$$2I = [x]_{0}^{\\frac{\\pi}{2}} = \\frac{\\pi}{2} - 0 = \\frac{\\pi}{2}$$

$$I = \\mathbf{\\frac{\\pi}{4}}$$

**Final Result:**
The value of the definite integral is $\\frac{\\pi}{4}$.`,
    status: 'published',
    display_order: 1,
    created_at: new Date('2026-01-05').toISOString(),
    updated_at: new Date('2026-01-05').toISOString(),
  },

  // Computer Science - Question 1 (Python File Handling - Short Answer)
  {
    id: 'q-cs-101',
    chapter_id: 'chap-cs-1',
    question_text: "Differentiate between 'w' and 'a' file opening modes in Python. Write a Python function `count_words()` that reads a text file 'notes.txt' and returns the total number of words starting with the letter 'T' or 't'.",
    question_type: 'Short Answer',
    marks: 3,
    answer_content: `### 1. Difference between 'w' and 'a' modes

| Feature | Write Mode (\`'w'\`) | Append Mode (\`'a'\`) |
| :--- | :--- | :--- |
| **File Exists** | Overwrites the entire existing content (truncates to 0 bytes). | Preserves existing content; appends new data at the end. |
| **File Does Not Exist** | Creates a new empty file. | Creates a new empty file. |
| **File Pointer** | Placed at the beginning (offset 0). | Placed at the end of the file. |

---

### 2. Python Function Implementation

\`\`\`python
def count_words(filename="notes.txt"):
    """Reads a text file and counts words beginning with 'T' or 't'."""
    count = 0
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            for line in f:
                words = line.split()
                for word in words:
                    # Strip leading punctuation if needed and check startswith
                    clean_word = word.strip(".,!?;:\"'()[]{}")
                    if clean_word.lower().startswith('t'):
                        count += 1
        return count
    except FileNotFoundError:
        print(f"Error: The file {filename} was not found.")
        return 0

# Sample test call:
# total = count_words()
# print(f"Total words starting with T/t: {total}")
\`\`\`

**Key Points:**
- Using \`with open(...)\` ensures automatic file closure even if an exception occurs.
- \`split()\` splits on any whitespace sequence (spaces, tabs, newlines).`,
    status: 'published',
    display_order: 1,
    created_at: new Date('2026-01-05').toISOString(),
    updated_at: new Date('2026-01-05').toISOString(),
  },

  // Computer Science - Question 2 (Stacks - Long Answer)
  {
    id: 'q-cs-201',
    chapter_id: 'chap-cs-2',
    question_text: "What is a Stack? Mention its primary characteristic. Write a complete Python program using functions to implement a stack of student roll numbers with PUSH, POP, and DISPLAY operations.",
    question_type: 'Long Answer',
    marks: 5,
    answer_content: `### 1. Definition and Characteristic
A **Stack** is a linear data structure in which insertions and deletions take place only at one end, called the **TOP** of the stack.
* **Primary Characteristic:** It strictly follows the **LIFO (Last In First Out)** or **FILO (First In Last Out)** principle. The element inserted last is the first one to be removed.

---

### 2. Complete Python Program

\`\`\`python
# Stack Implementation for Student Roll Numbers using Python List

def is_empty(stack):
    """Check if the stack has no elements."""
    return len(stack) == 0

def push(stack, item):
    """Insert an element at the top of the stack."""
    stack.append(item)
    print(f"Successfully pushed roll number: {item}")

def pop(stack):
    """Remove and return the top element. Guard against underflow."""
    if is_empty(stack):
        print("Underflow! Cannot pop from an empty stack.")
        return None
    removed = stack.pop()
    print(f"Popped roll number: {removed}")
    return removed

def peek(stack):
    """Inspect top element without removing."""
    if is_empty(stack):
        print("Stack is empty.")
        return None
    return stack[-1]

def display(stack):
    """Display elements from top to bottom."""
    if is_empty(stack):
        print("Stack is empty.")
        return
    print("\\n--- Current Stack (TOP to BOTTOM) ---")
    for i in range(len(stack) - 1, -1, -1):
        indicator = " <-- TOP" if i == len(stack) - 1 else ""
        print(f"| {stack[i]:4} |{indicator}")
    print("-------------------------------------\\n")

# Interactive Menu Demonstration
if __name__ == "__main__":
    student_stack = []
    
    # Demonstration calls
    push(student_stack, 101)
    push(student_stack, 105)
    push(student_stack, 112)
    display(student_stack)
    
    pop(student_stack)
    display(student_stack)
\`\`\`

---
**Examination Marking Scheme Tips:**
* Always check for **Underflow condition** before attempting to \`pop()\`.
* Elements must be printed in reverse order (from index \`len-1\` down to \`0\`) to accurately reflect the stack state from TOP to BOTTOM.`,
    status: 'published',
    display_order: 1,
    created_at: new Date('2026-01-06').toISOString(),
    updated_at: new Date('2026-01-06').toISOString(),
  },
];
