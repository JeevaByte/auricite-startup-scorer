
import { ScoreResult } from '@/pages/Index';

export const shareResults = async (scoreResult: ScoreResult) => {
  const shareData = {
    title: 'My Startup Investment Readiness Score',
    text: `I scored ${scoreResult.totalScore}/999 on my startup investment readiness assessment! 🚀\n\n• Business Idea: ${scoreResult.businessIdea}/100\n• Financials: ${scoreResult.financials}/100\n• Team: ${scoreResult.team}/100\n• Traction: ${scoreResult.traction}/100`,
    url: window.location.origin
  };

  try {
    if (navigator.share && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      return true;
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(
        `${shareData.title}\n\n${shareData.text}\n\nTake the assessment: ${shareData.url}`
      );
      return false; // Indicates clipboard was used instead of native share
    }
  } catch (error) {
    console.error('Error sharing:', error);
    throw error;
  }
};

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

export const generateShareableLink = (scoreResult: ScoreResult) => {
  const params = new URLSearchParams({
    score: scoreResult.totalScore.toString(),
    bi: scoreResult.businessIdea.toString(),
    fin: scoreResult.financials.toString(),
    team: scoreResult.team.toString(),
    trac: scoreResult.traction.toString()
  });
  
  return `${window.location.origin}?shared=true&${params.toString()}`;
};
