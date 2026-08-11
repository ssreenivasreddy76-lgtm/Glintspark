export const selectNextQuestion = (
  bank: any[], 
  topicsList: string[], 
  currentTopic: string, 
  currentDiff: string, 
  asked: string[], 
  previousScore: number | null = null
) => {
  if (!bank || bank.length === 0 || !topicsList || topicsList.length === 0) return null;
  
  let targetTopic = currentTopic || topicsList[0];
  let targetDiff = currentDiff || 'Medium';

  // Adaptive difficulty logic based on previous answer score
  if (previousScore !== null) {
    if (previousScore >= 80) {
      if (currentDiff === 'Easy') targetDiff = 'Medium';
      else if (currentDiff === 'Medium') targetDiff = 'Hard';
      else {
        // Already at Hard and doing well -> Move to next topic
        const topicIdx = topicsList.indexOf(currentTopic);
        if (topicIdx >= 0 && topicIdx < topicsList.length - 1) {
          targetTopic = topicsList[topicIdx + 1];
          targetDiff = 'Easy'; // Reset difficulty for new topic
        } else {
          return null; // Completed all topics
        }
      }
    } else if (previousScore < 50) {
      if (currentDiff === 'Hard') targetDiff = 'Medium';
      else if (currentDiff === 'Medium') targetDiff = 'Easy';
      else {
        // Struggling on Easy. Try to find another Easy in the same topic, 
        // if not, move to next topic to keep interview flowing.
      }
    }
  }

  // Attempt 1: Find unasked question matching targetTopic and targetDiff
  let candidates = bank.filter(q => 
    q.topic === targetTopic && 
    q.difficulty === targetDiff && 
    !asked.includes(q.id)
  );

  // Attempt 2: If none found, fallback to any unasked question in targetTopic regardless of difficulty
  if (candidates.length === 0) {
    candidates = bank.filter(q => 
      q.topic === targetTopic && 
      !asked.includes(q.id)
    );
  }

  // Attempt 3: If topic exhausted, move to next topic
  if (candidates.length === 0) {
    const topicIdx = topicsList.indexOf(targetTopic);
    if (topicIdx >= 0 && topicIdx < topicsList.length - 1) {
      targetTopic = topicsList[topicIdx + 1];
      candidates = bank.filter(q => 
        q.topic === targetTopic && 
        !asked.includes(q.id)
      );
    }
  }

  // If still completely exhausted, interview is over
  if (candidates.length === 0) return null;

  // Pick a random question from candidates to ensure variety
  const selected = candidates[Math.floor(Math.random() * candidates.length)];
  return {
    question: selected,
    topic: targetTopic,
    difficulty: selected.difficulty
  };
};
