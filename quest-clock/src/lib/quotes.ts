export const quotes = [
  "You don't have to be perfect, you just have to start.",
  "Every journey begins with a single step.",
  "Focus on the step in front of you, not the whole staircase.",
  "Your potential is endless.",
  "Small progress is still progress.",
  "Breathe. You've got this.",
  "Don't stop when you're tired, stop when you're done.",
  "Action is the foundational key to all success.",
  "You are capable of amazing things.",
  "One task at a time. The world can wait."
];

export function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}
