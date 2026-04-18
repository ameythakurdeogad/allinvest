export interface Option {
  value: string;
  label: string;
  sublabel?: string;
  emoji?: string;
}

export interface Question {
  id: string;
  step: number;
  question: string;
  subtext?: string;
  type: "single" | "multi";
  field: string;
  options: Option[];
  why?: string;
}

export const QUESTIONS: Question[] = [
  {
    id: "age",
    step: 1,
    question: "How old are you?",
    subtext: "Your age helps us find plans available and most relevant to your life stage.",
    type: "single",
    field: "age",
    why: "Insurance premiums and plan eligibility vary by age. Younger applicants often get better rates.",
    options: [
      { value: "18-25", label: "18 – 25", emoji: "🌱" },
      { value: "26-35", label: "26 – 35", emoji: "🚀" },
      { value: "36-45", label: "36 – 45", emoji: "💼" },
      { value: "46-55", label: "46 – 55", emoji: "🏡" },
      { value: "55+",   label: "55+",     emoji: "🌅" },
    ],
  },
  {
    id: "gender",
    step: 2,
    question: "What is your gender?",
    subtext: "Some plans offer specific benefits or premium discounts based on gender.",
    type: "single",
    field: "gender",
    why: "Certain plans like Shubh Shakti are designed exclusively for women, with lower premiums and women-specific health benefits.",
    options: [
      { value: "male",   label: "Male",               emoji: "👨" },
      { value: "female", label: "Female",             emoji: "👩" },
      { value: "other",  label: "Prefer not to say", emoji: "🙂" },
    ],
  },
  {
    id: "lifeStage",
    step: 3,
    question: "What best describes your current life stage?",
    subtext: "This helps us understand your responsibilities and who depends on you.",
    type: "single",
    field: "lifeStage",
    why: "Your family situation is the biggest factor in how much protection you need.",
    options: [
      { value: "single",        label: "Single",                    sublabel: "No dependents", emoji: "🧍" },
      { value: "married",       label: "Married",                   sublabel: "No children yet", emoji: "💑" },
      { value: "married-kids",  label: "Married with children",     sublabel: "Have kids to protect", emoji: "👨‍👩‍👧" },
      { value: "single-parent", label: "Single parent",             sublabel: "Sole earner for kids", emoji: "👩‍👧" },
    ],
  },
  {
    id: "income",
    step: 4,
    question: "What is your approximate annual household income?",
    subtext: "This helps us suggest plans that are appropriately sized for your situation.",
    type: "single",
    field: "income",
    why: "The right coverage amount is usually 10–15x your annual income. We use this to make sure we don't under- or over-recommend.",
    options: [
      { value: "<3L",    label: "Under ₹3 Lakh",     emoji: "💵" },
      { value: "3-6L",   label: "₹3 – 6 Lakh",       emoji: "💵" },
      { value: "6-12L",  label: "₹6 – 12 Lakh",      emoji: "💴" },
      { value: "12-25L", label: "₹12 – 25 Lakh",     emoji: "💶" },
      { value: "25-50L", label: "₹25 – 50 Lakh",     emoji: "💷" },
      { value: "50L+",   label: "₹50 Lakh and above", emoji: "💎" },
    ],
  },
  {
    id: "dependents",
    step: 5,
    question: "How many people financially depend on you?",
    subtext: "Include spouse, children, parents — anyone who relies on your income.",
    type: "single",
    field: "dependents",
    why: "The more people depending on you, the more critical it is to have strong life coverage in place.",
    options: [
      { value: "0",   label: "None",      sublabel: "I support only myself", emoji: "🙋" },
      { value: "1-2", label: "1 – 2",     sublabel: "Spouse or one parent", emoji: "👥" },
      { value: "3+",  label: "3 or more", sublabel: "Family with children etc.", emoji: "👨‍👩‍👧‍👦" },
    ],
  },
  {
    id: "riskAppetite",
    step: 6,
    question: "How do you feel about investment risk?",
    subtext: "There's no right answer — this just tells us how you'd prefer your money to work.",
    type: "single",
    field: "riskAppetite",
    why: "Some plans (like ULIPs) grow with the market but can fluctuate. Others give guaranteed, predictable returns. We match you based on your comfort.",
    options: [
      { value: "conservative", label: "Play it safe",     sublabel: "Guaranteed returns, no surprises", emoji: "🛡️" },
      { value: "moderate",     label: "Balanced",         sublabel: "Some growth, some stability",      emoji: "⚖️" },
      { value: "aggressive",   label: "Go for growth",    sublabel: "I'm comfortable with market ups and downs", emoji: "🚀" },
    ],
  },
  {
    id: "goals",
    step: 7,
    question: "What are your financial goals?",
    subtext: "Select all that apply — your plan shortlist will reflect each one.",
    type: "multi",
    field: "goals",
    why: "Your goals are the north star for the recommendation. We'll surface plans that directly address what matters to you.",
    options: [
      { value: "family-protection",  label: "Protect my family",         emoji: "🏠" },
      { value: "wealth-creation",    label: "Grow my wealth",            emoji: "📈" },
      { value: "retirement",         label: "Plan for retirement",       emoji: "🌅" },
      { value: "tax-saving",         label: "Save on taxes",             emoji: "🧾" },
      { value: "health-corpus",      label: "Build a health fund",       emoji: "🏥" },
      { value: "regular-income",     label: "Get regular income",        emoji: "💸" },
      { value: "guaranteed-returns", label: "Guaranteed returns only",   emoji: "🔒" },
    ],
  },
  {
    id: "hasExistingCover",
    step: 8,
    question: "Do you already have any life insurance?",
    subtext: "This helps us avoid recommending what you might already have.",
    type: "single",
    field: "hasExistingCover",
    why: "If you already have term cover, we might recommend upgrading, topping up, or adding a complementary plan instead of duplicating.",
    options: [
      { value: "yes",    label: "Yes, I have a policy",      emoji: "✅" },
      { value: "no",     label: "No, I'm starting fresh",    emoji: "🆕" },
      { value: "unsure", label: "Not sure / through employer", emoji: "🤔" },
    ],
  },
  {
    id: "healthConditions",
    step: 9,
    question: "Any pre-existing health conditions we should know about?",
    subtext: "This is kept private and only used to surface the most suitable plans for you.",
    type: "single",
    field: "healthConditions",
    why: "Some plans have provisions like premium waivers or specific riders for people with health conditions. This helps us highlight those.",
    options: [
      { value: "yes", label: "Yes", sublabel: "Diabetes, heart condition, etc.", emoji: "💊" },
      { value: "no",  label: "No",  sublabel: "Generally healthy",              emoji: "💪" },
    ],
  },
];
